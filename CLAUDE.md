# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build        # Build with tsup (outputs CJS + ESM + .d.ts to dist/)
npm run typecheck    # Type-check only (tsc --noEmit)
npm test             # Run tests with Vitest (interactive watch mode)
npx vitest run       # Run tests once (CI mode)
npx vitest run tests/builder.test.ts  # Run a single test file
```

Tests require a `GAMMA_API_KEY` in `.env.local`. Integration tests make real API calls and have a 120s timeout.

## Architecture

This is an unofficial, zero-dependency TypeScript SDK for the Gamma API (presentation/document generation), built and maintained by a Gambassador. It wraps the REST API at `https://public-api.gamma.app/v1.0`.

### Client → Resources → HttpClient

`GammaClient` creates an `HttpClient` and injects it into three resource classes:

- **GenerationsResource** (`src/resources/generations.ts`) — create generations, poll for completion, check status. The `createAndWait()` method combines creation + polling into one call.
- **ThemesResource** (`src/resources/themes.ts`) — list/search/paginate themes
- **FoldersResource** (`src/resources/folders.ts`) — list/search/paginate folders

### Builder Pattern (`src/builder/`)

Two-stage fluent builders enforce valid request combinations via the type system:

1. `GammaRequest.create(text).generate()` returns a `GenerateBuilder` with full text options (tone, audience, amount)
2. `.condense()` returns a `CondenseBuilder` (amount only), `.preserve()` returns `PreserveBuilder` (language only)
3. All builders extend `BaseBuilder<T>` which provides format, dimensions, images, theme, export, sharing methods
4. `.build()` produces the final `GenerateRequest`

`GammaTemplateRequest` is a separate simpler builder for template-based generation.

### Utilities (`src/utils/`)

- **HttpClient** (`http.ts`) — fetch wrapper with exponential backoff retries, timeout via combined AbortSignals with cleanup, rate-limit retry-after parsing. Auth via `X-API-KEY` header.
- **Polling** (`polling.ts`) — generic `pollForCompletion<T>()` with exponential backoff, timeout, AbortSignal cancellation, progress callbacks, and failure detection. Used by GenerationsResource.
- **Pagination** (`pagination.ts`) — `createPaginator<T>()` returns a `Paginator` with async generators for lazy page/item iteration and `toArray(maxItems?)` collection.

### Error Hierarchy (`src/errors/`)

`GammaError` base class with subclasses mapped to HTTP status codes (400→`ValidationError`, 401→`AuthenticationError`, 404→`NotFoundError`, 429→`RateLimitError`, etc.) plus `PollingTimeoutError`, `PollingCancelledError`, and `NetworkError`. `isRetryableError()` identifies transient errors (429, 500, 502, network).

### Types (`src/types/`)

String literal unions instead of enums (e.g., `TextMode = 'generate' | 'condense' | 'preserve'`). Type guards (`isGenerationCompleted`, `isGenerationFailed`) narrow the `GenerationStatusResponse` discriminated union.

## TypeScript Conventions

- **Strict mode** with `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess` enabled. Optional properties must include `| undefined` in their type (e.g., `signal?: AbortSignal | undefined`).
- All internal imports use `.js` extensions (ESM convention for bundler resolution).
- Barrel files at each module boundary (`src/index.ts`, `src/types/index.ts`, `src/resources/index.ts`, `src/builder/index.ts`).
- Use `type` imports where possible (`import type { ... }`).
