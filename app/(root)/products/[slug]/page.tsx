import { getProductBySlug } from '@/lib/actions/products.actions';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProdcutPrice from '@/components/ui/shared/product/product-price';
import { Card, CardContent } from '@/components/ui/card';
import ProductImages from '@/components/ui/shared/product/product-images';

export default async function ProductDetailsPage(props: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await props.params;

	const product = await getProductBySlug(slug);

	if (!product) {
		notFound();
	}

	return (
		<>
			<section>
				{/* grid */}
				<div className='grid grid-cols-1 md:grid-cols-5'>
					{/* images column*/}
					<div className='col-span-2'>
						{/* Image */}
						<ProductImages images={product.images} />
					</div>
					{/* details */}
					<div className='col-span-2 p-5'>
						<div className='flex flex-col gap-6'>
							<p>
								{product.brand} {product.category}
							</p>
							<h1 className='h3-bold'>{product.name}</h1>
							<p>
								{product.rating} of {product.numReviews} reviews
							</p>

							<div className='flex flex-col sm:flex-row sm:items-center gap-3'>
								<ProdcutPrice
									value={product.price}
									className='w-26 rounded-full bg-green-100 text-green-700 px-5 py-2'
								/>
							</div>
							<div className='mt-10'>
								<p className='font-semibold'>Description</p>
								<p>{product.description}</p>
							</div>
						</div>
					</div>

					{/* action column */}
					<div>
						<Card>
							<CardContent className='p-4'>
								<div className='mb-2 flex justify-between'>
									<div>Price</div>
									<div>
										<ProdcutPrice value={product.price} />
									</div>
								</div>

								<div className='mb-2 flex justify-between'>
									<div>Status</div>
									{!!product.stock ? (
										<Badge variant='outline'>In Stock</Badge>
									) : (
										<Badge variant='destructive'>Out of Stock</Badge>
									)}
								</div>
								{!!product.stock && (
									<div className='flex-center'>
										<Button className='w-full'>Add to Cart</Button>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</section>
		</>
	);
}
