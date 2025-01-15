'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signUpDefaultValues } from '@/lib/constants';
import { signUpUser } from '@/lib/actions/user.actions';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';

export default function SignUpForm() {
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get('callbackUrl') || '/';

	const [data, action] = useActionState(signUpUser, {
		success: false,
		message: ''
	});

	const SignUpButton = () => {
		const { pending } = useFormStatus();

		return (
			<Button
				disabled={pending}
				className='w-full'
				variant='default'>
				{pending ? 'Signing in...' : 'Sign In'}
			</Button>
		);
	};

	return (
		<form action={action}>
			<input
				type='hidden'
				name='callbackUrl'
				value={callbackUrl}
			/>
			<div className='space-y-6'>
				<div>
					<Label htmlFor='name'>Name</Label>
					<Input
						id='name'
						name='name'
						required
						type='text'
						defaultValue={signUpDefaultValues.email}
					/>
				</div>

				<div>
					<Label htmlFor='email'>Email</Label>
					<Input
						id='email'
						name='email'
						required
						type='email'
						autoComplete='email'
						defaultValue={signUpDefaultValues.email}
					/>
				</div>

				<div>
					<Label htmlFor='password'>Password</Label>
					<Input
						id='password'
						name='password'
						required
						type='password'
						autoComplete='password'
						defaultValue={signUpDefaultValues.password}
					/>
				</div>

				<div>
					<Label htmlFor='confirmPassword'>Confirm Password</Label>
					<Input
						id='confirmPassword'
						name='confirmPassword'
						required
						type='password'
						autoComplete='password'
						defaultValue={signUpDefaultValues.confirmPassword}
					/>
				</div>

				<div>
					<SignUpButton />
				</div>

				{data && !data.success && (
					<div className='text-center text-destructive'>{data.message}</div>
				)}
			</div>
		</form>
	);
}
