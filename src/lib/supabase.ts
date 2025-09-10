import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
)

// Database types (should match Supabase schema)
export interface Booking {
  id?: number
  name: string
  email: string
  phone: string
  service: string
  property_type: string
  message?: string
  postcode: string
  preferred_date?: string
  status?: string
  created_at?: string
}

export interface Contact {
  id?: number
  name: string
  email: string
  phone?: string
  message: string
  created_at?: string
}

export interface KbItem {
  id?: number
  kind: 'sop' | 'pricing' | 'faq' | 'policy'
  slug: string
  title: string
  content: string
  embedding?: number[]
  metadata?: Record<string, any>
  created_at?: string
  updated_at?: string
}

// Helper functions
export const submitBooking = async (booking: Omit<Booking, 'id' | 'created_at' | 'status'>) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert([{ ...booking, status: 'pending' }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const submitContact = async (contact: Omit<Contact, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('contacts')
    .insert([contact])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const queryKnowledge = async (query: string) => {
  // Simple text search for now (vector search requires embedding)
  const { data, error } = await supabase
    .from('kb_items')
    .select('*')
    .textSearch('content', query)
    .limit(3)
  
  if (error) throw error
  return data
}