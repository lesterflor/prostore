'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
import { Order } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import {
	PayPalButtons,
	PayPalScriptProvider,
	usePayPalScriptReducer
} from '@paypal/react-paypal-js';
import {
	createPaypalOrderAction,
	approvePaypalOrderAction,
	updateOrderToPaidCOD,
	deliverOrderAction
} from '@/lib/actions/order.actions';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import StripePayment from './stripe-payment';

export default function OrderDetailsTable({
	order,
	paypalClientId,
	stripeClientSecret,
	isAdmin = false
}: {
	order: Omit<Order, 'paymentResult'>;
	paypalClientId: string;
	isAdmin?: boolean;
	stripeClientSecret?: string | null;
}) {
	const { toast } = useToast();

	const [isPending, startTransition] = useTransition();

	const {
		shippingAddress,
		orderItems,
		itemsPrice,
		shippingPrice,
		taxPrice,
		totalPrice,
		paymentMethod,
		isPaid,
		isDelivered,
		paidAt,
		deliveredAt
	} = order;

	const PrintLoadingState = () => {
		const [{ isPending, isRejected }] = usePayPalScriptReducer();
		let status = '';

		if (isPending) {
			status = 'Loading';
		} else if (isRejected) {
			status = 'Error Loading Paypal';
		}

		return status;
	};

	const handleCreatePaypalOrder = async () => {
		const res = await createPaypalOrderAction(order.id);

		if (!res.success) {
			toast({
				variant: 'destructive',
				description: res.message
			});
		}

		return res.data;
	};

	const handleApprovePaypalOrder = async (data: { orderID: string }) => {
		const res = await approvePaypalOrderAction(order.id, data);

		toast({
			variant: !res.success ? 'destructive' : 'default',
			description: res.message
		});
	};

	// button to mark order as paid
	const MarkAsPaidButton = () => {
		return (
			<Button
				type='button'
				disabled={isPending}
				onClick={() =>
					startTransition(async () => {
						const res = await updateOrderToPaidCOD(order.id);

						toast({
							variant: res.success ? 'default' : 'destructive',
							description: res.message
						});
					})
				}>
				{isPending ? 'Processing...' : 'Mark as Paid'}
			</Button>
		);
	};

	// button to mark order as delievered
	const MarkAsDeliveredButton = () => {
		return (
			<Button
				type='button'
				disabled={isPending}
				onClick={() =>
					startTransition(async () => {
						const res = await deliverOrderAction(order.id);

						toast({
							variant: res.success ? 'default' : 'destructive',
							description: res.message
						});
					})
				}>
				{isPending ? 'Processing...' : 'Mark as Delivered'}
			</Button>
		);
	};

	return (
		<>
			<h1 className='py-4 text-2xl'>Order {formatId(order.id)}</h1>
			<div className='grid md:grid-cols-3 md:gap-5'>
				<div className='col-span-2 space-y-4 overflow-y-auto'>
					<Card>
						<CardContent className='p-4 gap-4'>
							<h2 className='text-xl pb-4'>Payment Method</h2>
							<p className='mb-2'>{paymentMethod}</p>
							{isPaid ? (
								<Badge variant='secondary'>
									Paid at {formatDateTime(paidAt!).dateTime}
								</Badge>
							) : (
								<Badge variant='destructive'>Not paid</Badge>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardContent className='p-4 gap-4'>
							<h2 className='text-xl pb-4'>Shipping Address</h2>
							<p className='mb-2'>{shippingAddress.fullName}</p>
							<p>
								{shippingAddress.streetAddress}, {shippingAddress.city},{' '}
								{shippingAddress.postalCode}, {shippingAddress.country}
							</p>
							{isDelivered ? (
								<Badge variant='secondary'>
									Delivered at {formatDateTime(deliveredAt!).dateTime}
								</Badge>
							) : (
								<Badge variant='destructive'>Not delivered</Badge>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardContent className='p-4 gap-4'>
							<h2 className='text-xl pb-4'>Order Items</h2>

							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Item</TableHead>
										<TableHead>Quantity</TableHead>
										<TableHead>Price</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{orderItems.map((item) => (
										<TableRow key={item.slug}>
											<TableCell>
												<Link
													className='flex items-center'
													href={`/products/${item.slug}`}>
													<Image
														src={item.image}
														alt={item.name}
														width={50}
														height={50}
													/>
													<span className='px-2'>{item.name}</span>
												</Link>
											</TableCell>

											<TableCell>
												<span className='px-2'>{item.qty}</span>
											</TableCell>
											<TableCell>
												<span className='text-right px-2'>
													{formatCurrency(item.price)}
												</span>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</div>

				<div>
					<Card>
						<CardContent className='p-4 gap-4 space-y-4'>
							<div className='flex justify-between'>
								<div>Items</div>
								<div>{formatCurrency(itemsPrice)}</div>
							</div>
							<div className='flex justify-between'>
								<div>Tax Price</div>
								<div>{formatCurrency(taxPrice)}</div>
							</div>
							<div className='flex justify-between'>
								<div>Shipping Price</div>
								<div>{formatCurrency(shippingPrice)}</div>
							</div>
							<div className='flex justify-between'>
								<div>Total Price</div>
								<div className='font-bold text-lg'>
									{formatCurrency(totalPrice)}
								</div>
							</div>
							{/* Paypal payment */}
							{!isPaid && paymentMethod === 'PayPal' && (
								<div>
									<PayPalScriptProvider
										options={{
											clientId: paypalClientId
										}}>
										<PrintLoadingState />
										<PayPalButtons
											createOrder={handleCreatePaypalOrder}
											onApprove={handleApprovePaypalOrder}
										/>
									</PayPalScriptProvider>
								</div>
							)}

							{/* Stripe payment */}
							{!isPaid && paymentMethod === 'Stripe' && stripeClientSecret && (
								<StripePayment
									priceInCents={Number(totalPrice) * 100}
									clientSecret={stripeClientSecret}
									orderId={order.id}
								/>
							)}

							{/* Cash on Delivery */}
							{isAdmin && !isPaid && paymentMethod === 'CashOnDelivery' && (
								<MarkAsPaidButton />
							)}

							{isAdmin && isPaid && !isDelivered && <MarkAsDeliveredButton />}
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	);
}
