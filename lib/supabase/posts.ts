import { supabase } from './client'
import type { Post, Collection } from './client'

export async function getFeed(limit = 20) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        full_name,
        avatar_url,
        level
      ),
      collections:id (
        name,
        icon,
        color
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function createPost(userId: string, content: string, collectionId: string | null, mediaUrls: string[] = [], tags: string[] = []) {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      collection_id: collectionId,
      content,
      media_urls: mediaUrls,
      tags,
      likes_count: 0,
      comments_count: 0,
      saves_count: 0,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function toggleLike(postId: string, userId: string) {
  // Check if already liked
  const { data: existingLike } = await supabase
    .from('likes')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single()

  if (existingLike) {
    // Unlike
    await supabase.from('likes').delete().eq('id', existingLike.id)
    await supabase.rpc('decrement_like_count', { post_id: postId })
  } else {
    // Like
    await supabase.from('likes').insert({ post_id: postId, user_id: userId })
    await supabase.rpc('increment_like_count', { post_id: postId })
  }
}

export async function getCollections(userId?: string) {
  let query = supabase.from('collections').select('*')
  
  if (userId) {
    query = query.eq('user_id', userId)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function createCollection(userId: string, name: string, description: string, icon: string, color: string) {
  const { data, error } = await supabase
    .from('collections')
    .insert({
      user_id: userId,
      name,
      description,
      icon,
      color,
      projects_count: 0,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getTrendingCollections(limit = 5) {
  const { data, error } = await supabase
    .from('collections')
    .select(`
      *,
      profiles:user_id (
        username,
        avatar_url
      )
    `)
    .order('projects_count', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}
