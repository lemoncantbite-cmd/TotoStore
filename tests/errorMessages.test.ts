import { getFriendlyErrorMessage } from '../src/lib/errorMessages';

describe('getFriendlyErrorMessage', () => {
  it('returns a network message for fetch failures', () => {
    expect(getFriendlyErrorMessage(new Error('fetch failed'))).toContain('Network issue');
  });

  it('returns a session message for expired auth', () => {
    expect(getFriendlyErrorMessage(new Error('JWT expired'))).toContain('session has expired');
  });

  it('uses the fallback for unknown non-errors', () => {
    expect(getFriendlyErrorMessage('unknown', 'Try again later.')).toBe('Try again later.');
  });
});