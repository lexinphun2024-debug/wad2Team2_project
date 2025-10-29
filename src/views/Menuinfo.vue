<template>
  <!-- NavBar -->
  <NavBar />
  <div class="menu-info-container">
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">←</button>
        <h2 class="stall-title">{{ stallName }}</h2>
      </div>
    </header>

    <!-- Tabs -->
    <div class="tabs">
      <!--best seller-->
      <button 
        :class="{ active: activeTab === 'bestseller' }"
        @click="switchTab('bestseller')"
      >
       ⭐ BestSeller
      </button>

      <!--category-->
      <button
        v-for="category in categories"
        :key="category"
        :class="{active: activeTab === category }"
        @click="switchTab(category)"
      >
      <!--capital the first letter for each cateogry-->
        {{ category.charAt(0).toUpperCase() + category.slice(1) }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>

    <!-- Menu Section -->
    <div v-if="!loading" class="menu-grid">
      <div v-for="(item, index) in displayedItems" :key="item.id" class="menu-card">
        
        <div class="menu-content">
          <h4>{{ item.item_name }}</h4>
          <p class="price">${{ item.price.toFixed(2) }}</p>
          <div class="add-btn-container">
           <button 
              v-if="cartQuantities[item.id] === 0" 
              class="add-btn" 
              @click="handleAddToCart(item)"
              @mouseover="showPopup(index)" 
              @mouseleave="hidePopup"
            >
              + Add to Cart
            </button>
            
            <!--When the item add in cart, then will show this quantity control -->
            <div v-else class="quantity-controls">
              <button class="quantity-btn" @click="decreaseQuantity(item)">-</button>
              <span class="quantity-display">{{ cartQuantities[item.id] }}</span>
              <button class="quantity-btn" @click="increaseQuantity(item)">+</button>
            </div>
            
            <div v-if="popupIndex === index" class="popup">Add to Order</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getStallById, getTop3BestsellerItems, getMenuItemsByCategory, getCategoriesByStall, 
 addToCart, updateCartItemQuantity, getCartItemQuantity} from "@/services/supabaseService";
import NavBar from '@/components/NavBar.vue'

