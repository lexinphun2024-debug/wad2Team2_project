<template>
  <div class="auth-container">
    <!-- Floating Shapes Background -->
    <div class="background-shapes">
      <div v-for="i in 15" :key="i" class="shape" :style="getShapeStyle(i)"></div>
    </div>

    <div class="auth-card">
      <!-- Header -->
      <div class="card-header">
        <div class="logo-circle">
          <span>{{ isLogin ? '👋' : '🎉' }}</span>
        </div>
        <h2 class="title">{{ isLogin ? 'Welcome Back' : 'Join Us Today' }}</h2>
        <p class="subtitle">
          {{ isLogin ? 'Login to continue' : 'Create your account' }}
        </p>
      </div>

      <!-- Mode Toggle -->
      <div class="toggle-container">
        <div class="toggle-wrapper">
          <div class="toggle-slider" :class="{ 'signup-active': !isLogin }"></div>
          <button 
            type="button"
            @click="switchMode(true)" 
            class="toggle-btn"
            :class="{ active: isLogin }"
          >
            Login
          </button>
          <button 
            type="button"
            @click="switchMode(false)" 
            class="toggle-btn"
            :class="{ active: !isLogin }"
          >
            Sign Up
          </button>
        </div>
      </div>

      <!-- Form -->
      <div class="form-container">
        <!-- Email -->
        <div class="input-group">
          <label class="input-label">📧 Email</label>
          <input
            v-model="email"
            type="email"
            class="form-input"
            :class="{ filled: email, error: emailError }"
            placeholder="your@email.com"
            @focus="emailError = false"
            @blur="validateEmail"
          />
          <transition name="shake">
            <span v-if="emailError" class="error-text">Please enter a valid email</span>
          </transition>
        </div>

        <!-- Username (Sign Up only) -->
        <transition name="slide">
          <div v-if="!isLogin" class="input-group">
            <label class="input-label">👤 Username</label>
            <input
              v-model="username"
              type="text"
              class="form-input"
              :class="{ filled: username }"
              placeholder="Choose a username"
            />
          </div>
        </transition>

        <!-- Password -->
        <div class="input-group">
          <label class="input-label">🔒 Password</label>
          <div class="password-wrapper">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              :class="{ filled: password }"
              placeholder="Enter your password"
            />
            <button 
              type="button"
              @click="showPassword = !showPassword" 
              class="password-toggle"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <div v-if="password && !isLogin" class="password-strength">
            <div class="strength-bar">
              <div 
                class="strength-fill" 
                :class="passwordStrength"
                :style="{ width: getPasswordWidth() }"
              ></div>
            </div>
            <span class="strength-text">{{ getPasswordText() }}</span>
          </div>
        </div>

        <!-- Confirm Password (Sign Up only) -->
        <transition name="slide">
          <div v-if="!isLogin" class="input-group">
            <label class="input-label">🔐 Confirm Password</label>
            <input
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              :class="{ 
                filled: confirmPassword,
                match: confirmPassword && confirmPassword === password,
                nomatch: confirmPassword && confirmPassword !== password
              }"
              placeholder="Confirm your password"
            />
            <span v-if="confirmPassword && confirmPassword === password" class="match-text">✓ Passwords match!</span>
            <span v-if="confirmPassword && confirmPassword !== password" class="nomatch-text">✗ Passwords don't match</span>
          </div>
        </transition>

        <!-- Forgot Password -->
        <div v-if="isLogin" class="forgot-password">
          <a href="#" @click.prevent="handleForgotPassword">Forgot Password?</a>
        </div>

        <!-- Submit Button -->
        <button 
          @click="handleSubmit" 
          class="submit-btn"
          :class="{ loading: loading, pulse: !loading }"
          :disabled="loading || isFormInvalid"
        >
          <span v-if="!loading" class="btn-content">
            <span class="btn-icon">{{ isLogin ? '🚀' : '✨' }}</span>
            <span>{{ isLogin ? 'Login' : 'Create Account' }}</span>
          </span>
          <span v-else class="loading-content">
            <span class="spinner"></span>
            <span>{{ isLogin ? 'Logging in...' : 'Creating...' }}</span>
          </span>
        </button>

      </div>

      <!-- Success Overlay -->
      <transition name="fade-scale">
        <div v-if="showSuccess" class="success-overlay">
          <div class="success-content">
            <div class="success-icon">✓</div>
            <h3>{{ successMessage }}</h3>
            <p>Redirecting to homepage...</p>
            <div class="success-loader"></div>
          </div>
        </div>
      </transition>
    </div>

    <transition name="slide-down">
      <div v-if="alertMessage" class="alert-message" :class="alertType">
        <span class="alert-icon">{{ alertType === 'error' ? '❌' : alertType === 'warning' ? '⚠️' : '✓' }}</span>
        <span>{{ alertMessage }}</span>
        <button @click="alertMessage = ''" class="alert-close">✕</button>
      </div>
    </transition>

    <!-- Terms -->
    <p class="terms">
      By continuing, you agree to our 
      <a href="#">Terms</a> & <a href="#">Privacy</a>
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { supabase } from "@/services/supabaseService"
import { useRouter } from "vue-router"

