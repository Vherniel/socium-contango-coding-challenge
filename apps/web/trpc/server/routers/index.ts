import { router } from '../trpc';
import { cvRouter } from './cv';

export const appRouter = router({
	cv: cvRouter,
});

export type AppRouter = typeof appRouter;
