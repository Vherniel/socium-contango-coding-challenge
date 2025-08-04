'use client';

import { useState } from 'react';
import { trpc } from '@/trpc/client';
import { Button } from '@repo/ui/components/button';
import { Card, CardContent } from '@repo/ui/components/card';
import { Input as BaseInput } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { cn } from '@repo/ui/lib/utils';

export default function CVForm() {
	const submitCV = trpc.cv.submitCV.useMutation();

	// Basic form related logic
	const [form, setForm] = useState({
		name: '',
		email: '',
		phone: '',
		skills: '',
		experience: '',
		pdfFile: null as File | null,
	});

	const [matchMessages, setMatchMessages] = useState<string[]>([]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!form.pdfFile) return alert('Please upload your PDF file.');

		const base64pdf = await toBase64(form.pdfFile);

		const skillsArray = form.skills.split(',').map((s) => s.trim());

		submitCV.mutate(
			{
				...form,
				skills: skillsArray,
				pdf: base64pdf,
			},
			{
				onSuccess: (data) => {
					const normalizedText = data.text.toLowerCase();

					const matches = {
						name: normalizedText.includes(form.name.toLowerCase()),
						email: normalizedText.includes(form.email.toLowerCase()),
						phone: normalizedText.includes(form.phone.toLowerCase()),
						experience: normalizedText.includes(form.experience.toLowerCase()),
						skills: form.skills
							.split(',')
							.map((skill) => skill.trim())
							.filter((skill) => normalizedText.includes(skill.toLowerCase())),
					};

					const results: string[] = [];

					// Matched / Unmatched feedback
					results.push(matches.name ? '✅ Name matched' : '❌ Name not found');
					results.push(matches.email ? '✅ Email matched' : '❌ Email not found');
					results.push(matches.phone ? '✅ Phone matched' : '❌ Phone not found');
					results.push(
						matches.experience ? '✅ Experience matched' : '❌ Experience not found',
					);

					if (matches.skills.length > 0) {
						results.push(`✅ Skills matched: ${matches.skills.join(', ')}`);
					} else if (skillsArray.length > 0) {
						results.push('❌ No skills matched');
					}

					setMatchMessages(results);
				},
			},
		);
	};

	return (
		<form onSubmit={handleSubmit} className='mx-auto max-w-md space-y-4 p-4'>
			{matchMessages.length > 0 && (
				<Card>
					<CardContent>
						{matchMessages.map((msg, i) => (
							<p key={i}>{msg}</p>
						))}
					</CardContent>
				</Card>
			)}
			<Input name='name' label='Full Name' required value={form.name} onChange={handleChange} />
			<Input
				name='email'
				type='email'
				label='Email'
				required
				value={form.email}
				onChange={handleChange}
			/>
			<Input name='phone' label='Phone' value={form.phone} onChange={handleChange} />
			<Input
				name='skills'
				label='Skills (comma-separated)'
				required
				value={form.skills}
				onChange={handleChange}
			/>
			<div className='space-y-1'>
				<Label className='text-left'>Experience</Label>
				<textarea
					name='experience'
					required
					value={form.experience}
					onChange={handleChange}
					className='border-input h-24 w-full rounded-md border px-3 py-2 text-sm'
				/>
			</div>
			<Input
				label='Upload your CV/Resume .pdf'
				type='file'
				name='pdf'
				accept='application/pdf'
				required
				onChange={(e) => setForm({ ...form, pdfFile: e.target.files?.[0] || null })}
			/>

			<Button type='submit' disabled={submitCV.isPending}>
				{submitCV.isPending ? 'Submitting...' : 'Submit CV'}
			</Button>

			{submitCV.data?.success && <p className='text-green-600'>Submission successful!</p>}
		</form>
	);
}

function Input({
	label,
	...props
}: React.ComponentProps<'input'> & { label: React.ReactNode }) {
	return (
		<>
			<Label className={cn('text-left')}>{label}</Label>
			<BaseInput {...props} />
		</>
	);
}

function toBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = (error) => reject(error);
	});
}
