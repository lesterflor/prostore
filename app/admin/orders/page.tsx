import { deleteOrder, getAllOrders } from '@/lib/actions/order.actions';
import { auth } from '@/auth';
import { Metadata } from 'next';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
import Link from 'next/link';
import Pagination from '@/components/shared/pagination';
import { Button } from '@/components/ui/button';
import DeleteDialog from '@/components/shared/delete-dialogue';

export const metadata: Metadata = {
	title: 'Orders Overview'
};

export default async function OrdersPage(props: {
	searchParams: Promise<{
		page: string;
		query: string;
	}>;
}) {
	const { page = '1', query = '' } = await props.searchParams;

	const session = await auth();

	if (session?.user?.role !== 'admin') {
		throw new Error('User is not authorized');
	}

	const orders = await getAllOrders({ page: Number(page), query });

	return (
		<div className='space-y-2'>
			<div className='items-center gap-3'>
				<h2 className='h2-bold'>Orders</h2>
				{query && (
					<div>
						Filtered by <i>&quot;{query}&quot;</i>{' '}
						<Link href='/admin/orders'>
							<Button
								variant='outline'
								size='sm'>
								Remove Filter
							</Button>
						</Link>
					</div>
				)}
			</div>
			<div className='overflow-x-auto'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>ID</TableHead>
							<TableHead>DATE</TableHead>
							<TableHead>BUYER</TableHead>
							<TableHead>TOTAL</TableHead>
							<TableHead>PAID</TableHead>
							<TableHead>DELIVERED</TableHead>
							<TableHead>ACTIONS</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{orders.data?.map((order) => (
							<TableRow key={order.id}>
								<TableCell>{formatId(order.id)}</TableCell>
								<TableCell>
									{formatDateTime(order.createdAt).dateTime}
								</TableCell>
								<TableCell>{order.user.name}</TableCell>
								<TableCell>
									{formatCurrency(Number(order.totalPrice).toFixed(2))}
								</TableCell>
								<TableCell>
									{order.isPaid && !!order.paidAt
										? formatDateTime(order.paidAt).dateTime
										: 'Not Paid'}
								</TableCell>
								<TableCell>
									{order.isDelivered && !!order.deliveredAt
										? formatDateTime(order.deliveredAt).dateTime
										: 'Not Delivered'}
								</TableCell>
								<TableCell className='flex items-center gap-0'>
									<Button
										asChild
										variant='outline'
										size='sm'>
										<Link href={`/order/${order.id}`}>Details</Link>
									</Button>
									{/* delete button */}
									<DeleteDialog
										id={order.id}
										action={deleteOrder}
									/>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>

				{orders.totalPages! > 1 && (
					<Pagination
						page={Number(page) || 1}
						totalPages={orders?.totalPages || 1}
					/>
				)}
			</div>
		</div>
	);
}
