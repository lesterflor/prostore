'use server';

import { z } from 'zod';
import { insertReviewSchema } from '../validators';
import { formatError } from '../utils';
import { auth } from '@/auth';
import prisma from '@/db/prisma';
import { revalidatePath } from 'next/cache';

export async function createUpdateReviewAction(
	data: z.infer<typeof insertReviewSchema>
) {
	try {
		const session = await auth();

		if (!session?.user) {
			throw new Error('User is not authenticated');
		}

		// validate and store review
		const review = insertReviewSchema.parse({
			...data,
			userId: session.user.id
		});

		const product = await prisma.product.findFirst({
			where: {
				id: review.productId
			}
		});

		if (!product) {
			throw new Error('Product was not found');
		}

		// check if user has already reviewed product
		const reviewExists = await prisma.review.findFirst({
			where: {
				productId: review.productId,
				userId: review.userId
			}
		});

		await prisma.$transaction(async (tx) => {
			// update
			if (reviewExists) {
				await tx.review.update({
					where: { id: reviewExists.id },
					data: {
						title: reviewExists.title,
						description: reviewExists.description,
						rating: reviewExists.rating
					}
				});
			} else {
				await tx.review.create({
					data: review
				});
			}

			// get the average rating
			const averageRating = await tx.review.aggregate({
				_avg: {
					rating: true
				},
				where: {
					productId: review.productId
				}
			});

			// get number of reviews
			const numReviews = await tx.review.count({
				where: {
					productId: review.productId
				}
			});

			// update rating and num reviews
			await tx.product.update({
				where: {
					id: review.productId
				},
				data: {
					rating: averageRating._avg.rating || 0,
					numReviews
				}
			});
		});

		revalidatePath(`/products/${product.slug}`);

		return {
			success: true,
			message: 'Review updated successfully'
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

// get all reviews for a product
export async function getReviewsByProductAction({
	productId
}: {
	productId: string;
}) {
	try {
		const reviews = await prisma.review.findMany({
			where: {
				productId
			},
			include: {
				user: {
					select: {
						name: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		});

		if (!reviews.length) {
			throw new Error('No reviews found for this product');
		}

		return {
			success: true,
			data: reviews
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error),
			data: []
		};
	}
}

// get review written by current user
export async function getProductReviewByUser({
	productId
}: {
	productId: string;
}) {
	try {
		const session = await auth();
		const userId = session?.user.id;

		if (!userId) {
			throw new Error('User not authenticated');
		}

		const review = await prisma.review.findFirst({
			where: {
				productId,
				userId
			}
		});

		return {
			success: true,
			data: review
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}
