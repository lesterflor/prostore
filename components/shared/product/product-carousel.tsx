'use client';

import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious
} from '@/components/ui/carousel';
import { IProduct } from '@/types';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductCarousel({ data }: { data: IProduct[] }) {
	return (
		<Carousel
			className='w-full mb-12'
			opts={{
				loop: true
			}}
			plugins={[
				Autoplay({
					delay: 2000,
					stopOnInteraction: true,
					stopOnMouseEnter: true
				})
			]}>
			<CarouselContent>
				{data.map((prod) => (
					<CarouselItem key={prod.id}>
						<Link href={`/products/${prod.slug}`}>
							<div className='relative mx-auto'>
								<Image
									src={prod.banner!}
									alt={prod.name}
									width={0}
									height={0}
									sizes='100vw'
									className='w-full h-auto'
								/>
								<div className='absolute inset-0 flex items-end justify-center'>
									<h2 className='bg-gray-900 bg-opacity-50 text-2xl font-bold px-2 text-white'>
										{prod.name}
									</h2>
								</div>
							</div>
						</Link>
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious />
			<CarouselNext />
		</Carousel>
	);
}
