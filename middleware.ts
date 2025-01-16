import { NextRequest, NextResponse } from 'next/server';
import { auth } from './auth';

export default async function middleware(request: NextRequest) {
	// get pathname
	const { pathname } = request.nextUrl;

	// check if user is not authenticated and accessing protected route
	const session = await auth();
	const userId = session?.user?.id;

	if (!userId && protectedPaths.some((p) => p.test(pathname))) {
		return NextResponse.redirect(new URL('/sign-in', request.url));
	}

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

const protectedPaths = [
	/\/shipping-address/,
	/\/payment-method/,
	/\/place-order/,
	/\/profile/,
	/\/user\/(.*)/,
	/\/order\/(.*)/,
	/\/admin/
];
