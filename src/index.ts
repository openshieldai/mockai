export interface Env {
  MAXIMUM_REQUEST_DELAY: number;
  UNSPLASH_ACCESS_KEY: string;
  DOC_URL: string;
  RATELIMITING_ENABLED: boolean;
  RATELIMITER: any;
  ENV: string;
  MAX_COMPLETION_TOKENS: number;
}


import { AutoRouter, withParams } from 'itty-router'
import { OpenAIChat, OpenAIImage, OpenAIModels, OpenAIModel } from './openai/init';
import { AnthropicChat } from './anthropic/init';
import { fromIttyRouter } from 'chanfana';
import { RootPage } from './utils/root';

const router = AutoRouter();

const publicRouter = fromIttyRouter(router, {
  schema: {
    info: {
      title: 'MockAI API',
      version: '1.0',
      description: 'Mock OpenAI API',
    },
  },
});


// Use the handle method as the request handler
router.get('/', RootPage);

publicRouter.post('/openai/v1/chat/completions', OpenAIChat);
publicRouter.get('/openai/v1/models', OpenAIModels);
publicRouter.get('/openai/v1/models/:id', withParams, OpenAIModel);
publicRouter.post('/openai/v1/images/generations', OpenAIImage);
publicRouter.post('/anthropic/v1/messages', AnthropicChat);

export default router;
