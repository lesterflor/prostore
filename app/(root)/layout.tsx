import Header from '@/components/ui/shared/header';
import Footer from '@/components/footer';
import React from 'react';

export default function Rootlayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className='flex h-screen flex-col'>
			<Header />
			<main className='flex-1 wrapper'>{children}</main>
			<Footer />
		</div>
	);
}