export default {
  name : 'MenuInfo',
  components: {
    NavBar
  },
  props: {
    stallId: { type: [String, Number], required: true },
  },
  data() {
    return {
      stallName: "",
      categories: [],
      activeTab: "bestseller",
      bestsellerItems: [],
      categoryItems: {},
      displayedItems: [],
      loading: true,
      popupIndex: null,
      cartQuantities : {},
    };
  },
   async mounted() {
    await this.loadData();
    await this.loadCartQuantities();
  },
  methods: {
    async loadData() {
      this.loading = true;
      try {
        const stall = await getStallById(this.stallId);
        this.stallName = stall.name;

        // Load bestseller
        this.bestsellerItems = await getTop3BestsellerItems(this.stallId);

        // Load the unqiue categories
        this.categories = await getCategoriesByStall(this.stallId);

       

        // Load items for each category
        for (const category of this.categories) {
          this.categoryItems[category] = await getMenuItemsByCategory(this.stallId, category);
        }

        // Default displayed items
        this.displayedItems = this.bestsellerItems;

      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    async loadCartQuantities() {
    // load the quantities for each food item selected
      const allItems = [
        ...this.bestsellerItems,
        ...Object.values(this.categoryItems).flat()
      ];

      for (const item of allItems) {
        const quantity = await getCartItemQuantity(item.id);
        this.cartQuantities[item.id] = quantity;
      }
    },

    async handleAddToCart(item) { //add to cart part
      try {
        await addToCart(
          this.stallId,
          this.stallName,
          item.id,
          item.item_name,
          item.price
        );
        this.cartQuantities[item.id] = 1;
      } catch (error) {
        console.error('Failed to add to cart:', error);
        alert('Failed to add item to cart');
      }
    },

    async increaseQuantity(item) {
      try {
        const newQuantity = this.cartQuantities[item.id] + 1;
        await updateCartItemQuantity(item.id, newQuantity);
        this.cartQuantities[item.id] = newQuantity;
      } catch (error) {
        console.error('Failed to update quantity:', error);
      }
    },

    async decreaseQuantity(item) {
      try {
        const newQuantity = this.cartQuantities[item.id] - 1;
        await updateCartItemQuantity(item.id, newQuantity);
        this.cartQuantities[item.id] = newQuantity;
      } catch (error) {
        console.error('Failed to update quantity:', error);
      }
    },


    switchTab(tab) {
      this.activeTab = tab;
      if (tab === "bestseller") {
        this.displayedItems = this.bestsellerItems;
      } else {
        this.displayedItems = this.categoryItems[tab] || [];
      }
    },

    showPopup(index) { this.popupIndex = index; },
    hidePopup() { this.popupIndex = null; },

    async goBack() {
      const stallid = this.$route.params.stallId;
      const stall = await getStallById(stallid); 
      //retrieve information of that stall id(contain hawker_centre_name, stall name)
      if(stall && stall.hawker_centre_name){
        this.$router.push({
          name: "StallInfo",
          params: { hawkerName: stall.hawker_centre_name }, //need the hawker centre name(from database)
          query: { stallId: stall.id }
        })
      }
    },
  },
};
</script>

<style scoped>
.menu-info-container {
  padding: 1.5rem;
  font-family: "Poppins", sans-serif;
  color: #333;
  background: linear-gradient(180deg, #fff8f0, #fff1e0);
  min-height: 100vh;
  padding-top: 90px;
}

/* Header */
.header {
  background: linear-gradient(90deg, #ffa94d, #ffca6f);
  padding: 1rem 1.5rem;
  border-radius: 14px;
  margin-bottom: 1.5rem;
  color: white;
  box-shadow: 0 3px 10px rgba(255, 165, 0, 0.3);
}
.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.back-btn {
  background: white;
  border: none;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  font-size: 1.2rem;
  cursor: pointer;
  color: #ff8800;
  font-weight: bold;
  transition: 0.3s ease;
  box-shadow: 0 2px 6px rgba(255, 136, 0, 0.2);
}
.back-btn:hover {
  background: #ff8800;
  color: white;
  transform: scale(1.1);
}
.stall-title {
  font-size: 1.6rem;
  font-weight: 600;
}

/* Tabs */
.tabs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.8rem;
}
.tabs button {
  background: rgba(255, 229, 180, 0.8);
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(255, 165, 0, 0.2);
  backdrop-filter: blur(8px);
}
.tabs button.active {
  background: linear-gradient(90deg, #ff9900, #ffb84d);
  color: white;
  box-shadow: 0 4px 10px rgba(255, 153, 0, 0.4);
}
.tabs button:hover {
  transform: scale(1.07);
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 3rem;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ffe5b4;
  border-top: 4px solid #ff9900;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Menu Grid */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}
.menu-card {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(255, 153, 0, 0.25);
  padding: 1.2rem;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 204, 153, 0.3);
}
.menu-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 6px 20px rgba(255, 153, 0, 0.35);
}
.menu-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.menu-content h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}
.price {
  font-weight: bold;
  color: #ff8800;
  margin-bottom: 0.6rem;
}

/* Add Button */
.add-btn-container {
  position: relative;
  display: flex;
  justify-content: flex-end;
}
.add-btn {
  background: linear-gradient(90deg, #ff9900, #ffb84d);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 0 1.2rem;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 3px 8px rgba(255, 165, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 50px;
}
.add-btn:hover {
  background: linear-gradient(90deg, #ff7700, #ffaa33);
  transform: scale(1.08);
  box-shadow: 0 5px 14px rgba(255, 136, 0, 0.4);
}
.popup {
  position: absolute;
  bottom: 110%;
  right: 0;
  background: #333;
  color: white;
  font-size: 0.75rem;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  opacity: 0.9;
}

/* Quantity Controls */
.quantity-controls {
  display: flex; /*make it align together one line */
  align-items: center;
  justify-content: flex-end;
  background: #fff7eb;
  border: 1px solid #ffe0b3;
  border-radius: 50px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(255, 165, 0, 0.15);
  transition: all 0.3s ease;
  width: fit-content;
  min-height: 50px; 
}

.quantity-btn {
  width: 50px;      
  height: 50px;     
  border: none;
  background: #ffe5b4;
  cursor: pointer;
  font-size: 24px;   
  font-weight: bold;
  color: #ff8800;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.quantity-btn:hover {
  background: #ffcc80;
  transform: scale(1.1);
}

.quantity-display {
  min-width: 50px;  
  text-align: center;
  font-weight: 600;
  color: #ff8800;
  font-size: 1.2rem; 
  padding: 0 8px;  
}

/* Responsive for 2 per row on md/lg */
@media (min-width: 768px) {
  .menu-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 767px) {
  .menu-grid {
    grid-template-columns: 1fr;
  }
}
</style>