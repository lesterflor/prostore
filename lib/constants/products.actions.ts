'use server';
import { convertToPOJO } from '@/lib/utils';

import { PrismaClient } from '@prisma/client';

// get latest products
export async function getLatestProducts() {
	const prisma = new PrismaClient();

	const data = await prisma.product.findMany({
		take: 4,
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
