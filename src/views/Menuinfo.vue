<template>
  <!-- NavBar -->
   
  <NavBar />
  <div class="menu-info-container">
    <!-- Header with gradient overlay -->
    <header class="header">
      <div class="header-content">
        <button class="back-btn" @click="goBack">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="stall-info">
          <h2 class="stall-title">{{ stallName }}</h2>
          <p class="stall-subtitle">Explore delicious menu</p>
        </div>
      </div>
      <div class="header-decoration">
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
        <div class="decoration-circle circle-3"></div>
      </div>
    </header>

    <!-- Enhanced Tabs with scroll indicator -->
    <div class="tabs-wrapper">
      <div class="tabs-container" ref="tabsContainer">
        <button 
          :class="{ active: activeTab === 'bestseller' }"
          @click="switchTab('bestseller')"
          class="tab-btn bestseller-tab"
        >
          <span class="tab-icon">⭐</span>
          <span class="tab-text">BestSeller</span>
          <span v-if="activeTab === 'bestseller'" class="active-indicator"></span>
        </button>

        <button
          v-for="category in categories"
          :key="category"
          :class="{active: activeTab === category }"
          @click="switchTab(category)"
          class="tab-btn"
        >
          <span class="tab-icon">{{ getCategoryIcon(category) }}</span>
          <span class="tab-text">{{ category.charAt(0).toUpperCase() + category.slice(1) }}</span>
          <span v-if="activeTab === category" class="active-indicator"></span>
        </button>
      </div>
    </div>

    <!-- Loading with animation for the preparing menu part -->
    <div v-if="loading" class="loading">
      <div class="loading-animation">
        <div class="loading-bowl"></div>
        <div class="loading-steam steam-1"></div>
        <div class="loading-steam steam-2"></div>
        <div class="loading-steam steam-3"></div>
      </div>
      <p class="loading-text">Preparing your menu...</p>
    </div>

    <!-- Enhanced Menu Section with staggered animations -->
    <transition-group 
      v-if="!loading" 
      name="menu-list" 
      tag="div" 
      class="menu-grid"
      @before-enter="beforeEnter"
      @enter="enter"
    >
      <div 
        v-for="(item, index) in displayedItems" 
        :key="item.id" 
        :data-index="index"
        class="menu-card"
      >
        <div class="card-shine"></div>
        
        <div class="menu-content">
          <div class="item-header">
            <h4 class="item-name">{{ item.item_name }}</h4>
            <div class="price-badge">
              <span class="currency">$</span>
              <span class="amount">{{ item.price.toFixed(2) }}</span>
            </div>
          </div>
          
          <div class="card-footer">
            <button 
              v-if="cartQuantities[item.id] === 0" 
              class="add-btn" 
              @click="handleAddToCart(item)"
            >
              <span class="btn-icon">🛒</span>
              <span class="btn-text">Add to Cart</span>
              <div class="btn-ripple"></div>
            </button>
            
            <div v-else class="quantity-controls">
              <button 
                class="quantity-btn decrease" 
                @click="decreaseQuantity(item)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
              <div class="quantity-display">
                <transition name="quantity-change" mode="out-in">
                  <span :key="cartQuantities[item.id]">{{ cartQuantities[item.id] }}</span>
                </transition>
              </div>
              <button 
                class="quantity-btn increase" 
                @click="increaseQuantity(item)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            </div>
            
            <div v-if="cartQuantities[item.id] > 0" class="in-cart-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              In Cart
            </div>
          </div>
        </div>
      </div>
    </transition-group>

    <!-- Empty state -->
    <div v-if="!loading && displayedItems.length === 0" class="empty-state">
      <div class="empty-icon">🍽️</div>
      <p class="empty-text">No items available in this category</p>
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

        this.bestsellerItems = await getTop3BestsellerItems(this.stallId);
        this.categories = await getCategoriesByStall(this.stallId);

        for (const category of this.categories) {
          this.categoryItems[category] = await getMenuItemsByCategory(this.stallId, category);
        }

        this.displayedItems = this.bestsellerItems;
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    async loadCartQuantities() {
      const allItems = [
        ...this.bestsellerItems,
        ...Object.values(this.categoryItems).flat()
      ];

      for (const item of allItems) {
        const quantity = await getCartItemQuantity(item.id);
        this.cartQuantities[item.id] = quantity;
      }
    },

    async handleAddToCart(item) {
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

    getCategoryIcon(category) {
      const icons = {
        'beverage': '🥤',
        'main': '🍜',
        'sides': '🍟',
        'desserts': '🍰',
        'rice': '🍚',
        'noodles': '🍜',
        'soup': '🍲',
        'snacks': '🍿',
        'add-on': '+'
      };
      return icons[category.toLowerCase()] || '🍴';
    },

    beforeEnter(el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px) scale(0.95)';
    },

    enter(el, done) {
      const delay = el.dataset.index * 50;
      setTimeout(() => {
        el.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0) scale(1)';
        done();
      }, delay);
    },

    async goBack() {
      const stallid = this.$route.params.stallId;
      const stall = await getStallById(stallid); 
      if(stall && stall.hawker_centre_name){
        this.$router.push({
          name: "StallInfo",
          params: { hawkerName: stall.hawker_centre_name },
          query: { stallId: stall.id }
        })
      }
    },
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}


