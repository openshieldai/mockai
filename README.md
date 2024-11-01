# MockAI service

This is a mock service for multiple AI services.

## Documentation

[Documentation](https://mockai.openshield.ai/docs)

## OpenAI API

### Supported endpoints:

- /openai/v1/chat/completions
- /openai/v1/images/generations
- /openai/v1/models
- /openai/v1/models/:id


### Example code

```typescript
import OpenAI from 'openai';

const openAIClient = new OpenAI({
  baseURL: 'https://mockai.openshield.ai/openai/v1', // or use your own baseURL
  apiKey: '',
});

async function main() {
  // @ts-ignore
  const completion = await openAIClient.chat.completions.create({
    stream: true,
    requestDelay: 5000,
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'What is the meaning of life?' },
    ],
  });
  console.log(JSON.stringify(completion, null, 2));

  for await (const part of completion) {
    process.stdout.write(part.choices[0]?.delta?.content || '');
  }
}

main().then(() => console.log('done'));
```
## Deploy

```bash
cp wrangler_example.toml wrangler.toml
```
Customize the `wrangler.toml` file with your own values.

```bash
wrangler login
wrangler deploy -e production
```
