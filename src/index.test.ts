import { unstable_dev } from "wrangler";
import type { UnstableDevWorker } from "wrangler";
import { describe, expect, it, beforeAll, afterAll } from "vitest";

describe("Chat Endpoint", () => {
	let worker: UnstableDevWorker;

	beforeAll(async () => {
		worker = await unstable_dev("src/index.ts", {
			experimental: { disableExperimentalWarning: true },
		});
	});

	afterAll(async () => {
		await worker.stop();
	});

	it("should return non-streaming response", async () => {
		const resp = await worker.fetch("/openai/v1/chat/completions", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ stream: false }),
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

	it("should return streaming response", async () => {
		const resp = await worker.fetch("/openai/v1/chat/completions", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ stream: true, streamingDelay: 100 }),
		});

		if (resp) {
			const reader = resp.body?.getReader();
			const decoder = new TextDecoder();
			let done = false;
			let fullText = "";

			while (!done) {
				const { value, done: streamDone } = await reader?.read()!;
				done = streamDone;
				if (value) {
					fullText += decoder.decode(value, { stream: true });
					// console.log("Received chunk:", decoder.decode(value, { stream: true }));
				}
			}

			expect(fullText).toContain("data: [DONE]");
		}
	}, 30000);
});
