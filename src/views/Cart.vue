<template>
  <div class="cart-container">
    <NavBar />
    
    <!-- Toast Notifications -->
    <div class="toast-container">
      <transition-group name="toast">
        <div 
          v-for="toast in toasts" 
          :key="toast.id" 
          :class="['toast', `toast-${toast.type}`]"
        >
          <span class="toast-icon">{{ toast.icon }}</span>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" @click="removeToast(toast.id)">×</button>
        </div>
      </transition-group>
    </div>

    <!-- Confirmation Modal -->
    <transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <span class="modal-icon">{{ modalData.icon }}</span>
            <h3>{{ modalData.title }}</h3>
          </div>
          <p class="modal-message">{{ modalData.message }}</p>
          <div class="modal-actions">
            <button class="modal-btn cancel-btn" @click="closeModal">Cancel</button>
            <button class="modal-btn confirm-btn" @click="confirmAction">{{ modalData.confirmText }}</button>
          </div>
        </div>
      </div>
    </transition>
    
    <div class="cart-content">
      <div class="cart-header">
        <h2>
          <span class="cart-icon">🛒</span>
          Your Cart
          <span v-if="cartItems.length > 0" class="item-count">({{ totalItems }} items)</span>
        </h2>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading your cart...</p>
      </div>

      <!-- Empty Cart State -->
      <div v-else-if="cartItems.length === 0" class="empty-cart">
        <div class="empty-illustration">
          <div class="empty-icon">🛒</div>
          <div class="empty-text">
            <h3>Your cart is empty</h3>
            <p>Add some delicious items to get started!</p>
          </div>
        </div>
        <button class="browse-btn" @click="$router.push('/')">
          <span>Browse Menu</span>
          <span class="arrow">→</span>
        </button>
      </div>

      <!-- Cart Items -->
      <div v-else class="cart-items">
        <!-- Group items by stall -->
        <div v-for="(items, stallName) in groupedByStall" :key="stallName" class="stall-group">
          <div class="stall-header">
            <h3 class="stall-name">
              {{ stallName }}
            </h3>
            <span class="stall-item-count">{{ items.length }} item{{ items.length !== 1 ? 's' : '' }}</span>
          </div>
          
          <div class="items-list">
            <div v-for="item in items" :key="item.id" class="cart-item" :class="{ 'removing': removingItems.has(item.id) }">
              <div class="item-main">
                <div class="item-info">
                  <h4>{{ item.item_name }}</h4>
                  <p class="item-price">${{ item.price.toFixed(2) }} each</p>
                </div>
                
                <div class="item-actions">
                  <div class="quantity-controls">
                    <button 
                      class="quantity-btn decrease" 
                      @click="decreaseQuantity(item)"
                      :disabled="item.quantity <= 1"
                    >
                      <span>−</span>
                    </button>
                    <div class="quantity-display">
                      <span class="quantity-number">{{ item.quantity }}</span>
                    </div>
                    <button 
                      class="quantity-btn increase" 
                      @click="increaseQuantity(item)"
                    >
                      <span>+</span>
                    </button>
                  </div>
                  
                  <div class="item-total">
                    <span class="total-label">Total</span>
                    <span class="total-amount">${{ (item.price * item.quantity).toFixed(2) }}</span>
                  </div>
                  
                  <button 
                    class="delete-btn" 
                    @click="deleteItem(item)"
                    :disabled="removingItems.has(item.id)"
                    title="Remove item"
                  >
                    <span class="delete-icon">🗑️</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Stall Subtotal -->
          <div class="stall-subtotal">
            <span>{{ stallName }} Subtotal</span>
            <span class="subtotal-amount">${{ calculateStallTotal(items).toFixed(2) }}</span>
          </div>
        </div>

        <!-- Cart Summary -->
        <div class="cart-summary">
          <div class="summary-card">
            <h3>Order Summary</h3>
            
            <div class="summary-row subtotal-row">
              <span>Subtotal ({{ totalItems }} items)</span>
              <span class="subtotal-value">${{ grandTotal.toFixed(2) }}</span>
            </div>
            
            <div class="summary-divider"></div>
            
            <div class="total-row">
              <span class="total-label">Total</span>
              <span class="total-amount">${{ grandTotal.toFixed(2) }}</span>
            </div>
          </div>
          
          <div class="action-buttons">
            <button class="clear-btn" @click="handleClearCart">
              <span class="btn-icon">🗑️</span>
              <span>Clear Cart</span>
            </button>
            <button class="pay-btn" @click="handlePay">
              <span class="btn-icon">💳</span>
              <span>Proceed to Pay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue';
