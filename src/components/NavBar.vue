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
              <router-link class="nav-link" to="/orders" active-class="active">
                <i class="icon">📋</i>
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
              <button class="btn-login" @click="handleLogin">
                <span class="login-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 17L15 12L10 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M15 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                <span class="login-text">Login</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>

<script>
import { getCartCount } from "@/services/supabaseService";

export default {
  name: 'NavBar',
  data() {
    return {
      cartCount: 0,
      isScrolled: false,
      cartInterval: null
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
    goToCart() {
      this.$router.push('/cart');
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
    this.updateCartCount(); // Load initial count
    // Optional auto refresh every few seconds (for testing)
    this.cartInterval = setInterval(this.updateCartCount, 1000);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
    clearInterval(this.cartInterval);
  }
}
</script>

<style scoped>
/* === Fixed Navbar Wrapper === */
.navbar-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  transition: all 0.3s ease;
}

/* Add subtle shadow + shrink when scrolled */
.navbar-wrapper.scrolled {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
}

/* Navbar core */
.navbar {
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  padding: 1rem 0;
  transition: all 0.3s ease;
}

/* Brand */
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

/* Links */
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

/* Cart badge */
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

/* Login button */
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

/* Mobile responsive */
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
</style>