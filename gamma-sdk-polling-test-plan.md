# Gamma SDK — Polling Behavior Test Plan

> **Purpose:** Determine real-world generation times across different configurations to inform the SDK's default polling interval, timeout, and backoff strategy.
>
> **How to use:** Run each test scenario using the Gamma API directly (cURL or script). Record the results in the table provided. Each test is a pair of requests: a POST to start the generation, then repeated GETs to check status.
>
> **Reference:** See `gamma-api-reference.md` for full parameter documentation.

---

## Test Setup

### Authentication

```
X-API-KEY: <YOUR_API_KEY>
```

### Base URL

```
https://public-api.gamma.app/v1.0
```

### How Each Test Works

1. **POST** to `/generations` (or `/generations/from-template`) with the test config
2. Record the `generationId` from the response
3. **GET** `/generations/{generationId}` every **10 seconds**
4. Record how many polls it took and the total time until `status` = `completed`
5. Record the full completed response (to capture any undocumented fields like export URLs)

### Important

- Run each test **at least twice** to check for variance
- Record the **full JSON response** for completed generations (we need to see the exact response shape, especially when `exportAs` is used)
- Note any status values other than `pending` and `completed` — we need to know if `failed`, `processing`, or other statuses exist
- Note the `x-request-id` response header for each request (useful for debugging)

---

## Test Scenarios

### Test 1: Minimal Generation (Baseline)

**Goal:** Establish the fastest possible generation time with the absolute minimum config.

```bash
curl --request POST \
  --url https://public-api.gamma.app/v1.0/generations \
  --header 'Content-Type: application/json' \
  --header 'X-API-KEY: <YOUR_API_KEY>' \
  --data '{
    "inputText": "Three tips for staying productive",
    "textMode": "generate"
  }'
```

Then poll:

```bash
curl --request GET \
  --url https://public-api.gamma.app/v1.0/generations/<GENERATION_ID> \
  --header 'X-API-KEY: <YOUR_API_KEY>' \
  --header 'accept: application/json'
```

| Run | Generation ID | Polls (every 10s) | Total Time | Final Status | Credits Deducted | Notes |
|-----|--------------|-------------------|------------|--------------|-----------------|-------|
| 1 | | | | | | |
| 2 | | | | | | |

---

### Test 2: Small Presentation with Options

**Goal:** Typical use case — a short presentation with a theme, specific format, and text options.

```bash
curl --request POST \
  --url https://public-api.gamma.app/v1.0/generations \
  --header 'Content-Type: application/json' \
  --header 'X-API-KEY: <YOUR_API_KEY>' \
  --data '{
    "inputText": "Five strategies for effective remote team management. Cover communication tools, async workflows, team bonding, performance tracking, and work-life balance.",
    "textMode": "generate",
    "format": "presentation",
    "numCards": 5,
    "cardSplit": "auto",
    "textOptions": {
      "amount": "medium",
      "tone": "professional",
      "audience": "team leads and managers",
      "language": "en"
    },
    "imageOptions": {
      "source": "aiGenerated",
      "model": "flux-1-quick",
      "style": "clean, modern, minimal"
    }
  }'
```

| Run | Generation ID | Polls (every 10s) | Total Time | Final Status | Credits Deducted | Notes |
|-----|--------------|-------------------|------------|--------------|-----------------|-------|
| 1 | | | | | | |
| 2 | | | | | | |

---

### Test 3: Larger Presentation (Stress Test)

**Goal:** Test a heavier generation — more cards, more text, premium image model.

```bash
curl --request POST \
  --url https://public-api.gamma.app/v1.0/generations \
  --header 'Content-Type: application/json' \
  --header 'X-API-KEY: <YOUR_API_KEY>' \
  --data '{
    "inputText": "A comprehensive guide to starting a SaaS business in 2026. Cover: market research, MVP development, pricing strategies, go-to-market plan, customer acquisition channels, retention strategies, metrics and KPIs, scaling operations, fundraising options, legal considerations, team building, technology stack decisions, competitive analysis, customer support setup, and long-term vision planning.",
    "textMode": "generate",
    "format": "presentation",
    "numCards": 20,
    "cardSplit": "auto",
    "additionalInstructions": "Make each section actionable with specific examples and data points where relevant",
    "textOptions": {
      "amount": "detailed",
      "tone": "professional, authoritative",
      "audience": "aspiring entrepreneurs and startup founders",
      "language": "en"
    },
    "imageOptions": {
      "source": "aiGenerated",
      "model": "imagen-4-pro",
      "style": "photorealistic, business, corporate"
    },
    "cardOptions": {
      "dimensions": "16x9"
    }
  }'
```

