import { unstable_dev } from 'wrangler';
import type { UnstableDevWorker } from 'wrangler';
import { describe, expect, it, beforeAll, afterAll } from 'vitest';

describe('Chat Endpoint', () => {
  let worker: UnstableDevWorker;

  beforeAll(async () => {
    worker = await unstable_dev('src/index.ts', {
      experimental: { disableExperimentalWarning: true },
    });
  });

  afterAll(async () => {
    await worker.stop();
  });

  it('should return non-streaming response', async () => {
    const resp = await worker.fetch('/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stream: false,
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Hello!' }],
      }),
    });

    if (resp) {
      const json = (await resp.json()) as {
        choices: { message: { content: string } }[];
      };
      expect(json).toHaveProperty('choices');
      expect(json.choices[0].message.content).toContain(
        "As an AI, I don't have personal beliefs or feelings."
      );
    }
  }, 15000);

  it('should return streaming response', async () => {
    const resp = await worker.fetch('/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stream: true,
        streamingDelay: 100,
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Hello!' }],
      }),
    });

    if (resp) {
      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullText = '';

      while (!done) {
        const { value, done: streamDone } = await reader?.read()!;
        done = streamDone;
        if (value) {
          fullText += decoder.decode(value, { stream: true });
          // console.log("Received chunk:", decoder.decode(value, { stream: true }));
        }
      }

      // Check if the fullText contains the expected end message
      expect(fullText).toContain('finish_reason":"stop"');
    }
  }, 30000);

  describe('Image Generation Endpoint', () => {
    it('should return an image', async () => {
      const resp = await worker.fetch('/openai/v1/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'A futuristic cityscape' }),
      });

      if (resp) {
        const contentType = resp.headers.get('Content-Type');
        expect(contentType?.startsWith('application/json')).toBe(true);

        const json = (await resp.json()) as {
          data: { url: string }[];
        };

        expect(json).toHaveProperty('data');
        expect(json.data.length).toBeGreaterThan(0);
      }
    }, 15000);
  });

  describe('Models Endpoint', () => {
    it('should return a list of models', async () => {
      const resp = await worker.fetch('/openai/v1/models', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (resp) {
        expect(resp.status).toBe(200);
        const json = (await resp.json()) as {
          object: string;
          data: {
            id: string;
            owned_by: string;
            created: number;
            object: string;
          }[];
        };

        expect(json).toHaveProperty('data');
        expect(json.data.length).toBeGreaterThan(0);
      }
    }, 15000);
  });

  describe('Model Endpoint', () => {
    it('should return details of a specific model', async () => {
      const modelId = 'gpt-4o'; // Replace with a valid model ID
      const resp = await worker.fetch(`/openai/v1/models/${modelId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (resp) {
        expect(resp.status).toBe(200);
        const json = (await resp.json()) as {
          id: string;
          owned_by: string;
          created: number;
        };

        expect(json).toHaveProperty('id', modelId);
        expect(json).toHaveProperty('owned_by');
        expect(json).toHaveProperty('created');
      }
    }, 15000);
  });
});

describe('Anthropic Chat Endpoint', () => {
  let worker: UnstableDevWorker;

  beforeAll(async () => {
    worker = await unstable_dev('src/index.ts', {
      experimental: { disableExperimentalWarning: true },
    });
  });

  afterAll(async () => {
    await worker.stop();
  });

  it('should return non-streaming response', async () => {
    const resp = await worker.fetch('/anthropic/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stream: false,
        model: 'claude-3-5-sonnet-20241022',
        messages: [{ role: 'user', content: 'Hello!' }],
      }),
    });

    if (resp) {
      const json = (await resp.json()) as {
        content: { text: string; type: string }[];
        id: string;
        model: string;
        role: string;
        stop_reason: string;
        stop_sequence: null;
        type: string;
        usage: { input_tokens: number; output_tokens: number };
      };
      expect(json).toHaveProperty('content');
      expect(json.content[0].text).toContain(
        "As an AI, I don't have personal beliefs"
      );
    }
  }, 15000);

  it('should return streaming response', async () => {
    const resp = await worker.fetch('/anthropic/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stream: true,
        model: 'claude-3-5-sonnet-20241022',
        messages: [{ role: 'user', content: 'Hello!' }],
      }),
    });

    if (resp) {
      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullText = '';

      while (!done) {
        const { value, done: streamDone } = await reader?.read()!;
        done = streamDone;
        if (value) {
          fullText += decoder.decode(value, { stream: true });
        }
      }

      // Check if the fullText contains the expected end message
      expect(fullText).toContain('type":"message_stop');
    }
  }, 30000);
});
