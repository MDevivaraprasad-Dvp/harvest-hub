import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Listing = {
  id: number
  created_at: string
  farmer_name: string
  farmer_phone: string
  produce_name: string
  quantity_kg: number
  price_per_kg: number
  location: string
  image_url: string | null
}
