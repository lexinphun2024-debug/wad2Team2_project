<template>
  <div class="order-container">
    <NavBar />

    <!-- Loading the order -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading your orders...</p>
    </div>

    <!-- No order placed, empty page -->
    <div v-else-if="Object.keys(groupedOrders).length === 0" class="empty-state">
      <h3>No orders yet</h3>
      <p>Place your first order to see it here!</p>
      <button @click="$router.push('/')" class="cta-btn">Browse Menu</button>
    </div>

    <!-- Order Details -->
    <div v-else class="orders-content">

      <!-- Current Orders Section -->
      <section v-if="currentOrderGroups.length > 0" class="orders-section">
        <div class="section-header">
          <h2>
            <span class="icon">🔥</span>
            Current Orders
            <span class="badge">{{ currentOrderGroups.length }}</span>
          </h2>
        </div>
        
        <transition-group name="fade-list" tag="div" class="orders-grid">
          <div 
            v-for="orderGroup in currentOrderGroups" 
            :key="orderGroup.groupId" 
            class="order-card"
            :class="['status-' + orderGroup.status, { 'pulse': orderGroup.status === 'ready' }]"
          >
            <!-- Status Banner -->
            <div class="status-banner" :class="'banner-' + orderGroup.status">
              <span class="status-text">
                <span class="status-icon">
                  {{ orderGroup.status === 'preparing' ? '👨‍🍳' : '🎉' }}
                </span>
                {{ statusText(orderGroup.status) }}
              </span>
            </div>

            <!-- Order Details -->
            <div class="card-content">
              <div class="order-header">
                <span class="order-id">Order #{{ orderGroup.groupId }}</span>
                <span class="order-time">{{ formatTime(orderGroup.created_at) }}</span>
              </div>

              <!-- Items List grouped by stall -->
              <div v-for="(stallItems, stallName) in orderGroup.itemsByStall" :key="stallName" class="stall-section">
                <div class="stall-name-header">{{ stallName }}</div>
                <ul class="items-list">
                  <li 
                    v-for="item in stallItems" 
                    :key="item.id"
                    class="item-row"
                  >
                    <div class="item-details">
                      <span class="item-name">{{ item.item_name }}</span>
                      <span class="item-quantity">× {{ item.quantity }}</span>
                    </div>
                    <span class="item-price">${{ (item.price * item.quantity).toFixed(2) }}</span>
                  </li>
                </ul>
              </div>

              <!-- Total -->
              <div class="order-total">
                <span>Total</span>
                <span class="total-amount">${{ orderGroup.total.toFixed(2) }}</span>
              </div>

              <!-- Progress Bar -->
              <div v-if="orderGroup.status === 'preparing'" class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: getProgress(orderGroup) + '%' }"></div>
                </div>
                <p class="progress-text">Estimated ready in {{ getEstimatedTime(orderGroup) }}</p>
              </div>

              <!-- Action Button -->
              <button 
                v-if="orderGroup.status === 'ready'" 
                @click="collectOrder(orderGroup)" 
                class="collect-btn"
              >
                <span class="btn-icon">📦</span>
                Collect Food
              </button>
            </div>
          </div>
        </transition-group>
      </section>

      <!-- Order Completed part  -->
      <section v-if="completedOrderGroups.length > 0" class="orders-section completed-section">
        <div class="section-header">
          <h2>
            <span class="icon">✓</span>
            Completed Orders
          </h2>
          <button @click="toggleCompleted" class="toggle-btn">
            {{ showCompleted ? 'Hide' : 'Show' }}
          </button>
        </div>
        
        <transition name="slide">
          <div v-show="showCompleted">
            <transition-group name="fade-list" tag="div" class="orders-grid">
              <div 
                v-for="orderGroup in completedOrderGroups" 
                :key="orderGroup.groupId" 
                class="order-card completed-card"
              >
                <div class="card-content">
                  <div class="order-header">
                    <span class="order-id">Order #{{ orderGroup.groupId }}</span>
                    <span class="order-time">{{ formatTime(orderGroup.created_at) }}</span>
                    <span class="completed-badge">{{ statusText(orderGroup.status) }}</span>
                  </div>

                  <!-- Item list that group by the stall -->
                  <div v-for="(stallItems, stallName) in orderGroup.itemsByStall" :key="stallName" class="stall-section">
                    <div class="stall-name-header">{{ stallName }}</div>
                    <ul class="items-list">
                      <li 
                        v-for="item in stallItems" 
                        :key="item.id"
                        class="item-row"
                      >
                        <div class="item-details">
                          <span class="item-name">{{ item.item_name }}</span>
                          <span class="item-quantity">× {{ item.quantity }}</span>
                        </div>
                        <span class="item-price">${{ (item.price * item.quantity).toFixed(2) }}</span>
                      </li>
                    </ul>
                  </div>

                  <div class="order-total">
                    <span>Total</span>
                    <span class="total-amount">${{ orderGroup.total.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </transition-group>
          </div>
        </transition>
      </section>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue';
import { supabase, getUserOrders, updateOrderStatus } from "@/services/supabaseService";

export default {
  name: 'Order',
  components: { NavBar },
  data() {
    return {
      orders: [],
      loading: true,
      userId: null,
      showCompleted: false,
      intervalId: null,
    };
  },
  computed: {
    // Group orders by the time
    groupedOrders() {
        const groups = {};

        this.orders.forEach(order => {
        const groupKey = order.group_id;
        //each purchase order will have different group_id
        //go through each order item

        // create group for each individual order palced
        if (!groups[groupKey]) {
            groups[groupKey] = {
                groupId: order.group_id,
                created_at: order.created_at,
                status: order.status,
                items: [],
                itemsByStall: {},
                total: 0,
            };
        }

        // add item into a group
        groups[groupKey].items.push(order);

        // group by the stall name within in that that order id part
        const stallName = order.stall_name || 'Unknown Stall';
        if (!groups[groupKey].itemsByStall[stallName]) {
            groups[groupKey].itemsByStall[stallName] = [];
        }
        groups[groupKey].itemsByStall[stallName].push(order);
        //add the food item order by the stallname then by the group_id

        // add the total for that group of order
        groups[groupKey].total += order.price * order.quantity;
        });

        return groups;
    },
    
    currentOrderGroups() {
      //filter only active order(not completed order yet)
      return Object.values(this.groupedOrders)
        .filter(g => g.status !== 'completed')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
    
    completedOrderGroups() {
      //completed order
      return Object.values(this.groupedOrders)
        .filter(g => g.status === 'completed')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  },
  async mounted() {
    await this.loadOrders();
    //set the order at 5 sec
    this.intervalId = setInterval(this.updateStatuses, 5000);
  },
  beforeUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  },
  methods: {
    //load the order that belong to the users
    async loadOrders() {
      this.loading = true;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          this.$router.push('/login');
          return;
        }
        this.userId = user.id;
        this.orders = await getUserOrders(user.id);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        this.loading = false;
      }
    },

    statusText(status) {
      switch(status) {
        case 'preparing': return 'Preparing your meals...';
        case 'ready': return 'Ready to collect!';
        case 'completed': return 'Completed';
        default: return status;
      }
    },

    async updateStatuses() {
      const now = new Date();
      let updated = false;

      for (const order of this.orders) {
        if (order.status === 'preparing') {
          // Simulate preparation time around 10 sec
          const orderTime = new Date(order.created_at);
          if ((now - orderTime) / 1000 > 10) { 
            await updateOrderStatus(order.id, 'ready');
            order.status = 'ready';
            updated = true;
          }
        }
      }

      // Reload the orders when status update
      if (updated) {
        await this.loadOrders();
      }
    },

    async collectOrder(orderGroup) {
      try {
        // Update all items in the order group to completed
        const updatePromises = orderGroup.items.map(item => 
          updateOrderStatus(item.id, 'completed')
        );
        
        await Promise.all(updatePromises);
        
        // Update local state
        orderGroup.items.forEach(item => {
          const orderIndex = this.orders.findIndex(o => o.id === item.id);
          if (orderIndex !== -1) {
            this.orders[orderIndex].status = 'completed';
          }
        });
      } catch (error) {
        console.error('Error collecting order:', error);
        alert('Failed to update order status');
      }
    },

    //the created_order time
    formatTime(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / 60000);
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return date.toLocaleDateString();
    },

    //the preparation food period

    getProgress(orderGroup) {
      const created = new Date(orderGroup.created_at);
      const now = new Date();
      const elapsed = (now - created) / 1000; // seconds
      const total = 10; // 10 seconds for demo
      return Math.min((elapsed / total) * 100, 100);
    },


    // the update of food item to be ready
    getEstimatedTime(orderGroup) {
      const created = new Date(orderGroup.created_at);
      const now = new Date();
      const elapsed = (now - created) / 1000;
      const remaining = Math.max(10 - elapsed, 0);
      
      if (remaining < 60) return `${Math.ceil(remaining)}s`;
      return `${Math.ceil(remaining / 60)}m`;
    },

    //to see the completed order
    toggleCompleted() {
      this.showCompleted = !this.showCompleted;
    }
  }
};
</script>

