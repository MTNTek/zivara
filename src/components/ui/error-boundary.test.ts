import { describe, it, expect } from 'vitest';

describe('Error Boundary Components', () => {
  it('ErrorBoundary component can be imported', async () => {
    const testModule = await import('./error-boundary');
    expect(testModule.ErrorBoundary).toBeDefined();
    expect(typeof testModule.ErrorBoundary).toBe('function');
  });

  it('SectionErrorBoundary component can be imported', async () => {
    const testModule = await import('./section-error-boundary');
    expect(testModule.SectionErrorBoundary).toBeDefined();
    expect(typeof testModule.SectionErrorBoundary).toBe('function');
  });
});

