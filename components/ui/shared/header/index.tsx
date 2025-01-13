import { APP_NAME } from '@/lib/constants';
import Link from 'next/link';
import Image from 'next/image';
import Menu from './menu';

export default function Header() {
	return (
		<header className='w-full border-b'>
			<div className='wrapper flex-between'>
				<div className='flex-start'>
					<Link
						href='/'
						className='flex-start'>
						<Image
							height={48}
							width={48}
							priority={true}
							alt={`${APP_NAME} logo`}
							src='/images/logo.svg'
						/>
						<span className='hidden lg:block font-bold text-2xl pl-2'>
							{APP_NAME}
						</span>
					</Link>
				</div>
				<Menu />
			</div>
		</header>
	);
}
