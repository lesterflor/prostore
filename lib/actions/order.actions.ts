'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { formatError } from '../utils';
import { auth } from '@/auth';
import { getMyCart } from './cart.actions';
import { getUserById } from './user.actions';
import prisma from '@/db/prisma';
import { insertOrderSchema } from '../validators';
import { CartItem } from '@/types';

export async function createOrderAction() {
	try {
		const session = await auth();

		if (!session) {
			throw new Error('User is not authenticated');
		}

		const cart = await getMyCart();
		const userId = session?.user?.id;

		if (!userId) {
			throw new Error('User not found');
		}

		const user = await getUserById(userId);

		if (!cart || !cart.items.length) {
			return {
				success: false,
				message: 'Your cart is empty',
				redirectTo: '/cart'
			};
		}
		if (!user.address) {
			return {
				success: false,
				message: 'No shipping address',
				redirectTo: '/shippin-address'
			};
		}
		if (!user.paymentMethod) {
			return {
				success: false,
				message: 'No payment method',
				redirectTo: '/payment-method'
			};
		}

		const order = insertOrderSchema.parse({
			userId: user.id,
			shippingAddress: user.address,
			paymentMethod: user.paymentMethod,
			itemsPrice: cart.itemsPrice,
			taxPrice: cart.taxPrice,
			shippingPrice: cart.shippingPrice,
			totalPrice: cart.totalPrice
		});

		// create a transaction to create order and items in db
		const insertedOrderId = await prisma.$transaction(async (tx) => {
			// create order
			const insertedOrder = await tx.order.create({
				data: order
			});

			// create order items from cart items
			for (const item of cart.items as CartItem[]) {
				await tx.orderItem.create({
					data: {
						...item,
						price: item.price,
						orderId: insertedOrder.id
					}
				});
			}

			// clear the cart
			await tx.cart.update({
				where: {
					id: cart.id
				},
				data: {
					items: [],
					totalPrice: 0,
					taxPrice: 0,
					shippingPrice: 0,
					itemsPrice: 0
				}
			});

			// return the transaction id
			return insertedOrder.id;
		});

		if (!insertedOrderId) {
			throw new Error('Order not created');
		}

		return {
			success: true,
			message: 'Order created',
			redirectTo: `/order/${insertedOrderId}`
		};
	} catch (error: unknown) {
		if (isRedirectError(error)) {
			throw error;
		}

		return {
			success: false,
			message: formatError(error)
		};
	}
}
