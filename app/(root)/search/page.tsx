import ProductCard from '@/components/shared/product/product-card';
import { getAllProducts } from '@/lib/actions/products.actions';

export default async function SearchPage(props: {
	searchParams: Promise<{
		category?: string;
		q?: string;
		price?: string;
		rating?: string;
		sort?: string;
		page?: string;
	}>;
}) {
	const {
		category = 'all',
		q: searchTerm = 'all',
		price = 'all',
		rating = 'all',
		sort = 'newest',
		page = '1'
	} = await props.searchParams;

	const products = await getAllProducts({
		query: searchTerm,
		category,
		price,
		rating,
		sort,
		page: Number(page)
	});

	return (
		<div className='grid md:grid-cols-5 md:gap-5'>
			{/* filters */}
			<div className='filter-links'></div>
			<div className='space-y-4 md:col-span-4'>
				<div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
					{!products.data.length && <div>No products found</div>}

					{products.data.map((product) => (
						<ProductCard
							key={product.id}
							product={product}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
