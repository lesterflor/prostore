'use client';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu';

import { Button } from '@/components/ui/button';
import { SunIcon, MoonIcon, SunMoon } from 'lucide-react';

export default function ModeToggle() {
	const [mounted, setMounted] = useState(false);

	const { theme, setTheme } = useTheme();

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					className='focus-visible:ring-0 focus-visible:ring-offset-0'
					variant='ghost'>
					{theme === 'system' ? (
						<SunMoon />
					) : theme === 'dark' ? (
						<MoonIcon />
					) : (
						<SunIcon />
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>Appearance</DropdownMenuLabel>

				<DropdownMenuSeparator />

				<DropdownMenuCheckboxItem
					checked={theme === 'system'}
					onClick={() => setTheme('system')}>
					System
				</DropdownMenuCheckboxItem>

				<DropdownMenuCheckboxItem
					checked={theme === 'dark'}
					onClick={() => setTheme('dark')}>
					Dark
				</DropdownMenuCheckboxItem>

				<DropdownMenuCheckboxItem
					checked={theme === 'light'}
					onClick={() => setTheme('light')}>
					Light
				</DropdownMenuCheckboxItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
