'use server';

import prisma from '@/db/prisma';
import { CartItem } from '@/types';
import { convertToPOJO, formatError, round2 } from '../utils';
import { cookies } from 'next/headers';
import { auth } from '@/auth';
import { cartItemSchema, insertCartSchema } from '../validators';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

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

			await prisma.cart.create({
				data: newCart
			});

			revalidatePath(`/products/${data.slug}`);

			return {
				success: true,
				message: `${product.name} added to cart`
			};
		} else {
			// check if item is already in the cart
			const existItem = (cart.items as CartItem[]).find(
				(x) => x.productId === item.productId
			);

			if (existItem) {
				// check stock
				if (product.stock < existItem.qty + 1) {
					throw new Error('Not enough stock');
				}

				// increase quantity
				(cart.items as CartItem[]).find(
					(x) => x.productId === item.productId
				)!.qty = existItem.qty + 1;
			} else {
				// if item does not exist in cart
				// check stock
				if (product.stock < 1) {
					throw new Error('Not enough stock');
				}

				// add item to the cart.items
				cart.items.push(item);
			}

			// save to db
			await prisma.cart.update({
				where: {
					id: cart.id
				},
				data: {
					items: cart.items as Prisma.CartUpdateitemsInput[],
					...calcPrice(cart.items as CartItem[])
				}
			});

			revalidatePath(`/products/${data.slug}`);

			return {
				success: true,
				message: `${product.name} ${
					!!existItem ? 'updated in' : 'added to'
				} cart`
			};
		}
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
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
					userId
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

// delete items
export async function removeItemFromCart(productId: string) {
	try {
		// check for cookie
		const sessionCartId = (await cookies()).get('sessionCartId')?.value;

		if (!sessionCartId) {
			throw new Error('Cart session not found');
		}

		// get product
		const product = await prisma.product.findFirst({
			where: {
				id: productId
			}
		});

		if (!product) {
			throw new Error('Product not found');
		}

		// get users cart
		const cart = await getMyCart();

		if (!cart) {
			throw new Error('Cart not found');
		}

		// check for item
		const exist = (cart.items as CartItem[]).find(
			(x) => x.productId === productId
		);

		if (!exist) {
			throw new Error('Item not found in cart');
		}

		// check if only 1 in qty
		if (exist.qty === 1) {
			// remove from cart
			cart.items = (cart.items as CartItem[]).filter(
				(x) => x.productId !== productId
			);
		} else {
			// decrease quantity
			(cart.items as CartItem[]).find((x) => x.productId === productId)!.qty =
				exist.qty - 1;
		}

		// update cart db
		await prisma.cart.update({
			where: {
				id: cart.id
			},
			data: {
				items: cart.items as Prisma.CartUpdateitemsInput[],
				...calcPrice(cart.items as CartItem[])
			}
		});

		revalidatePath(`/products/${product.slug}`);

		return {
			success: true,
			message: `${product.name} was removed from cart`
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}
