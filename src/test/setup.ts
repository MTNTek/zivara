import { beforeAll, afterAll } from 'vitest';
import * as dotenv from 'dotenv';

// Load environment variables for tests
dotenv.config();

beforeAll(() => {
  // Setup code before all tests
  console.log('Test environment initialized');
});

afterAll(() => {
  // Cleanup code after all tests
  console.log('Test environment cleaned up');
});
