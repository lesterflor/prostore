import ProductCard from '@/components/shared/product/product-card';
import { Button } from '@/components/ui/button';
import {
	getAllCategories,
	getAllProducts
} from '@/lib/actions/products.actions';
import Link from 'next/link';

export async function generateMetadata(props: {
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
		q = 'all',
		price = 'all',
		rating = 'all'
		//sort = 'newest',
		//page = '1'
	} = await props.searchParams;

	const isQuerySet = q && q !== 'all' && q.trim() !== '';
	const isCategorySet =
		category && category !== 'all' && category.trim() !== '';
	const isPriceSet = price && price !== 'all' && price.trim() !== '';
	const isRatingSet = rating && rating !== 'all' && rating.trim() !== '';

	if (isQuerySet || isCategorySet || isPriceSet || isRatingSet) {
		return {
			title: `Search ${isQuerySet ? q : ''} ${
				isCategorySet ? `: Category ${category}` : ''
			} ${isPriceSet ? `: Price ${price}` : ''} ${
				isRatingSet ? `: Rating ${rating}` : ''
			}`
		};
	} else {
		return {
			title: 'Search Products'
		};
	}
}

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

	// construct the filtered url
	const getFilterUrl = ({
		c,
		s,
		p,
		r,
		pg
	}: {
		c?: string;
		s?: string;
		p?: string;
		r?: string;
		pg?: string;
	}) => {
		const params = { q: searchTerm, category, price, rating, sort, page };

		if (c) params.category = c;
		if (p) params.price = p;
		if (s) params.sort = s;
		if (r) params.rating = r;
		if (pg) params.page = pg;

		return `/search?${new URLSearchParams(params).toString()}`;
	};

	const categories = await getAllCategories();

	const prices = [
		{
			name: '$1 to $50',
			value: '1-50'
		},
		{
			name: '$51 to $100',
			value: '51-100'
		},
		{
			name: '$101 to $150',
			value: '101-150'
		},
		{
			name: '$151 to $200',
			value: '151-200'
		},
		{
			name: '$201 to $500',
			value: '201-500'
		},
		{
			name: '$501 to $1000',
			value: '501-1000'
		}
	];

	const ratings = Array.from({ length: 4 }, (_v, n) => 4 - n);

	const sortOrders = ['newest', 'lowest', 'highest', 'rating'];

	return (
		<div className='grid md:grid-cols-5 md:gap-5'>
			<div className='filter-links'>
				{/* Category links */}
				<div className='text-xl mb-2 mt-3'>Department</div>
				<div>
					<ul className='space-y-1'>
						<li>
							<Link
								className={`${
									category === 'all' || (category === '' && 'font-bold')
								}`}
								href={getFilterUrl({ c: 'all' })}>
								Any
							</Link>
						</li>
						{categories.map((cat) => (
							<li key={cat.category}>
								<Link
									className={`${category === cat.category && 'font-bold'}`}
									href={getFilterUrl({ c: cat.category })}>
									{cat.category}
								</Link>
							</li>
						))}
					</ul>
				</div>

				{/* price links */}
				<div className='text-xl mb-2 mt-8'>Price</div>
				<div>
					<ul className='space-y-1'>
						<li>
							<Link
								className={`${price === 'all' && 'font-bold'}`}
								href={getFilterUrl({ p: 'all' })}>
								Any
							</Link>
						</li>
						{prices.map((pr) => (
							<li key={pr.name}>
								<Link
									className={`${price === pr.value && 'font-bold'}`}
									href={getFilterUrl({ p: pr.value })}>
									{pr.name}
								</Link>
							</li>
						))}
					</ul>
				</div>

				{/* ratings */}
				<div className='text-xl mb-2 mt-3'>Ratings</div>
				<div>
					<ul className='space-y-1'>
						<li>
							<Link
								className={`${rating === 'all' && 'font-bold'}`}
								href={getFilterUrl({ r: 'all' })}>
								Any
							</Link>
						</li>
						{ratings.map((rat) => (
							<li key={rat}>
								<Link
									className={`${rating === rat.toString() && 'font-bold'}`}
									href={getFilterUrl({ r: rat.toString() })}>
									{`${rat} stars & up`}
								</Link>
							</li>
						))}
					</ul>
				</div>
			</div>
			<div className='space-y-4 md:col-span-4'>
				<div className='flex-between flex-col md:flex-row my-4'>
					<div className='flex items-center'>
						{searchTerm !== 'all' &&
							searchTerm !== '' &&
							`Query: ${searchTerm}`}{' '}
						{category !== 'all' && category !== '' && `Category: ${category}`}{' '}
						{price !== 'all' && price !== '' && `Price: ${price}`}{' '}
						{rating !== 'all' &&
							rating !== '' &&
							`Rating: ${rating} stars & up`}
						&nbsp;
						{(searchTerm !== 'all' && searchTerm !== '') ||
						(category !== 'all' && category !== '') ||
						rating !== 'all' ||
						price !== 'all' ? (
							<Button
								variant={'link'}
								asChild>
								<Link href='/search'>Clear</Link>
							</Button>
						) : null}
					</div>

					{/* Sort */}
					<div>
						Sort by{' '}
						{sortOrders.map((s) => (
							<Link
								key={s}
								className={`mx-2 ${sort === s && 'font-bold'}`}
								href={getFilterUrl({ s })}>
								{s}
							</Link>
						))}
					</div>
				</div>
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
