import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './db/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compareSync } from 'bcrypt-ts-edge';
import type { NextAuthConfig } from 'next-auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const config = {
	adapter: PrismaAdapter(prisma),

	providers: [
		CredentialsProvider({
			credentials: {
				email: { type: 'email' },
				password: { type: 'password' }
			},
			async authorize(credentials) {
				if (credentials === null) {
					return null;
				}

				const user = await prisma.user.findFirst({
					where: {
						email: credentials.email as string
					}
				});

				// check if user exists and password matches
				if (user && user.password) {
					const isMatch = compareSync(
						credentials.password as string,
						user.password
					);

					// if password correct, return user
					if (isMatch) {
						return {
							id: user.id,
							name: user.name,
							email: user.email,
							role: user.role
						};
					}
				}

				// if user does not exist
				return null;
			}
		})
	],
	pages: {
		signIn: '/sign-in',
		error: '/sign-in'
	},
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60 // 30 days
	},
	callbacks: {
		async session({ session, user, trigger, token }: any) {
			// Set the user ID from the token
			session.user.id = token.sub;
			session.user.role = token.role;
			session.user.name = token.name;

			// If there is an update, set the user name
			if (trigger === 'update') {
				session.user.name = user.name;
			}

			return session;
		},
		async jwt({ token, user, trigger, session }: any) {
			// assign user fields to token
			if (user) {
				token.role = user.role;

				// if user has no name then use the email
				if (user.name === 'NO_NAME') {
					token.name = user.email!.split('@')[0];
				}

				// update db to reflect token name
				await prisma.user.update({
					where: {
						id: user.id
					},
					data: {
						name: token.name
					}
				});
			}

			return token;
		},

		authorized({ request, auth }: any) {
			// check for session cart cookie
			if (!request.cookies.get('sessionCartId')) {
				const sessionCartId = crypto.randomUUID();

				// clone request headers
				const newRequestHeaders = new Headers(request.headers);

				// create new response and add the new headers
				const response = NextResponse.next({
					request: {
						headers: newRequestHeaders
					}
				});

				// set newly generated session cart id in the response cookies
				response.cookies.set('sessionCartId', sessionCartId);

				return response;
			} else {
				return true;
			}
		}
	}
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