| Run | Generation ID | Polls (every 10s) | Total Time | Final Status | Credits Deducted | Notes |
|-----|--------------|-------------------|------------|--------------|-----------------|-------|
| 1 | | | | | | |
| 2 | | | | | | |

---

### Test 4: Document Format

**Goal:** See if document format has different generation times than presentation.

```bash
curl --request POST \
  --url https://public-api.gamma.app/v1.0/generations \
  --header 'Content-Type: application/json' \
  --header 'X-API-KEY: <YOUR_API_KEY>' \
  --data '{
    "inputText": "An onboarding guide for new employees at a mid-size technology company. Cover first day logistics, team introductions, tool setup, company culture, HR policies, and 30-60-90 day expectations.",
    "textMode": "generate",
    "format": "document",
    "numCards": 8,
    "textOptions": {
      "amount": "detailed",
      "tone": "friendly, welcoming",
      "language": "en"
    },
    "imageOptions": {
      "source": "pictographic"
    },
    "cardOptions": {
      "dimensions": "letter"
    }
  }'
```

| Run | Generation ID | Polls (every 10s) | Total Time | Final Status | Credits Deducted | Notes |
|-----|--------------|-------------------|------------|--------------|-----------------|-------|
| 1 | | | | | | |
| 2 | | | | | | |

---

### Test 5: Social Post Format

**Goal:** Smallest output format — should be fastest. Good lower bound test.

```bash
curl --request POST \
  --url https://public-api.gamma.app/v1.0/generations \
  --header 'Content-Type: application/json' \
  --header 'X-API-KEY: <YOUR_API_KEY>' \
  --data '{
    "inputText": "Three reasons automation saves small businesses time and money",
    "textMode": "generate",
    "format": "social",
    "numCards": 3,
    "textOptions": {
      "amount": "brief",
      "tone": "engaging, punchy"
    },
    "imageOptions": {
      "source": "aiGenerated",
      "model": "flux-1-quick",
      "style": "bold, colorful, social media"
    },
    "cardOptions": {
      "dimensions": "4x5"
    }
  }'
```

| Run | Generation ID | Polls (every 10s) | Total Time | Final Status | Credits Deducted | Notes |
|-----|--------------|-------------------|------------|--------------|-----------------|-------|
| 1 | | | | | | |
| 2 | | | | | | |

---

### Test 6: Webpage Format

**Goal:** Test the webpage format since it has different constraints (no dimensions, no header/footer).

```bash
curl --request POST \
  --url https://public-api.gamma.app/v1.0/generations \
  --header 'Content-Type: application/json' \
  --header 'X-API-KEY: <YOUR_API_KEY>' \
  --data '{
    "inputText": "A landing page for a fictional AI-powered project management tool called TaskFlow. Include hero section, features, pricing tiers, testimonials, and a call to action.",
    "textMode": "generate",
    "format": "webpage",
    "numCards": 6,
    "textOptions": {
      "amount": "medium",
      "tone": "modern, confident"
    },
    "imageOptions": {
      "source": "aiGenerated",
      "model": "flux-1-quick",
      "style": "tech, clean, SaaS"
    }
  }'
```

| Run | Generation ID | Polls (every 10s) | Total Time | Final Status | Credits Deducted | Notes |
|-----|--------------|-------------------|------------|--------------|-----------------|-------|
| 1 | | | | | | |
| 2 | | | | | | |

---

### Test 7: With PDF Export

**Goal:** Determine if requesting `exportAs: pdf` adds extra time to generation, and capture the exact response shape including the download URL.

