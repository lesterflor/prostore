import { cn } from '@/lib/utils';

export default function ProdcutPrice({
	value,
	className
}: {
	value: string;
	className?: string;
}) {
	// get int
	const [intValue, float] = value.split('.');

	return (
		<p className={cn('text-2xl', className)}>
			<span className='text-xs align-super'>$ </span>
			<span>{intValue}</span>
			<span className='text-xs align-super'>.{float}</span>
		</p>
	);
}
