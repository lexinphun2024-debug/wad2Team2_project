<template>
  <div class="stallaction">
    
    <!--Nav Bar -->
    <NavBar />

    <div class="container py-5">
      <div class="actions-card">
        <div class="actions-header">
          <button @click="goBack" class="back-icon-btn">
            <span>←</span>
          </button>
          <h1>
            <span class="stall-name">{{ stall.name }}</span>
          </h1>
          <p class="actions-subtitle">
            Check for Queue Length or View Menu/Pre-order food
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>Loading stall info...</p>
        </div>

        <!-- Content part  -->
        <div v-else class="actions-grid">

          <!-- left column is queue status -->
          <button 
            class="action-btn queue" 
            :class="queueColorClass"
          >
            <div class="action-icon">⏱️</div>
            <div class="action-content">
              <h2>Queue Status</h2>
              <div class="queue-time-info">
                <span class="time-value">{{ queueTime }}</span>
                <span class="time-unit">mins</span>
              </div>
              <p class="queue-status-text">{{ queueStatusText }}</p>
              <div class="queue-indicator-mini">
                <div class="indicator-bar-mini" :style="{ width: queuePercentage + '%' }"></div>
              </div>
            </div>
          </button>

          <!--right column : pre-order/view menu -->
          <button class="action-btn preorder" @click="goToMenu">
            <div class="action-icon">📱</div>
            <div class="action-content">
              <h2>Pre-Order/View Menu</h2>
              <p>Browse the menu and place your order in advance. Skip the queue!</p>
              <div class="preorder-benefits-mini">
                <span class="benefit-mini">✓ Save time</span>
                <span class="benefit-mini">✓ Skip wait</span>
              </div>
            </div>
            <span class="action-arrow">→</span>
          </button>
        </div>

        <!-- location information part -->
        <div v-if="!loading" class="location-info">
          <span class="location-icon">📍</span>
          <span class="location-text">{{ stall.hawker_centre_name }}</span>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { getStallById } from '@/services/supabaseService'
import NavBar from '@/components/NavBar.vue'

export default {
  name: 'StallAction',
  components: {
    NavBar
  },
  data() {
    return {
      stall: {},
      queueTime: 0,
      loading: true,
      animating: false
    }
  },
  computed: {

    //the queue length
    queueColorClass() {
      if (this.queueTime <= 10) return 'queue-green'
      if (this.queueTime <= 20) return 'queue-orange'
      return 'queue-red'
    },
    queueStatusText() {
      if (this.queueTime <= 10) return 'Short wait - Great time!'
      if (this.queueTime <= 20) return 'Moderate wait'
      return 'Long wait - Consider pre-order'
    },

    //based on the queue time, create the queue percentage, max is 30 mins
    queuePercentage() {
      return Math.min((this.queueTime / 30) * 100, 100)
    }
  },
  async mounted() {
    await this.loadStallInfo()
  },
  methods: {
    async loadStallInfo() {
      this.loading = true
      try {
        const stallId = this.$route.params.stallId
        
        //get the stall by stall id
        const data = await getStallById(stallId)

        if (!data) {
          throw new Error('Stall not found')
        }

        this.stall = data
        this.queueTime = data.queue || 0
      } catch (error) {
        console.error('Error loading stall info:', error)
        this.$router.push('/')
      } finally {
        this.loading = false
      }
    },
    
    
    goToMenu() {
      this.$router.push({
        name: 'MenuInfo',
        params: { stallId: this.stall.id }
        //directly to the props at the menuinfo.vue

      })
    },
    goBack() {
      this.$router.push({
        name: 'StallInfo',
        params: { hawkerName: this.stall.hawker_centre_name }
      })
    }
  }
}
</script>

