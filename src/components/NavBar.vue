<template>
  <header :class="['navbar-wrapper', { 'scrolled': isScrolled }]">
    <nav class="navbar navbar-expand-lg navbar-light">
      <div class="container">
        <router-link class="navbar-brand" to="/">
          <span class="brand-icon">🍜</span>
          <span class="brand-text">EasyEat</span>
        </router-link>
        
        <button 
          class="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbar"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbar">
          <ul class="navbar-nav ms-auto align-items-center">
            <li class="nav-item">
              <router-link class="nav-link" to="/order" active-class="active">
                <div class="orders-icon-wrapper">
                  <i class="icon">📋</i>
                  <span class="orders-badge" v-if="ordersCount > 0">{{ ordersCount }}</span>
                </div>
                <span>Orders</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link cart-link" to="/cart" active-class="active">
                <div class="cart-icon-wrapper">
                  <i class="icon">🛒</i>
                  <span class="cart-badge" v-if="cartCount > 0">{{ cartCount }}</span>
                </div>
                <span>Cart</span>
              </router-link>
            </li>
            <li class="nav-item">
              <!-- show the login button if not login -->
              <button v-if="!user" class="btn-login" @click="handleLogin">
                <span class="login-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 17L15 12L10 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M15 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                <span class="login-text">Login</span>
              </button>

              <!-- when login -->
              <div v-else class="user-menu">
                <button class="btn-user" @click="toggleUserMenu">
                  <span class="user-avatar">👤</span>
                  <span class="username">{{ username }}</span>
                  <span class="dropdown-arrow">▼</span>
                </button>
                
                <!-- dropdown menu with a log out button -->
                <transition name="fade-slide">
                  <div v-if="showUserMenu" class="user-dropdown">
                    <div class="user-info">
                      <div class="user-email">{{ user.email }}</div>
                    </div>
                    <button class="dropdown-item logout-btn" @click="confirmLogout">
                      <span>Logout</span>
                    </button>
                  </div>
                </transition>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Log out message box -->
    <transition name="fade">
      <div v-if="showLogoutConfirm" class="modal-overlay" @click.self="showLogoutConfirm = false">
        <div class="confirm-modal">
          <div class="modal-icon">⚠️</div>
          <h3>Confirm Logout</h3>
          <p>Are you sure you want to logout?</p>
          <div class="modal-actions">
            <button class="btn-cancel" @click="cancelLogout">
              Cancel
            </button>
            <button class="btn-confirm" @click="handleLogout" :disabled="loggingOut">
              <span v-if="!loggingOut">Logout</span>
              <span v-else class="logout-spinner">
                <span class="spinner"></span>
                Logging out...
              </span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Success/Error Alert -->
    <transition name="slide-down">
      <div v-if="alertMessage" class="alert-message" :class="alertType">
        <span class="alert-icon">{{ alertType === 'success' ? '✓' : '✗' }}</span>
        <span>{{ alertMessage }}</span>
        <button @click="alertMessage = ''" class="alert-close">✕</button>
      </div>
    </transition>
  </header>
</template>

<script>
import { supabase, getCartCount, getUserOrders } from "@/services/supabaseService";

export default {
  name: 'NavBar',
  data() {
    return {
      cartCount: 0,
      ordersCount: 0,
      isScrolled: false,
      cartInterval: null,
      ordersInterval: null,
      user: null,
      username: '',
      showUserMenu: false,
      showLogoutConfirm: false,
      loggingOut: false,
      alertMessage: '',
      alertType: 'success'
    }
  },
  methods: {
    handleLogin() {
      this.$router.push('/login')
    },
    
    handleScroll() {
      this.isScrolled = window.scrollY > 20
    },
    
    async updateCartCount() {
      try {
        this.cartCount = await getCartCount(); 
      } catch (error) {
        console.error("Error updating cart count:", error);
      }
    },

    async updateOrdersCount() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          this.ordersCount = 0;
          return;
        }
        
        const orders = await getUserOrders(user.id);
        // Count only current orders (not completed)
        this.ordersCount = orders.filter(o => o.status !== 'completed').length;
      } catch (error) {
        console.error("Error updating orders count:", error);
        this.ordersCount = 0;
      }
    },
    
    goToCart() {
      this.$router.push('/cart');
    },
    
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu
    },
    
    async checkUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          this.user = user
          // Get username from user metadata that is stored during the sign up
          this.username = user.user_metadata?.username || 
                         user.email?.split('@')[0] || 
                         'User'
          console.log('User logged in:', this.username)
          
          // update the order count when user login in successful
          await this.updateOrdersCount();
        } else {
          this.user = null
          this.username = ''
          this.ordersCount = 0
          console.log('No user logged in')
        }
      } catch (error) {
        console.error('Error checking user:', error)
        this.user = null
        this.username = ''
        this.ordersCount = 0
      }
    },
    
    confirmLogout() {
      this.showUserMenu = false
      this.showLogoutConfirm = true
    },
    
    cancelLogout() {
      this.showLogoutConfirm = false
    },
    
    async handleLogout() {
      this.loggingOut = true
      
      try {
        const { error } = await supabase.auth.signOut()
        
        if (error) throw error
        
        // Clear user data
        this.user = null
        this.username = ''
        this.ordersCount = 0
        this.cartCount = 0
        this.showLogoutConfirm = false
        this.showUserMenu = false
        
        //Display the login successful message
        this.showAlert('Logged out successfully!', 'success')
        
        // Redirect to homepage
        setTimeout(() => {
          this.$router.push('/')
        }, 1000)
        
      } catch (error) {
        this.showAlert('Logout failed. Please try again.', 'error')
        console.error('Logout error:', error)
      } finally {
        this.loggingOut = false
      }
    },
    
    showAlert(message, type = 'success') {
      this.alertMessage = message
      this.alertType = type
      setTimeout(() => {
        this.alertMessage = ''
      }, 3000)
    },
    
    handleClickOutside(event) {
      if (this.showUserMenu && !event.target.closest('.user-menu')) {
        this.showUserMenu = false
      }
    }
  },
  
  async mounted() {
    window.addEventListener('scroll', this.handleScroll);
    document.addEventListener('click', this.handleClickOutside);
    
    // Check if user is logged in
    await this.checkUser();
    
    // Update cart count immediately
    await this.updateCartCount();
    
    this.cartInterval = setInterval(this.updateCartCount, 2000);
    
    //when the user login and update every 5 secound
    this.ordersInterval = setInterval(async () => {
      // Check user status first
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        this.user = user;
        await this.updateOrdersCount();
      } else {
        this.user = null;
        this.ordersCount = 0;
      }
    }, 5000);
  },
  
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
    document.removeEventListener('click', this.handleClickOutside);

    // Clear intervals for cart and orders
    if (this.cartInterval) {
      clearInterval(this.cartInterval);
    }
    if (this.ordersInterval) {
      clearInterval(this.ordersInterval);
    }
  }
}
</script>

