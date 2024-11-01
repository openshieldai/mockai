import OpenAI from 'openai';

const openAIClient = new OpenAI({
  baseURL: 'https://mockai.openshield.ai/openai/v1',
  apiKey: '',
});

async function main() {
  // @ts-ignore
  const completion = await openAIClient.chat.completions.create({
    stream: true,
    request_delay: 0,
    model: 'gpt-4',
    answer: 'As an AI, I don\'t have personal beliefs or feelings. However, many people have different interpretations of the meaning of life. Some believe it\'s to pursue happiness, knowledge, or spiritual enlightenment, whereas others might say it\'s to create meaningful connections with others. Ultimately, the meaning of life might be a deeply personal and subjective concept.',
    messages: [
      { role: 'system', content: 'Write a receipt to the following prompt:' },
      { role: 'user', content: 'What is the meaning of life?' },
    ],
  });

  let fullContent: any[] = [];

  for await (const part of completion) {
    process.stdout.write(part.choices[0]?.delta?.content || '');
    const content = part;
    if (content !== undefined && content !== null) {
      fullContent.push(JSON.stringify(content));
    }
  }

  const lastMessage = JSON.parse(fullContent[fullContent.length - 1]);
  const usage = lastMessage.usage;
  console.log('\n');
  console.log(`${usage.prompt_tokens} prompt tokens, ${usage.completion_tokens} completion tokens, ${usage.total_tokens} total tokens`);

}

main();
