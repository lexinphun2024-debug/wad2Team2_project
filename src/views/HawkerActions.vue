<template>
  <div class="hawker-actions-page">
    <NavBar />
    <div class="container py-5">
      <div class="actions-card">
        <div class="actions-header">
          <h1>
            What would you like to do for
            <span class="hawker-name">“{{ hawkerName }}”</span>?
          </h1>
          <p class="actions-subtitle">
            Choose an option below to explore directions or see stall details.
          </p>
        </div>

        <div class="actions-grid">
          <button class="action-btn map" @click="goToMap">
            <div class="action-icon">🗺️</div>
            <div class="action-content">
              <h2>How to get there</h2>
              <p>View the interactive map with directions to this hawker centre.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-btn info" @click="goToStallInfo">
            <div class="action-icon">📋</div>
            <div class="action-content">
              <h2>Stall Information</h2>
              <p>Browse the stalls, menu highlights, and categories available.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>
        </div>

        <button class="back-btn" @click="goBack">
          ← Back to search
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'

export default {
  name: 'HawkerActions',
  components: {
    NavBar
  },
  props: {
    hawkerName: {
      type: String,
      required: true
    }
  },
  methods: {
    goToMap() {
      this.$router.push({
        name: 'FindLocator',
        query: { hawker: this.hawkerName }
      })
    },
    goToStallInfo() {
      this.$router.push({
        name: 'StallInfo',
        params: { hawkerName: this.hawkerName }
      })
    },
    goBack() {
      this.$router.push({ name: 'Home' })
    }
  }
}
</script>

<style scoped>
.hawker-actions-page {
  min-height: 100vh;
  background: linear-gradient(180deg, rgba(248, 249, 250, 0.4) 0%, #ffffff 60%);
}

.actions-card {
  max-width: 900px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
  padding: 3rem;
  text-align: left;
}

.actions-header h1 {
  font-family: 'Poppins', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.75rem;
}

.hawker-name {
  color: #ff6b35;
}

.actions-subtitle {
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  color: #7f8c8d;
  margin-bottom: 2.5rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.75rem;
  border-radius: 18px;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  background: #ffffff;
  border: 2px solid rgba(255, 107, 53, 0.15);
  position: relative;
}

.action-btn:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 35px rgba(255, 107, 53, 0.2);
  border-color: rgba(255, 107, 53, 0.35);
}

.action-btn.map {
  background: linear-gradient(135deg, rgba(255, 140, 66, 0.1) 0%, rgba(255, 193, 118, 0.15) 100%);
}

.action-btn.info {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 153, 102, 0.15) 100%);
}

.action-icon {
  font-size: 2.6rem;
  line-height: 1;
}

.action-content h2 {
  font-family: 'Poppins', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.35rem;
}

.action-content p {
  font-family: 'Poppins', sans-serif;
  font-size: 0.95rem;
  color: #6c7a89;
  margin: 0;
}

.action-arrow {
  margin-left: auto;
  font-size: 1.5rem;
  font-weight: 600;
  color: #ff6b35;
}

.back-btn {
  border: none;
  background: none;
  color: #ff6b35;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.back-btn:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .actions-card {
    padding: 2rem;
  }

  .actions-header h1 {
    font-size: 1.6rem;
  }

  .action-btn {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-arrow {
    margin-left: 0;
  }
}
</style>
