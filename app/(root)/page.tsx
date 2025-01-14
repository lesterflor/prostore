import ProductList from '@/components/ui/shared/product/product-list';
import { LATEST_PRODUCTS_LIMIT } from '@/lib/constants';
import { getLatestProducts } from '@/lib/actions/products.actions';

export default async function HomePage() {
	const data = await getLatestProducts();

	return (
		<>
			<ProductList
				data={data}
				title='Newest Arrivals'
				limit={LATEST_PRODUCTS_LIMIT}
			/>
		</>
	);
}
