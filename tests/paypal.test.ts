import { generateAccessToken, paypal } from '../lib/paypal';

// test to generate access token
test('generates token from paypal', async () => {
	const tokenResponse = await generateAccessToken();

	expect(typeof tokenResponse).toBe('string');
	expect(tokenResponse.length).toBeGreaterThan(0);

	console.log(tokenResponse);
});

test('test to create a paypal order', async () => {
	const tokenResponse = await generateAccessToken();
	const price = 10.0;

	const orderResponse = await paypal.createOrder(price);
	console.log(orderResponse);

	expect(orderResponse).toHaveProperty('id');
	expect(orderResponse).toHaveProperty('status');
	expect(orderResponse.status).toBe('CREATED');
});

test('simulate capture payment with a mock order', async () => {
	const orderId = '100';

	const mockCapturePayments = jest
		.spyOn(paypal, 'capturePayment')
		.mockResolvedValue({
			status: 'COMPLETED'
		});

	const captureResponse = await paypal.capturePayment(orderId);

	expect(captureResponse).toHaveProperty('status');
	expect(captureResponse.status).toBe('COMPLETED');

	mockCapturePayments.mockRestore();
});
