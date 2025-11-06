<template>
  <div class="find-locator">
    <NavBar />
    <div class="container py-4">
      <h1 class="text-center mb-4">Find Hawker Centres</h1>
      
      <div class="locator-search">
        <HawkerSearch @search="handleSearchInput" :showTrending="false" />
        <p v-if="searchError" class="search-error">{{ searchError }}</p>
      </div>
      
      <div class="map-container">
        <div id="map"></div>
      </div>
      <div class="hawker-details mt-4" v-if="selectedCenter">
        <div class="detail-header">
          <h3>{{ selectedCenter.name }}</h3>
          <span class="detail-tag">Selected Centre</span>
        </div>
        <p class="detail-address">{{ selectedCenter.address }}</p>
      </div>
      <div v-else-if="!loading && !error" class="empty-state">
        <p>Search for a hawker centre to view it on the map.</p>
      </div>
      <div v-if="loading" class="status-card">Loading hawker centres...</div>
      <div v-else-if="error" class="status-card error">{{ error }}</div>
    </div>
  </div>
</template>

<script>
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import axios from 'axios'
import NavBar from '@/components/NavBar.vue'
import HawkerSearch from '@/components/HawkerSearch.vue'

// Coordinates sourced from public map data; extend as new centres are supported.
const COORDINATE_LOOKUP = {
  'Adam Road Food Centre': [1.3246, 103.8141],
  'Amoy Street Food Centre': [1.2802, 103.8489],
  'Bedok Food Centre': [1.3211, 103.9557],
  'Beo Crescent Market': [1.2855, 103.8324],
  'Berseh Food Centre': [1.3071, 103.8564],
  'Chinatown Complex Food Centre': [1.2835, 103.8430],
  'Lau Pa Sat': [1.2803, 103.8505],
  'Maxwell Food Centre': [1.2801, 103.8448],
  'Newton Food Centre': [1.3115, 103.8391],
  'Tekka Centre': [1.3050, 103.8503],
  'Old Airport Road Food Centre': [1.3066, 103.8830],
  'Tiong Bahru Market': [1.2859, 103.8330],
  'Zion Riverside Food Centre': [1.2937, 103.8329]
}

const DATASET_URL = 'https://data.gov.sg/api/action/datastore_search'
const DATASET_RESOURCE_ID = 'd_68a42f09f350881996d83f9cd73ab02f'

