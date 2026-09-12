import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  username: string
  full_name: string
  avatar_url: string
  bio: string
  level: number
  visits: number
  created_at: string
}

export type Post = {
  id: string
  user_id: string
  collection_id: string | null
  content: string
  media_urls: string[]
  tags: string[]
  likes_count: number
  comments_count: number
  saves_count: number
  created_at: string
  updated_at: string
  profiles?: Profile
}

export type Collection = {
  id: string
  user_id: string
  name: string
  description: string
  icon: string
  color: string
  projects_count: number
  created_at: string
}

export type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: string
}
