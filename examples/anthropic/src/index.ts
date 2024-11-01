import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  baseURL: 'http://localhost:8787/anthropic',
  apiKey: 'openshield',
});

async function main() {
  // @ts-ignore
  const stream = await anthropic.messages.create({
    request_delay: 1000,
    max_tokens: 990,
    answer:
      "As an AI, I don't have personal beliefs or feelings. However, many people have different interpretations of the meaning of life. Some believe it's to pursue happiness, knowledge, or spiritual enlightenment, whereas others might say it's to create meaningful connections with others. Ultimately, the meaning of life might be a deeply personal and subjective concept.",
    model: 'claude-3-5-sonnet-20241022',
    stream: true,
    messages: [
      {
        role: 'user',
        content: 'Hello, Claude!',
      },
    ],
  });


  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      process.stdout.write(event.delta.text);
    }
  }
  process.stdout.write('\n');
}

main();
