import { supabase } from './client'

export async function getConversations(userId: string) {
  const { data, error } = await supabase.rpc('get_conversations', { user_id: userId })
  
  if (error) throw error
  return data
}

export async function getMessages(conversationPartnerId: string, currentUserId: string, limit = 50) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${conversationPartnerId}),and(sender_id.eq.${conversationPartnerId},receiver_id.eq.${currentUserId})`)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) throw error
  return data
}

export async function sendMessage(senderId: string, receiverId: string, content: string) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      read: false,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function markMessageAsRead(messageId: string) {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('id', messageId)

  if (error) throw error
}

export async function getSuggestedUsers(currentUserId: string, limit = 5) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, bio')
    .neq('id', currentUserId)
    .limit(limit)

  if (error) throw error
  return data
}
