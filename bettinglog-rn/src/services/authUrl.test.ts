import { pickAuthParams } from './authUrl';

test('extracts PKCE code from query', () => {
  expect(pickAuthParams('bettinglog://reset-password?code=abc123').code).toBe('abc123');
});

test('extracts tokens from fragment', () => {
  const p = pickAuthParams('bettinglog://auth#access_token=xyz&refresh_token=r1&type=recovery');
  expect(p.access_token).toBe('xyz');
  expect(p.refresh_token).toBe('r1');
});

test('surfaces error_description', () => {
  expect(pickAuthParams('bettinglog://auth?error_description=denied').error).toBe('denied');
});
