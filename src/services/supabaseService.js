import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

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


//retrieve information by stall id
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


//CART SECTION

//ADD FOOD ITEM TO THE CART WITH THE STALLNAME AND STALLID
export async function addToCart(stallId, stallName, itemId, itemName, price) {
  try {
    //Get logged-in user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("User not logged in");

    const userId = user.id;

    // Check if item already exists in cart
    const { data: existing, error: fetchError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("item_id", itemId)
      .eq("user_id", userId)
      .maybeSingle();
      //the cart is empty, it return null, BUT STILL CAN DISPLAY OUT

  
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
          user_id: userId,
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

// Update the food item quantity in the cart, when user click on the '+' , '-'
export async function updateCartItemQuantity(itemId, quantity) {
  try {
    if (quantity <= 0) {
      return await removeFromCart(itemId);
    }

     const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not logged in");

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('item_id', itemId)
       .eq("user_id", user.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    throw error;
  }
}

// Get food item quantity in the cart
export async function getCartItemQuantity(itemId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not logged in");

    const { data, error } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('item_id', itemId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? data.quantity : 0;
  } catch (error) {
    console.error('Error getting cart quantity:', error);
    return 0;
  }
}

// Remove food item from cart
export async function removeFromCart(itemId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not logged in");

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('item_id', itemId)
       .eq("item_id", itemId);

    if (error) throw error;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
}

// Get all the food item in the cart
export async function getAllCartItems() {
  try {

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
       .eq("user_id", user.id);

    if (error) {
    
      return [];
    }
    return data || [];
  } catch (error) {
    return [];
  }
}

// Get total cart count (sum of all quantities)
export async function getCartCount() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { data, error } = await supabase
      .from('cart_items')
      .select('quantity')
       .eq("user_id", user.id);;

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not logged in");

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq("user_id", user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}


//ORDER PART
//get all order of that user
export async function getUserOrders(userId) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting user orders:', error);
    return [];
  }
}

// Update the order status
export async function updateOrderStatus(orderId, status) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}