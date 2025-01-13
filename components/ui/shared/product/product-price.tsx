import { cn } from '@/lib/utils';

export default function ProdcutPrice({
	value,
	className
}: {
	value: number;
	className?: string;
}) {
	// ensure to precision (2)
	const stringValue = value.toFixed(2);
	// get int
	const [intValue, float] = stringValue.split('.');

	return (
		<p className={cn('text-2xl', className)}>
			<span className='text-xs align-super'>$ </span>
			<span>{intValue}</span>
			<span className='text-xs align-super'>.{float}</span>
		</p>
	);
}
