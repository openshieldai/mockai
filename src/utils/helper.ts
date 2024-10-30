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
