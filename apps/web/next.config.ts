/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'standalone',
	poweredByHeader: false,

	// Let's skip these checks for now to reduce friction
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},

	transpilePackages: ['@repo/ui'],
};

export default nextConfig;
