# Gamma API v1.0 — Complete Reference for SDK Development

> **Source:** Compiled from [developers.gamma.app](https://developers.gamma.app) on February 5, 2026
> **API Base URL:** `https://public-api.gamma.app/v1.0/`
> **Authentication:** API key via `X-API-KEY` header (format: `sk-gamma-xxxxxxxx`)
> **Required Plan:** Pro, Ultra, Team, or Business

---

## Endpoints Overview

| # | Method | Endpoint | Description |
|---|--------|----------|-------------|
| 1 | POST | `/v1.0/generations` | Generate a gamma from scratch |
| 2 | POST | `/v1.0/generations/from-template` | Generate a gamma from an existing template (beta) |
| 3 | GET | `/v1.0/generations/{generationId}` | Check generation status / retrieve result |
| 4 | GET | `/v1.0/themes` | List themes (paginated, searchable) |
| 5 | GET | `/v1.0/folders` | List folders (paginated, searchable) |

---

## Endpoint 1: Generate a Gamma

**`POST /v1.0/generations`**

### Request Body

#### Top-Level Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `inputText` | string | **Yes** | — | Content used to generate gamma. Supports text + image URLs. Token limit: 100,000 (~400,000 chars). Use `\n---\n` for card breaks. |
| `textMode` | string | **Yes** | — | How inputText is modified. Values: `generate`, `condense`, `preserve` |
| `format` | string | No | `presentation` | Output type. Values: `presentation`, `document`, `social`, `webpage` |
| `themeId` | string | No | workspace default | Theme ID from GET Themes or copied from app |
| `numCards` | integer | No | `10` | Number of cards. Pro: 1-60, Ultra: 1-75. Only used when `cardSplit` is `auto`. |
| `cardSplit` | string | No | `auto` | How content divides into cards. Values: `auto`, `inputTextBreaks` |
| `additionalInstructions` | string | No | — | Extra specifications for output. Char limit: 1-2000. |
| `folderIds` | string[] | No | — | Folder IDs to store the gamma in. Must be a member of the folder. |
| `exportAs` | string | No | — | Export format. Values: `pdf`, `pptx`. Links expire after a period. |

#### `textOptions` (object, optional)

| Parameter | Type | Required | Default | Condition | Description |
|-----------|------|----------|---------|-----------|-------------|
| `textOptions.amount` | string | No | `medium` | Only when `textMode` = `generate` or `condense` | Text density per card. Values: `brief`, `medium`, `detailed`, `extensive` |
| `textOptions.tone` | string | No | — | Only when `textMode` = `generate` | Mood/voice. Free text, 1-500 chars. Example: `"professional, inspiring"` |
| `textOptions.audience` | string | No | — | Only when `textMode` = `generate` | Target audience. Free text, 1-500 chars. Example: `"seven year olds"` |
| `textOptions.language` | string | No | `en` | — | Output language code. See Language Codes section below. |

#### `imageOptions` (object, optional)

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `imageOptions.source` | string | No | `aiGenerated` | Image source. Values: `aiGenerated`, `pictographic`, `pexels`, `giphy`, `webAllImages`, `webFreeToUse`, `webFreeToUseCommercially`, `placeholder`, `noImages` |
| `imageOptions.model` | string | No | auto-selected | Only when `source` = `aiGenerated`. See Image Models section below. |
| `imageOptions.style` | string | No | — | Only when `source` = `aiGenerated`. Artistic style. Free text, 1-500 chars. Example: `"minimal, black and white, line art"` |

#### `cardOptions` (object, optional)

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `cardOptions.dimensions` | string | No | varies by format | Aspect ratio. Not applicable if `format` = `webpage`. See Dimensions table below. |
| `cardOptions.headerFooter` | object | No | — | Header/footer configuration. Not applicable if `format` = `webpage`. See Header/Footer section below. |

**Dimensions by format:**

| Format | Options | Default |
|--------|---------|---------|
| `presentation` | `fluid`, `16x9`, `4x3` | `fluid` |
| `document` | `fluid`, `pageless`, `letter`, `a4` | `fluid` |
| `social` | `1x1`, `4x5`, `9x16` | `4x5` |
| `webpage` | N/A | N/A |

**Header/Footer configuration (`cardOptions.headerFooter`):**

| Parameter | Type | Description |
|-----------|------|-------------|
| `topLeft`, `topRight`, `topCenter`, `bottomLeft`, `bottomRight`, `bottomCenter` | object | Position config |
| `hideFromFirstCard` | boolean (default: `false`) | Hide header/footer from first card |
| `hideFromLastCard` | boolean (default: `false`) | Hide header/footer from last card |

**Position object options:**

| Type | Additional Fields |
|------|-------------------|
| `text` | `value` (required) — the text string |
| `image` | `source` (required): `themeLogo` or `custom`; `size` (optional): `sm`, `md`, `lg`, `xl`; if `custom`: `src` (required) — image URL |
| `cardNumber` | No additional fields |

#### `sharingOptions` (object, optional)

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `sharingOptions.workspaceAccess` | string | No | workspace share settings | Values: `noAccess`, `view`, `comment`, `edit`, `fullAccess` |
| `sharingOptions.externalAccess` | string | No | workspace share settings | Values: `noAccess`, `view`, `comment`, `edit` |
| `sharingOptions.emailOptions.recipients` | string[] | No | — | Email addresses to share with |
| `sharingOptions.emailOptions.access` | string | No | — | Values: `view`, `comment`, `edit`, `fullAccess` |

### Response

**Success (200):**
```json
{
  "generationId": "yyyyyyyyyy"
}
```

**Error (400):**
```json
{
  "message": "Input validation errors: 1. …",
  "statusCode": 400
}
```

**Error (403 — no credits):**
```json
{
  "message": "Forbidden",
  "statusCode": 403
}
```

---

## Endpoint 2: Create from Template

**`POST /v1.0/generations/from-template`**

> ⚠️ This endpoint is currently in **beta**. Functionality, rate limits, and pricing are subject to change.

### Request Body

#### Top-Level Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `gammaId` | string | **Yes** | — | Template ID to modify. Format: `g_abcdef123456ghi`. Found in the Gamma app. |
| `prompt` | string | **Yes** | — | Text content, image URLs, and instructions. Token limit: 100,000 (~400,000 chars) shared with template content. |
| `themeId` | string | No | template's theme | Theme ID |
| `folderIds` | string[] | No | — | Folder IDs to store in |
| `exportAs` | string | No | — | Values: `pdf`, `pptx` |

#### `imageOptions` (object, optional)

> Note: When creating from a template, new images automatically match the image source used in the original template. These options only apply when the original template used AI-generated images.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `imageOptions.model` | string | No | auto-selected | AI image model. See Image Models section. |
| `imageOptions.style` | string | No | — | Artistic style. Free text, 1-500 chars. |

#### `sharingOptions` (object, optional)

Same structure as Generate endpoint:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `sharingOptions.workspaceAccess` | string | No | workspace defaults | Values: `noAccess`, `view`, `comment`, `edit`, `fullAccess` |
| `sharingOptions.externalAccess` | string | No | workspace defaults | Values: `noAccess`, `view`, `comment`, `edit` |
| `sharingOptions.emailOptions.recipients` | string[] | No | — | Email addresses |
| `sharingOptions.emailOptions.access` | string | No | — | Values: `view`, `comment`, `edit`, `fullAccess` |

### Response

Same as Generate endpoint.

---

## Endpoint 3: Get Generation Status

**`GET /v1.0/generations/{generationId}`**

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `generationId` | string | **Yes** | The generation ID returned from POST endpoints |

### Responses

**Pending:**
```json
{
  "status": "pending",
  "generationId": "XXXXXXXXXXX"
}
```

**Completed:**
```json
{
  "generationId": "XXXXXXXXXXX",
  "status": "completed",
  "gammaUrl": "https://gamma.app/docs/yyyyyyyyyy",
  "credits": {
    "deducted": 150,
    "remaining": 3000
  }
}
```

> Note: If `exportAs` was specified in the generation request, the completed response will also include file download URLs. These links **expire after a period of time**.

**Not Found (404):**
```json
{
  "message": "Generation ID not found. generationId: xxxxxx",
  "statusCode": 404,
  "credits": {
    "deducted": 0,
    "remaining": 3000
  }
}
```

---

## Endpoint 4: List Themes

**`GET /v1.0/themes`**

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | No | — | Search by name (case-insensitive) |
| `limit` | integer | No | — | Items per page. Max: 50. |
| `after` | string | No | — | Cursor token for next page (from previous `nextCursor`) |

### Response

```json
{
  "data": [
    {
      "id": "abcdefghi",
      "name": "Prism",
      "type": "custom",
      "colorKeywords": ["light", "blue", "pink", "purple", "pastel", "gradient", "vibrant"],
      "toneKeywords": ["playful", "friendly", "creative", "inspirational", "fun"]
    }
  ],
  "hasMore": true,
  "nextCursor": "abc123def456ghi789"
}
```

**Theme object fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Theme ID (used as `themeId` in generation endpoints) |
| `name` | string | Theme display name |
| `type` | string | `standard` (global) or `custom` (workspace-specific) |
| `colorKeywords` | string[] | Color descriptors |
| `toneKeywords` | string[] | Tone descriptors |

---

## Endpoint 5: List Folders

**`GET /v1.0/folders`**

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | No | — | Search by name (case-insensitive) |
| `limit` | integer | No | — | Items per page. Max: 50. |
| `after` | string | No | — | Cursor token for next page (from previous `nextCursor`) |

### Response

```json
{
  "data": [
    {
      "id": "abc123def456",
      "name": "Business Proposals"
    }
  ],
  "hasMore": false,
  "nextCursor": null
}
```

**Folder object fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Folder ID (used in `folderIds` in generation endpoints) |
| `name` | string | Folder display name |

---

## Pagination (Themes & Folders)

Both list endpoints use **cursor-based pagination** with identical structure:

1. First request: `GET /v1.0/themes?limit=50`
2. If `hasMore` is `true`, use `nextCursor` value: `GET /v1.0/themes?limit=50&after=abc123def456ghi789`
3. Repeat until `hasMore` is `false` and `nextCursor` is `null`

> Cursors are **forward-only** — you cannot paginate backward.

---

## Error Codes

| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | Input validation errors | Invalid parameters. Check error details. |
| 401 | Invalid API key | API key is invalid or not associated with a Pro+ account. |
| 403 | Forbidden | No credits left. Upgrade plan or refill credits. |
| 404 | Generation ID not found | Specified generation ID could not be located. |
| 422 | Failed to generate text | Generation produced empty output. Review inputs. |
| 429 | Too many requests | Rate limited. Retry after limit period. |
| 500 | An error occurred while generating the gamma | Unexpected error. Contact support with `x-request-id` header. |
| 502 | Bad gateway | Temporary gateway issue. Retry. |

**Error response format:**
```json
{
  "message": "Error description here",
  "statusCode": 400
}
```

---

## Image Models

| Model Name | String Value | Credits/Image | Plan Restriction |
|------------|-------------|---------------|------------------|
| Flux Fast 1.1 | `flux-1-quick` | 2 | — |
| Flux Kontext Fast | `flux-kontext-fast` | 2 | — |
| Imagen 3 Fast | `imagen-3-flash` | 2 | — |
| Luma Photon Flash | `luma-photon-flash-1` | 2 | — |
| Flux Pro | `flux-1-pro` | 8 | — |
| Imagen 3 | `imagen-3-pro` | 8 | — |
| Ideogram 3 Turbo | `ideogram-v3-turbo` | 10 | — |
| Luma Photon | `luma-photon-1` | 10 | — |
| Leonardo Phoenix | `leonardo-phoenix` | 15 | — |
| Flux Kontext Pro | `flux-kontext-pro` | 20 | — |
| Gemini 2.5 Flash | `gemini-2.5-flash-image` | 20 | — |
| Ideogram 3 | `ideogram-v3` | 20 | — |
| Imagen 4 | `imagen-4-pro` | 20 | — |
| Recraft | `recraft-v3` | 20 | — |
| GPT Image | `gpt-image-1-medium` | 30 | — |
| Flux Ultra | `flux-1-ultra` | 30 | Ultra only |
| Imagen 4 Ultra | `imagen-4-ultra` | 30 | Ultra only |
| Dall E 3 | `dall-e-3` | 33 | — |
| Flux Kontext Max | `flux-kontext-max` | 40 | Ultra only |
| Recraft Vector Illustration | `recraft-v3-svg` | 40 | — |
| Ideogram 3.0 Quality | `ideogram-v3-quality` | 45 | Ultra only |
| GPT Image Detailed | `gpt-image-1-high` | 120 | Ultra only |

---

## Language Codes

| Language | Code | | Language | Code |
|----------|------|-|----------|------|
| Afrikaans | `af` | | Albanian | `sq` |
| Arabic | `ar` | | Arabic (Saudi Arabia) | `ar-sa` |
| Bengali | `bn` | | Bosnian | `bs` |
| Bulgarian | `bg` | | Catalan | `ca` |
| Croatian | `hr` | | Czech | `cs` |
| Danish | `da` | | Dutch | `nl` |
| English (India) | `en-in` | | English (UK) | `en-gb` |
| English (US) | `en` | | Estonian | `et` |
| Finnish | `fi` | | French | `fr` |
| German | `de` | | Greek | `el` |
| Gujarati | `gu` | | Hausa | `ha` |
| Hebrew | `he` | | Hindi | `hi` |
| Hungarian | `hu` | | Icelandic | `is` |
| Indonesian | `id` | | Italian | `it` |
| Japanese (です/ます) | `ja` | | Japanese (だ/である) | `ja-da` |
| Kannada | `kn` | | Kazakh | `kk` |
| Korean | `ko` | | Latvian | `lv` |
| Lithuanian | `lt` | | Macedonian | `mk` |
| Malay | `ms` | | Malayalam | `ml` |
| Marathi | `mr` | | Norwegian | `nb` |
| Persian | `fa` | | Polish | `pl` |
| Portuguese (Brazil) | `pt-br` | | Portuguese (Portugal) | `pt-pt` |
| Romanian | `ro` | | Russian | `ru` |
| Serbian | `sr` | | Simplified Chinese | `zh-cn` |
| Slovenian | `sl` | | Spanish | `es` |
| Spanish (Latin America) | `es-419` | | Spanish (Mexico) | `es-mx` |
| Spanish (Spain) | `es-es` | | Swahili | `sw` |
| Swedish | `sv` | | Tagalog | `tl` |
| Tamil | `ta` | | Telugu | `te` |
| Thai | `th` | | Traditional Chinese | `zh-tw` |
| Turkish | `tr` | | Ukrainian | `uk` |
| Urdu | `ur` | | Uzbek | `uz` |
| Vietnamese | `vi` | | Welsh | `cy` |
| Yoruba | `yo` | | | |

---

## Additional Notes

- **Rate limits:** 50 generations/hour. Contact support via Slack for higher capacity.
- **Credit system:** Higher tier subscriptions receive more monthly credits. Auto-recharge available at gamma.app/settings/billing.
- **Export file URLs:** Download immediately — links expire after a period of time.
- **OAuth:** Not yet available. API keys only.
- **Editing:** No edit/update endpoints exist. Editing must be done in the Gamma app.
- **Deleting:** No delete endpoints exist.
- **Listing gammas:** No endpoint to list existing gammas.
- **Webhooks:** Not supported. Must poll GET `/generations/{generationId}` for completion.
- **`x-request-id` header:** Returned in API responses. Include when contacting support.
- **Gamma MCP Server:** Exists as a hosted connector for AI tools (Claude, etc.). Mirrors Generate API capabilities. Does not support editing.
