import { z } from 'zod'
import { router, protectedProcedure } from '../../lib/trpc/trpc'
import { generateTextResponse, generateImageResponse } from '../../lib/gemini'

export const chatRouter = router({
  // Get all conversations for user
  getConversations: protectedProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabase
        .from('conversations')
        .select('*')
        .eq('user_id', ctx.user.sub)
        .order('updated_at', { ascending: false })

      if (error) throw new Error(error.message)
      return data
    }),

  // Create new conversation
  createConversation: protectedProcedure
    .input(z.object({ title: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('conversations')
        .insert({
          user_id: ctx.user.sub,
          title: input.title || 'New Chat'
        })
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    }),

  // Get messages for conversation
  getMessages: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', input.conversationId)
        .order('created_at', { ascending: true })

      if (error) throw new Error(error.message)
      return data
    }),

  // Send message
  sendMessage: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      content: z.string(),
      isImageRequest: z.boolean().default(false)
    }))
    .mutation(async ({ ctx, input }) => {
      const userName = ctx.user.name || ctx.user.email || 'User'
      
      // Save user message
      const { error: userMessageError } = await ctx.supabase
        .from('messages')
        .insert({
          conversation_id: input.conversationId,
          role: 'user' as const,
          content: input.content
        })

      if (userMessageError) throw new Error(userMessageError.message)

      try {
        let assistantContent = ''
        let imageUrl: string | null = null

        if (input.isImageRequest) {
          // Generate image
          const imageResult = await generateImageResponse(input.content, userName)
          assistantContent = imageResult.description
          imageUrl = imageResult.imageUrl
        } else {
          // Generate text response
          assistantContent = await generateTextResponse(input.content, userName)
        }

        // Save assistant message
        const { data, error: assistantMessageError } = await ctx.supabase
          .from('messages')
          .insert({
            conversation_id: input.conversationId,
            role: 'assistant' as const,
            content: assistantContent,
            image_url: imageUrl
          })
          .select()
          .single()

        if (assistantMessageError) throw new Error(assistantMessageError.message)

        // Update conversation timestamp
        await ctx.supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', input.conversationId)

        return data
      } catch (error: any) {
        console.error('Error generating response:', error)
        
        // Save error message as assistant response
        const { data, error: errorMessageError } = await ctx.supabase
          .from('messages')
          .insert({
            conversation_id: input.conversationId,
            role: 'assistant' as const,
            content: `❌ Error: ${error.message || 'Failed to generate response'}`,
            image_url: null
          })
          .select()
          .single()

        if (errorMessageError) throw new Error(errorMessageError.message)
        return data
      }
    }),

  // Delete conversation
  deleteConversation: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('conversations')
        .delete()
        .eq('id', input.conversationId)
        .eq('user_id', ctx.user.sub)

      if (error) throw new Error(error.message)
      return { success: true }
    }),

  // Update conversation title
  updateConversationTitle: protectedProcedure
    .input(z.object({ 
      conversationId: z.string(),
      title: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('conversations')
        .update({ title: input.title })
        .eq('id', input.conversationId)
        .eq('user_id', ctx.user.sub)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    })
})