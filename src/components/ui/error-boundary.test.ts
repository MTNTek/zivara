import { describe, it, expect } from 'vitest';

describe('Error Boundary Components', () => {
  it('ErrorBoundary component can be imported', async () => {
    const module = await import('./error-boundary');
    expect(module.ErrorBoundary).toBeDefined();
    expect(typeof module.ErrorBoundary).toBe('function');
  });

  it('SectionErrorBoundary component can be imported', async () => {
    const module = await import('./section-error-boundary');
    expect(module.SectionErrorBoundary).toBeDefined();
    expect(typeof module.SectionErrorBoundary).toBe('function');
  });
});

