'use server';

import { prisma } from '@/db/prisma';
import { CartItem } from '@/types';
import { convertToPOJO, formatError, round2 } from '../utils';
import { cookies } from 'next/headers';
import { auth } from '@/auth';
import { cartItemSchema, insertCartSchema } from '../validators';

// calculate cart prices
const calcPrice = (items: CartItem[]) => {
	const itemsPrice = round2(
			items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
		),
		shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
		taxPrice = round2(0.15 * itemsPrice),
		totalPrice = round2(itemsPrice + taxPrice + shippingPrice);

	return {
		itemsPrice: itemsPrice.toFixed(2),
		shippingPrice: shippingPrice.toFixed(2),
		taxPrice: taxPrice.toFixed(2),
		totalPrice: totalPrice.toFixed(2)
	};
};

export async function addItemToCart(data: CartItem) {
	try {
		// check for cookie
		const sessionCartId = (await cookies()).get('sessionCartId')?.value;

		if (!sessionCartId) {
			throw new Error('Cart session not found');
		}

		// get session and id
		const session = await auth();
		const userId = session?.user?.id ? (session.user.id as string) : undefined;

		// get cart
		const cart = await getMyCart();

		// parse and validate item
		const item = cartItemSchema.parse(data);

		console.log('item', item);

		// find product in db
		const product = await prisma.product.findFirst({
			where: {
				id: item.productId
			}
		});

		if (!product) {
			throw new Error('Product not found');
		}

		if (!cart) {
			// create new cart
			const newCart = insertCartSchema.parse({
				userId,
				items: [item],
				sessionCartId: sessionCartId,
				...calcPrice([item])
			});

			console.log(newCart);
		}
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}

	return {
		success: true,
		message: 'Item added to Cart'
	};
}

export async function getMyCart() {
	// check for cookie
	const sessionCartId = (await cookies()).get('sessionCartId')?.value;

	if (!sessionCartId) {
		throw new Error('Cart session not found');
	}

	// get session and id
	const session = await auth();
	const userId = session?.user?.id ? (session.user.id as string) : undefined;

	// get user cart from db
	const cart = await prisma.cart.findFirst({
		where: userId
			? {
					id: userId
			  }
			: {
					sessionCartId
			  }
	});

	if (!cart) {
		return undefined;
	}

	// convert decimals
	return convertToPOJO({
		...cart,
		items: cart.items as CartItem[],
		itemsPrice: cart.itemsPrice.toString(),
		totalPrice: cart.totalPrice.toString(),
		taxPrice: cart.taxPrice.toString(),
		shippingPrice: cart.shippingPrice.toString()
	});
}