.menu-info-container {
  padding: 1rem;
  font-family: "Poppins", sans-serif;
  color: #333;
  background: linear-gradient(135deg, #fff8f0 0%, #ffe8d1 50%, #ffd9b3 100%);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  padding-top: calc(var(--navbar-height, 70px) + 20px);
  /*padding between header and navbar */
}

/* Enhanced Header */
.header {
  background: linear-gradient(135deg, #ff8c42 0%, #ffa94d 50%, #ffbd6f 100%);
  padding: 1.5rem;
  border-radius: 20px;
  margin-bottom: 1.5rem;
  color: white;
  box-shadow: 0 8px 24px rgba(255, 140, 66, 0.3);
  position: relative;
  overflow: hidden;
}

.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
  pointer-events: none;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 2;
}

.back-btn {
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ff8c42;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.back-btn:hover {
  background: white;
  transform: translateX(-4px) scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.back-btn:active {
  transform: translateX(-4px) scale(0.98);
}

.stall-info {
  flex: 1;
}

.stall-title {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stall-subtitle {
  font-size: 0.9rem;
  opacity: 0.95;
  margin: 0;
  font-weight: 400;
}

.header-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 100%;
  pointer-events: none;
  opacity: 0.15;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: white;
}

.circle-1 {
  width: 120px;
  height: 120px;
  top: -40px;
  right: -20px;
  animation: float 4s ease-in-out infinite;
}

.circle-2 {
  width: 80px;
  height: 80px;
  top: 20px;
  right: 60px;
  animation: float 3s ease-in-out infinite 0.5s;
}

.circle-3 {
  width: 50px;
  height: 50px;
  bottom: -10px;
  right: 40px;
  animation: float 3.5s ease-in-out infinite 1s;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(5deg); }
}

/* Enhanced Tabs */
.tabs-wrapper {
  margin-bottom: 2rem;
  position: relative;
}

.tabs-container {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding: 0.5rem 0.25rem 1rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tabs-container::-webkit-scrollbar {
  display: none;
}

.tab-btn {
  background: white;
  border: 2px solid transparent;
  padding: 0.75rem 1.25rem;
  border-radius: 16px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 12px rgba(255, 140, 66, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  position: relative;
  color: #666;
}

.tab-icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.tab-text {
  font-size: 0.95rem;
}

.tab-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 140, 66, 0.2);
  border-color: #ffe8d1;
}

/*the icon can shift upward abit when hover */
.tab-btn:hover .tab-icon {
  transform: scale(1.2) rotate(10deg);
}

.tab-btn.active {
  background: linear-gradient(135deg, #ff8c42 0%, #ffa94d 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(255, 140, 66, 0.4);
  border-color: transparent;
}

.tab-btn.active .tab-icon {
  animation: bounce 0.6s ease;
}

.active-indicator {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
}

.tab-btn.active .active-indicator {
  animation: pulse 1.5s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.3) rotate(15deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
  50% { opacity: 0.6; transform: translateX(-50%) scale(1.3); }
}

/* Loading the menu part */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 4rem;
  gap: 1.5rem;
}

.loading-animation {
  position: relative;
  width: 80px;
  height: 80px;
}

.loading-bowl {
  width: 60px;
  height: 40px;
  background: linear-gradient(135deg, #ff8c42 0%, #ffa94d 100%);
  border-radius: 0 0 30px 30px;
  position: absolute;
  bottom: 10px;
  left: 10px;
  animation: bowl-shake 1s ease-in-out infinite;
}

.loading-bowl::before {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  height: 10px;
  background: linear-gradient(135deg, #ff8c42 0%, #ffa94d 100%);
  border-radius: 50% 50% 0 0;
}

.loading-steam {
  position: absolute;
  width: 8px;
  height: 30px;
  background: linear-gradient(to top, rgba(255, 140, 66, 0.6), transparent);
  border-radius: 50%;
  opacity: 0;
}

.steam-1 {
  left: 20px;
  animation: steam 2s ease-in-out infinite;
}

.steam-2 {
  left: 36px;
  animation: steam 2s ease-in-out infinite 0.3s;
}

.steam-3 {
  left: 52px;
  animation: steam 2s ease-in-out infinite 0.6s;
}

@keyframes bowl-shake {
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
}

@keyframes steam {
  0% { opacity: 0; transform: translateY(20px) scaleX(1); }
  50% { opacity: 0.6; }
  100% { opacity: 0; transform: translateY(-10px) scaleX(1.5); }
}

.loading-text {
  font-size: 1.1rem;
  color: #ff8c42;
  font-weight: 600;
  animation: fade 1.5s ease-in-out infinite;
}

@keyframes fade {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* Enhanced Menu Grid */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  padding-bottom: 2rem;
}

.menu-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.card-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s ease;
  pointer-events: none;
}

.menu-card:hover .card-shine {
  left: 100%;
}

.menu-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 32px rgba(255, 140, 66, 0.25);
  border-color: #ffe8d1;
}

.menu-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.item-name {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
  color: #333;
  flex: 1;
  line-height: 1.4;
}

.price-badge {
  background: linear-gradient(135deg, #ff8c42 0%, #ffa94d 100%);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  font-weight: 700;
  display: flex;
  align-items: baseline;
  gap: 0.15rem;
  box-shadow: 0 4px 12px rgba(255, 140, 66, 0.3);
  white-space: nowrap;
}

.currency {
  font-size: 0.9rem;
}

.amount {
  font-size: 1.1rem;
}

.card-footer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Add to cart Button  */
.add-btn {
  background: linear-gradient(135deg, #ff8c42 0%, #ffa94d 100%);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 0.875rem 1.5rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 16px rgba(255, 140, 66, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
}

.btn-icon {
  font-size: 1.1rem;
  transition: transform 0.3s ease;
}

.btn-text {
  position: relative;
  z-index: 1;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 140, 66, 0.4);
}

.add-btn:hover .btn-icon {
  transform: scale(1.2) rotate(-10deg);
}

.add-btn:active {
  transform: translateY(0);
}

/* Quantity Button '+' '-' and quantity number */
.quantity-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff7eb;
  border: 2px solid #ffe8d1;
  border-radius: 50px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(255, 140, 66, 0.15);
  transition: all 0.3s ease;
  height: 52px;
}

.quantity-controls:hover {
  border-color: #ffd9b3;
  box-shadow: 0 6px 16px rgba(255, 140, 66, 0.2);
}

.quantity-btn {
  width: 52px;
  height: 52px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #ff8c42;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

.quantity-btn::before {
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff8c42 0%, #ffa94d 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.quantity-btn svg {
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.quantity-btn:hover::before {
  opacity: 1;
}

.quantity-btn:hover svg {
  stroke: white;
}

.quantity-btn:active {
  transform: scale(0.9);
}

.quantity-display {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #ff8c42;
  font-size: 1.3rem;
  min-width: 60px;
}

.quantity-change-enter-active,
.quantity-change-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.quantity-change-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.8);
}

.quantity-change-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.8);
}

/* In Cart Badge */
.in-cart-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  background: #4caf50;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
  animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

.empty-text {
  font-size: 1.1rem;
  color: #999;
  font-weight: 500;
}

/* List Transitions */
.menu-list-move {
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Responsive Design */
@media (max-width: 768px) {
  

  .header {
    padding: 1.25rem;
    border-radius: 16px;
  }

  .stall-title {
    font-size: 1.3rem;
  }

  .stall-subtitle {
    font-size: 0.85rem;
  }

  .back-btn {
    width: 40px;
    height: 40px;
  }

  .menu-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .tabs-container {
    gap: 0.5rem;
  }

  .tab-btn {
    padding: 0.65rem 1rem;
    font-size: 0.9rem;
  }

  .tab-icon {
    font-size: 1.1rem;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .menu-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1025px) {
  .menu-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .menu-info-container {
    max-width: 1400px;
    margin: 0 auto;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  } 
}
</style>