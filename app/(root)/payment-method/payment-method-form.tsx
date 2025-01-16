'use client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';
import { paymentMethodSchema } from '@/lib/validators';
import { ControllerRenderProps, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { DEFAULT_PAYMENT_METHOD, PAYMENT_METHODS } from '@/lib/constants';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import { updateUsersPaymentMethod } from '@/lib/actions/user.actions';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function PaymentMethodForm({
	preferredPaymentMethod
}: {
	preferredPaymentMethod: string | null;
}) {
	const router = useRouter();
	const { toast } = useToast();

	const form = useForm<z.infer<typeof paymentMethodSchema>>({
		resolver: zodResolver(paymentMethodSchema),
		defaultValues: {
			type: preferredPaymentMethod || DEFAULT_PAYMENT_METHOD
		}
	});

	const [isPending, startTransition] = useTransition();

	const onSubmit: SubmitHandler<z.infer<typeof paymentMethodSchema>> = async (
		values
	) => {
		startTransition(async () => {
			const res = await updateUsersPaymentMethod(values);

			if (!res.success) {
				toast({
					variant: 'destructive',
					description: res.message
				});
				return;
			}

			router.push('/place-order');
		});
	};

	return (
		<div className='max-w-md mx-auto space-y-4'>
			<h1 className='h2-bold mt-4'>Payment Method</h1>
			<p className='text-sm text-muted-foreground'>
				Please enter an address to ship to
			</p>

			<Form {...form}>
				<form
					method='post'
					className='space-y-4'
					onSubmit={form.handleSubmit(onSubmit)}>
					<div className='flex flex-col md:flex-row gap-5'>
						<FormField
							control={form.control}
							name='type'
							render={({
								field
							}: {
								field: ControllerRenderProps<
									z.infer<typeof paymentMethodSchema>
								>;
							}) => (
								<FormItem className='w-full'>
									<FormLabel>Address</FormLabel>
									<FormControl>
										<RadioGroup
											onValueChange={field.onChange}
											className='flex flex-col space-y-2'>
											{PAYMENT_METHODS.map((p) => (
												<FormItem
													key={p}
													className='flex items-center space-x-3 space-y-0'>
													<FormControl>
														<RadioGroupItem
															value={p}
															checked={field.value === p}
														/>
													</FormControl>
													<FormLabel className='font-normal'>{p}</FormLabel>
												</FormItem>
											))}
										</RadioGroup>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className='flex gap-2'>
						<Button
							type='submit'
							disabled={isPending}>
							{isPending ? (
								<Loader className='w-4 h-4 animate-spin' />
							) : (
								<ArrowRight className='w-4 h-4' />
							)}{' '}
							Continue
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
