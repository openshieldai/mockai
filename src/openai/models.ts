import { Env } from '..';
import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { ratelimit } from '../utils/ratelimit';
import { IRequestStrict } from 'itty-router';

async function getModel(request: IRequestStrict, env: Env, ctx: ExecutionContext) {
  const id = request.params.id;
  if (!id) {
    return new Response('Model ID is required', { status: 400 });
  }
  return new Response(
    JSON.stringify({
      id,
      object: 'model',
      created: Math.floor(Date.now() / 1000),
      owned_by: 'system',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

async function getModels(request: Request, env: Env, ctx: ExecutionContext) {
  return new Response(
    JSON.stringify({
      object: 'list',
      data: [
        {
          id: 'gpt-4-turbo',
          object: 'model',
          created: 1712361441,
          owned_by: 'system',
        },
        {
          id: 'tts-1',
          object: 'model',
          created: 1681940951,
          owned_by: 'openai-internal',
        },
        {
          id: 'gpt-4-turbo-2024-04-09',
          object: 'model',
          created: 1712601677,
          owned_by: 'system',
        },
        {
          id: 'tts-1-1106',
          object: 'model',
          created: 1699053241,
          owned_by: 'system',
        },
        {
          id: 'o1-preview',
          object: 'model',
          created: 1725648897,
          owned_by: 'system',
        },
        {
          id: 'o1-preview-2024-09-12',
          object: 'model',
          created: 1725648865,
          owned_by: 'system',
        },
        {
          id: 'dall-e-2',
          object: 'model',
          created: 1698798177,
          owned_by: 'system',
        },
        {
          id: 'whisper-1',
          object: 'model',
          created: 1677532384,
          owned_by: 'openai-internal',
        },
        {
          id: 'gpt-3.5-turbo-instruct',
          object: 'model',
          created: 1692901427,
          owned_by: 'system',
        },
        {
          id: 'gpt-4o-mini',
          object: 'model',
          created: 1721172741,
          owned_by: 'system',
        },
        {
          id: 'tts-1-hd',
          object: 'model',
          created: 1699046015,
          owned_by: 'system',
        },
        {
          id: 'gpt-4o-2024-05-13',
          object: 'model',
          created: 1715368132,
          owned_by: 'system',
        },
        {
          id: 'tts-1-hd-1106',
          object: 'model',
          created: 1699053533,
          owned_by: 'system',
        },
        {
          id: 'gpt-3.5-turbo',
          object: 'model',
          created: 1677610602,
          owned_by: 'openai',
        },
        {
          id: 'gpt-3.5-turbo-0125',
          object: 'model',
          created: 1706048358,
          owned_by: 'system',
        },
        {
          id: 'babbage-002',
          object: 'model',
          created: 1692634615,
          owned_by: 'system',
        },
        {
          id: 'davinci-002',
          object: 'model',
          created: 1692634301,
          owned_by: 'system',
        },
        {
          id: 'dall-e-3',
          object: 'model',
          created: 1698785189,
          owned_by: 'system',
        },
        {
          id: 'gpt-4o-realtime-preview',
          object: 'model',
          created: 1727659998,
          owned_by: 'system',
        },
        {
          id: 'gpt-4o-realtime-preview-2024-10-01',
          object: 'model',
          created: 1727131766,
          owned_by: 'system',
        },
        {
          id: 'gpt-3.5-turbo-0301',
          object: 'model',
          created: 1677649963,
          owned_by: 'openai',
        },
        {
          id: 'o1-mini-2024-09-12',
          object: 'model',
          created: 1725648979,
          owned_by: 'system',
        },
        {
          id: 'chatgpt-4o-latest',
          object: 'model',
          created: 1723515131,
          owned_by: 'system',
        },
        {
          id: 'o1-mini',
          object: 'model',
          created: 1725649008,
          owned_by: 'system',
        },
        {
          id: 'gpt-4-1106-preview',
          object: 'model',
          created: 1698957206,
          owned_by: 'system',
        },
        {
          id: 'text-embedding-ada-002',
          object: 'model',
          created: 1671217299,
          owned_by: 'openai-internal',
        },
        {
          id: 'gpt-3.5-turbo-16k',
          object: 'model',
          created: 1683758102,
          owned_by: 'openai-internal',
        },
        {
          id: 'gpt-4o-mini-2024-07-18',
          object: 'model',
          created: 1721172717,
          owned_by: 'system',
        },
        {
          id: 'text-embedding-3-small',
          object: 'model',
          created: 1705948997,
          owned_by: 'system',
        },
        {
          id: 'text-embedding-3-large',
          object: 'model',
          created: 1705953180,
          owned_by: 'system',
        },
        {
          id: 'gpt-4o',
          object: 'model',
          created: 1715367049,
          owned_by: 'system',
        },
        {
          id: 'gpt-3.5-turbo-16k-0613',
          object: 'model',
          created: 1685474247,
          owned_by: 'openai',
        },
        {
          id: 'gpt-4o-2024-08-06',
          object: 'model',
          created: 1722814719,
          owned_by: 'system',
        },
        {
          id: 'gpt-3.5-turbo-1106',
          object: 'model',
          created: 1698959748,
          owned_by: 'system',
        },
        {
          id: 'gpt-4o-audio-preview',
          object: 'model',
          created: 1727460443,
          owned_by: 'system',
        },
        {
          id: 'gpt-3.5-turbo-0613',
          object: 'model',
          created: 1686587434,
          owned_by: 'openai',
        },
        {
          id: 'gpt-4o-audio-preview-2024-10-01',
          object: 'model',
          created: 1727389042,
          owned_by: 'system',
        },
        {
          id: 'gpt-4-0613',
          object: 'model',
          created: 1686588896,
          owned_by: 'openai',
        },
        {
          id: 'gpt-4-turbo-preview',
          object: 'model',
          created: 1706037777,
          owned_by: 'system',
        },
        {
          id: 'gpt-4-0125-preview',
          object: 'model',
          created: 1706037612,
          owned_by: 'system',
        },
        {
          id: 'gpt-4',
          object: 'model',
          created: 1687882411,
          owned_by: 'openai',
        },
        {
          id: 'gpt-3.5-turbo-instruct-0914',
          object: 'model',
          created: 1694122472,
          owned_by: 'system',
        },
        {
          id: 'davinci:ft-openshield-2023-03-06-11-44-36',
          object: 'model',
          created: 1678103077,
          owned_by: 'openshield',
        },
      ],
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

export class OpenAIModels extends OpenAPIRoute {
  schema = {
    contentType: 'application/json',
    tags: ['openai'],
    responses: {
      200: {
        description:
          'This endpoint will return a list of models available for inference.',
        contentType: 'application/json',
        content: {
          'application/json': {
            schema: z.object({
              object: z.string(),
              data: z.array(
                z.object({
                  id: z.string(),
                  owned_by: z.string(),
                  created: z.number(),
                  object: z.string(),
                })
              ),
            }),
          },
        },
      },
    },
  };

  async handle(request: Request, env: Env, ctx: ExecutionContext) {
    await ratelimit(request, env, ctx);
    return getModels(request, env, ctx);
  }
}

export class OpenAIModel extends OpenAPIRoute {
  schema = {
    contentType: 'application/json',
    tags: ['openai'],
    request: {
      query: z.object({
        id: z.string(),
      }),
    },
    responses: {
      200: {
        description: 'This endpoint will return a model object.',
        contentType: 'application/json',
        content: {
          'application/json': {
            schema: z.object({
              id: z.string(),
              owned_by: z.string(),
              created: z.number(),
              object: z.string(),
            }),
          },
        },
      },
    },
  };

  async handle(request: IRequestStrict, env: Env, ctx: ExecutionContext) {
    await ratelimit(request, env, ctx);
    return getModel(request, env, ctx);
  }
}
