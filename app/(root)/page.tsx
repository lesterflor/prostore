import ProductList from '@/components/ui/shared/product/product-list';
import { getLatestProducts } from '@/lib/constants/products.actions';

export default async function HomePage() {
	const data = await getLatestProducts();

	return (
		<>
			<ProductList
				data={data}
				title='Newest Arrivals'
				limit={4}
			/>
		</>
	);
}