```bash
curl --request POST \
  --url https://public-api.gamma.app/v1.0/generations \
  --header 'Content-Type: application/json' \
  --header 'X-API-KEY: <YOUR_API_KEY>' \
  --data '{
    "inputText": "A quarterly business review covering revenue, customer growth, product milestones, and next quarter goals",
    "textMode": "generate",
    "format": "presentation",
    "numCards": 8,
    "exportAs": "pdf",
    "textOptions": {
      "amount": "medium",
      "tone": "professional"
    },
    "imageOptions": {
      "source": "aiGenerated",
      "model": "flux-1-quick",
      "style": "corporate, clean"
    }
  }'
```

**⚠️ IMPORTANT: Record the FULL completed response JSON for this test.** We need to see the exact field names and structure for the export download URL.

| Run | Generation ID | Polls (every 10s) | Total Time | Final Status | Credits Deducted | Full Response JSON | Notes |
|-----|--------------|-------------------|------------|--------------|-----------------|-------------------|-------|
| 1 | | | | | | | |
| 2 | | | | | | | |

---

### Test 8: With PPTX Export

**Goal:** Same as Test 7 but with PPTX to compare and capture response shape.

```bash
curl --request POST \
  --url https://public-api.gamma.app/v1.0/generations \
  --header 'Content-Type: application/json' \
  --header 'X-API-KEY: <YOUR_API_KEY>' \
  --data '{
    "inputText": "A quarterly business review covering revenue, customer growth, product milestones, and next quarter goals",
    "textMode": "generate",
    "format": "presentation",
    "numCards": 8,
    "exportAs": "pptx",
    "textOptions": {
      "amount": "medium",
      "tone": "professional"
    },
    "imageOptions": {
      "source": "aiGenerated",
      "model": "flux-1-quick",
      "style": "corporate, clean"
    }
  }'
```

**⚠️ IMPORTANT: Record the FULL completed response JSON for this test.**

| Run | Generation ID | Polls (every 10s) | Total Time | Final Status | Credits Deducted | Full Response JSON | Notes |
|-----|--------------|-------------------|------------|--------------|-----------------|-------------------|-------|
| 1 | | | | | | | |
| 2 | | | | | | | |

---

### Test 9: Preserve Text Mode

**Goal:** Test `preserve` mode which should do less AI processing. May be faster.

```bash
curl --request POST \
  --url https://public-api.gamma.app/v1.0/generations \
  --header 'Content-Type: application/json' \
  --header 'X-API-KEY: <YOUR_API_KEY>' \
  --data '{
    "inputText": "# Introduction\nWelcome to our company overview.\n---\n# Our Mission\nWe help businesses automate their workflows.\n---\n# Our Services\nConsulting, implementation, and training.\n---\n# Contact Us\nReach out at hello@example.com",
    "textMode": "preserve",
    "format": "presentation",
    "cardSplit": "inputTextBreaks",
    "imageOptions": {
      "source": "noImages"
    }
  }'
```

| Run | Generation ID | Polls (every 10s) | Total Time | Final Status | Credits Deducted | Notes |
|-----|--------------|-------------------|------------|--------------|-----------------|-------|
| 1 | | | | | | |
| 2 | | | | | | |

---

### Test 10: No Images

**Goal:** Isolate whether AI image generation is a significant factor in total generation time.

```bash
curl --request POST \
  --url https://public-api.gamma.app/v1.0/generations \
  --header 'Content-Type: application/json' \
  --header 'X-API-KEY: <YOUR_API_KEY>' \
  --data '{
    "inputText": "Five strategies for effective remote team management. Cover communication tools, async workflows, team bonding, performance tracking, and work-life balance.",
    "textMode": "generate",
    "format": "presentation",
    "numCards": 5,
    "textOptions": {
      "amount": "medium",
      "tone": "professional",
      "language": "en"
    },
    "imageOptions": {
      "source": "noImages"
    }
  }'
```

> **Compare directly with Test 2** (same prompt, same card count, but Test 2 has AI images). The difference tells us how much image generation adds.

| Run | Generation ID | Polls (every 10s) | Total Time | Final Status | Credits Deducted | Notes |
|-----|--------------|-------------------|------------|--------------|-----------------|-------|
| 1 | | | | | | |
| 2 | | | | | | |

---

### Test 11: Premium Image Model

**Goal:** See if a heavier image model (imagen-4-pro vs flux-1-quick) noticeably increases generation time.

