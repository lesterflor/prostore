'use server';
import {
	shippingAddressSchema,
	signInFormSchema,
	signUpFormSchema,
	paymentMethodSchema
} from './../validators';
import { auth, signIn, signOut } from '@/auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { hashSync } from 'bcrypt-ts-edge';
import prisma from '@/db/prisma';
import { formatError } from '../utils';
import { ShippingAddress } from '@/types';
import { z } from 'zod';

// sign in the user with credentials
export async function signInWithCredentials(
	prevState: unknown,
	formData: FormData
) {
	try {
		const user = signInFormSchema.parse({
			email: formData.get('email'),
			password: formData.get('password')
		});

		await signIn('credentials', user);

		return {
			success: true,
			message: 'Signed In Successfully'
		};
	} catch (err: unknown) {
		if (isRedirectError(err)) {
			throw err;
		}

		return {
			success: false,
			message: 'Invalid credentials'
		};
	}
}

// sign out user
export async function signOutUser() {
	await signOut();
}

// sign up user
export async function signUpUser(prevState: unknown, formData: FormData) {
	try {
		const user = signUpFormSchema.parse({
			name: formData.get('name'),
			email: formData.get('email'),
			password: formData.get('password'),
			confirmPassword: formData.get('confirmPassword')
		});

		const unHashedPassword = user.password;

		user.password = hashSync(user.password, 10);

		await prisma.user.create({
			data: {
				name: user.name,
				email: user.email,
				password: user.password
			}
		});

		await signIn('credentials', {
			email: user.email,
			password: unHashedPassword
		});

		return {
			success: true,
			message: 'Successfully created user'
		};
	} catch (err: unknown) {
		if (isRedirectError(err)) {
			throw err;
		}

		return {
			success: false,
			message: formatError(err)
		};
	}
}

export async function getUserById(userId: string) {
	const user = await prisma.user.findFirst({
		where: {
			id: userId
		}
	});

	if (!user) {
		throw new Error('User not found');
	}

	return user;
}

export async function updateUserAddress(data: ShippingAddress) {
	try {
		const session = await auth();
		const currentUser = await prisma.user.findFirst({
			where: {
				id: session?.user?.id
			}
		});

		if (!currentUser) {
			throw new Error('user not found');
		}

		const address = shippingAddressSchema.parse(data);

		await prisma.user.update({
			where: {
				id: currentUser.id
			},
			data: {
				address
			}
		});

		return {
			success: true,
			message: 'User address updated successfully'
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

// update users payment method
export async function updateUsersPaymentMethod(
	data: z.infer<typeof paymentMethodSchema>
) {
	try {
		const session = await auth();
		const currentUser = await prisma.user.findFirst({
			where: {
				id: session?.user?.id
			}
		});

		if (!currentUser) {
			throw new Error('User not found');
		}

		const paymentMethod = paymentMethodSchema.parse(data);

		await prisma.user.update({
			where: {
				id: currentUser.id
			},
			data: {
				paymentMethod: paymentMethod.type
			}
		});

		return {
			success: true,
			message: 'User payment method updated successfully'
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

// update the user profile
export async function updateProfileAction(user: {
	name: string;
	email: string;
}) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			throw new Error('User is not authenticated');
		}

		const currentUser = await prisma.user.findFirst({
			where: {
				id: session?.user?.id
			}
		});

		if (!currentUser) {
			throw new Error('User was not found');
		}

		await prisma.user.update({
			where: {
				id: currentUser.id
			},
			data: {
				name: user.name
			}
		});

		return {
			success: true,
			message: 'User updated successfully'
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}
