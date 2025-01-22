import Pagination from '@/components/shared/pagination';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import {
	deleteProductByIdAction,
	getAllProducts
} from '@/lib/actions/products.actions';
import { formatCurrency, formatId, formatNumber } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';
import DeleteDialog from '@/components/shared/delete-dialogue';
import Image from 'next/image';

export default async function AdminProductsPage(props: {
	searchParams: Promise<{
		query: string;
		page: string;
		category: string;
	}>;
}) {
	const { page: pageNo, query = '', category = '' } = await props.searchParams;

	const page = Number(pageNo) || 1;

	const products = await getAllProducts({
		query,
		page,
		category
	});

	return (
		<div className='space-y-2'>
			<div className='flex-between'>
				<div className='items-center gap-3'>
					<h1 className='h2-bold'>Products</h1>
					{query && (
						<div>
							Filtered by <i>&quot;{query}&quot;</i>{' '}
							<Link href='/admin/products'>
								<Button
									variant='outline'
									size='sm'>
									Remove Filter
								</Button>
							</Link>
						</div>
					)}
				</div>
				<Button
					asChild
					variant='default'>
					<Link href='/admin/products/create'>Create Product</Link>
				</Button>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>ID</TableHead>
						<TableHead>NAME</TableHead>
						<TableHead className='text-right'>PRICE</TableHead>
						<TableHead>CATEGORY</TableHead>
						<TableHead>STOCK</TableHead>
						<TableHead>RATING</TableHead>
						<TableHead className='w-[100px]'>ACTIONS</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{products.data.map((product) => (
						<TableRow key={product.id}>
							<TableCell>{formatId(product.id)}</TableCell>
							<TableCell className='flex gap-2 items-center justify-between'>
								<Image
									className='w-15 h-15'
									src={product.images[0]}
									width={100}
									height={100}
									alt={product.name}
								/>
								{product.name}
							</TableCell>
							<TableCell className='text-right'>
								{formatCurrency(product.price.toString())}
							</TableCell>
							<TableCell>{product.category}</TableCell>
							<TableCell>{formatNumber(product.stock)}</TableCell>
							<TableCell>{product.rating.toString()}</TableCell>
							<TableCell className='flex gap-1'>
								<Button
									asChild
									variant='outline'
									size='sm'>
									<Link href={`/admin/products/${product.id}`}>Edit</Link>
								</Button>
								{/* Delete button */}
								<DeleteDialog
									id={product.id}
									action={deleteProductByIdAction}
								/>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			{products.totalPages > 1 && (
				<Pagination
					page={page}
					totalPages={products.totalPages}
				/>
			)}
		</div>
	);
}
