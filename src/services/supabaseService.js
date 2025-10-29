import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://tjfnvvjwiscwhxwirlua.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZm52dmp3aXNjd2h4d2lybHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NDU3OTYsImV4cCI6MjA3NzAyMTc5Nn0.pUaPRyffG6smNeQZxXTJaPzsgueRkaT2lPiTiw3rExA"

export const supabase = createClient(supabaseUrl, supabaseKey)

// Fetch stalls by hawker centre name --> user select 'all'
export const getStallsByHawkerName = async (hawkerCentreName) => {
  try {
    const { data, error } = await supabase
      .from('info')
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
      .from('info')
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
      .from('info')
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
      .from('info')
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

// Get top 3 menu items (according by order)
export const getTop3BestsellerItems = async (stallId) => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('stall_id', stallId)
      .order('number_of_orders', { ascending: false })
      .limit(3);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching top 3 bestseller items:', error);
    return [];
  }
}


//get menu item by category
export const getMenuItemsByCategory = async (stallId, category) => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('stall_id', stallId)
      .eq('category', category)
      .order('id', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching menu items by category:', error);
    return [];
  }
}


//get the unqiue category for the stall
export const getCategoriesByStall = async (stallId) => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('category', { distinct: true })
      .eq('stall_id', stallId);
    
    if (error) throw error;
    
    //this is the part where make the categories to be unique, only appear once
    const uniqueCategories = [...new Set(data.map(item => item.category))];
    
    
    return uniqueCategories;

   

  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
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


//CART
export async function addToCart(stallId, stallName, itemId, itemName, price) {
  try {
    // Check if item already exists in cart
    const { data: existing, error: fetchError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('item_id', itemId)
      .maybeSingle(); //the cart is empty, it return null

  
    if (existing) {
      // Update quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    } else {
      // Insert new item
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          stall_id: stallId,
          stall_name: stallName,
          item_id: itemId,
          item_name: itemName,
          price: price,
          quantity: 1
        })
        .select()
        .maybeSingle(); 

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

// Update item quantity
export async function updateCartItemQuantity(itemId, quantity) {
  try {
    if (quantity <= 0) {
      return await removeFromCart(itemId);
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('item_id', itemId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    throw error;
  }
}

// Get item quantity in cart
export async function getCartItemQuantity(itemId) {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('item_id', itemId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? data.quantity : 0;
  } catch (error) {
    console.error('Error getting cart quantity:', error);
    return 0;
  }
}

// Remove item from cart
export async function removeFromCart(itemId) {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('item_id', itemId);

    if (error) throw error;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
}

// Get all cart items
export async function getAllCartItems() {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*');

    if (error) {
      // Return empty array if there's any error (table doesn't exist, no data, etc.)
      return [];
    }
    return data || [];
  } catch (error) {
    // Silently fail and return empty array
    return [];
  }
}

// Get total cart count (sum of all quantities)
export async function getCartCount() {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select('quantity');

    if (error) {
      return 0;
    }
    
    if (!data || data.length === 0) {
      return 0;
    }
    
    // Sum up all quantities
    return data.reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    return 0;
  }
}

// Clear entire cart
export async function clearCart() {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .gt('id', 0); // Delete all rows where id > 0

    if (error) throw error;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}