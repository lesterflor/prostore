import { generateAccessToken } from '../lib/paypal';

// test to generate access token
test('generates token from paypal', async () => {
	const tokenResponse = await generateAccessToken();

	expect(typeof tokenResponse).toBe('string');
	expect(tokenResponse.length).toBeGreaterThan(0);

	console.log(tokenResponse);
});
