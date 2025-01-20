import Pagination from '@/components/shared/pagination';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import { getMyOrdersAction } from '@/lib/actions/order.actions';
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'My Orders'
};

export default async function OrderPage(props: {
	searchParams: Promise<{
		page: string;
	}>;
}) {
	const { page } = await props.searchParams;
	const orders = await getMyOrdersAction({
		page: Number(page) || 1
	});

	return (
		<div className='space-y-2'>
			<h2 className='h2-bold'>Orders</h2>
			<div className='overflow-x-uto'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>ID</TableHead>
							<TableHead>DATE</TableHead>
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
								<TableCell>
									<Link href={`/order/${order.id}`}>
										<span className='px-2 hover:text-muted-foreground'>
											Details
										</span>
									</Link>
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
