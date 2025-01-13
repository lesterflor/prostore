import React from 'react';

interface IDataProps {
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
}

export default function ProductList({
	data,
	title,
	limit
}: {
	data: IDataProps[];
	title?: string;
	limit?: number;
}) {
	const limitedData = limit ? data.slice(0, limit) : data;

	return (
		<div className='my-10'>
			<h2 className='h2-bold mb-4'>{title}</h2>
			{!!limitedData.length ? (
				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
					{limitedData.map((product) => {
						return <div key={product.name}>{product.name}</div>;
					})}
				</div>
			) : (
				<div>
					<p>No products found</p>
				</div>
			)}
		</div>
	);
}
