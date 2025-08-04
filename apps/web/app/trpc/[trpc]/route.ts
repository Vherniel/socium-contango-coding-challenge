import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/trpc/server/routers';
import { createTRPCContext } from '@/trpc/server/context';

const handler = (req: Request) => {
	return fetchRequestHandler({
		endpoint: '/trpc',
		req,
		router: appRouter,
		createContext: createTRPCContext,
	});
};

export { handler as GET, handler as POST };
