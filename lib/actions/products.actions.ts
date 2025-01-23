'use server';
import { convertToPOJO, formatError } from '@/lib/utils';
import prisma from '@/db/prisma';
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from '../constants';
import { IProduct } from '@/types';
import { revalidatePath } from 'next/cache';
import { insertProductSchema, updateProductSchema } from '../validators';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// get latest products
export async function getLatestProducts(): Promise<IProduct[]> {
	const data = await prisma.product.findMany({
		take: LATEST_PRODUCTS_LIMIT,
		orderBy: {
			createdAt: 'desc'
		}
	});

	const noDecimal = data.map((item) => {
		return {
			...item,
			price: Number(item.price).toFixed(2),
			rating: Number(item.rating).toFixed(2),
			createdAt: new Date(item.createdAt.toString())
		};
	});

	return convertToPOJO(noDecimal);
}

// get single product by slug
export async function getProductBySlug(slug: string) {
	const product = await prisma.product.findFirst({
		where: {
			slug
		}
	});

	if (product) {
		const newObj = {
			...product,
			price: Number(product?.price).toFixed(2),
			rating: Number(product?.rating).toFixed(2)
		};
		return newObj;
	}

	return null;
}
// get single product by id
export async function getProductById(id: string) {
	const product = await prisma.product.findFirst({
		where: {
			id
		}
	});

	if (product) {
		const newObj = {
			...product,
			price: Number(product?.price).toFixed(2),
			rating: Number(product?.rating).toFixed(2)
		};
		return newObj;
	}

	return null;
}

export async function getAllProducts({
	query,
	limit = PAGE_SIZE,
	page,
	price,
	category,
	rating,
	sort
}: {
	query: string;
	limit?: number;
	page: number;
	category?: string;
	price?: string;
	rating?: string;
	sort?: string;
}) {
	console.log(page);

	// query filter
	const queryFilter: Prisma.ProductWhereInput =
		query && query !== 'all'
			? {
					name: {
						contains: query,
						mode: 'insensitive'
					} as Prisma.StringFilter
			  }
			: {};

	const categoryFilter =
		category && category !== 'all'
			? {
					category
			  }
			: {};

	const priceFilter: Prisma.ProductWhereInput =
		price && price !== 'all'
			? {
					price: {
						gte: Number(price.split('-')[0]),
						lte: Number(price.split('-')[1])
					}
			  }
			: {};

	const ratingFilter =
		rating && rating !== 'all'
			? {
					rating: {
						gte: Number(rating)
					}
			  }
			: {};

	const data = await prisma.product.findMany({
		where: {
			...queryFilter,
			...categoryFilter,
			...priceFilter,
			...ratingFilter
		},
		take: limit,
		// skip: (page - 1) * limit,

		orderBy:
			sort === 'lowest'
				? { price: 'asc' }
				: sort === 'highest'
				? { price: 'desc' }
				: sort === 'rating'
				? { rating: 'desc' }
				: { createdAt: 'desc' }
	});

	const cleanData = data.map((item) => {
		return {
			...item,
			price: Number(item.price).toFixed(2),
			rating: item.rating.toString()
		};
	});

	const dataCount = await prisma.product.count();

	return {
		data: cleanData,
		totalPages: Math.ceil(dataCount / limit)
	};
}

// delete product by id
export async function deleteProductByIdAction(productId: string) {
	try {
		const product = await prisma.product.findFirst({
			where: {
				id: productId
			}
		});

		if (!product) {
			throw new Error(`Product ${productId} was not found`);
		}

		await prisma.product.delete({
			where: {
				id: productId
			}
		});

		revalidatePath('/admin/products');

		return {
			success: true,
			message: `Product ${product.name} successfully deleted`
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

// create a new product
export async function createProductAction(
	data: z.infer<typeof insertProductSchema>
) {
	try {
		const product = insertProductSchema.parse(data);

		await prisma.product.create({
			data: product
		});

		revalidatePath('/admin/products');

		return {
			success: true,
			message: 'Product successfully created'
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function updateProductAction(
	data: z.infer<typeof updateProductSchema>
) {
	try {
		const product = updateProductSchema.parse(data);

		const existingProduct = await prisma.product.findFirst({
			where: {
				id: product.id
			}
		});

		if (!existingProduct) {
			throw new Error('Product was not found');
		}

		await prisma.product.update({
			where: {
				id: product.id
			},
			data: product
		});

		revalidatePath('/admin/products');

		return {
			success: true,
			message: 'Product successfully updated'
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

// get all categories
export async function getAllCategories() {
	const data = await prisma.product.groupBy({
		by: ['category'],
		_count: true
	});

	return data;
}

// get featured products
export async function getFeaturedProducts() {
	const data = await prisma.product.findMany({
		where: {
			isFeatured: true
		},
		orderBy: {
			createdAt: 'desc'
		},
		take: 4
	});

	const noDecimal = data.map((item) => {
		return {
			...item,
			price: Number(item.price).toFixed(2),
			rating: Number(item.rating).toFixed(2),
			createdAt: new Date(item.createdAt.toString())
		};
	});

	return convertToPOJO(noDecimal);
}
