import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// convert a prisma object into POJO
export function convertToPOJO<T>(value: T): T {
	return JSON.parse(JSON.stringify(value));
}
