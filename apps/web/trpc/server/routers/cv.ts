import { z } from 'zod';
import { procedure, router } from '../trpc';

const submitCVSchema = z.object({
	name: z.string(),
	email: z.string().email(),
	phone: z.string(),
	skills: z.array(z.string()),
	experience: z.string(),
	pdf: z.string(), // base64 string of the PDF
});

export const cvRouter = router({
	submitCV: procedure.input(submitCVSchema).mutation(async ({ input }) => {
		const response = await fetch('http://localhost:5678/webhook/cv-submit', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				...input,
			}),
		});

		const result = await response.json();
		console.log(result);
		return result;
	}),
});