```bash
curl --request POST \
  --url https://public-api.gamma.app/v1.0/generations \
  --header 'Content-Type: application/json' \
  --header 'X-API-KEY: <YOUR_API_KEY>' \
  --data '{
    "inputText": "Five strategies for effective remote team management. Cover communication tools, async workflows, team bonding, performance tracking, and work-life balance.",
    "textMode": "generate",
    "format": "presentation",
    "numCards": 5,
    "textOptions": {
      "amount": "medium",
      "tone": "professional",
      "language": "en"
    },
    "imageOptions": {
      "source": "aiGenerated",
      "model": "imagen-4-pro",
      "style": "clean, modern, minimal"
    }
  }'
```

> **Compare directly with Test 2** (same prompt, but Test 2 uses `flux-1-quick`). The difference tells us if image model choice affects generation time.

| Run | Generation ID | Polls (every 10s) | Total Time | Final Status | Credits Deducted | Notes |
|-----|--------------|-------------------|------------|--------------|-----------------|-------|
| 1 | | | | | | |
| 2 | | | | | | |

---

## What We're Looking For

After running all tests, fill in this summary:

### Timing Summary

| Test | Description | Avg Time | Avg Polls |
|------|-------------|----------|-----------|
| 1 | Minimal (baseline) | | |
| 2 | Small presentation w/ fast images | | |
| 3 | Large presentation (20 cards, premium images) | | |
| 4 | Document format | | |
| 5 | Social post (smallest) | | |
| 6 | Webpage format | | |
| 7 | With PDF export | | |
| 8 | With PPTX export | | |
| 9 | Preserve mode, no images | | |
| 10 | Generate mode, no images | | |
| 11 | Same as Test 2 but premium image model | | |

### Key Questions to Answer

1. **What is the fastest generation time?** (Likely Test 5 or Test 9)
2. **What is the slowest generation time?** (Likely Test 3)
3. **Does image model choice significantly affect time?** (Compare Test 2 vs Test 11)
4. **Does removing images significantly speed things up?** (Compare Test 2 vs Test 10)
5. **Does export (PDF/PPTX) add time?** (Compare Test 2 vs Test 7/8)
6. **Are there status values other than `pending` and `completed`?** (Record any new ones)
7. **What does the export response look like?** (Full JSON from Tests 7 and 8)
8. **Is 10 seconds a good default polling interval?** Based on the data, does polling every 10 seconds feel right or should we adjust?

### SDK Polling Defaults (Fill In After Testing)

Based on test results, our recommended SDK defaults:

| Setting | Value | Rationale |
|---------|-------|-----------|
| Default polling interval | 10s (adjust after testing) | |
| Default timeout | ___s | Should be > slowest observed time + buffer |
| Backoff strategy | Yes/No | If most generations complete within a tight range, backoff may not be needed |
| Max backoff interval | ___s | Cap so we don't wait too long between checks |

---

## Edge Case Tests (Optional)

If credits allow, these are also useful:

### Test E1: Invalid Generation ID

**Goal:** Confirm 404 behavior and response shape.

```bash
curl --request GET \
  --url https://public-api.gamma.app/v1.0/generations/this_does_not_exist \
  --header 'X-API-KEY: <YOUR_API_KEY>' \
  --header 'accept: application/json'
```

### Test E2: Empty Input Text

**Goal:** Confirm 400 validation error shape.

```bash
curl --request POST \
  --url https://public-api.gamma.app/v1.0/generations \
  --header 'Content-Type: application/json' \
  --header 'X-API-KEY: <YOUR_API_KEY>' \
  --data '{
    "inputText": "",
    "textMode": "generate"
  }'
```

### Test E3: Invalid Parameter Value

**Goal:** Confirm error shape for bad enum values.

```bash
curl --request POST \
  --url https://public-api.gamma.app/v1.0/generations \
  --header 'Content-Type: application/json' \
  --header 'X-API-KEY: <YOUR_API_KEY>' \
  --data '{
    "inputText": "Test",
    "textMode": "invalid_value"
  }'
```

### Test E4: Poll a Completed Generation Again

**Goal:** See if polling a generation that already completed still returns the completed response, or if it expires.

```bash
# Use a generationId from a previously completed test
# Wait 5 minutes, then poll again
# Wait 30 minutes, then poll again
# Record if/when it stops returning data
```

> Record the full responses for all edge case tests. These define our error types.
