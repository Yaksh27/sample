import { initTRPC, TRPCError } from '@trpc/server'
import { getSession } from '@auth0/nextjs-auth0'
import superjson from 'superjson'
import { supabase } from '../supabase'

// Define user type
interface User {
  sub: string
  name?: string
  email?: string
  picture?: string
}

// Create context for tRPC with real auth and database
export const createTRPCContext = async () => {
  try {
    const session = await getSession()
    
    return {
      user: session?.user as User | null,
      supabase
    }
  } catch (error) {
    console.error('Error creating context:', error)
    return {
      user: null,
      supabase
    }
  }
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape
  },
})

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(
  t.middleware(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to access this resource',
      })
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    })
  })
)