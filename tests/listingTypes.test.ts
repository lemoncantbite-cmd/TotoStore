import { maskRegistrationNumber, normalizeRegistrationNumber } from '../src/types/listing';

describe('listing helpers', () => {
  it('normalizes registration numbers', () => {
    expect(normalizeRegistrationNumber(' wb 37 ab 1234 ')).toBe('WB 37 AB 1234');
  });

  it('masks registration numbers while preserving the last four characters', () => {
    expect(maskRegistrationNumber('WB37AB1234')).toBe('****1234');
  });
});