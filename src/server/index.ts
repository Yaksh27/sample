import { router, publicProcedure, protectedProcedure } from '../lib/trpc/trpc'
import { z } from 'zod'
import { generateTextResponse, generateImageResponse } from '../lib/gemini'

// Store messages by user ID and conversation ID
const messagesStore = new Map<string, any[]>()
// Store conversations by user ID
const conversationsStore = new Map<string, any[]>()

const chatRouter = router({
  getConversations: protectedProcedure
    .query(({ ctx }) => {
      const userId = ctx.user.sub
      console.log('Getting conversations for user:', userId)
      
      // Get user's conversations or create default one
      if (!conversationsStore.has(userId)) {
        const defaultConversation = {
          id: '1',
          user_id: userId,
          title: `Welcome Chat`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        conversationsStore.set(userId, [defaultConversation])
      }
      
      const userConversations = conversationsStore.get(userId) || []
      console.log('User', userId, 'has', userConversations.length, 'conversations')
      return userConversations
    }),

  getMessages: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(({ input, ctx }) => {
      const userId = ctx.user.sub
      const messageKey = `${userId}-${input.conversationId}`
      
      console.log('Getting messages for user:', userId, 'conversation:', input.conversationId)
      
      // Get messages for this specific user and conversation
      const messages = messagesStore.get(messageKey) || []
      
      console.log('Found', messages.length, 'messages for conversation', input.conversationId)
      return messages
    }),

   sendMessage: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      content: z.string(),
      isImageRequest: z.boolean().default(false)
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.sub
      const userName = ctx.user.name || ctx.user.email || 'User'
      const messageKey = `${userId}-${input.conversationId}`
      
      console.log(`\n=== NEW MESSAGE ===`)
      console.log(`User: ${userId} (${userName})`)
      console.log(`Type: ${input.isImageRequest ? 'IMAGE' : 'TEXT'}`)
      console.log(`Content: ${input.content}`)
      console.log(`Conversation: ${input.conversationId}`)
      
      // Get or create message array
      if (!messagesStore.has(messageKey)) {
        messagesStore.set(messageKey, [])
      }
      const messages = messagesStore.get(messageKey)!

      // Add user message
      const userMessage = {
        id: Math.random().toString(),
        conversation_id: input.conversationId,
        role: 'user' as const,
        content: input.content,
        image_url: null,
        created_at: new Date().toISOString()
      }
      messages.push(userMessage)

      // Generate AI response - pure Gemini or error
      let assistantResponse: string
      let imageUrl: string | null = null

      try {
        if (input.isImageRequest) {
          console.log('Attempting image generation...')
          const imageResult = await generateImageResponse(input.content, userName)
          assistantResponse = imageResult.description
          imageUrl = imageResult.imageUrl
          console.log('Image generation successful')
        } else {
          console.log('Attempting text generation...')
          assistantResponse = await generateTextResponse(input.content, userName)
          console.log('Text generation successful')
        }
      } catch (geminiError: any) {
        console.error('Gemini API failed:', geminiError)
        // Return the actual error message from Gemini
        assistantResponse = `❌ Error: ${geminiError.message || 'Gemini API is currently unavailable.'}`
      }

      // Add assistant response
      const assistantMessage = {
        id: Math.random().toString(),
        conversation_id: input.conversationId,
        role: 'assistant' as const,
        content: assistantResponse,
        image_url: imageUrl,
        created_at: new Date(Date.now() + 1000).toISOString()
      }
      messages.push(assistantMessage)

      // Update conversation
      const userConversations = conversationsStore.get(userId) || []
      const conversation = userConversations.find(c => c.id === input.conversationId)
      if (conversation) {
        conversation.updated_at = new Date().toISOString()
        if (conversation.title === 'New Chat' && messages.length === 2) {
          conversation.title = input.content.slice(0, 30) + (input.content.length > 30 ? '...' : '')
        }
      }

      console.log('Response generated:', assistantResponse.substring(0, 100) + '...')
      console.log('=== END MESSAGE ===\n')
      
      return assistantMessage
    }),

  createConversation: protectedProcedure
    .input(z.object({ title: z.string().optional() }))
    .mutation(({ input, ctx }) => {
      const userId = ctx.user.sub
      const newConversationId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      console.log('Creating new conversation for user:', userId)
      
      // Get or create user's conversations array
      if (!conversationsStore.has(userId)) {
        conversationsStore.set(userId, [])
      }
      const userConversations = conversationsStore.get(userId)!
      
      // Create new conversation
      const newConversation = {
        id: newConversationId,
        user_id: userId,
        title: input.title || 'New Chat',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Add to the beginning of the array (most recent first)
      userConversations.unshift(newConversation)
      
      console.log('Created conversation:', newConversationId, 'User now has', userConversations.length, 'conversations')
      return newConversation
    }),

  deleteConversation: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(({ input, ctx }) => {
      const userId = ctx.user.sub
      console.log('User', userId, 'deleting conversation:', input.conversationId)
      
      // Remove from conversations
      const userConversations = conversationsStore.get(userId) || []
      const filteredConversations = userConversations.filter(c => c.id !== input.conversationId)
      conversationsStore.set(userId, filteredConversations)
      
      // Remove messages
      const messageKey = `${userId}-${input.conversationId}`
      messagesStore.delete(messageKey)
      
      return { success: true }
    })
})

export const appRouter = router({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}!`,
      }
    }),
  chat: chatRouter
})

export type AppRouter = typeof appRouter