<style scoped>
.stall-actions-page {
  min-height: 100vh;
  background: linear-gradient(180deg, rgba(248, 249, 250, 0.4) 0%, #ffffff 60%);
  padding-bottom: 80px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.py-5 {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

.actions-card {
  max-width: 900px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
  padding: 3rem;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.actions-header {
  position: relative;
  margin-bottom: 2.5rem;
}

.back-icon-btn {
  background: #f8f9fa;
  border: 2px solid rgba(255, 107, 53, 0.15);
  border-radius: 12px;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.back-icon-btn:hover {
  background: rgba(255, 107, 53, 0.1);
  border-color: rgba(255, 107, 53, 0.35);
  transform: translateX(-4px);
}

.actions-header h1 {
  font-family: 'Poppins', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.75rem;
  line-height: 1.3;
}

.stall-name {
  color: #ff6b35;
}

.actions-subtitle {
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  color: #7f8c8d;
  margin: 0;
}

/*Loading part*/
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff6b35;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}


.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.action-btn {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 2rem;
  border-radius: 18px;
  border: 2px solid rgba(255, 107, 53, 0.15);
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #ffffff;
  position: relative;
  min-height: 200px;
}

.action-btn:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 35px rgba(255, 107, 53, 0.2);
  border-color: rgba(255, 107, 53, 0.35);
}

.action-btn.pulse {
  animation: pulse 0.6s ease-in-out;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

.action-btn.queue {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(255, 140, 66, 0.12) 100%);
}

.action-btn.queue.queue-green {
  background: linear-gradient(135deg, rgba(74, 222, 128, 0.08) 0%, rgba(34, 197, 94, 0.12) 100%);
  border-color: rgba(74, 222, 128, 0.25);
}


.action-btn.queue.queue-orange {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(255, 140, 66, 0.12) 100%);
  border-color: rgba(255, 107, 53, 0.25);
}


.action-btn.queue.queue-red {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.08) 0%, rgba(255, 71, 87, 0.12) 100%);
  border-color: rgba(255, 107, 107, 0.25);
}


.action-btn.preorder {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(255, 153, 102, 0.12) 100%);
}

.action-icon {
  font-size: 2.6rem;
  line-height: 1;
  flex-shrink: 0;
}

/*for the queue percentage(expand) */
.action-content {
  flex: 1;
}

/*the header of each action content */
.action-content h2 {
  font-family: 'Poppins', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.75rem;
}

.action-content p {
  font-family: 'Poppins', sans-serif;
  font-size: 0.95rem;
  color: #6c7a89;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.queue-time-info {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

/*queue length number */
.time-value {
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.queue-green .time-value {
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.queue-red .time-value {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 'mins' */
.time-unit {
  font-size: 1rem;
  color: #6c7a89;
  font-weight: 600;
}

.queue-status-text {
  font-size: 0.9rem !important;
  color: #6c7a89 !important;
  margin-bottom: 1rem !important;
  font-weight: 500;
}

/*Percentage part */
.queue-indicator-mini {
  background: #f0f0f0;
  border-radius: 6px;
  height: 6px;
  overflow: hidden;
  position: relative;
}

.indicator-bar-mini {
  height: 100%;
  border-radius: 6px;
  transition: all 0.5s ease;
}

.queue-green .indicator-bar-mini {
  background: linear-gradient(135deg, #4ade80, #22c55e);
}

.queue-orange .indicator-bar-mini {
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
}

.queue-red .indicator-bar-mini {
  background: linear-gradient(135deg, #ff6b6b, #ff4757);
}

.preorder-benefits-mini {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.benefit-mini {
  font-size: 0.85rem;
  color: #22c55e;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.action-arrow {
  position: absolute;
  top: 2rem;
  right: 2rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #ff6b35;
  transition: transform 0.3s ease;
}

.action-btn:hover .action-arrow {
  transform: translateX(4px);
}

/*Location information */
.location-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.25rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px solid rgba(255, 107, 53, 0.1);
}

.location-icon {
  font-size: 1.3rem;
}

.location-text {
  font-family: 'Poppins', sans-serif;
  color: #6c7a89;
  font-weight: 500;
  font-size: 0.95rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .actions-card {
    padding: 2rem;
  }

  .actions-header h1 {
    font-size: 1.6rem;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .action-btn {
    min-height: auto;
  }

  .action-icon {
    font-size: 2.2rem;
  }

  .action-content h2 {
    font-size: 1.2rem;
  }

  .time-value {
    font-size: 2rem;
  }

  .action-arrow {
    position: static;
    margin-left: auto;
  }

  .action-btn {
    flex-direction: row;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 1rem 0.5rem;
  }

  .actions-card {
    padding: 1.5rem;
    border-radius: 18px;
  }

  .action-btn {
    padding: 1.5rem;
  }
}
</style>