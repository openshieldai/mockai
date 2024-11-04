import { Env } from '..';
import { tokenize, delay, tokenizer } from '../utils/helper';
import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { ratelimit } from '../utils/ratelimit';
import Anthropic from '@anthropic-ai/sdk';

export async function post(request: Request, env: Env, ctx: ExecutionContext) {
  try {
    const {
      stream,
      request_delay = 0,
      model,
      max_tokens,
      answer = '',
      messages = [],
    } = (await request.json()) as {
      stream?: boolean;
      request_delay?: number;
      model: string;
      max_tokens: number;
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

    if (max_tokens === undefined) {
        return new Response('Max tokens must be greater than 0', { status: 400 });
    }

    if (tokens.length > max_tokens) {
      return new Response('Max tokens exceeded', { status: 400 });
    }


    // For non-streaming responses, return the mock response as before

    if (
      stream ||
      request.headers.get('x-stainless-helper-method') === 'stream'
    ) {
      let { readable, writable } = new TransformStream();
      let writer = writable.getWriter();
      const textEncoder = new TextEncoder();

      ctx.waitUntil(
        (async () => {
          const baseMockData: Anthropic.MessageStreamEvent = {
            type: 'message_start',
            message: {
              id: `msg_${crypto.randomUUID()}`,
              role: 'assistant',
              type: 'message',
              model: model,
              content: [],
              stop_reason: null,
              stop_sequence: null,
              usage: {
                input_tokens: promptTokens.length,
                output_tokens: 0, // Initialize with 0, will update later
              },
            },
          };

          // Send the baseMockData at the start of the stream
          writer.write(
            textEncoder.encode(`event: message_start\ndata: ${JSON.stringify(baseMockData)}\n\n`)
          );

          // Tokenize the content
          const tokens = tokenize(content);

          if (tokens.length === 0) {
            console.error('No tokens to stream');
            writer.close();
            return;
          }

          let chunkIndex = 0;

          const contentBlockStart: Anthropic.MessageStreamEvent = {
            type: 'content_block_start',
            content_block: { type: 'text', text: '' },
            index: 0,
          };

          writer.write(
            textEncoder.encode(`event: content_block_start\ndata: ${JSON.stringify(contentBlockStart)}\n\n`)
          );

          // Simulate streaming with intervals
          const intervalId = setInterval(() => {
            if (chunkIndex < tokens.length) {
              const data = {
                type: 'content_block_delta',
                index: 0,
                delta: { type: 'text_delta', text: tokens[chunkIndex] },
              };
              writer.write(
                textEncoder.encode(`event: content_block_delta\ndata: ${JSON.stringify(data)}\n\n`)
              );
              chunkIndex++;
            } else {
              const messageDelta: Anthropic.MessageStreamEvent = {
                type: 'message_delta',
                delta: {
                  stop_reason: 'end_turn',
                  stop_sequence: null,
                },
                usage: {
                  output_tokens: tokens.length,
                },
              };

              // Write the [DONE] message and close the writer
              const endMessage = {
                type: 'message_stop',
              };
              writer.write(
                textEncoder.encode(`event: message_stop\ndata: ${JSON.stringify(endMessage)}\n\n`)
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
    } else {
      console.log('Non-streaming response');
      const chatCompletion: Anthropic.Message = {
        id: `msg_${crypto.randomUUID()}`,
        type: 'message',
        role: 'assistant',
        model: model,
        content: [
          {
            type: 'text',
            text: content,
          },
        ],
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: {
          input_tokens: promptTokens.length,
          output_tokens: tokens.length,
        },
      };
      return new Response(JSON.stringify(chatCompletion));
    }
  } catch (error) {
    console.error(error);
    return new Response('Internal server error', { status: 500 });
  }
}

export class AnthropicChat extends OpenAPIRoute {
  schema = {
    contentType: 'application/json',
    tags: ['anthropic'],
    request: {
      headers: z.object({
        'x-api-key': z.string(),
        'anthropic-version': z.string(),
        'anthropic-beta': z.string().optional(),
        'anthropic-stream': z.string().optional(),
      }),
      body: {
        required: true,
        content: {
          'application/json': {
            schema: z.object({
              stream: z.boolean().optional(),
              request_delay: z.number().optional(),
              max_tokens: z.number(),
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
              content: z.array(
                z.object({
                  text: z.string(),
                  type: z.literal('text'),
                })
              ),
              id: z.string(),
              model: z.string(),
              role: z.string(),
              stop_reason: z.string(),
              stop_sequence: z.null(),
              type: z.string(),
              usage: z.object({
                input_tokens: z.number(),
                output_tokens: z.number(),
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