<style scoped>
.navbar-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  transition: all 0.3s ease;
}

.navbar-wrapper.scrolled {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
}

.navbar {
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  padding: 1rem 0;
  transition: all 0.3s ease;
}

.navbar-brand {
  font-weight: 700;
  font-size: 1.8rem;
  color: #ff6b35 !important;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.3s ease;
}

.navbar-brand:hover {
  transform: scale(1.05);
}

.brand-icon {
  font-size: 2rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.brand-text {
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.navbar-nav {
  gap: 1rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem !important;
  border-radius: 12px;
  font-weight: 500;
  color: #495057 !important;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link .icon {
  font-size: 1.3rem;
  transition: transform 0.3s ease;
}

.nav-link:hover {
  background-color: #fff3e0;
  color: #ff6b35 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 107, 53, 0.2);
}

.nav-link:hover .icon {
  transform: scale(1.2);
}

.nav-link.active {
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  color: white !important;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
}

.nav-link.active .icon {
  filter: brightness(0) invert(1);
}

.cart-link {
  position: relative;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}


.orders-icon-wrapper {
  position: relative;
  display: inline-block;
}

.orders-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background-color: #f44336;
  color: #fff;
  font-size: 10px;
  font-weight: bold;
  padding: 1px 5px;
  border-radius: 50%;
  line-height: 1;
}

.btn-login {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1.75rem;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
  position: relative;
  overflow: hidden;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
}

.btn-login:active {
  transform: translateY(0) scale(0.98);
}

.user-menu {
  position: relative;
}

.btn-user {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
}

.btn-user:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
}

.user-avatar {
  font-size: 20px;
}

.username {
  font-size: 14px;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  font-size: 10px;
  transition: transform 0.3s;
}

.user-menu .btn-user:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  overflow: hidden;
  z-index: 1000;
}

.user-info {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.user-email {
  font-size: 13px;
  color: #666;
  word-break: break-all;
}

.dropdown-item {
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.dropdown-item:hover {
  background: #fff5f0;
}

.logout-btn {
  color: #ef4444;
}

.logout-btn:hover {
  background: #fef2f2;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.confirm-modal {
  background: white;
  border-radius: 20px;
  padding: 32px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  animation: modalPop 0.3s ease;
}

@keyframes modalPop {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.confirm-modal h3 {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
}

.confirm-modal p {
  color: #666;
  margin-bottom: 24px;
  font-size: 15px;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 15px;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-cancel:hover {
  background: #e5e5e5;
}

.btn-confirm {
  background: #ef4444;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-2px);
}

.btn-confirm:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.logout-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.alert-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 16px 50px 16px 20px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 10000;
  min-width: 300px;
  max-width: 90%;
}

.alert-message.success {
  border-left: 4px solid #10b981;
}

.alert-message.error {
  border-left: 4px solid #ef4444;
}

.alert-icon {
  font-size: 20px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.alert-message.success .alert-icon {
  background: #d1fae5;
  color: #10b981;
}

.alert-message.error .alert-icon {
  background: #fee2e2;
  color: #ef4444;
}

.alert-close {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 4px;
}

.alert-close:hover {
  color: #333;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

@media (max-width: 991px) {
  .navbar-nav {
    padding-top: 1rem;
    gap: 0.5rem;
  }
  .btn-login {
    width: 100%;
    justify-content: center;
    margin-top: 0.5rem;
  }
}

@media (max-width: 768px) {
  .username {
    max-width: 80px;
  }
  
  .user-dropdown {
    right: -10px;
  }
}
</style>