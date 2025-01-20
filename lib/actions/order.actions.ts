'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { convertToPOJO, formatError } from '../utils';
import { auth } from '@/auth';
import { getMyCart } from './cart.actions';
import { getUserById } from './user.actions';
import prisma from '@/db/prisma';
import { insertOrderSchema } from '../validators';
import { CartItem, PaymentResult } from '@/types';
import { paypal } from '../paypal';
import { revalidatePath } from 'next/cache';
import { PAGE_SIZE } from '../constants';
import { Prisma } from '@prisma/client';

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

export async function getOrderByIdAction(orderId: string) {
	const data = await prisma.order.findFirst({
		where: {
			id: orderId
		},
		include: {
			orderItems: true,
			user: {
				select: {
					name: true,
					email: true
				}
			}
		}
	});

	if (!data) {
		throw new Error('Order was not found');
	}

	const cleansed = {
		...data,
		totalPrice: Number(data.totalPrice).toFixed(2),
		itemsPrice: Number(data.itemsPrice).toFixed(2),
		shippingPrice: Number(data.shippingPrice).toFixed(2),
		taxPrice: Number(data.taxPrice).toFixed(2),
		orderItems: data.orderItems.map((item) => {
			return {
				...item,
				price: Number(item.price).toFixed(2)
			};
		})
	};

	return convertToPOJO(cleansed);
}

// create new paypal order
export async function createPaypalOrderAction(orderId: string) {
	try {
		const order = await prisma.order.findFirst({
			where: {
				id: orderId
			}
		});

		if (order) {
			// create paypal order
			const paypalOrder = await paypal.createOrder(Number(order.totalPrice));

			// update db with paypal orderId
			await prisma.order.update({
				where: {
					id: orderId
				},
				data: {
					paymentResult: {
						id: paypalOrder.id,
						email_address: '',
						status: '',
						pricePaid: 0
					}
				}
			});

			return {
				success: true,
				message: 'Order item created successfully',
				data: paypalOrder.id
			};
		} else {
			throw new Error('Order not found');
		}
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

// approve paypal order and update order to paid
export async function approvePaypalOrderAction(
	orderId: string,
	data: {
		orderID: string;
	}
) {
	try {
		const order = await prisma.order.findFirst({
			where: {
				id: orderId
			}
		});

		if (!order) {
			throw new Error('Order not found');
		}

		const captureData = await paypal.capturePayment(data.orderID);

		if (
			!captureData ||
			captureData.id !== (order.paymentResult as PaymentResult)?.id ||
			captureData.status !== 'COMPLETED'
		) {
			throw new Error('Error in Paypal payment');
		}

		// update order paid
		await updateOrderToPaid({
			orderId,
			paymentResult: {
				id: captureData.id,
				status: captureData.status,
				email_address: captureData.payer.email_address,
				pricePaid:
					captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value
			}
		});

		revalidatePath(`/order/${orderId}`);

		return {
			success: true,
			message: 'Order has been successfully paid'
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

// update order to paid
async function updateOrderToPaid({
	orderId,
	paymentResult
}: {
	orderId: string;
	paymentResult?: PaymentResult;
}) {
	const order = await prisma.order.findFirst({
		where: {
			id: orderId
		},
		include: {
			orderItems: true
		}
	});

	if (!order) {
		throw new Error('Order was not found');
	}

	if (order.isPaid) {
		throw new Error('Order was already paid');
	}

	// transaction to update order and product inventory
	await prisma.$transaction(async (tx) => {
		// iterate over products
		for (const item of order.orderItems) {
			await tx.product.update({
				where: {
					id: item.productId
				},
				data: {
					stock: {
						increment: -item.qty
					}
				}
			});
		}

		// set the order to paid
		await tx.order.update({
			where: {
				id: orderId
			},
			data: {
				isPaid: true,
				paidAt: new Date(),
				paymentResult
			}
		});
	});

	// get updated order after transaction
	const updatedOrder = await prisma.order.findFirst({
		where: {
			id: orderId
		},
		include: {
			orderItems: true,
			user: {
				select: {
					name: true,
					email: true
				}
			}
		}
	});

	if (!updatedOrder) {
		throw new Error('Order transaction failed');
	}
}

// get orders
export async function getMyOrdersAction({
	limit = PAGE_SIZE,
	page
}: {
	limit?: number;
	page: number;
}) {
	const session = await auth();
	if (!session) {
		throw new Error('User is not authorized');
	}

	try {
		const data = await prisma.order.findMany({
			where: {
				userId: session?.user?.id
			},
			orderBy: {
				createdAt: 'desc'
			},
			take: limit,
			skip: (page - 1) * limit
		});

		const dataCount = await prisma.order.count({
			where: {
				userId: session?.user?.id
			}
		});

		if (!data) {
			throw new Error('User orders not found');
		}

		return {
			data,
			totalPages: Math.ceil(dataCount / limit)
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

type SalesDataType = {
	month: string;
	totalSales: number;
}[];

// get sales data
export async function getOrderSummarayAction() {
	// get counts for each resource
	const orderCount = await prisma.order.count();
	const productCount = await prisma.product.count();
	const userCount = await prisma.user.count();

	// calculate total sales
	const totalSales = await prisma.order.aggregate({
		_sum: { totalPrice: true }
	});

	// get monthly sales
	const salesDataRaw = await prisma.$queryRaw<
		Array<{ month: string; totalSales: Prisma.Decimal }>
	>`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM/YY')`;

	const salesData: SalesDataType = salesDataRaw.map((entry) => ({
		month: entry.month,
		totalSales: Number(entry.totalSales)
	}));

	// get latest sales
	const latestSales = await prisma.order.findMany({
		orderBy: {
			createdAt: 'desc'
		},
		include: {
			user: {
				select: {
					name: true
				}
			}
		},
		take: 6
	});

	return {
		orderCount,
		productCount,
		userCount,
		totalSales,
		latestSales,
		salesData
	};
}

// get all orders
export async function getAllOrders({
	limit = PAGE_SIZE,
	page
}: {
	limit?: number;
	page: number;
}) {
	const data = await prisma.order.findMany({
		orderBy: {
			createdAt: 'desc'
		},
		take: limit,
		skip: (page - 1) * limit,
		include: {
			user: {
				select: {
					name: true
				}
			}
		}
	});

	const dataCount = await prisma.order.count();

	return {
		data,
		totalPages: Math.ceil(dataCount / limit)
	};
}

// delete order fro admin page
export async function deleteOrder(id: string) {
	try {
		await prisma.order.delete({
			where: {
				id
			}
		});

		revalidatePath('/admin/orders');

		return {
			success: true,
			message: 'Order deleted successfully'
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

// update order to paid (for cases like C.O.D.)
export async function updateOrderToPaidCOD(orderId: string) {
	try {
		await updateOrderToPaid({ orderId });

		revalidatePath(`/order/${orderId}`);

		return {
			success: true,
			message: 'COD order marked as paid'
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

// update COD order to delivered
export async function deliverOrderAction(orderId: string) {
	try {
		const order = await prisma.order.findFirst({
			where: { id: orderId }
		});

		if (!order) {
			throw new Error('Order not found');
		}

		if (!order.isPaid) {
			throw new Error('Order was not paid');
		}

		await prisma.order.update({
			where: {
				id: orderId
			},
			data: {
				isDelivered: true,
				deliveredAt: new Date()
			}
		});

		revalidatePath(`/order/${orderId}`);

		return {
			success: true,
			message: 'Order has been marked delivered'
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}
