'use client';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
	createUpdateReviewAction,
	getProductReviewByUser
} from '@/lib/actions/review.actions';
import { REVIEW_FORM_DEFAULT_VALUES } from '@/lib/constants';
import { insertReviewSchema } from '@/lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { StarIcon } from 'lucide-react';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

export default function ReviewForm({
	userId,
	productId,
	onReviewSubmitted
}: {
	userId: string;
	productId: string;
	onReviewSubmitted: () => void;
}) {
	const [formOpen, setFormOpen] = useState(false);
	const { toast } = useToast();
	const form = useForm<z.infer<typeof insertReviewSchema>>({
		resolver: zodResolver(insertReviewSchema),
		defaultValues: REVIEW_FORM_DEFAULT_VALUES
	});

	const onSubmit: SubmitHandler<z.infer<typeof insertReviewSchema>> = async (
		values
	) => {
		const res = await createUpdateReviewAction({ ...values, productId });

		setFormOpen(false);

		onReviewSubmitted();

		toast({
			variant: res.success ? 'default' : 'destructive',
			description: res.message
		});
	};

	const handleOpenForm = async () => {
		form.setValue('productId', productId);
		form.setValue('userId', userId);

		const review = await getProductReviewByUser({ productId });

		if (review) {
			form.setValue('title', review.data!.title);
			form.setValue('description', review.data!.description);
			form.setValue('rating', review.data!.rating);
		}

		setFormOpen(true);
	};

	return (
		<Dialog
			open={formOpen}
			onOpenChange={setFormOpen}>
			<Button
				onClick={handleOpenForm}
				variant='default'>
				Write a Review
			</Button>
			<DialogContent className='sm:max-w-[425px]'>
				<Form {...form}>
					<form
						method='post'
						onSubmit={form.handleSubmit(onSubmit)}>
						<DialogHeader>
							<DialogTitle>Write a Review</DialogTitle>
							<DialogDescription>
								Share your thoughts with other customers
							</DialogDescription>
						</DialogHeader>
						<div className='grid gap-4 py-4'>
							<FormField
								control={form.control}
								name='title'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Title</FormLabel>
										<FormControl>
											<Input
												placeholder='Enter title'
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='description'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea
												placeholder='Enter description'
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='rating'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Rating</FormLabel>
										<Select
											onValueChange={field.onChange}
											value={field.value.toString()}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder='Select a rating' />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{Array.from({ length: 5 }).map((_, index) => (
													<SelectItem
														key={index}
														value={(index + 1).toString()}>
														{index + 1}{' '}
														{Array.from({ length: index + 1 }).map((_, i) => (
															<StarIcon
																key={i}
																className='inline h-4 w-4'
															/>
														))}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormItem>
								)}
							/>
						</div>
						<DialogFooter>
							<Button
								type='submit'
								size='lg'
								className='w-full'
								disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