<style scoped>
.order-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  padding: calc(var(--navbar-height, 90px) + 20px) 20px 20px;
}

/* Loading part */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: white;
  gap: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty order page part */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: white;
  text-align: center;
  gap: 15px;
}

.empty-state h3 {
  font-size: 28px;
  margin: 0;
}

.empty-state p {
  font-size: 16px;
  opacity: 0.9;
}

.cta-btn {
  padding: 12px 30px;
  background: white;
  color: #ff6b35;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

/* Orders Content */
.orders-content {
  max-width: 1200px;
  margin: 0 auto;
}

.orders-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 10px;
}

.section-header h2 {
  color: white;
  font-size: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.icon {
  font-size: 28px;
}

.badge {
  background: rgba(255, 255, 255, 0.3);
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 14px;
  font-weight: 600;
}

.toggle-btn {
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* order grid */
.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

/* order card */
.order-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s, box-shadow 0.3s;
}

.order-card:hover {
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

/* status icon */
.status-banner {
  padding: 12px;
  text-align: center;
  font-weight: 600;
  color: white;
}

.banner-preparing {
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
}

.banner-ready {
  background: linear-gradient(135deg, #ffb347 0%, #ffcc33 100%);
  animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 5px rgba(255, 179, 71, 0.5); }
  50% { box-shadow: 0 0 20px rgba(255, 179, 71, 0.8); }
}

.status-icon {
  font-size: 18px;
  margin-right: 5px;
}

/* Card Content */
.card-content {
  padding: 20px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.order-id {
  font-weight: 700;
  color: #ff6b35;
  font-size: 16px;
}

.order-time {
  color: #999;
  font-size: 14px;
}

.completed-badge {
  background: #ff8c42;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

/* stall name */
.stall-section {
  margin: 15px 0;
}

.stall-name-header {
  font-weight: 600;
  color: #ff6b35;
  font-size: 14px;
  margin-bottom: 8px;
  padding-bottom: 5px;
  border-bottom: 2px solid #eee;
}

/* food item list detail */
.items-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed #eee;
}

.item-row:last-child {
  border-bottom: none;
}

.item-details {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.item-name {
  font-weight: 500;
  color: #333;
}

.item-quantity {
  color: #999;
  font-size: 14px;
}

.item-price {
  font-weight: 600;
  color: #ff6b35;
}

/* total order amount part */
.order-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 2px solid #eee;
  font-size: 18px;
  font-weight: 700;
}

.total-amount {
  color: #ff6b35;
}

/* progress of order status part */
.progress-container {
  margin-top: 20px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #eee;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b35 0%, #ff8c42 100%);
  border-radius: 10px;
  transition: width 1s linear;
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}

.progress-text {
  text-align: center;
  color: #999;
  font-size: 14px;
  margin-top: 8px;
}

/* collect food order button */
.collect-btn {
  width: 100%;
  padding: 14px;
  margin-top: 15px;
  background: linear-gradient(135deg, #ffb347 0%, #ffcc33 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.collect-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 5px 15px rgba(255, 179, 71, 0.4);
}

.collect-btn:active {
  transform: scale(0.98);
}

.btn-icon {
  font-size: 20px;
}

/* Pulse Animation for Ready Orders */
.pulse {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

/* Completed Card */
.completed-card {
  opacity: 1;
  box-shadow: none;
  transform: none;
  transition: none;
  cursor: default;
  
}

.completed-card:hover {
  opacity: 1;
  box-shadow: none;
  transform: none;
  filter: none;
}

/* Transitions */
.fade-list-enter-active,
.fade-list-leave-active {
  transition: all 0.5s ease;
}

.fade-list-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.fade-list-leave-to {
  opacity: 0;
  transform: translateX(-30px) scale(0.95);
}

.fade-list-move {
  transition: transform 0.5s ease;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s ease;
  max-height: 2000px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .orders-grid {
    grid-template-columns: 1fr;
  }

  .section-header h2 {
    font-size: 20px;
  }

  .order-card {
    margin: 0;
  }
}

@media (max-width: 480px) {
  .order-container {
    padding: 15px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .toggle-btn {
    align-self: stretch;
  }

  .empty-icon {
    font-size: 60px;
  }

  .empty-state h3 {
    font-size: 22px;
  }
}
</style>
