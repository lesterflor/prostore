'use server';
import { convertToPOJO } from '@/lib/utils';
import { prisma } from '@/db/prisma';
import { LATEST_PRODUCTS_LIMIT } from '../constants';
import { IProduct } from '@/types';

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
