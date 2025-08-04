'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { trpc } from '../trpc/client';
import { httpBatchLink } from '@trpc/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function getBaseUrl() {
	if (typeof window !== 'undefined') return ''; // browser should use relative path
	return `http://localhost:3000`; // backend service (match your docker-compose or dev port)
}

/**
 * All providers for the application.
 * This is the top-level component that wraps the application.
 */
export function Providers({ children }: { children: React.ReactNode }) {
	const trpcClient = trpc.createClient({
		links: [
			httpBatchLink({
				url: `${getBaseUrl()}/trpc`,
			}),
		],
	});

	return (
		<NextThemesProvider
			attribute='class'
			defaultTheme='system'
			enableSystem
			disableTransitionOnChange
			enableColorScheme>
			<trpc.Provider client={trpcClient} queryClient={queryClient}>
				<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
			</trpc.Provider>
		</NextThemesProvider>
	);
}
