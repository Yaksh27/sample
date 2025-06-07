/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'via.placeholder.com',
      'lh3.googleusercontent.com',
      's.gravatar.com',
    ],
  },
  env: {
    AUTH0_SECRET: process.env.AUTH0_SECRET,
    AUTH0_BASE_URL: process.env.AUTH0_BASE_URL,
    GOOGLE_AI_KEY: process.env.GOOGLE_AI_KEY,
  },
}

module.exports = nextConfig