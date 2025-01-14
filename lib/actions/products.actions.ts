'use server';
import { convertToPOJO } from '@/lib/utils';

import { PrismaClient } from '@prisma/client';
import { LATEST_PRODUCTS_LIMIT } from '../constants';
import { IProduct } from '@/types';

// get latest products
export async function getLatestProducts(): Promise<IProduct[]> {
	const prisma = new PrismaClient();

	const data = await prisma.product.findMany({
		take: LATEST_PRODUCTS_LIMIT,
		orderBy: {
			createdAt: 'desc'
		}
	});

	const noDecimal = data.map((item) => {
		return {
			...item,
			price: item.price.toNumber(),
			rating: item.rating.toNumber(),
			createdAt: item.createdAt.toString()
		};
	});

	return convertToPOJO(noDecimal);
}
