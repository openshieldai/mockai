# MockAI service

This is a mock service for multiple AI services.

## Documentation

[Documentation](https://mockai.openshield.ai/docs)

## OpenAI API

### Supported endpoints:

- `/openai/v1/chat/completions` (streaming supported)
- `/openai/v1/images/generations`
- `/openai/v1/models`
- `/openai/v1/models/:id`

### Echo mode

If you set `answer` in the request body, the service will echo the answer back.


### Extra parameters
- `request_delay`: Delay the response time.
- `answer`: Echo the answer back.

### Example code

```bash
cd examples/openai
pnpm install
pnpm run build
pnpm run start
```

## Deploy

### Environment variables

- `MAX_COMPLETION_TOKENS`: The maximum number of tokens in the response.
- `MAXIMUM_REQUEST_DELAY`: The maximum request delay.
- `RATELIMITING_ENABLED`: Whether to enable rate limiting.
- `ENV`: The environment name.
- `DOC_URL`: The documentation URL.

```bash
npm install -g pnpm
```

```bash
cp wrangler_example.toml wrangler.toml
```
Customize the `wrangler.toml` file with your own values.

```bash
pnpm install
wrangler login
wrangler deploy -e production
```