import { getAllCartItems, updateCartItemQuantity, removeFromCart, clearCart } from "@/services/supabaseService";

export default {
  name: 'Cart',
  components: {
    NavBar
  },
  data() {
    return {
      cartItems: [],
      loading: true,
      removingItems: new Set(),
      toasts: [],
      toastId: 0,
      showModal: false,
      modalData: {},
      pendingAction: null
    };
  },
  computed: {
    groupedByStall() {
      const grouped = {};
      this.cartItems.forEach(item => {
        if (!grouped[item.stall_name]) {
          grouped[item.stall_name] = [];
        }
        grouped[item.stall_name].push(item);
      });
      return grouped;
    },
    grandTotal() {
      return this.cartItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
    },
    totalItems() {
      return this.cartItems.reduce((total, item) => total + item.quantity, 0);
    }
  },
  async mounted() {
    await this.loadCart();
  },
  methods: {

    // Toast notification system
    showToast(message, type = 'info') {
      const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
      };
      
      const toast = {
        id: ++this.toastId,
        message,
        type,
        icon: icons[type]
      };
      
      this.toasts.push(toast);
      
      setTimeout(() => {
        this.removeToast(toast.id);
      }, 1000);
    },
    
    removeToast(id) {
      const index = this.toasts.findIndex(t => t.id === id);
      if (index > -1) {
        this.toasts.splice(index, 1);
      }
    },
    
    // Modal system
    showConfirmModal(title, message, confirmText, action, icon = '❓') {
      this.modalData = { title, message, confirmText, icon };
      this.pendingAction = action;
      this.showModal = true;
    },
    
    closeModal() {
      this.showModal = false;
      this.pendingAction = null;
    },
    
    async confirmAction() {
      if (this.pendingAction) {
        await this.pendingAction();
      }
      this.closeModal();
    },
    
    //load the cart item
    async loadCart() {
      this.loading = true;
      try {
        this.cartItems = await getAllCartItems();
      } catch (error) {
        console.error('Error loading cart:', error);
        this.showToast('Failed to load cart. Please refresh the page.', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    async increaseQuantity(item) {
      try {
        const newQuantity = item.quantity + 1;
        await updateCartItemQuantity(item.item_id, newQuantity);
        item.quantity = newQuantity;
        this.showToast('Quantity updated', 'success');
      } catch (error) {
        console.error('Failed to update quantity:', error);
        this.showToast('Failed to update quantity', 'error');
      }
    },
    
    async decreaseQuantity(item) {
      if (item.quantity <= 1) {
        this.showConfirmModal(
          'Remove Item',
          `Remove "${item.item_name}" from cart?`,
          'Remove',
          () => this.performDelete(item),
          '🗑️'
        );
        return;
      }
      
      try {
        const newQuantity = item.quantity - 1;
        await updateCartItemQuantity(item.item_id, newQuantity);
        item.quantity = newQuantity;
        this.showToast('Quantity updated', 'success');
      } catch (error) {
        console.error('Failed to update quantity:', error);
        this.showToast('Failed to update quantity', 'error');
      }
    },
    
    deleteItem(item) {
      this.showConfirmModal(
        'Remove Item',
        `Remove "${item.item_name}" from cart?`,
        'Remove',
        () => this.performDelete(item),
        '🗑️'
      );
    },
    
    async performDelete(item) {
      this.removingItems.add(item.id);
      
      try {
        await removeFromCart(item.item_id);
        
        setTimeout(() => {
          this.cartItems = this.cartItems.filter(i => i.id !== item.id);
          this.removingItems.delete(item.id);
          this.showToast('Item removed from cart', 'success');
        }, 300);
      } catch (error) {
        console.error('Failed to delete item:', error);
        this.showToast('Failed to remove item', 'error');
        this.removingItems.delete(item.id);
      }
    },
    
    calculateStallTotal(items) {
      return items.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
    },
    
    handleClearCart() {
      this.showConfirmModal(
        'Clear Cart',
        'Are you sure you want to clear the entire cart? This action cannot be undone.',
        'Clear All',
        this.performClearCart,
        '🗑️'
      );
    },
    
    async performClearCart() {
      try {
        await clearCart();
        this.cartItems = [];
        this.showToast('Cart cleared successfully', 'success');
      } catch (error) {
        console.error('Failed to clear cart:', error);
        this.showToast('Failed to clear cart', 'error');
      }
    },
    
    handlePay() {
      if (this.cartItems.length === 0) {
        this.showToast('Cart is empty', 'warning');
        return;
      }
      
      this.showConfirmModal(
        'Confirm Payment',
        `Proceed with payment of $${this.grandTotal.toFixed(2)}?`,
        'Pay Now',
        this.performPayment,
        '💳'
      );
    },
    
    async performPayment() {
      try {
        await clearCart();
        this.cartItems = [];
        this.showToast(`Payment of $${this.grandTotal.toFixed(2)} successful! Thank you for your order.`, 'success');
        
        setTimeout(() => {
          this.$router.push('/');
        }, 2000);
      } catch (error) {
        console.error('Payment failed:', error);
        this.showToast('Payment processing failed. Please try again.', 'error');
      }
    }
  }
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.cart-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef3 100%);
}

.cart-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

/* Toast Notifications */
.toast-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  min-width: 300px;
  max-width: 400px;
  border-left: 4px solid;
}

