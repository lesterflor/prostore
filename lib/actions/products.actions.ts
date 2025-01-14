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
			createdAt: new Date(item.createdAt.toString())
		};
	});

	return convertToPOJO(noDecimal);
}
