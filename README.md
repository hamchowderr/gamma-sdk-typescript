# @chowderr/gamma-sdk

[![npm version](https://img.shields.io/npm/v/%40chowderr%2Fgamma-sdk.svg)](https://www.npmjs.com/package/@chowderr/gamma-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

An unofficial TypeScript SDK for the [Gamma API](https://developers.gamma.app) that makes it easy to generate presentations, documents, social media content, and webpages programmatically.

> **Note:** This is not an official Gamma product. It is built and maintained by a [Gambassador](https://gamma.app) with the goal of eventually contributing it to the Gamma team.

## Why Use This SDK?

The Gamma API is straightforward, but this SDK handles the boilerplate so you don't have to:

| What you'd build yourself | What the SDK gives you |
|---|---|
| Manually `POST /generations`, then loop `GET /generations/{id}` with `setTimeout` until `status === 'completed'` | `createAndWait()` with exponential backoff, configurable timeouts, and progress callbacks |
| Hand-craft JSON request bodies and remember valid field combinations | Fluent builder pattern (`GammaRequest.create(...).generate().asPresentation().widescreen().build()`) with IDE autocomplete and compile-time validation |
| Write retry logic for 429/5xx responses, parse `Retry-After` headers | Automatic retries with exponential backoff and rate-limit awareness built into every request |
| Manage cursor tokens and loop through paginated theme/folder listings | Async iterators (`for await (const theme of client.themes.paginate().items())`) that handle pagination transparently |
| Check `response.ok`, parse error bodies, figure out what went wrong | Typed error classes (`RateLimitError`, `AuthenticationError`, `GenerationFailedError`, etc.) with status codes and request IDs |
| Wire up `AbortController` to both the HTTP request and a polling loop | Pass a `signal` once and cancellation works across the entire generation lifecycle |

## Features

- **Type-safe API client** - Full TypeScript support with comprehensive type definitions
- **Fluent builder pattern** - Intuitive request construction with method chaining
- **Async polling with progress callbacks** - Monitor generation progress with customizable callbacks
- **Cancellation support** - Cancel long-running operations with AbortController
- **Pagination helpers** - Async iterators for seamless pagination through themes and folders
- **Comprehensive error handling** - Specific error classes for different failure scenarios
- **Zero runtime dependencies** - Minimal footprint using native fetch
- **Dual CJS/ESM build** - Works in both CommonJS and ES Module environments

## Installation

```bash
npm install @chowderr/gamma-sdk
```

## Quick Start

```typescript
import { GammaClient } from '@chowderr/gamma-sdk';

// Create a client with your API key
const client = new GammaClient({
  apiKey: 'sk-gamma-your-api-key',
});

// Generate a presentation and wait for completion
const result = await client.generations.createAndWait({
  inputText: 'Five tips for productivity',
  textMode: 'generate',
  format: 'presentation',
});

console.log('Generated gamma:', result.gammaUrl);
console.log('Credits used:', result.credits.deducted);
```

## Usage Examples

### Basic Generation

```typescript
import { GammaClient } from '@chowderr/gamma-sdk';

const client = new GammaClient({
  apiKey: 'sk-gamma-your-api-key',
});

// Create and wait for a presentation
const result = await client.generations.createAndWait({
  inputText: 'Introduction to machine learning for beginners',
  textMode: 'generate',
  format: 'presentation',
  numCards: 10,
});

console.log('View your gamma at:', result.gammaUrl);
```

### Using the Builder Pattern

The SDK provides a fluent builder API for constructing requests with full IDE autocomplete support.

```typescript
import { GammaClient, GammaRequest } from '@chowderr/gamma-sdk';

const client = new GammaClient({
  apiKey: 'sk-gamma-your-api-key',
});

// Build a request using the fluent API
const request = GammaRequest
  .create('Remote team management strategies')
  .generate()                                    // Text mode: generate, condense, or preserve
  .withTone('professional, authoritative')       // Set the tone
  .withAudience('team leads and managers')       // Target audience
  .withTextAmount('medium')                      // Text density: brief, medium, detailed, extensive
  .asPresentation()                              // Format: asPresentation, asDocument, asSocial, asWebpage
  .widescreen()                                  // Dimensions: widescreen, standard, a4, letter, square, etc.
  .withCards(10)                                 // Number of slides
  .withAiImages('flux-1-quick', 'clean, modern') // AI-generated images with style
  .withTheme('your-theme-id')                    // Apply a theme
  .exportAs('pdf')                               // Export format: pdf or pptx
  .build();

const result = await client.generations.createAndWait(request);
```

#### Text Modes

```typescript
// Generate mode - AI generates new content from your topic/outline
const generateRequest = GammaRequest
  .create('Three benefits of remote work')
  .generate()
  .withTone('casual and friendly')
  .withAudience('startup founders')
  .build();

// Condense mode - AI summarizes and condenses your content
const condenseRequest = GammaRequest
  .create('Your long article or document text here...')
  .condense()
  .withTextAmount('brief')
  .build();

// Preserve mode - Uses your text as-is with minimal modification
const preserveRequest = GammaRequest
  .create('# Slide 1\nContent here\n---\n# Slide 2\nMore content')
  .preserve()
  .withCardSplit('inputTextBreaks')  // Split on \n---\n markers
  .build();
```

#### Format and Dimensions

```typescript
// Presentation formats
GammaRequest.create('Topic').generate()
  .asPresentation()
  .widescreen()     // 16:9
  .build();

GammaRequest.create('Topic').generate()
  .asPresentation()
  .standard()       // 4:3
  .build();

// Document formats
GammaRequest.create('Topic').generate()
  .asDocument()
  .a4()             // A4 paper
  .build();

GammaRequest.create('Topic').generate()
  .asDocument()
  .letter()         // US Letter
  .build();

GammaRequest.create('Topic').generate()
  .asDocument()
  .pageless()       // Continuous scroll
  .build();

// Social media formats
GammaRequest.create('Topic').generate()
  .asSocial()
  .square()         // 1:1 (Instagram)
  .build();

GammaRequest.create('Topic').generate()
  .asSocial()
  .portrait()       // 4:5 (Instagram/Facebook)
  .build();

GammaRequest.create('Topic').generate()
  .asSocial()
  .story()          // 9:16 (TikTok, Reels, Stories)
  .build();
```

#### Image Options

```typescript
// AI-generated images with specific model and style
GammaRequest.create('Topic').generate()
  .withAiImages('imagen-4-pro', 'minimalist, corporate')
  .build();

// Disable images
GammaRequest.create('Topic').generate()
  .noImages()
  .build();

// Other image sources via withImages()
GammaRequest.create('Topic').generate()
  .withImages('pexels')    // Stock photos from Pexels
  .build();

GammaRequest.create('Topic').generate()
  .withImages('unsplash')  // Stock photos from Unsplash
  .build();

GammaRequest.create('Topic').generate()
  .withImages('giphy')     // Animated GIFs from Giphy
  .build();
```

### Template-Based Generation

Generate content based on an existing gamma template.

```typescript
import { GammaClient, GammaTemplateRequest } from '@chowderr/gamma-sdk';

const client = new GammaClient({
  apiKey: 'sk-gamma-your-api-key',
});

// Build a template-based request
const request = GammaTemplateRequest
  .create('g_abcdef123456', 'Update with Q1 2026 sales data and new projections')
  .withAiImages('imagen-4-pro', 'corporate, professional')
  .withTheme('your-theme-id')
  .inFolders('folder-id-1', 'folder-id-2')
  .exportAs('pptx')
  .build();

const result = await client.generations.createFromTemplateAndWait(request);
```

### Polling with Progress Callbacks

Monitor the progress of long-running generations.

```typescript
const result = await client.generations.createAndWait(
  {
    inputText: 'Comprehensive guide to TypeScript',
    textMode: 'generate',
    numCards: 20,
  },
  {
    onProgress: (progress) => {
      console.log(`Poll #${progress.pollCount}`);
      console.log(`Status: ${progress.status}`);
      console.log(`Elapsed: ${progress.elapsedMs}ms`);
      console.log(`Next poll in: ${progress.currentIntervalMs}ms`);
    },
  }
);
```

### Handling Warnings

The API may return warnings when parameters conflict or are ignored.

```typescript
const { generationId } = await client.generations.create({
  inputText: 'My content',
  textMode: 'generate',
  format: 'presentation',
  cardOptions: {
    dimensions: '1x1',  // Invalid for presentation format
  },
});

// Check for warnings in the response
const status = await client.generations.getStatus(generationId);
if (status.status === 'completed' && status.warnings) {
  console.warn('API warnings:', status.warnings);
  // Example: "cardOptions.dimensions 1x1 is not valid for format presentation. Using default: fluid."
}
```

### Handling Failed Generations

Use the `isGenerationFailed` type guard to check for failed status.

```typescript
import { isGenerationFailed, isGenerationCompleted } from '@chowderr/gamma-sdk';

const status = await client.generations.getStatus(generationId);

if (isGenerationCompleted(status)) {
  console.log('Success:', status.gammaUrl);
} else if (isGenerationFailed(status)) {
  console.error('Failed:', status.error.message);
  console.error('Status code:', status.error.statusCode);
} else {
  console.log('Still pending...');
}
```

When using `createAndWait()`, failed generations automatically throw `GenerationFailedError`.

### Cancellation with AbortController

Cancel a generation request that is taking too long.

```typescript
const controller = new AbortController();

// Cancel after 2 minutes
const timeout = setTimeout(() => controller.abort(), 120000);

try {
  const result = await client.generations.createAndWait(
    { inputText: 'My content', textMode: 'generate' },
    { signal: controller.signal }
  );
  clearTimeout(timeout);
  console.log('Completed:', result.gammaUrl);
} catch (error) {
  if (error instanceof PollingCancelledError) {
    console.log('Generation was cancelled');
  }
  throw error;
}
```

### Listing Themes

```typescript
// List themes (first page)
const { data: themes, hasMore, nextCursor } = await client.themes.list();

// Search for themes
const { data: darkThemes } = await client.themes.search('dark');

// Paginate with options
const { data: limitedThemes } = await client.themes.list({ limit: 10 });

// Get all themes (loads into memory)
const allThemes = await client.themes.listAll();
```

### Listing Folders

```typescript
// List folders (first page)
const { data: folders } = await client.folders.list();

// Search for folders
const { data: projectFolders } = await client.folders.search('project');

// Get all folders
const allFolders = await client.folders.listAll();

// Use folder in generation
const result = await client.generations.createAndWait({
  inputText: 'My content',
  textMode: 'generate',
  folderIds: [folders[0].id],
});
```

### Pagination with Async Iterators

```typescript
// Iterate over pages
for await (const page of client.themes.paginate()) {
  console.log(`Got ${page.data.length} themes`);
  for (const theme of page.data) {
    console.log(`- ${theme.name} (${theme.type})`);
  }
}

// Iterate over individual items
for await (const theme of client.themes.paginate().items()) {
  console.log(theme.name, theme.colorKeywords);
}

// Collect all items into an array
const allThemes = await client.themes.paginate().toArray();

// With search filter
for await (const theme of client.themes.paginate({ query: 'modern' }).items()) {
  console.log(theme.name);
}
```

## API Reference

### GammaClient

The main client for interacting with the Gamma API.

```typescript
const client = new GammaClient({
  apiKey: string;          // Required - Your Gamma API key
  baseUrl?: string;        // Optional - API base URL (default: 'https://public-api.gamma.app/v1.0')
  timeout?: number;        // Optional - Request timeout in ms (default: 30000)
  retries?: number;        // Optional - Retry count for transient errors (default: 3)
  polling?: PollingOptions; // Optional - Default polling options
});
```

**Properties:**
- `client.generations` - GenerationsResource for creating content
- `client.themes` - ThemesResource for listing themes
- `client.folders` - FoldersResource for listing folders

### GenerationsResource

Methods for creating and managing content generations.

| Method | Description |
|--------|-------------|
| `create(request)` | Starts a generation and returns immediately with the generation ID |
| `createFromTemplate(request)` | Starts a template-based generation (beta) |
| `getStatus(generationId)` | Checks the current status of a generation |
| `createAndWait(request, options?)` | Creates a generation and polls until completion |
| `createFromTemplateAndWait(request, options?)` | Creates from template and polls until completion |
| `waitForCompletion(generationId, options?)` | Polls an existing generation until it completes |

### ThemesResource

Methods for listing and searching themes.

| Method | Description |
|--------|-------------|
| `list(options?)` | Lists themes with optional filtering and pagination |
| `search(query, options?)` | Searches for themes by name |
| `paginate(options?)` | Returns an async paginator for all themes |
| `listAll(options?)` | Fetches all themes as a single array |

### FoldersResource

Methods for listing and searching folders.

| Method | Description |
|--------|-------------|
| `list(options?)` | Lists folders with optional filtering and pagination |
| `search(query, options?)` | Searches for folders by name |
| `paginate(options?)` | Returns an async paginator for all folders |
| `listAll(options?)` | Fetches all folders as a single array |

### Polling Options

Configure polling behavior for `createAndWait` and `waitForCompletion` methods.

```typescript
interface PollingOptions {
  intervalMs?: number;        // Initial poll interval (default: 10000 - 10 seconds)
  timeoutMs?: number;         // Maximum wait time (default: 600000 - 10 minutes)
  maxIntervalMs?: number;     // Maximum poll interval (default: 30000 - 30 seconds)
  backoffMultiplier?: number; // Exponential backoff multiplier (default: 1.5)
  signal?: AbortSignal;       // AbortSignal for cancellation
  onProgress?: (progress: PollingProgress) => void; // Progress callback
}

interface PollingProgress {
  status: 'pending' | 'completed' | 'failed';
  generationId: string;
  pollCount: number;
  elapsedMs: number;
  currentIntervalMs: number;
}
```

## Error Handling

The SDK provides specific error classes for different failure scenarios.

```typescript
import {
  GammaError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  GenerationFailedError,
  RateLimitError,
  PollingTimeoutError,
  PollingCancelledError,
} from '@chowderr/gamma-sdk';

try {
  const result = await client.generations.createAndWait({
    inputText: 'My content',
    textMode: 'generate',
  });
} catch (error) {
  if (error instanceof ValidationError) {
    // 400 - Invalid request parameters
    console.error('Validation failed:', error.message);
  } else if (error instanceof AuthenticationError) {
    // 401 - Invalid API key
    console.error('Invalid API key');
  } else if (error instanceof AuthorizationError) {
    // 403 - No credits or insufficient permissions
    console.error('Out of credits or forbidden');
  } else if (error instanceof NotFoundError) {
    // 404 - Resource not found
    console.error('Generation not found');
  } else if (error instanceof GenerationFailedError) {
    // 422 - Generation failed (empty output or processing error)
    console.error('Generation failed:', error.message);
    // This can also be thrown during polling when status becomes 'failed'
  } else if (error instanceof RateLimitError) {
    // 429 - Rate limit exceeded
    console.error('Rate limited, retry after:', error.retryAfter);
  } else if (error instanceof PollingTimeoutError) {
    // Polling exceeded timeout
    console.error(`Timed out after ${error.elapsedMs}ms (${error.pollCount} polls)`);
  } else if (error instanceof PollingCancelledError) {
    // Polling was cancelled via AbortSignal
    console.error('Cancelled by user');
  } else if (error instanceof GammaError) {
    // Other API errors
    console.error('API error:', error.message, error.statusCode, error.requestId);
  } else {
    throw error;
  }
}
```

### Error Classes

| Error Class | HTTP Status | Description |
|-------------|-------------|-------------|
| `GammaError` | - | Base class for all SDK errors |
| `ValidationError` | 400 | Invalid request parameters |
| `AuthenticationError` | 401 | Invalid or missing API key |
| `AuthorizationError` | 403 | No credits or insufficient permissions |
| `NotFoundError` | 404 | Resource not found |
| `GenerationFailedError` | 422 | Generation failed (empty output or status: 'failed') |
| `RateLimitError` | 429 | Rate limit exceeded (50 requests/hour) |
| `ServerError` | 500 | Server encountered an error |
| `GatewayError` | 502 | Gateway error (temporary) |
| `NetworkError` | - | Network connectivity error |
| `PollingTimeoutError` | - | Polling exceeded timeout limit |
| `PollingCancelledError` | - | Polling cancelled via AbortSignal |

## Types

All types are exported from the package for full TypeScript support.

```typescript
import type {
  // Request types
  GenerateRequest,
  GenerateFromTemplateRequest,

  // Response types
  GenerationStartResponse,
  GenerationCompletedResponse,
  GenerationFailedResponse,
  GenerationStatusResponse,
  GenerationError,
  Theme,
  Folder,
  Credits,
  PaginatedResponse,

  // Enum types
  TextMode,           // 'generate' | 'condense' | 'preserve'
  TextAmount,         // 'brief' | 'medium' | 'detailed' | 'extensive'
  Format,             // 'presentation' | 'document' | 'social' | 'webpage'
  Dimension,          // '16x9' | '4x3' | 'fluid' | 'a4' | 'letter' | ...
  ExportFormat,       // 'pdf' | 'pptx'
  ImageSource,        // 'aiGenerated' | 'pexels' | 'unsplash' | 'noImages' | ...
  ImageModel,         // 'flux-1-quick' | 'imagen-4-pro' | ...
  LanguageCode,       // 'en' | 'es' | 'fr' | 'de' | ...
  ThemeType,          // 'standard' | 'custom'
  GenerationStatus,   // 'pending' | 'completed' | 'failed'

  // Option types
  TextOptions,
  ImageOptions,
  CardOptions,
  SharingOptions,
} from '@chowderr/gamma-sdk';

// Type guards
import {
  isGenerationCompleted,
  isGenerationPending,
  isGenerationFailed,
} from '@chowderr/gamma-sdk';
```

## Requirements

- **Node.js 18+** - Uses native `fetch` API
- **Gamma API Key** - Requires a Pro, Ultra, Team, or Business plan

Get your API key from the [Gamma app settings](https://gamma.app/settings/api).

## Rate Limits

- **50 generations per hour** - Contact Gamma support for higher limits
- Credit costs vary by image model and generation complexity

## License

MIT
