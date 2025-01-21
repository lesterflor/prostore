'use client';

import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { updateUserAction } from '@/lib/actions/user.actions';
import { USER_ROLES } from '@/lib/constants';
import { updateUserSchema } from '@/lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { ControllerRenderProps, useForm } from 'react-hook-form';
import { z } from 'zod';

export default function UpdateUserForm({
	user
}: {
	user: z.infer<typeof updateUserSchema>;
}) {
	const router = useRouter();
	const { toast } = useToast();

	const form = useForm<z.infer<typeof updateUserSchema>>({
		resolver: zodResolver(updateUserSchema),
		defaultValues: user
	});

	const onSubmit = async (values: z.infer<typeof updateUserSchema>) => {
		const res = await updateUserAction({
			...values,
			id: user.id
		});

		toast({
			variant: !res.success ? 'destructive' : 'default',
			description: res.message
		});

		form.reset();

		router.push('/admin/users');
	};

	return (
		<Form {...form}>
			<form
				method='POST'
				onSubmit={form.handleSubmit(onSubmit)}>
				{/* Email */}
				<div>
					<FormField
						control={form.control}
						name='email'
						render={({
							field
						}: {
							field: ControllerRenderProps<
								z.infer<typeof updateUserSchema>,
								'email'
							>;
						}) => (
							<FormItem className='w-full'>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										disabled={true}
										placeholder='Enter an email'
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Name */}
					<FormField
						control={form.control}
						name='name'
						render={({
							field
						}: {
							field: ControllerRenderProps<
								z.infer<typeof updateUserSchema>,
								'name'
							>;
						}) => (
							<FormItem className='w-full'>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input
										placeholder='Enter a name'
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Role */}
					<div>
						<FormField
							control={form.control}
							name='role'
							render={({
								field
							}: {
								field: ControllerRenderProps<
									z.infer<typeof updateUserSchema>,
									'role'
								>;
							}) => (
								<FormItem className='w-full'>
									<FormLabel>Role</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value.toString()}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder='Select a role' />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{USER_ROLES.map((role) => (
												<SelectItem
													key={role}
													value={role}>
													{role[0].toUpperCase() + role.slice(1)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>

				<div className='flex-between pt-8'>
					<Button
						type='submit'
						className='w-full'
						disabled={form.formState.isSubmitting}>
						{form.formState.isSubmitting ? 'Submitting...' : 'Update User'}
					</Button>
				</div>
			</form>
		</Form>
	);
}
