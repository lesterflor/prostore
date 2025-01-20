'use client';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import React from 'react';

const links = [
	{
		title: 'Overview',
		href: '/admin/overview'
	},
	{
		title: 'Products',
		href: '/admin/products'
	},
	{
		title: 'Orders',
		href: '/admin/orders'
	}
];

export default function AdminMainNav({
	className,
	...props
}: React.HTMLAttributes<HTMLElement>) {
	const pathname = usePathname();

	return (
		<nav
			className={cn('flex items-center space-x-4 lg:space-x-6', className)}
			{...props}>
			{links.map((item) => (
				<Link
					className={cn(
						'text-sm font-medium transition-colors hover:text-primary',
						pathname.includes(item.href) ? '' : 'text-muted-foreground'
					)}
					key={item.href}
					href={item.href}>
					{item.title}
				</Link>
			))}
		</nav>
	);
}
