import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('works', () => { 
    expect(2 + 2).toBe(4); 
  });
  
  it('basic math operations', () => {
    expect(Math.max(1, 2, 3)).toBe(3);
    expect(Math.min(1, 2, 3)).toBe(1);
  });
  
  it('string operations', () => {
    expect('Fire Safety KZ'.toLowerCase()).toBe('fire safety kz');
    expect('test'.length).toBe(4);
  });
});