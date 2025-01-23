'use client';

import { Review } from '@/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ReviewForm from './review-form';
import { getReviewsByProductAction } from '@/lib/actions/review.actions';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { CalculatorIcon, UserIcon } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import Rating from '@/components/shared/product/rating';

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

	const reload = async () => {};

	useEffect(() => {
		const loadReviews = async () => {
			const res = await getReviewsByProductAction({ productId });

			if (res.success) {
				setReviews(res.data);
			}
		};

		loadReviews();
	}, [productId]);

	return (
		<div className='space-y-4'>
			{!reviews.length && <div>No reviews yet</div>}
			{userId ? (
				<ReviewForm
					userId={userId}
					productId={productId}
					onReviewSubmitted={reload}
				/>
			) : (
				<div>
					Please{' '}
					<Link
						className='text-blue-700 px-0'
						href={`/sign-in?callbackUrl=/products/${productSlug}`}>
						sign in
					</Link>{' '}
					to write a review
				</div>
			)}
			<div className='flex flex-col gap-3'>
				{reviews.map((review) => (
					<Card key={review.id}>
						<CardHeader>
							<div className='flex-between'>
								<CardTitle>{review.title}</CardTitle>
							</div>
							<CardDescription>{review.description}</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='flex space-x-4 text-sm text-muted-foreground'>
								<Rating value={review.rating} />
								<div className='flex items-center'>
									<UserIcon className='mr-1 h-3 w-3' />
									{review.user ? review.user.name : 'User'}
								</div>
								<div className='flex items-center'>
									<CalculatorIcon className='mr-1 h-3 w-3' />
									{formatDateTime(review.createdAt).dateTime}
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
