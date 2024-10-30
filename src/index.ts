export interface Env {
	MAXIMUM_STREAM_DELAY: number;
	UNSPLASH_ACCESS_KEY: string;
	REPO_URL: string;
	RATELIMITING_ENABLED: boolean;
	RATELIMITER: any;
}


import { AutoRouter } from 'itty-router'
import { OpenAIChat, OpenAIImage } from './openai/init';
import { fromIttyRouter } from 'chanfana';
import { RootPage } from './utils/root';

const router = AutoRouter();

const publicRouter = fromIttyRouter(router, {
  schema: {
    info: {
      title: 'MockAI API',
      version: '1.0',
      description: '',
    },
  },
});


// Use the handle method as the request handler
router.get('/', RootPage);

publicRouter.post('/openai/v1/chat/completions', OpenAIChat);
publicRouter.post('/openai/v1/images/generations', OpenAIImage);

export default router;
