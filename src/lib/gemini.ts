import { GoogleGenAI, Modality } from '@google/genai'

const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyC27HZo1lTEl5dtKW36_vnDponqwbTFWyw'

console.log('🔑 Using API key:', API_KEY ? 'Key found' : 'No key')

const ai = new GoogleGenAI({ apiKey: API_KEY })

export async function generateTextResponse(prompt: string, userName?: string): Promise<string> {
  try {
    console.log('🤖 Attempting Gemini API call...')
    console.log('📝 Prompt:', prompt.substring(0, 100))
    
    const result = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ text: prompt }]
    })
    
    const text = result.text
    console.log('✅ Gemini response received:', text.substring(0, 100))
    return text
    
  } catch (error: any) {
    console.error('❌ Gemini failed, details:', error)
    
    // Check for geographic restrictions
    if (error.message?.includes('location') || error.message?.includes('region')) {
      throw new Error(`Sorry ${userName || 'there'}, Gemini API is not available in your region. This might be due to geographic restrictions.`)
    }
    
    // Check for API key issues
    if (error.message?.includes('API_KEY') || error.message?.includes('401')) {
      throw new Error(`API key issue detected. Please check your Gemini API configuration.`)
    }
    
    // Return error message instead of fallback
    throw new Error(`Gemini API failed: ${error.message}`)
  }
}

export async function generateImageResponse(prompt: string, userName?: string): Promise<{
  description: string
  imageUrl: string | null
}> {
  try {
    console.log('🎨 Attempting image generation with Gemini 2.0 Flash...')
    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [{ text: `Generate an image: ${prompt}` }],
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    })
    
    let description = ''
    let imageUrl: string | null = null
    
    // Process response parts
    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        description = part.text
      } else if (part.inlineData) {
        // Convert base64 image data to data URL
        const imageData = part.inlineData.data
        const mimeType = part.inlineData.mimeType
        imageUrl = `data:${mimeType};base64,${imageData}`
        console.log('✅ Image generated successfully')
      }
    }
    
    return {
      description: description || `Generated image: ${prompt}`,
      imageUrl
    }
    
  } catch (error: any) {
    console.error('❌ Image generation failed:', error)
    
    if (error.message?.includes('location') || error.message?.includes('region')) {
      throw new Error('Image generation is not available in your region. Gemini\'s image generation feature has geographic restrictions.')
    }
    
    throw new Error(`Gemini image generation failed: ${error.message}`)
  }
}