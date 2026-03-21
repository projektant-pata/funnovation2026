import { readFile } from 'node:fs/promises'
import path from 'node:path'

const promptCache = new Map<string, string>()
const schemaCache = new Map<string, unknown>()

function aiPath(...segments: string[]) {
  return path.join(process.cwd(), 'ai', ...segments)
}

export async function loadPromptAsset(fileName: string): Promise<string> {
  const cacheKey = `prompt:${fileName}`
  const cached = promptCache.get(cacheKey)
  if (cached) return cached

  const absolutePath = aiPath('prompts', fileName)
  const content = await readFile(absolutePath, 'utf-8')
  const trimmed = content.trim()
  promptCache.set(cacheKey, trimmed)
  return trimmed
}

export async function loadSchemaAsset(fileName: string): Promise<unknown> {
  const cacheKey = `schema:${fileName}`
  const cached = schemaCache.get(cacheKey)
  if (cached) return cached

  const absolutePath = aiPath('schemas', fileName)
  const content = await readFile(absolutePath, 'utf-8')
  const parsed = JSON.parse(content) as unknown
  schemaCache.set(cacheKey, parsed)
  return parsed
}
