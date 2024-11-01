import OpenAI from 'openai';
import { Env } from '..';
import { tokenize, delay } from '../utils/helper';
import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { ratelimit } from '../utils/ratelimit';

export async function post (request: Request, env: Env, ctx: ExecutionContext) {
  const { stream, requestDelay = 0, model } = (await request.json()) as {
    stream: boolean;
    requestDelay?: number;
    model: string;
  };

  if (requestDelay > env.MAXIMUM_REQUEST_DELAY) {
    return new Response('Stream delay is too long', { status: 400 });
  }

  await delay(requestDelay);

  const content = [
    "As an AI, I don't have personal beliefs or feelings. ",
    'However, many people have different interpretations of the meaning of life. ',
    "Some believe it's to pursue happiness, knowledge, or spiritual enlightenment, ",
    "whereas others might say it's to create meaningful connections with others. ",
    'Ultimately, the meaning of life might be a deeply personal and subjective concept.',
  ].join('');

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
        prompt_tokens: 24,
        completion_tokens: 68,
        total_tokens: 92,
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
          writer.write(textEncoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          chunkIndex++;
        } else {
          // Write the [DONE] message and close the writer
          writer.write(textEncoder.encode(`data: [DONE]\n\n`));
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
}

export class OpenAIChat extends OpenAPIRoute {
  schema = {
    contentType: 'application/json',
    tags: ['openai'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              stream: z.boolean(),
              requestDelay: z.number().optional(),
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
        description: 'Chat Completion response',
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
