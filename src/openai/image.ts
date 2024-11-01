import { Env } from '..';
import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { ratelimit } from '../utils/ratelimit';

export async function post(
  request: Request,
  env: Env,
  ctx: ExecutionContext
) {
  if (env.UNSPLASH_ACCESS_KEY) {
    console.log('UNSPLASH_ACCESS_KEY is set');
    // TODO: Implement Unsplash API
  } else {
    console.log('UNSPLASH_ACCESS_KEY is not set');
    try {
      const { n = 1, size = '1024x1024' } = (await request.json()) as {
        model: string;
        n: number;
        size: string;
      };

      const responseData = {
        created: Math.floor(Date.now() / 1000),
        data: [] as { url: string }[],
      };

      const [width, height] = size.split('x').map(Number);

      for (let i = 0; i < n; i++) {
        responseData.data.push({
          url: `https://images.unsplash.com/photo-1721332155637-8b339526cf4c?h=${height}&w=${width}&auto=format`,
        });
      }

      return new Response(JSON.stringify(responseData), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return new Response('Invalid JSON input', { status: 400 });
    }
  }
}


export class OpenAIImage extends OpenAPIRoute {
  schema = {
    tags: ['openai'],
    contentType: 'application/json',
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: z.object({
              prompt: z.string(),
              n: z.number().optional(),
              size: z.string().optional(),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description:
          'Given a prompt and/or an input image, the model will generate a new image',
        contentType: 'application/json',
        content: {
          'application/json': {
            schema: z.object({
              created: z.number(),
              data: z.array(z.object({ url: z.string() })),
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
