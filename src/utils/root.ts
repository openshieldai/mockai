import showdown from 'showdown';
import { Env } from '..';

// Convert markdown to HTML
const markdownToHtml = (markdown: string): string => {
  const converter = new showdown.Converter();
  return converter.makeHtml(markdown);
};

// Fetch and return the markdown content as HTML
async function get(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  try {
    const response = await fetch(`${env.REPO_URL}/README.md`, {
      cf: {
        cacheTtl: 300,
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch README.md: ${response.statusText}`);
    }
    const markdown = await response.text();
    return new Response(markdownToHtml(markdown), {
      headers: { 'Content-Type': 'text/html' },
      cf: {
        cacheTtl: 3600,
      }
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    return new Response(`Error: ${errorMessage}`, { status: 500 });
  }
}

export function RootPage(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  return get(request, env, ctx);
}
