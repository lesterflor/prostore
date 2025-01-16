import { auth } from '@/auth';
import { getMyCart } from '@/lib/actions/cart.actions';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ShippingAddress } from '@/types';
import { getUserById } from '@/lib/actions/user.actions';
import ShippingAddressForm from './shipping-address-form';

export const metadata: Metadata = {
	title: 'Shipping Address'
};

export default async function ShippingAddressPage() {
	const cart = await getMyCart();

	if (!cart || !cart.items.length) {
		redirect('/cart');
	}

	const session = await auth();
	const userId = session?.user?.id;

	if (!userId) {
		throw new Error('No userId found');
	}

	const user = await getUserById(userId);

	return (
		<>
			<ShippingAddressForm address={user.address as ShippingAddress} />
		</>
	);
}