const router = useRouter()

// State
const isLogin = ref(true)
const email = ref('')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)
const emailError = ref(false)
const showSuccess = ref(false)
const successMessage = ref('')
const alertMessage = ref('')
const alertType = ref('error')

const showAlert = (message, type = 'error') => {
  alertMessage.value = message
  alertType.value = type
  setTimeout(() => {
    alertMessage.value = ''
  }, 4000)
}

// Computed
const passwordStrength = computed(() => {
  const len = password.value.length
  if (len < 6) return 'weak'
  if (len < 10) return 'medium'
  return 'strong'
})

const isFormInvalid = computed(() => {
  if (!email.value || !password.value) return true
  if (!isLogin.value) {
    if (!username.value) return true
    if (password.value !== confirmPassword.value) return true
  }
  return false
})

// Methods
const getShapeStyle = (i) => {
  const shapes = ['circle', 'square', 'triangle']
  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${5 + Math.random() * 10}s`,
    width: `${20 + Math.random() * 60}px`,
    height: `${20 + Math.random() * 60}px`,
    borderRadius: shapes[i % 3] === 'circle' ? '50%' : shapes[i % 3] === 'square' ? '10px' : '0'
  }
}

const getPasswordWidth = () => {
  const len = password.value.length
  if (len < 6) return '33%'
  if (len < 10) return '66%'
  return '100%'
}

const getPasswordText = () => {
  const len = password.value.length
  if (len < 6) return 'Weak'
  if (len < 10) return 'Good'
  return 'Strong'
}

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (email.value && !emailRegex.test(email.value)) {
    emailError.value = true
  }
}

const switchMode = (login) => {
  isLogin.value = login
  email.value = ''
  username.value = ''
  password.value = ''
  confirmPassword.value = ''
  emailError.value = false
}

const handleSubmit = async () => {
  if (isFormInvalid.value) return

  loading.value = true

  try {
    if (isLogin.value) {
      // LOGIN
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })

      if (error) throw error

      // Get username from user metadata
      const displayUsername = data.user.user_metadata?.username || data.user.email.split('@')[0]

      successMessage.value = `Welcome back, ${displayUsername}! 🎉`
      showSuccess.value = true

      setTimeout(() => {
        router.push('/')
      }, 1500)

    } else {
      // SIGN UP
      const { data, error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          data: {
            username: username.value,
          }
        }
      })

      if (error) throw error

      successMessage.value = `Welcome, ${username.value}! 🎊`
      showSuccess.value = true

      setTimeout(() => {
        router.push('/')
      }, 1500)
    }
  } catch (error) {
    showAlert(error.message, 'error')
  } finally {
    loading.value = false
  }
}

const handleForgotPassword = async () => {
  if (!email.value) {
    showAlert('Please enter your email address first', 'warning')
    return
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.value)
    if (error) throw error
    showAlert('Password reset email sent! Check your inbox.', 'success')
  } catch (error) {
    showAlert(error.message, 'error')
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.auth-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.background-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.shape {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  animation: float 8s infinite ease-in-out;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
    opacity: 0.6;
  }
}

.auth-card {
  background: white;
  border-radius: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 440px;
  position: relative;
  z-index: 10;
  animation: slideUp 0.6s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-header {
  padding: 40px 32px 20px;
  text-align: center;
}

.logo-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  margin: 0 auto 20px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #ff6b35;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  font-size: 14px;
}

.toggle-container {
  padding: 0 32px 24px;
}

.toggle-wrapper {
  display: flex;
  background: #f5f5f5;
  border-radius: 50px;
  padding: 4px;
  position: relative;
}

.toggle-slider {
  position: absolute;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  border-radius: 50px;
  top: 4px;
  left: 4px;
  transition: left 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.5);
}

.toggle-slider.signup-active {
  left: calc(50%);
}

.toggle-btn {
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  font-weight: 600;
  font-size: 15px;
  color: #999;
  cursor: pointer;
  position: relative;
  z-index: 1;
  transition: all 0.3s;
  border-radius: 50px;
}

.toggle-btn:hover {
  color: #ff6b35;
}

.toggle-btn.active {
  color: white;
}

.form-container {
  padding: 0 32px 32px;
}

.input-group {
  margin-bottom: 20px;
  position: relative;
}

.input-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e5e5e5;
  border-radius: 14px;
  font-size: 15px;
  transition: all 0.3s;
  outline: none;
}

.form-input:focus {
  border-color: #ff6b35;
  box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.1);
  transform: translateY(-2px);
}

.form-input.filled {
  border-color: #ff6b35;
  background: #fff9f5;
}

.form-input.error {
  border-color: #ef4444;
  animation: shake 0.5s;
}

.form-input.match {
  border-color: #10b981;
  background: #f0fdf4;
}

.form-input.nomatch {
  border-color: #ef4444;
  background: #fef2f2;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.error-text, .nomatch-text {
  display: block;
  color: #ef4444;
  font-size: 12px;
  margin-top: 6px;
  font-weight: 500;
}

.match-text {
  display: block;
  color: #10b981;
  font-size: 12px;
  margin-top: 6px;
  font-weight: 500;
}

.password-wrapper {
  position: relative;
  display: block;
  width: 100%;
}

.password-toggle {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.3s;
}

.password-toggle:hover {
  transform: translateY(-50%) scale(1.2);
}

.password-strength {
  margin-top: 8px;
}

.strength-bar {
  height: 4px;
  background: #e5e5e5;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s;
}

.strength-fill.weak {
  background: #ef4444;
}

.strength-fill.medium {
  background: #f59e0b;
}

.strength-fill.strong {
  background: #10b981;
}

.strength-text {
  display: block;
  font-size: 12px;
  margin-top: 4px;
  font-weight: 600;
}

.forgot-password {
  text-align: right;
  margin-bottom: 20px;
}

.forgot-password a {
  color: #ff6b35;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}

.forgot-password a:hover {
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
  margin-bottom: 24px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 107, 53, 0.5);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-btn.pulse:not(:disabled) {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
  }
  50% {
    box-shadow: 0 4px 20px rgba(255, 107, 53, 0.6);
  }
}

.btn-content, .loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-icon {
  font-size: 20px;
  animation: wiggle 1s infinite;
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.success-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.98);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 30px;
  z-index: 100;
}

.success-content {
  text-align: center;
  padding: 40px;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  margin: 0 auto 20px;
  animation: successPop 0.6s ease;
}

@keyframes successPop {
  0% {
    transform: scale(0) rotate(-180deg);
  }
  50% {
    transform: scale(1.2) rotate(0deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

.success-content h3 {
  color: #ff6b35;
  font-size: 24px;
  margin-bottom: 8px;
}

.success-content p {
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
}

.success-loader {
  width: 40px;
  height: 4px;
  background: #e5e5e5;
  border-radius: 2px;
  margin: 0 auto;
  overflow: hidden;
  position: relative;
}

.success-loader::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 50%;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  animation: loading 1.5s ease-in-out infinite;
}

@keyframes loading {
  0% { left: -50%; }
  100% { left: 100%; }
}

.terms {
  color: white;
  text-align: center;
  font-size: 13px;
  margin-top: 24px;
  opacity: 0.9;
  position: relative;
  z-index: 10;
}

.terms a {
  color: white;
  font-weight: 600;
  text-decoration: underline;
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
  z-index: 1000;
  min-width: 300px;
  max-width: 90%;
  animation: shake 0.5s;
}

.alert-message.error {
  border-left: 4px solid #ef4444;
}

.alert-message.warning {
  border-left: 4px solid #f59e0b;
}

.alert-message.success {
  border-left: 4px solid #10b981;
}

.alert-icon {
  font-size: 20px;
  flex-shrink: 0;
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
  transition: color 0.3s;
}

.alert-close:hover {
  color: #333;
}

.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(-20px);
  max-height: 0;
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
  max-height: 0;
}

.shake-enter-active {
  animation: shake 0.5s;
}

.fade-scale-enter-active, .fade-scale-leave-active {
  transition: all 0.3s;
}

.fade-scale-enter-from, .fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
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

@media (max-width: 500px) {
  .auth-card {
    border-radius: 20px;
  }
  
  .card-header {
    padding: 32px 24px 16px;
  }
  
  .form-container {
    padding: 0 24px 24px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .logo-circle {
    width: 70px;
    height: 70px;
    font-size: 35px;
  }
}
</style>
