<template>
  <!-- NavBar -->
  <NavBar />
  <div class="stall-info-container">
    <!-- Header with back button -->
    <div class="header">
      <button @click="goBack" class="back-button">
        <span class="back-arrow">←</span>
      </button>
      <h1 class="hawker-name">{{ hawkerName }}</h1>
    </div>

    <!-- Category Filter -->
    <div class="category-filter">
      <button 
        v-for="category in categories" 
        :key="category"
        @click="selectCategory(category)"
        :class="['category-btn', { active: selectedCategory === category }]"
      >
        {{ category }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading stalls...</p>
    </div>

    <!-- Stalls Grid -->
    <div v-else-if="filteredStalls.length > 0" class="stalls-grid">
      <div 
        v-for="stall in filteredStalls" 
        :key="stall.id"
        class="stall-card"
        @click="openStallDetail(stall)"
      >
        <div class="stall-image">
          <!-- Show actual image if available, otherwise show placeholder -->
          <img 
            v-if="stall.image_url" 
            :src="stall.image_url" 
            :alt="stall.name"
            @error="handleImageError"
          />
          <div v-else class="image-placeholder">
            <div class="placeholder-icon">🍽️</div>
            <p class="placeholder-text">No Image</p>
          </div>
        </div>
        <div class="stall-info">
          <h3 class="stall-name">{{ stall.name }}</h3>
          <p class="cuisine-type">{{ stall.cuisine }}</p>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-else class="no-results">
      <div class="no-results-icon">😔</div>
      <p>No stalls found in this category</p>
    </div>
  </div>
</template>

<script>
import { getStallsByHawkerName, getStallsByHawkerAndCuisine, getCuisineTypesByHawker } from '@/services/supabaseService'
import NavBar from '@/components/NavBar.vue'

export default {
  name: 'StallInfo',
  props: {
    hawkerName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      stalls: [],
      filteredStalls: [],
      selectedCategory: 'All',
      categories: ['All'],
      loading: true
    }
  },
  async mounted() {
    await this.loadStalls()
    await this.loadCategories()
  },
  methods: {
    async loadStalls() {
      this.loading = true
      try {
        this.stalls = await getStallsByHawkerName(this.hawkerName)
        this.filteredStalls = this.stalls
      } catch (error) {
        console.error('Error loading stalls:', error)
      } finally {
        this.loading = false
      }
    },
    async loadCategories() {
      try {
        const cuisines = await getCuisineTypesByHawker(this.hawkerName)
        // Add unique cuisines to categories, keeping "All" at the start
        this.categories = ['All', ...cuisines.sort()]
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    },
    async selectCategory(category) {
      this.selectedCategory = category
      this.loading = true
      
      try {
        if (category === 'All') {
          this.filteredStalls = this.stalls
        } else {
          this.filteredStalls = await getStallsByHawkerAndCuisine(this.hawkerName, category)
        }
      } catch (error) {
        console.error('Error filtering stalls:', error)
      } finally {
        this.loading = false
      }
    },
    handleImageError(event) {
      // If image fails to load, hide it to show placeholder
      event.target.style.display = 'none'
    },
    goBack() {
      this.$router.push('/')
    },
    openStallDetail(stall) {
      // Navigate to menu info page
      this.$router.push({ 
        name: 'MenuInfo', 
        params: { stallId: stall.id }
      })
    }
  }
}
</script>

<style scoped>
.stall-info-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 2rem;
}

/* Header */
.header {
  background: linear-gradient(135deg, #eeb264 0%, #da7644 80%);
  color:  white;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-button {
  background: rgba(255, 255, 255, 0.703);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: black;
  font-size: 1.5rem;
  font-weight: bold;
}

.back-arrow {
  display: block;
  line-height: 1;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.703);
  transform: scale(1.05);
}

.hawker-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  flex: 1;
}

/* Category Filter */
.category-filter {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 72px;
  z-index: 99;
}

.category-filter::-webkit-scrollbar {
  height: 4px;
}

.category-filter::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 4px;
}

.category-btn {
  padding: 0.5rem 1.25rem;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  white-space: nowrap;
  font-size: 0.9rem;
}

.category-btn:hover {
  border-color:  #f9a825;
  color: #f9a825;
  transform: translateY(-2px);
}

.category-btn.active {
  background: linear-gradient(135deg,#f9a825 0%, #ffb74d 100%);
  color: white;
  border-color: transparent;
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  gap: 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #f9a825;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Stalls Grid */
.stalls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.stall-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.stall-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.stall-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: linear-gradient(135deg, #f9a825 0%, #ffb74d 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stall-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  position: absolute;
  top: 0;
  left: 0;
}

.stall-card:hover .stall-image img {
  transform: scale(1.05);
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.placeholder-icon {
  font-size: 4rem;
  opacity: 0.6;
}

.placeholder-text {
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.5px;
  opacity: 0.8;
}

.stall-info {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stall-name {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: #333;
}

.cuisine-type {
  color: #fff;
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0;
  padding: 0.25rem 0.75rem;
  background:linear-gradient(135deg, #ffe0b2 0%, #f57c00 100%);
  border-radius: 15px;
  display: inline-block;
  width: fit-content;
}

/* No Results */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 1rem;
  color: #666;
  font-size: 1.1rem;
  gap: 1rem;
}

.no-results-icon {
  font-size: 5rem;
  opacity: 0.5;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hawker-name {
    font-size: 1.2rem;
  }

  .stalls-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    padding: 1rem;
  }

  .category-filter {
    top: 68px;
  }
}

@media (max-width: 480px) {
  .stalls-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }

  .stall-image {
    height: 180px;
  }

  .header {
    padding: 0.75rem;
  }

  .hawker-name {
    font-size: 1.1rem;
  }

  .back-button {
    width: 36px;
    height: 36px;
  }

  .category-btn {
    padding: 0.4rem 1rem;
    font-size: 0.85rem;
  }
}

@media (min-width: 1200px) {
  .stalls-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}
</style>