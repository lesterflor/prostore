import { NextRequest, NextResponse } from 'next/server';

export default function middleware(request: NextRequest) {
	// clone request headers
	const newRequestHeaders = new Headers(request.headers);

	// create new response and add the new headers
	const response = NextResponse.next({
		request: {
			headers: newRequestHeaders
		}
	});
	// check for session cart cookie
	if (!request.cookies.get('sessionCartId')) {
		const sessionCartId = crypto.randomUUID();

		// set newly generated session cart id in the response cookies
		response.cookies.set('sessionCartId', sessionCartId);
	}

	return response;
}
