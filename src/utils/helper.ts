import { init, Tiktoken } from 'tiktoken/lite/init';
import wasm from '../../node_modules/tiktoken/lite/tiktoken_bg.wasm';
import model from '../../node_modules/tiktoken/encoders/cl100k_base.json';

export function tokenize(content: string) {
  const regex = /(\s+|[.,!?;]|[\u4e00-\u9fa5])/g;
  const tokens = content.split(regex).filter(Boolean);
  return tokens;
}

export const delay = (delayTime: number) => {
  return new Promise((resolve, _) => {
    setTimeout(() => {
      resolve(void 0);
    }, delayTime);
  });
};

export async function tokenizer(content: string) {
  await init((imports) => WebAssembly.instantiate(wasm, imports));
  const encoder = new Tiktoken(
    model.bpe_ranks,
    model.special_tokens,
    model.pat_str
  );
  const tokens = encoder.encode(content);
  encoder.free();
  return tokens;
}
