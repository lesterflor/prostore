import React from 'react';

export default function Rootlayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className='flex h-screen flex-col'>
			<main className='flex-1 wrapper'>{children}</main>
		</div>
	);
}
