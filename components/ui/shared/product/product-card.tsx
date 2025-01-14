import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import ProdcutPrice from './product-price';

export interface IProduct {
	id: string;
	name: string;
	slug: string;
	category: string;
	description: string;
	images: string[];
	price: number;
	brand: string;
	rating: number;
	numReviews: number;
	stock: number;
	isFeatured: boolean;
	banner: string | null;
	createdAt: string;
}

export default function ProductCard({ product }: { product: IProduct }) {
	return (
		<Card className='w-full max-w-sm'>
			<CardHeader className='p-0 items-center'>
				<Link href={`/products/${product.slug}`}>
					<Image
						src={product.images[0]}
						alt={product.name}
						height={300}
						width={300}
						priority={true}
					/>
				</Link>
			</CardHeader>
			<CardContent className='p-4 grid gap-4'>
				<div className='text-xs'>{product.brand}</div>
				<Link href={`/product/${product.slug}`}>
					<h2 className='text-sm font-medium'>{product.name}</h2>
				</Link>
				<div className='flex-between gap-4'>
					<p>{product.rating} Stars</p>
					{!!product.stock ? (
						<ProdcutPrice
							value={product.price}
							className='font-bold'
						/>
					) : (
						<p className='text-destructive'>Out of Stock</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
