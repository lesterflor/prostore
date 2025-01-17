import { getOrderByIdAction } from '@/lib/actions/order.actions';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

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

	return <div>{order.totalPrice}</div>;
}
