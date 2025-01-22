import ProductList from '@/components/shared/product/product-list';
import { LATEST_PRODUCTS_LIMIT } from '@/lib/constants';
import {
	getFeaturedProducts,
	getLatestProducts
} from '@/lib/actions/products.actions';
import ProductCarousel from '@/components/shared/product/product-carousel';
import ViewAllProductsButton from '@/components/view-all-products-button';

export default async function HomePage() {
	const data = await getLatestProducts();
	const featuredProducts = await getFeaturedProducts();

	return (
		<>
			{!!featuredProducts.length && <ProductCarousel data={featuredProducts} />}
			<ProductList
				data={data}
				title='Newest Arrivals'
				limit={LATEST_PRODUCTS_LIMIT}
			/>
			<ViewAllProductsButton />
		</>
	);
}
