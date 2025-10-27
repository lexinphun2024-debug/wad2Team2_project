import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://tjfnvvjwiscwhxwirlua.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZm52dmp3aXNjd2h4d2lybHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NDU3OTYsImV4cCI6MjA3NzAyMTc5Nn0.pUaPRyffG6smNeQZxXTJaPzsgueRkaT2lPiTiw3rExA"

export const supabase = createClient(supabaseUrl, supabaseKey)

// Fetch stalls by hawker centre name --> user select 'all'
export const getStallsByHawkerName = async (hawkerCentreName) => {
  try {
    const { data, error } = await supabase
      .from('stalls')
      .select('*')
      .eq('hawker_centre_name', hawkerCentreName)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching stalls:', error)
    return []
  }
}

// Fetch stalls by hawker centre name and cuisine type
export const getStallsByHawkerAndCuisine = async (hawkerCentreName, cuisine) => {
  try {
    const { data, error } = await supabase
      .from('stalls')
      .select('*')
      .eq('hawker_centre_name', hawkerCentreName)
      .ilike('cuisine', `%${cuisine}%`)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching stalls by cuisine:', error)
    return []
  }
}

// Get all unique cuisine types from a specific hawker centre
export const getCuisineTypesByHawker = async (hawkerCentreName) => {
  try {
    const { data, error } = await supabase
      .from('stalls')
      .select('cuisine')
      .eq('hawker_centre_name', hawkerCentreName)
    
    if (error) throw error
    
    // Extract unique cuisines
    const uniqueCuisines = [...new Set(data.map(item => item.cuisine))]
    return uniqueCuisines
  } catch (error) {
    console.error('Error fetching cuisine types:', error)
    return []
  }
}


//menu info
export const getStallById = async (stallId) => {
  try {
    const { data, error } = await supabase
      .from('stalls')
      .select('*')
      .eq('id', stallId)
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching stall:', error)
    return null
  }
}

// ========== MENU ITEMS ==========

// Fetch all menu items for a stall
export const getMenuItemsByStall = async (stallId) => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('stall_id', stallId)
      .order('id', { ascending: true })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return []
  }
}

// Get top 3 menu items (first 3 by ID)
export const getTop3MenuItems = async (stallId) => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('stall_id', stallId)
      .order('id', { ascending: true })
      .limit(3)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching top 3 menu items:', error)
    return []
  }
}

// Filter menu items by price range
export const getMenuItemsByPriceRange = async (stallId, minPrice, maxPrice) => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('stall_id', stallId)
      .gte('price', minPrice)
      .lte('price', maxPrice)
      .order('id', { ascending: true })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching menu items by price:', error)
    return []
  }
}
