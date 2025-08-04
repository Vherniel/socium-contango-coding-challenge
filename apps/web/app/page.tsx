import CVForm from './_segments/_form.cv-form';

export default async function HomePage() {
	return (
		<div className='flex min-h-svh items-center justify-center'>
			<div className='flex flex-col items-center justify-center gap-4'>
				<h1 className='text-2xl font-bold'>Socium Contago Coding Challenge</h1>
				<CVForm />
			</div>
		</div>
	);
}
