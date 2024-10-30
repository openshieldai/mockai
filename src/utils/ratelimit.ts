import { Env } from '..';

export async function ratelimit(request: Request, env: Env, ctx: ExecutionContext) {
        if (env.RATELIMITING_ENABLED) {
        const ipAddress = request.headers.get('cf-connecting-ip') || '';
        const { success } = await env.RATELIMITER.limit({ key: ipAddress });
        const { pathname } = new URL(request.url);

        if (!success) {
          return new Response(`429 Failure – rate limit exceeded for ${pathname}`, { status: 429 });
        } 
  }
}
