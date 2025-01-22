'use client';

import { Review } from '@/types';
import Link from 'next/link';
import { useState } from 'react';

export default function ReviewList({
	userId,
	productId,
	productSlug
}: {
	userId: string;
	productId: string;
	productSlug: string;
}) {
	const [reviews, setReviews] = useState<Review[]>([]);

	return (
		<div className='space-y-4'>
			{!reviews.length && <div>No reviews yet</div>}
			{userId ? (
				<>{/* review form */}</>
			) : (
				<div>
					Please{' '}
					<Link
						className='text-blue-700 px-2'
						href={`/sign-in?callbackUrl=/products/${productSlug}`}>
						Sign in
					</Link>{' '}
					to write a review
				</div>
			)}
		</div>
	);
}
