<template>
  <div class="search-container">
    <!-- Search Bar -->
    <form @submit.prevent="displayStallinfo" class="search-form">
      <div class="search-wrapper-parent">
        <div class="search-wrapper">
          <span class="search-icon">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <input 
            type="text" 
            v-model="searchQuery"
            @input="DisplayHawker"
            @focus="isInputFocused = true"
            @blur="handleBlur"
            placeholder="Search for hawker centres ..."
            class="search-input"
          >
          <button type="submit" class="search-button">
             Search
            <span class="search-button-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          </button>
        </div>
        
        <!-- Suggestions Dropdown - Absolute positioned -->
        <div class="suggestions-dropdown" v-if="suggestions.length > 0 && isInputFocused">
          <ul class="suggestions-list">
            <li 
              v-for="(hawker, index) in suggestions" 
              :key="index"
              @mousedown="selectSuggestion(hawker)"
              class="suggestion-item"
            >
              <span class="location-icon">📍</span>
              <span class="hawker-name">{{ hawker }}</span>
            </li>
          </ul>
        </div>
      </div>
    </form>

    <!-- Trending Hawker Centres -->
    <div class="trending-section" v-if="showTrending">
      <div class="trending-header">
        <span class="fire-icon">🔥</span>
        <span class="trending-text">Trending:</span>
      </div>
      <div class="trending-tags">
        <button 
          v-for="(hawker, index) in trendingHawkers" 
          :key="index"
          @click="selectTrending(hawker)"
          class="trending-tag"
        >
          {{ hawker }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'HawkerSearch',
  props: {
    showTrending: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      searchQuery: '',
      suggestions: [],
      isInputFocused: false,
      trendingHawkers: [
        'Maxwell Food Centre',
        'Amoy Street Food Centre',
        'Newton Food Centre'
      ],
      url: "https://data.gov.sg/api/action/datastore_search?resource_id=d_68a42f09f350881996d83f9cd73ab02f"
    }
  },
  methods: {
    DisplayHawker() {
      const lowercaseinput = this.searchQuery.toLowerCase()
      
      if (lowercaseinput === '') {
        this.suggestions = []
        return
      }
      
      axios.get(this.url)
        .then(response => {
          const hawkerlist = response.data.result.records
          const filteredList = []
          let count = 0
          
          for (let i = 0; i < hawkerlist.length; i++) {
            const hkname = hawkerlist[i].name_of_centre
            
            if (hkname.toLowerCase().indexOf(lowercaseinput) !== -1) {
              filteredList.push(hkname)
              count++
              
              if (count >= 3) break
            }
          }
          
          this.suggestions = filteredList
        })
        .catch(error => console.error(error))
    },
    
    selectSuggestion(hawkerName) {
      this.searchQuery = hawkerName
      this.suggestions = []
      this.isInputFocused = false
      this.displayStallinfo()
    },
    
    selectTrending(hawkerName) {
      this.searchQuery = hawkerName
      this.suggestions = []
      this.isInputFocused = false
    },
    
    handleBlur() {
      // Delay to allow click event on suggestions to fire first
      setTimeout(() => {
        this.isInputFocused = false
      }, 200)
    },
    
    displayStallinfo() {
      const selecthawker = this.searchQuery.trim()
      
      if (selecthawker === '') {
        alert('Please type a hawker centre name')
        return
      }
      
      this.$emit('search', selecthawker)
    }
  }
}
</script>

<style scoped>
.search-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem;
  animation: fadeIn 1s ease-out 0.4s backwards;
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

/* Search Form */
.search-form {
  margin-bottom: 1.5rem;
}

.search-wrapper-parent {
  position: relative;
  width: 100%;
  overflow: visible;
  z-index:1000;
}

.search-wrapper {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 0.35rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  border: 2px solid transparent;
  gap: 0.5rem;
  position: relative;
  z-index: 10;
}

.search-wrapper:focus-within {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  border-color: rgba(255, 107, 53, 0.3);
}

.search-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 1.25rem;
  flex-shrink: 0;
}

.search-icon svg {
  width: 24px;
  height: 24px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1.05rem;
  padding: 1.1rem 1rem;
  outline: none;
  color: #333;
  font-family: 'Poppins', sans-serif;
  font-weight: 400;
  min-width: 0;
}

.search-input::placeholder {
  color: #999;
  font-weight: 400;
}

.search-button {
  background: linear-gradient(135deg, #d97556 0%, #e08a67 100%);
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(217, 117, 86, 0.3);
  font-family: 'Poppins', sans-serif;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.search-button:hover {
  background: linear-gradient(135deg, #c86549 0%, #d97556 100%);
  box-shadow: 0 6px 20px rgba(217, 117, 86, 0.4);
  transform: translateY(-1px);
}

.search-button:active {
  transform: translateY(0);
}

.search-button-icon {
  display: flex;
  align-items: center;
}

.search-button-icon svg {
  width: 20px;
  height: 20px;
}

/* Suggestions Dropdown - Absolute positioned */
.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);  
  margin-top: 0.5rem;
  padding: 0.75rem 0;
  animation: slideDown 0.3s ease;
  z-index: 9999; 
  max-height: 400px;
  overflow-y: auto;
}
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.suggestions-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 0.9rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.suggestion-item:hover {
  background: rgba(217, 117, 86, 0.08);
  border-left-color: #d97556;
  transform: translateX(3px);
}

.location-icon {
  font-size: 1.1rem;
  margin-right: 0.75rem;
}

.hawker-name {
  font-size: 0.95rem;
  color: #333;
  font-weight: 500;
  font-family: 'Poppins', sans-serif;
}

/* Trending Section */
.trending-section {
  margin-top: 2rem;
  animation: fadeIn 1s ease-out 0.6s backwards;
  position: relative;
  z-index: 1;
}

.trending-header {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.fire-icon {
  font-size: 1.4rem;
  animation: flicker 1.5s infinite;
}

@keyframes flicker {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.08); }
}

.trending-text {
  font-size: 1.15rem;
  font-weight: 600;
  color: white;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.4);
  font-family: 'Poppins', sans-serif;
}

.trending-tags {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.trending-tag {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(8px);
  color: white;
  border: 1.5px solid rgba(255, 255, 255, 0.4);
  padding: 0.7rem 1.5rem;
  border-radius: 50px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-family: 'Poppins', sans-serif;
  white-space: nowrap;
}

.trending-tag:hover {
  background: rgba(255, 255, 255, 0.95);
  color: #d97556;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  border-color: rgba(255, 255, 255, 0.8);
}

.trending-tag:active {
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 768px) {
  .search-wrapper {
    padding: 0.3rem;
  }
  
  .search-icon {
    padding-left: 1rem;
  }
  
  .search-input {
    font-size: 0.95rem;
    padding: 0.95rem 0.75rem;
  }
  
  .search-button {
    padding: 0.9rem 1.75rem;
    font-size: 0.95rem;
  }
  
  .trending-tag {
    font-size: 0.85rem;
    padding: 0.6rem 1.25rem;
  }
}

@media (max-width: 576px) {
  .search-wrapper {
    gap: 0.35rem;
  }
  
  .search-button {
    padding: 0.9rem 1.5rem;
  }
  
  .search-button span:first-child {
    display: none;
  }
  
  .trending-section {
    text-align: left;
  }
  
  .trending-tags {
    display: flex;
  }
}
</style>

