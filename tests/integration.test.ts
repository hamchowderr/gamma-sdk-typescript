import { describe, it, expect, beforeAll } from 'vitest';
import { getApiKey, skipIfNoApiKey } from './setup';
import { GammaClient, GammaRequest } from '../src';

describe('Gamma API Integration Tests', () => {
  let client: GammaClient;

  beforeAll(() => {
    if (skipIfNoApiKey()) {
      return;
    }
    client = new GammaClient({ apiKey: getApiKey() });
  });

  describe('Themes API', () => {
    it.skipIf(skipIfNoApiKey())('lists themes', async () => {
      const response = await client.themes.list({ limit: 5 });

      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
      expect(typeof response.hasMore).toBe('boolean');

      if (response.data.length > 0) {
        const theme = response.data[0];
        expect(theme.id).toBeDefined();
        expect(theme.name).toBeDefined();
        expect(theme.type).toMatch(/^(standard|custom)$/);
      }
    });

    it.skipIf(skipIfNoApiKey())('paginates through themes', async () => {
      const themes: string[] = [];
      let pageCount = 0;

      for await (const page of client.themes.paginate({ limit: 3 })) {
        pageCount++;
        themes.push(...page.data.map(t => t.name));

        // Only fetch 2 pages for testing
        if (pageCount >= 2) break;
      }

      expect(themes.length).toBeGreaterThan(0);
      console.log(`Fetched ${themes.length} themes across ${pageCount} pages`);
    });
  });

  describe('Folders API', () => {
    it.skipIf(skipIfNoApiKey())('lists folders', async () => {
      const response = await client.folders.list({ limit: 5 });

      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
      expect(typeof response.hasMore).toBe('boolean');
    });
  });

  describe('Generations API', () => {
    it.skipIf(skipIfNoApiKey())('creates a generation and polls for completion', async () => {
      const request = GammaRequest
        .create('Three simple tips for staying focused while working from home')
        .generate()
        .withTextAmount('brief')
        .asSocial()
        .square()
        .withCards(3)
        .noImages() // Faster generation without images
        .build();

      console.log('Starting generation...');

      let pollCount = 0;
      const result = await client.generations.createAndWait(request, {
        intervalMs: 5000, // Poll every 5 seconds
        timeoutMs: 300000, // 5 minute timeout
        onProgress: (progress) => {
          pollCount++;
          console.log(`Poll #${pollCount}: ${progress.status} (${Math.round(progress.elapsedMs / 1000)}s elapsed)`);
        },
      });

      expect(result.status).toBe('completed');
      expect(result.gammaUrl).toBeDefined();
      expect(result.gammaUrl).toMatch(/^https:\/\/gamma\.app/);
      expect(result.credits.deducted).toBeGreaterThan(0);

      console.log(`Generation completed!`);
      console.log(`  URL: ${result.gammaUrl}`);
      console.log(`  Credits used: ${result.credits.deducted}`);
      console.log(`  Credits remaining: ${result.credits.remaining}`);
    }, 600000); // 10 minute test timeout

    it.skipIf(skipIfNoApiKey())('can check status of a generation', async () => {
      // First create a generation
      const request = GammaRequest
        .create('Two tips for better sleep')
        .generate()
        .withTextAmount('brief')
        .asSocial()
        .withCards(2)
        .noImages()
        .build();

      const { generationId } = await client.generations.create(request);
      expect(generationId).toBeDefined();
      console.log(`Created generation: ${generationId}`);

      // Check the status
      const status = await client.generations.getStatus(generationId);
      expect(status.generationId).toBe(generationId);
      expect(['pending', 'completed']).toContain(status.status);
      console.log(`Status: ${status.status}`);

      // Wait for completion
      const result = await client.generations.waitForCompletion(generationId, {
        intervalMs: 5000,
        onProgress: (p) => console.log(`  Polling... ${p.status}`),
      });

      expect(result.status).toBe('completed');
      console.log(`Completed: ${result.gammaUrl}`);
    }, 600000);
  });
});
