<template>
  <!-- NavBar -->
  <NavBar />
  <div class="menu-info-container">
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">←</button>
        <h2 class="stall-title">{{ stallName }}</h2>
      </div>
    </header>

    <!-- Tabs -->
    <div class="tabs">
      <button :class="{ active: activeTab === 'top3' }" @click="activeTab = 'top3'">
        🏆 Top 3 Recommended
      </button>
      <button :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">
        🍽️ All Menu
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>

    <!-- Top 3 Section -->
    <div v-if="!loading && activeTab === 'top3'" class="menu-grid">
      <div v-for="(item, index) in top3Items" :key="item.id" class="menu-card">
        <div class="menu-content">
          <h4>{{ index + 1 }}. {{ item.item_name }}</h4>
          <p class="price">${{ item.price.toFixed(2) }}</p>
          <div class="add-btn-container">
            <button class="add-btn" @mouseover="showPopup(index)" @mouseleave="hidePopup">
              ADD
            </button>
            <div v-if="popupIndex === index" class="popup">Add to Order</div>
          </div>
        </div>
      </div>
    </div>

    <!-- All Menu Section -->
    <div v-if="!loading && activeTab === 'all'">
      <div class="filter-section">
        <button class="filter-toggle" @click="showFilter = !showFilter">🔍 Filter</button>
        <div v-if="showFilter" class="filter-controls">
          <label>Price Range:</label>
          <div class="filter-inputs">
            <input type="number" v-model.number="minPrice" min="0" class="price-input" readonly />
            <span>–</span>
            <input type="number" v-model.number="maxPrice" min="0" class="price-input" />
            <button class="filter-btn" @click="applyFilter">Apply</button>
          </div>
          <input type="range" v-model="maxPrice" min="0" max="50" class="price-range" />
        </div>
      </div>

      <div class="menu-grid">
        <div v-for="(item, index) in filteredItems" :key="item.id" class="menu-card">
          <div class="menu-content">
            <h4>{{ item.item_name }}</h4>
            <p class="price">${{ item.price.toFixed(2) }}</p>
            <div class="add-btn-container">
              <button class="add-btn" @mouseover="showPopup(index)" @mouseleave="hidePopup">
                ADD
              </button>
              <div v-if="popupIndex === index" class="popup">Add to Order</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getStallById, getTop3MenuItems, getMenuItemsByStall } from "@/services/supabaseService";
import NavBar from '@/components/NavBar.vue'

export default {
  props: {
    stallId: { type: [String, Number], required: true },
  },
  data() {
    return {
      stallName: "",
      top3Items: [],
      allItems: [],
      filteredItems: [],
      activeTab: "top3",
      loading: true,
      showFilter: false,
      minPrice: 0,
      maxPrice: 20,
      popupIndex: null,
    };
  },
  async mounted() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      try {
        this.loading = true;
        const stall = await getStallById(this.stallId);
        this.stallName = stall.name;
        this.top3Items = await getTop3MenuItems(this.stallId);
        this.allItems = await getMenuItemsByStall(this.stallId);
        this.filteredItems = [...this.allItems];

        // Save hawker name for back navigation if exists
        if (this.$route.query.hawkerName) {
          localStorage.setItem("hawkerName", this.$route.query.hawkerName);
        }
      } catch (error) {
        console.error("Error loading data:", error.message);
      } finally {
        this.loading = false;
      }
    },

    goBack() {
      // Retrieve hawkerName from query or localStorage
      const hawkerName =
        this.$route.query.hawkerName || localStorage.getItem("hawkerName");
      if (hawkerName) {
        this.$router.push({ name: "StallInfo", params: { hawkerName } });
      } else {
        this.$router.push({ name: "Home" }); // fallback to homepage
      }
    },

    applyFilter() {
      this.filteredItems = this.allItems.filter(
        (item) => item.price >= this.minPrice && item.price <= this.maxPrice
      );
    },
    showPopup(index) {
      this.popupIndex = index;
    },
    hidePopup() {
      this.popupIndex = null;
    },
  },
};
</script>

<style scoped>
.menu-info-container {
  padding: 1.5rem;
  font-family: "Poppins", sans-serif;
  color: #333;
  background: #fff9f0;
  min-height: 100vh;
}

/* Header */
.header {
  background: linear-gradient(90deg, #ffa94d, #ffca6f);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  color: white;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.back-btn {
  background: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 1.2rem;
  cursor: pointer;
  color: #ff8800;
  font-weight: bold;
  transition: 0.3s;
}
.back-btn:hover {
  background: #ff8800;
  color: white;
}
.stall-title {
  font-size: 1.4rem;
  font-weight: 600;
}

/* Tabs */
.tabs {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.tabs button {
  background: #ffe5b4;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}
.tabs button.active {
  background: #ff9900;
  color: white;
}
.tabs button:hover {
  transform: scale(1.05);
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 3rem;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ffe5b4;
  border-top: 4px solid #ff9900;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Filter Section */
.filter-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}
.filter-toggle {
  background: #ffb347;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: bold;
  cursor: pointer;
}
.filter-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: #fff4e3;
  border-radius: 10px;
  padding: 0.8rem;
  margin-top: 0.5rem;
  width: 100%;
  max-width: 350px;
}
.filter-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.price-input {
  width: 60px;
  padding: 0.3rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.filter-btn {
  background: #ff9900;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  transition: 0.3s;
}
.filter-btn:hover {
  background: #ff7700;
}

/* Menu Grid */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.2rem;
}
.menu-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(255, 153, 0, 0.2);
  padding: 1rem;
  transition: transform 0.2s;
}
.menu-card:hover {
  transform: translateY(-4px);
}
.menu-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.price {
  font-weight: bold;
  color: #ff8800;
}

/* Add Button */
.add-btn-container {
  position: relative;
  display: flex;
  justify-content: flex-end;
}
.add-btn {
  background: #ff9900;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 1rem;
  cursor: pointer;
  font-weight: bold;
  transition: 0.3s;
}
.add-btn:hover {
  background: #ff7700;
  transform: scale(1.05);
}
.popup {
  position: absolute;
  bottom: 110%;
  right: 0;
  background: #333;
  color: white;
  font-size: 0.75rem;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  opacity: 0.9;
}

/* Responsive for 2 per row on md/lg */
@media (min-width: 768px) {
  .menu-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 767px) {
  .menu-grid {
    grid-template-columns: 1fr;
  }
}
</style>