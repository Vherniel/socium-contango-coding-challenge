import { db } from './db';

export function createTRPCContext() {
	return { db };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
