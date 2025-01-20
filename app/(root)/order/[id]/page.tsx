import { getOrderByIdAction } from '@/lib/actions/order.actions';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import OrderDetailsTable from './order-details-table';
import { ShippingAddress } from '@/types';
import { auth } from '@/auth';

export const metadata: Metadata = {
	title: 'Order Details'
};

export default async function OrderDetailsPage(props: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await props.params;

	const order = await getOrderByIdAction(id);

	if (!order) {
		notFound();
	}

	const session = await auth();

	return (
		<OrderDetailsTable
			order={{
				...order,
				shippingAddress: order.shippingAddress as ShippingAddress
			}}
			paypalClientId={process.env.PAYPAL_CLIENT_ID || 'sb'}
			isAdmin={session?.user?.role === 'admin'}
		/>
	);
}
