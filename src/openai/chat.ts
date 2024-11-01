import OpenAI from 'openai';
import { Env } from '..';
import { tokenize, delay, tokenizer } from '../utils/helper';
import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { ratelimit } from '../utils/ratelimit';

export async function post(request: Request, env: Env, ctx: ExecutionContext) {
  try {
    const {
      stream,
      request_delay = 0,
      model,
      max_completion_tokens = env.MAX_COMPLETION_TOKENS || 9999,
      answer = '',
      messages = [],
    } = (await request.json()) as {
      stream?: boolean;
      request_delay?: number;
      model: string;
      max_completion_tokens?: number;
      answer?: string;
      messages: { role: string; content: string }[];
    };

    if (request_delay > env.MAXIMUM_REQUEST_DELAY) {
      return new Response('Request delay reached the maximum', { status: 400 });
    }

    await delay(request_delay);

    let content;
    if (answer) {
      content = answer;
    } else {
      content = [
        "As an AI, I don't have personal beliefs or feelings. ",
        'However, many people have different interpretations of the meaning of life. ',
        "Some believe it's to pursue happiness, knowledge, or spiritual enlightenment, ",
        "whereas others might say it's to create meaningful connections with others. ",
        'Ultimately, the meaning of life might be a deeply personal and subjective concept.',
      ].join('');
    }

    let promptTokens: number[] = [];
    for (const message of messages) {
      if (message.role === 'user') {
        promptTokens.push(...(await tokenizer(message.content)));
      }
    }

    const tokens = await tokenizer(content);

    if (max_completion_tokens && tokens.length > max_completion_tokens) {
      return new Response('Max completion tokens exceeded', { status: 400 });
    }

    // Declare tokens before using it

    // For non-streaming responses, return the mock response as before
    if (!stream) {
      const chatCompletion: OpenAI.Chat.ChatCompletion = {
        id: `chatcmpl-${crypto.randomUUID()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: model,
        choices: [
          {
            index: 0,
            logprobs: null,
            message: {
              role: 'assistant',
              content: content,
              refusal: '',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: promptTokens.length,
          completion_tokens: tokens.length,
          total_tokens: promptTokens.length + tokens.length,
        },
      };
      return new Response(JSON.stringify(chatCompletion));
    }

    let { readable, writable } = new TransformStream();
    let writer = writable.getWriter();
    const textEncoder = new TextEncoder();

    ctx.waitUntil(
      (async () => {
        const baseMockData: OpenAI.Chat.ChatCompletionChunk = {
          id: `chatcmpl-${crypto.randomUUID()}`,
          object: 'chat.completion.chunk',
          created: Math.floor(Date.now() / 1000),
          model: model,
          system_fingerprint: crypto.randomUUID(),
          choices: [
            {
              index: 0,
              delta: { content: '' },
              logprobs: null,
              finish_reason: null,
            },
          ],
        };

        // Tokenize the content
        const tokens = tokenize(content);
        let chunkIndex = 0;

        // Simulate streaming with intervals
        const intervalId = setInterval(() => {
          if (chunkIndex < tokens.length) {
            const data = {
              ...baseMockData,
              choices: [
                {
                  ...baseMockData.choices[0],
                  delta: { content: tokens[chunkIndex] },
                },
              ],
            };
            writer.write(
              textEncoder.encode(`data: ${JSON.stringify(data)}\n\n`)
            );
            chunkIndex++;
          } else {
            // Write the [DONE] message and close the writer
            const endMessage = {
              usage: {
                prompt_tokens: promptTokens.length,
                completion_tokens: tokens.length,
                total_tokens: promptTokens.length + tokens.length,
              },
              finish_reason: 'stop',
            };
            const doneData = {
              ...baseMockData,
              usage: endMessage.usage,
              choices: [
                {
                  ...baseMockData.choices[0],
                  finish_reason: endMessage.finish_reason,
                },
              ],
            };
            writer.write(
              textEncoder.encode(`data: ${JSON.stringify(doneData)}\n\n`)
            );
            writer.close();
            clearInterval(intervalId);
          }
        }, 100); // Interval delay for realism
      })()
    );

    // Send the readable back to the browser
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error(error);
    return new Response('Internal server error', { status: 500 });
  }
}

export class OpenAIChat extends OpenAPIRoute {
  schema = {
    contentType: 'application/json',
    tags: ['openai'],
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: z.object({
              stream: z.boolean().optional(),
              request_delay: z.number().optional(),
              max_completion_tokens: z.number().optional(),
              answer: z.string().optional(),
              messages: z.array(
                z.object({ role: z.string(), content: z.string() })
              ),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description:
          'Given a list of messages comprising a conversation, the model will return a response.',
        contentType: 'application/json',
        content: {
          'application/json': {
            schema: z.object({
              id: z.string(),
              object: z.string(),
              created: z.number(),
              model: z.string(),
              choices: z.array(
                z.object({
                  index: z.number(),
                  logprobs: z.null(),
                  message: z.object({
                    role: z.string(),
                    content: z.string(),
                    refusal: z.string(),
                  }),
                  finish_reason: z.string(),
                })
              ),
              usage: z.object({
                prompt_tokens: z.number(),
                completion_tokens: z.number(),
                total_tokens: z.number(),
              }),
            }),
          },
        },
      },
    },
  };

  async handle(request: Request, env: Env, ctx: ExecutionContext) {
    await ratelimit(request, env, ctx);
    return post(request, env, ctx);
  }
}
