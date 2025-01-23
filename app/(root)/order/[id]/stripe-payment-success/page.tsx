import { Button } from '@/components/ui/button';
import { getOrderByIdAction } from '@/lib/actions/order.actions';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function SuccessPage(props: {
	params: Promise<{
		id: string;
	}>;
	searchParams: Promise<{
		payment_intent: string;
	}>;
}) {
	const { id } = await props.params;
	const { payment_intent: paymentIntentId } = await props.searchParams;

	// fetch order
	const order = await getOrderByIdAction(id);

	if (!order) {
		notFound();
	}

	// retrieve the payment intent
	const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

	// check payment intent is valid
	if (
		paymentIntent.metadata.orderId === null ||
		paymentIntent.metadata.orderId !== order.id.toString()
	) {
		return notFound();
	}

	// check if payment success
	const isSucccess = paymentIntent.status === 'succeeded';

	if (!isSucccess) {
		return redirect(`/order/${id}`);
	}

	return (
		<div className='max-w-4xl w-full mx-auto space-y-8'>
			<div className='flex flex-col gap-6 items-center'>
				<h1 className='h1-bold'>Thanks for your purchase</h1>
				<div>We are processing your order.</div>
				<Button asChild>
					<Link href={`/order/${id}`}>View Order</Link>
				</Button>
			</div>
		</div>
	);
}
