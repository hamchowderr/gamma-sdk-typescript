import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local from project root
config({ path: resolve(__dirname, '..', '.env.local') });

export function getApiKey(): string {
  const apiKey = process.env.GAMMA_API_KEY;
  if (!apiKey || apiKey === 'sk-gamma-your-api-key-here') {
    throw new Error(
      'GAMMA_API_KEY not set. Please add your API key to .env.local'
    );
  }
  return apiKey;
}

export function skipIfNoApiKey(): boolean {
  const apiKey = process.env.GAMMA_API_KEY;
  return !apiKey || apiKey === 'sk-gamma-your-api-key-here';
}
