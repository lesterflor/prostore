'use client';
import { createOrderAction } from '@/lib/actions/order.actions';
import { useFormStatus } from 'react-dom';
import { Check, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function PlaceOrderForm() {
	const router = useRouter();

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		const res = await createOrderAction();

		if (res.redirectTo) {
			router.push(res.redirectTo);
		}
	};

	const PlaceOrderButton = () => {
		const { pending } = useFormStatus();
		return (
			<Button
				disabled={pending}
				type='submit'
				className='w-full'>
				{pending ? (
					<Loader className='w-4 h-4 animate-spin' />
				) : (
					<Check className='w-4 h-4' />
				)}{' '}
				Place Order
			</Button>
		);
	};

	return (
		<form
			className='w-full'
			onSubmit={handleSubmit}>
			<PlaceOrderButton />
		</form>
	);
}
