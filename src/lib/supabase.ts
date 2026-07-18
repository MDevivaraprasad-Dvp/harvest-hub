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

export type Review = {
  id: number
  created_at: string
  farmer_phone: string
  rating: number
  comment: string | null
  buyer_name: string
}

export type OrderStatus =
  | 'pending'
  | 'completed'
  | 'cancelled'
  | 'negotiating'
  | 'counter_offered'

export type Order = {
  id: number
  created_at: string
  farmer_phone: string
  buyer_name: string
  buyer_phone: string
  listing_id: number | null
  produce_name: string
  quantity_kg: number
  price_per_kg: number
  status: OrderStatus
  note: string | null
  offered_price: number | null
  counter_price: number | null
}

export type ListingView = {
  id: number
  created_at: string
  listing_id: number
  viewer_phone: string | null
}
