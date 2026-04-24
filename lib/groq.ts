import Groq from 'groq-sdk'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function transcribeAudio(file: File): Promise<string> {
  const result = await client.audio.transcriptions.create({
    file,
    model: 'whisper-large-v3-turbo',
    language: 'en',
    response_format: 'json',
  })
  return result.text
}
