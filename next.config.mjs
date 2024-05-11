/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode : false,
    images: {
        domains: ['feedback-boards-assets.s3.amazonaws.com', 'lh3.googleusercontent.com', 'www.thetechoutlook.com'],
    }
};

export default nextConfig;