.toast-success {
  border-left-color: #4CAF50;
}

.toast-error {
  border-left-color: #f44336;
}

.toast-warning {
  border-left-color: #ff9800;
}

.toast-info {
  border-left-color: #2196F3;
}

.toast-icon {
  font-size: 20px;
  font-weight: bold;
}

.toast-success .toast-icon {
  color: #4CAF50;
}

.toast-error .toast-icon {
  color: #f44336;
}

.toast-warning .toast-icon {
  color: #ff9800;
}

.toast-info .toast-icon {
  color: #2196F3;
}

.toast-message {
  flex: 1;
  color: #333;
  font-size: 14px;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.toast-close:hover {
  color: #333;
}

/* Toast Animations */
.toast-enter-active {
  animation: slideIn 0.3s ease-out;
}

.toast-leave-active {
  animation: slideOut 0.3s ease-in;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 450px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.modal-icon {
  font-size: 32px;
}

.modal-header h3 {
  margin: 0;
  font-size: 24px;
  color: #1a1a1a;
}

.modal-message {
  color: #666;
  font-size: 16px;
  line-height: 1.5;
  margin: 0 0 24px 0;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.modal-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.confirm-btn {
  background: #4CAF50;
  color: white;
}

.confirm-btn:hover {
  background: #45a049;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
}

/* Modal Animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content {
  transform: scale(0.9);
}

.modal-leave-to .modal-content {
  transform: scale(0.9);
}

/* Header */
.cart-header {
  margin-bottom: 30px;
}

.cart-header h2 {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #1a1a1a;
  font-size: 32px;
  font-weight: 700;
  margin: 0;
}

.cart-icon {
  font-size: 36px;
}

.item-count {
  font-size: 18px;
  color: #666;
  font-weight: 400;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.07);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  margin-top: 20px;
  color: #666;
  font-size: 16px;
}

/* Empty Cart */
.empty-cart {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.07);
}

.empty-illustration {
  margin-bottom: 30px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-text h3 {
  font-size: 24px;
  color: #333;
  margin: 0 0 10px 0;
}

.empty-text p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.browse-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.browse-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

.browse-btn .arrow {
  transition: transform 0.3s ease;
}

.browse-btn:hover .arrow {
  transform: translateX(4px);
}

/* Cart Items */
.cart-items {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.stall-group {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.07);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stall-group:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 12px rgba(0,0,0,0.1);
}

.stall-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
}

.stall-name {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.stall-icon {
  font-size: 24px;
}

.stall-item-count {
  font-size: 14px;
  opacity: 0.9;
}

.items-list {
  padding: 16px;
}

.cart-item {
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 12px;
  background: #f9fafb;
  transition: all 0.3s ease;
}

.cart-item:last-child {
  margin-bottom: 0;
}

.cart-item:hover {
  background: #f3f4f6;
  transform: scale(1.01);
}

.cart-item.removing {
  opacity: 0;
  transform: translateX(-100%);
}

.item-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-info h4 {
  margin: 0 0 6px 0;
  color: #1a1a1a;
  font-size: 18px;
  font-weight: 600;
}

.item-price {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.quantity-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #4CAF50;
  font-weight: 600;
}

.quantity-btn:hover:not(:disabled) {
  background: #4CAF50;
  color: white;
  transform: scale(1.1);
}

.quantity-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.quantity-display {
  min-width: 40px;
  text-align: center;
  padding: 0 8px;
}

.quantity-number {
  font-weight: 700;
  font-size: 18px;
  color: #1a1a1a;
}

.item-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 90px;
}

.total-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.total-amount {
  font-weight: 700;
  font-size: 18px;
  color: #4CAF50;
}

.delete-btn {
  width: 44px;
  height: 44px;
  border: 2px solid #fee;
  background: #fff5f5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover:not(:disabled) {
  background: #ff4444;
  border-color: #ff4444;
  transform: scale(1.1);
}

.delete-btn:hover:not(:disabled) .delete-icon {
  filter: grayscale(1) brightness(2);
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delete-icon {
  font-size: 20px;
}

.stall-subtotal {
  display: flex;
  justify-content: space-between;
  padding: 20px 24px;
  background: #f0f9f1;
  font-weight: 600;
  font-size: 16px;
  color: #2d5a2f;
}

.subtotal-amount {
  color: #4CAF50;
  font-size: 18px;
}

/* Cart Summary */
.cart-summary {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.07);
  overflow: hidden;
}

.summary-card {
  padding: 24px;
}

.summary-card h3 {
  margin: 0 0 20px 0;
  color: #1a1a1a;
  font-size: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  color: #666;
  font-size: 16px;
}

.subtotal-row {
  font-weight: 500;
}

.subtotal-value {
  color: #333;
  font-weight: 600;
}

.summary-divider {
  height: 2px;
  background: linear-gradient(to right, transparent, #e0e0e0, transparent);
  margin: 16px 0;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0 0 0;
}

.total-label {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
}

.total-amount {
  font-size: 28px;
  font-weight: 700;
  color: #4CAF50;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 12px;
  padding: 0 24px 24px 24px;
}

.clear-btn,
.pay-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-icon {
  font-size: 20px;
}

.clear-btn {
  background: #fff5f5;
  color: #d32f2f;
  border: 2px solid #ffebee;
}

.clear-btn:hover {
  background: #d32f2f;
  color: white;
  border-color: #d32f2f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
}

.pay-btn {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.pay-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

/* Responsive Design */
@media (max-width: 768px) {
  .cart-content {
    padding: 16px;
  }

  .cart-header h2 {
    font-size: 24px;
  }

  .cart-icon {
    font-size: 28px;
  }

  .item-count {
    font-size: 14px;
  }

  .item-main {
    flex-direction: column;
    align-items: flex-start;
  }

  .item-actions {
    width: 100%;
    justify-content: space-between;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }

  .quantity-btn {
    width: 32px;
    height: 32px;
  }

  .item-total {
    min-width: 70px;
  }

  .total-label {
    font-size: 10px;
  }

  .total-amount {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .stall-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .stall-item-count {
    font-size: 12px;
  }

  .item-actions {
    flex-wrap: wrap;
  }

  .delete-btn {
    width: 40px;
    height: 40px;
  }
}
</style>