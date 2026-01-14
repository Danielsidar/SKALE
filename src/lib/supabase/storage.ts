import { createClient } from './client'

export async function uploadFile(
  file: File,
  bucket: string,
  path: string = ''
): Promise<string> {
  const supabase = createClient()
  
  // Clean file name and add timestamp to avoid collisions
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
  const filePath = path ? `${path}/${fileName}` : fileName

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw error
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return publicUrl
}

export async function deleteFile(bucket: string, path: string) {
  const supabase = createClient()
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}



