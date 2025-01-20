import Menu from '@/components/shared/header/menu';
import { APP_NAME } from '@/lib/constants';
import Image from 'next/image';
import Link from 'next/link';
import MainNav from './main-nav';

// export const metadata: Metadata = {
// 	title: {
// 		template: `%s | Prostore`,
// 		default: APP_NAME
// 	},
// 	description: APP_DESCRIPTION,
// 	metadataBase: new URL(SERVER_URL)
// };

export default function UserLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className='flex flex-col'>
			<div className='border-b container mx-auto'>
				<div className='flex items-center h-16 px-4'>
					<Link
						href='/'
						className='w-22'>
						<Image
							src='/images/logo.svg'
							width={48}
							height={48}
							alt={APP_NAME}
						/>
					</Link>
					{/* Main nav */}
					<MainNav className='mx-6' />
					<div className='ml-auto items-center flex space-x-4'>
						<Menu />
					</div>
				</div>
			</div>

			<div className='flex-1 space-y-4 p-8 pt-6 container mx-auto'>
				{children}
			</div>
		</div>
	);
}
