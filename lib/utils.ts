import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// convert a prisma object into POJO
export function convertToPOJO<T>(value: T): T {
	return JSON.parse(JSON.stringify(value));
}

// format number with decimal
export function formatNumberWithDecimal(num: number): string {
	const [int, decimal] = num.toString().split('.');

	return decimal ? `${int}.${decimal.padEnd(2, '0')}` : `${int}.00}`;
}

// format errors
export async function formatError(error: any) {
	if (error.name === 'ZodError') {
		const fieldErrors = Object.keys(error.errors).map(
			(field) => error.errors[field].message
		);

		return fieldErrors.join('. ');
	} else if (
		error.name === 'PrismaClientKnownRequestError' &&
		error.code === 'P2002'
	) {
		const field = error.meta?.target ? error.meta.target[0] : 'Field';

		return `${field[0].toUpperCase() + field.slice(1)} already exists`;
	} else {
		return typeof error.message === 'string'
			? error.message
			: JSON.stringify(error.message);
	}
}

// round number to fixed 2
export function round2(value: number | string) {
	if (typeof value === 'number') {
		return Math.round((value + Number.EPSILON) * 100) / 100;
	} else if (typeof value === 'string') {
		return Math.round(Number(value + Number.EPSILON) * 100) / 100;
	} else {
		throw new Error('value must be number or string');
	}
}

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-ca', {
	currency: 'CAD',
	style: 'currency',
	minimumFractionDigits: 2
});

export function formatCurrency(amount: number | string | null) {
	if (typeof amount === 'number') {
		return CURRENCY_FORMATTER.format(amount);
	} else if (typeof amount === 'string') {
		return CURRENCY_FORMATTER.format(Number(amount));
	} else {
		return 'NaN';
	}
}
