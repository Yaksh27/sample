import { UserProvider } from '@auth0/nextjs-auth0/client'
import TRPCProvider from '../lib/trpc/Provider'
import './globals.css'

export const metadata = {
  title: 'ChatGPT Clone',
  description: 'A ChatGPT clone built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link 
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" 
          rel="stylesheet" 
          integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" 
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <UserProvider>
          <TRPCProvider>
            {children}
          </TRPCProvider>
        </UserProvider>
        <script 
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" 
          integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" 
          crossOrigin="anonymous"
        ></script>
      </body>
    </html>
  )
}