export default {
  name: 'FindLocator',
  components: {
    NavBar,
    HawkerSearch
  },
  data() {
    return {
      map: null,
      markers: [],
      allCenters: [],
      selectedCenter: null,
      loading: false,
      error: null,
      pendingFocus: '',
      searchError: ''
    }
  },
  mounted() {
    this.initMap()
    this.pendingFocus = (this.$route.query.hawker || '').trim()
    this.fetchHawkerCenters()
  },
  watch: {
    '$route.query.hawker'(newValue) {
      const trimmed = (newValue || '').trim()
      if (!trimmed) {
        return
      }

      if (this.hawkerCenters.length > 0) {
        this.focusOnHawker(trimmed)
      } else {
        this.pendingFocus = trimmed
      }
    }
  },
  methods: {
    initMap() {
      this.map = L.map('map').setView([1.2897, 103.8501], 12)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.map)
    },
    async fetchHawkerCenters() {
      this.loading = true
      this.error = null

      try {
        const response = await axios.get(DATASET_URL, {
          params: {
            resource_id: DATASET_RESOURCE_ID,
            limit: 200
          }
        })

        const records = response.data?.result?.records || []
        this.allCenters = records
          .map(record => {
            const name = record.name_of_centre?.trim()
            const coordinates = COORDINATE_LOOKUP[name]
            if (!name || !coordinates) {
              if (import.meta.env.DEV && name) {
                console.warn(`Missing coordinates for hawker centre: ${name}`)
              }
              return null
            }
            return {
              id: record._id,
              name,
              address: record.location_of_centre || 'Address unavailable',
              coordinates
            }
          })
          .filter(Boolean)

        this.afterDataLoaded()
      } catch (err) {
        console.error('Error fetching hawker centres:', err)
        this.error = 'Unable to load hawker centre information right now. Please try again later.'
      } finally {
        this.loading = false
      }
    },
    afterDataLoaded() {
      if (!this.allCenters.length) return

      if (this.pendingFocus) {
        this.selectCenterByName(this.pendingFocus)
        this.pendingFocus = ''
      } else if (this.$route.query.hawker) {
        this.selectCenterByName(this.$route.query.hawker)
      }
    },
    refreshMarkers() {
      if (!this.map) return

      // Remove existing markers
      this.markers.forEach(marker => marker.remove())
      this.markers = []

      if (this.selectedCenter) {
        const marker = L.marker(this.selectedCenter.coordinates)
          .bindPopup(`
            <strong>${this.selectedCenter.name}</strong><br>
            ${this.selectedCenter.address}
          `)
          .addTo(this.map)
        this.markers.push(marker)
        this.map.setView(this.selectedCenter.coordinates, 16)
        marker.openPopup()
      }
    },
    showLocation(center) {
      if (!this.map) return

      this.map.setView(center.coordinates, 16)
      const marker = this.markers.find(m => {
        const { lat, lng } = m.getLatLng()
        return lat === center.coordinates[0] && lng === center.coordinates[1]
      })
      if (marker) {
        marker.openPopup()
      }
    },
    focusOnHawker(name) {
      if (!name) return

      this.selectCenterByName(name)
    },
    selectCenterByName(name) {
      const targetName = name.trim().toLowerCase()
      const center = this.allCenters.find(
        hawker => hawker.name.trim().toLowerCase() === targetName
      )

      if (center) {
        this.selectedCenter = center
        this.searchError = ''
        this.refreshMarkers()
        this.updateRouteQuery(center.name)
      } else if (import.meta.env.DEV) {
        console.warn(`Unable to focus map on hawker centre: ${name}`)
      }
    },
    handleSearchInput(hawkerName) {
      const query = (hawkerName || '').trim()
      if (!query) {
        this.searchError = 'Please enter a hawker centre name.'
        return
      }

      if (!this.allCenters.length) {
        this.searchError = 'Data is still loading. Please try again shortly.'
        return
      }

      const match = this.allCenters.find(
        hawker => hawker.name.toLowerCase() === query.toLowerCase()
      )

      if (match) {
        this.selectedCenter = match
        this.searchError = ''
        this.refreshMarkers()
        this.updateRouteQuery(match.name)
      } else {
        this.selectedCenter = null
        this.refreshMarkers()
        this.searchError = 'We could not find that hawker centre. Check the spelling and try again.'
      }
    },
    updateRouteQuery(name) {
      this.$router.replace({
        query: { hawker: name }
      })
    }
  }
}
</script>

<style scoped>
.find-locator {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-top: calc(var(--navbar-height, 90px) + 20px);
}

.map-container {
  height: 500px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

#map {
  height: 100%;
  width: 100%;
}

.locator-search {
  max-width: 700px;
  margin: 0 auto 2rem auto;
}

.search-error {
  margin-top: 0.75rem;
  color: #c0392b;
  font-family: 'Poppins', sans-serif;
  font-size: 0.95rem;
  text-align: center;
}

.status-card {
  margin-top: 1.5rem;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  font-family: 'Poppins', sans-serif;
  text-align: center;
  color: #2c3e50;
}

.status-card.error {
  border-left: 4px solid #dc3545;
  color: #c0392b;
}

.hawker-details {
  background: white;
  padding: 1.75rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
  max-width: 700px;
  margin: 0 auto;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.detail-header h3 {
  margin: 0;
  font-family: 'Poppins', sans-serif;
  font-size: 1.5rem;
  color: #2c3e50;
}

.detail-tag {
  background: rgba(255, 107, 53, 0.1);
  color: #ff6b35;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
}

.detail-address {
  margin: 0;
  font-family: 'Poppins', sans-serif;
  color: #6c7a89;
  font-size: 1rem;
}

.empty-state {
  margin-top: 2rem;
  text-align: center;
  font-family: 'Poppins', sans-serif;
  color: #7f8c8d;
}

h1 {
  color: #2c3e50;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
}

h3 {
  color: #2c3e50;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  margin-bottom: 1rem;
}
</style>
