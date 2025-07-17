import * as v from 'valibot';

export const inputSchema = v.object({
	username: v.pipe(v.string(), v.minLength(3), v.maxLength(10)),
	password: v.pipe(v.string(), v.minLength(8), v.maxLength(100)),
});

export type InputSchema = v.InferInput<typeof inputSchema>;
