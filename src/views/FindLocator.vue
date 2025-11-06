<template>
  <div class="find-locator">
    <NavBar />
    <div class="container-fluid px-3 px-md-4 py-4 main-content">
      <h1 class="text-center mb-4">Find Hawker Centres</h1>
      
      <!-- hawker search & user location  -->
      <div class="searchlocationrow">
        <div class="search-wrapper">
          <HawkerSearch @search="handleSearchInput" :showTrending="false" />
          <p v-if="searchError" class="search-error">{{ searchError }}</p>
        </div>
        
        <button class="btn-location" @click="openmanuallocation">
          <span class="location-icon">📍</span>
          <span class="location-text">{{ userLocation ? 'Update Location' : 'Set Your Location' }}</span>
        </button>
      </div>

      <!-- distance information -->
      <transition name="fade">
        <div v-if="selectedCenter && userLocation && distance" class="dist-card">
          <div class="dist-info">
            <span class="dist-icon">🎯</span>
            <div class="dist-details">
              <span class="dist-value">{{ distance }} km</span>
              <span class="dist-label">from your location</span>
            </div>
          </div>
          <button class="btn-directions" @click="getDirections">
              Route Through Google Map
          </button>
        </div>
      </transition>

      <!-- Content part  -->
      <div class="content-grid">
        <!-- map -->
        <div class="map-section">
          <div class="map-container">
            <div id="map"></div>
            <div v-if="loading" class="map-overlay">
              <div class="spinner"></div>
              <p>Loading hawker centres...</p>
            </div>
          </div>
        </div>

        <div class="details-panel">
          <transition name="slide-fade" mode="out-in">
            <div v-if="selectedCenter" key="details" class="hawker-details">
              <div class="detail-header">
                <h3>{{ selectedCenter.name }}</h3>
                <span class="detail-badge">📍 Selected</span>
              </div>
              <div class="detail-address">
                <span class="address-icon">📫</span>
                <span>{{ selectedCenter.address }}</span>
              </div>
              
              <div v-if="userLocation && distance" class="detail-distance">
                <div class="distance-metric">
                  <span class="metric-icon">📏</span>
                  <div>
                    <div class="metric-value">{{ distance }} km</div>
                    <div class="metric-label">Distance</div>
                  </div>
                </div>
                <div class="distance-metric">
                  <span class="metric-icon">🚶</span>
                  <div>
                    <div class="metric-value">~{{ travelTime }} min</div>
                    <div class="metric-label">Walking Time</div>
                  </div>
                </div>
              </div>

              <button v-if="userLocation" class="btn-primary-full" @click="getDirections">
                🗺️ Route Through Google Map
              </button>
            </div>

            <div v-else-if="!loading && !error" key="empty" class="empty-state">
              <div class="empty-icon">🔍</div>
              <h4>No Hawker Centre Selected</h4>
              <p>Search for a hawker centre to view details and location on the map.</p>
            </div>

            <div v-else-if="error" key="error" class="error-state">
              <div class="error-icon">⚠️</div>
              <h4>Unable to Load Data</h4>
              <p>{{ error }}</p>
              <button class="btn-retry" @click="fetchHawkerCenters">
                🔄 Retry
              </button>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- Manual Location Modal -->
    <transition name="modal-fade">
      <div v-if="showManualLocation" class="modal-overlay" @click.self="closeManualModal">
        <div class="modal-box">
          <div class="modal-header">
            <h3>📍 Set Your Location</h3>
            <button class="btn-close" @click="closeManualModal">×</button>
          </div>
          
          <p class="modal-description">Search for your location to see distances to hawker centres</p>
          
          <div class="search-input-wrapper">
            <input
              type="text"
              v-model="manualLocation"
              placeholder="Type your location ..."
              class="location-input"
              @input="handleLocationInput"
              autofocus
            />
            <span v-if="manualLocation" class="clear-input" @click="clearLocationInput">×</span>
          </div>

          <ul v-if="suggestions.length" class="suggestions-list">
            <li
              v-for="(s, i) in suggestions"
              :key="i"
              @click="selectSuggestion(s)"
              class="suggestion-item"
            >
              <span class="suggestion-icon">📍</span>
              <span class="suggestion-text">{{ s.display_name }}</span>
            </li>
          </ul>

          <div v-if="loadingSuggestions" class="suggestions-loading">
            <div class="mini-spinner"></div>
            <span>Searching...</span>
          </div>

          <div class="modal-actions">
            <button class="btn-secondary" @click="closeManualModal">Cancel</button>
            <button 
              class="btn-primary" 
              @click="searchManualLocation" 
              :disabled="!userLocation"
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </transition>
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
      searchError: '',
      userMarker: null,
      userLocation: null,
      showManualLocation: false,
      manualLocation: '',
      suggestions: [],
      loadingSuggestions: false,
      debounceTimer: null,
      distance: null,
      travelTime: null,
      polyline: null
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
     if (trimmed && this.allCenters.length > 0) {
        this.focusOnHawker(trimmed)
      } else if (trimmed) {
        this.pendingFocus = trimmed
      }
    }
  },
  methods: {
    initMap() {
      this.map = L.map('map', {
        zoomControl: true,
        scrollWheelZoom: true
      }).setView([1.2897, 103.8501], 12)

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

      if (this.selectedCenter) {
        // Custom icon for hawker centre
        const hawkerIcon = L.divIcon({
          className: 'hawker-marker',
          html: '<div class="marker-pin hawker"></div>',
          iconSize: [40, 52],
          iconAnchor: [20, 52],
          popupAnchor: [0, -52]
        })

        const marker = L.marker(this.selectedCenter.coordinates, { icon: hawkerIcon })
          .bindPopup(`
            <div class="custom-popup">
              <strong>${this.selectedCenter.name}</strong><br>
              <span class="popup-address">${this.selectedCenter.address}</span>
            </div>
          `)
          .addTo(this.map)
        
        this.markers.push(marker)

        // Draw line and fit bounds if user location exists
        if (this.userLocation) {
          const bounds = L.latLngBounds([
            this.selectedCenter.coordinates,
            this.userLocation
          ])
          this.map.fitBounds(bounds, { padding: [80, 80] })
        } else {
          this.map.setView(this.selectedCenter.coordinates, 15)
        }

        marker.openPopup()
        this.calculateDistance()
      }
    },

    calculateDistance() {
      if (!this.selectedCenter || !this.userLocation) {
        this.distance = null
        this.travelTime = null
        return
      }

      const [lat1, lon1] = this.userLocation
      const [lat2, lon2] = this.selectedCenter.coordinates

      // Haversine formula
      const R = 6371 // Earth's radius in km
      const dLat = this.toRad(lat2 - lat1)
      const dLon = this.toRad(lon2 - lon1)
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.toRad(lat1)) *
          Math.cos(this.toRad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = R * c

      this.distance = distance.toFixed(2)
      // Estimate walking time (avg 5 km/h)
      this.travelTime = Math.ceil((distance / 5) * 60)
    },

    toRad(value) {
      return (value * Math.PI) / 180
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
    },

    openmanuallocation() {
      this.showManualLocation = true
      this.manualLocation = ''
      this.suggestions = []
      this.userLocation = null
    },

    addUserMarker() {
      if (!this.userLocation || !this.map) return

      const userIcon = L.divIcon({
        className: 'user-marker-custom',
        html: '<div class="marker-pin user"></div>',
        iconSize: [35, 47],
        iconAnchor: [17.5, 47],
        popupAnchor: [0, -47]
      })

      if (this.userMarker) {
        this.map.removeLayer(this.userMarker)
      }

      const [lat, lon] = this.userLocation
      this.userMarker = L.marker([lat, lon], { icon: userIcon })
        .addTo(this.map)
        .bindPopup(
          '<div class="custom-popup"><strong>📍 Your Location</strong></div>',
          { closeButton: false, autoClose: false, closeOnClick: false }
        )
        .openPopup()

      if (this.selectedCenter) {
        this.refreshMarkers()
      } else {
        this.map.setView([lat, lon], 14)
      }
    },


    async handleLocationInput() {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
      }

      if (this.manualLocation.length < 3) {
        this.suggestions = []
        return
      }

      this.debounceTimer = setTimeout(async () => {
        const query = encodeURIComponent(this.manualLocation + ', Singapore')
        //use onestreet map open source api
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5&countrycodes=sg`
      
      try {
          const res = await fetch(url, {
            headers: {
              'User-Agent': 'HawkerLocator/1.0'
            }
          })
          this.suggestions = await res.json()
      }catch (err) {
        console.error("Error fetching location suggestions:", err);
        this.suggestions = [];
      } finally {
          this.loadingSuggestions = false
      }
      }, 400)

    },

    selectSuggestion(s) {
      this.manualLocation = s.display_name
      this.suggestions = []
      this.userLocation = [parseFloat(s.lat), parseFloat(s.lon)]
    },

    searchManualLocation() {
      if (!this.userLocation) {
        return
      }
      this.addUserMarker()
      this.closeManualModal()
    },

    closeManualModal() {
      this.showManualLocation = false
      this.manualLocation = ''
      this.suggestions = []
      this.loadingSuggestions = false
    },

    openmanuallocation() {
      this.showManualLocation = true
    },

    getDirections() {
      if (!this.selectedCenter || !this.userLocation) return
      
      const [lat, lon] = this.selectedCenter.coordinates
      const [userLat, userLon] = this.userLocation
      
      //direct to google map for route
      const url = `https://www.google.com/maps/dir/${userLat},${userLon}/${lat},${lon}`
      window.open(url, '_blank')
    }

  },

  beforeUnmount() {
    // Clean up map
    if (this.map) {
      this.map.remove()
    }
    //clear timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
  }
}
</script>

<style scoped>
.find-locator {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

h1 {
  color: #2c3e50;
  font-weight: 700;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  margin-bottom: 2rem;
}

/* Search and Location Row */
.searchlocationrow {
  display: flex;
  gap: 1rem;
  max-width: 1000px;
  margin: 0 auto 2rem;
  align-items: flex-start;
  position: relative;
  z-index : 10;
}

.search-wrapper {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 100;
}

.search-error {
  margin-top: 0.5rem;
  color: #dc3545;
  font-size: 0.875rem;
  font-weight: 500;
}

.btn-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c61 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
  white-space: nowrap;
}

.btn-location:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
}

.location-icon {
  font-size: 1.2rem;
}

/* distance part */
.dist-card {
  max-width: 1000px;
  margin: 0 auto 1.5rem;
  background: white;
  padding: 1.25rem 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.dist-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dist-icon {
  font-size: 2rem;
}

.dist-details {
  display: flex;
  flex-direction: column;
}

.dist-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.dist-label {
  font-size: 0.875rem;
  color: #6c757d;
}

.btn-directions {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-directions:hover {
  background: #218838;
  transform: scale(1.05);
}

/*Content part */
.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.main-content {
  padding-top: 80px !important;
}

@media (min-width: 992px) {
  .content-grid {
    grid-template-columns: 2fr 1fr;
  }
}

/* map part */
.map-section {
  position: relative;
}

.map-container {
  height: 500px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  position: relative;
}

#map {
  height: 100%;
  width: 100%;
}

.map-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  z-index: 1000;
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
  to { transform: rotate(360deg); }
}

/* Details Panel */
.details-panel {
  display: flex;
  flex-direction: column;
}

.hawker-details {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.detail-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
  flex: 1;
  min-width: 0;
}

.detail-badge {
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c61 100%);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
}

.detail-address {
  display: flex;
  align-items: start;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  color: #495057;
  line-height: 1.6;
}

.address-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.detail-distance {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.distance-metric {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
}

.metric-icon {
  font-size: 1.75rem;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c3e50;
}

.metric-label {
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-primary-full {
  width: 100%;
  background: linear-gradient(135deg, #28a745 0%, #34ce57 100%);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary-full:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
}


.empty-state,
.error-state {
  background: white;
  padding: 3rem 2rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.empty-icon,
.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h4,
.error-state h4 {
  color: #2c3e50;
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
}

.empty-state p,
.error-state p {
  color: #6c757d;
  margin: 0;
}

.btn-retry {
  margin-top: 1.5rem;
  background: #ff6b35;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-retry:hover {
  background: #ff5722;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.modal-box {
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: #f8f9fa;
  color: #2c3e50;
}

.modal-description {
  color: #6c757d;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.search-input-wrapper {
  position: relative;
  margin-bottom: 1rem;
}

.location-input {
  width: 100%;
  padding: 0.875rem 2.5rem 0.875rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.location-input:focus {
  outline: none;
  border-color: #ff6b35;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.clear-input {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.clear-input:hover {
  background: #f8f9fa;
  color: #2c3e50;
}

.suggestions-list {
  list-style: none;
  margin: 0 0 1rem 0;
  padding: 0;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  max-height: 250px;
  overflow-y: auto;
  background: white;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  border-bottom: 1px solid #f8f9fa;
  transition: all 0.2s ease;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background: linear-gradient(90deg, #fff5f0 0%, #ffffff 100%);
  padding-left: 1.25rem;
}

.suggestion-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.suggestion-text {
  flex: 1;
  font-size: 0.95rem;
  color: #495057;
}

.suggestions-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 1rem;
  color: #6c757d;
}

.mini-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e9ecef;
  border-top: 2px solid #ff6b35;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn-secondary,
.btn-primary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary {
  background: #e9ecef;
  color: #495057;
}

.btn-secondary:hover {
  background: #dee2e6;
}

.btn-primary {
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c61 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Custom Markers */
:deep(.hawker-marker),
:deep(.user-marker-custom) {
  background: transparent !important;
  border: none !important;
}

:deep(.marker-pin) {
  width: 30px;
  height: 30px;
  border-radius: 50% 50% 50% 0;
  position: absolute;
  transform: rotate(-45deg);
  left: 50%;
  top: 50%;
  margin: -15px 0 0 -15px;
  border: 3px solid white;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
}

:deep(.marker-pin.hawker) {
  background: #ff6b35;
  width: 35px;
  height: 35px;
  margin: -17.5px 0 0 -17.5px;
}

:deep(.marker-pin.user) {
  background: #007bff;
}

:deep(.marker-pin::after) {
  content: '';
  width: 10px;
  height: 10px;
  margin: 7px 0 0 7px;
  background: white;
  position: absolute;
  border-radius: 50%;
}

:deep(.marker-pin.hawker::after) {
  width: 12px;
  height: 12px;
  margin: 8.5px 0 0 8.5px;
}


:deep(.custom-popup) {
  font-family: 'Poppins', sans-serif;
}

:deep(.custom-popup strong) {
  font-size: 1rem;
  color: #2c3e50;
  display: block;
  margin-bottom: 0.25rem;
}

:deep(.popup-address) {
  font-size: 0.875rem;
  color: #6c757d;
}


.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-box {
  transition: all 0.3s ease;
}

.modal-fade-enter-from .modal-box {
  transform: scale(0.9) translateY(20px);
}

@media (max-width: 991px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .map-container {
    height: 400px;
  }
}

@media (max-width: 768px) {
  .searchlocationrow {
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn-location {
    width: 100%;
    justify-content: center;
  }

  .distance-card {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }

  .dist-info {
    justify-content: center;
  }

  .btn-directions {
    width: 100%;
  }

  .detail-distance {
    grid-template-columns: 1fr;
  }

  .modal-box {
    padding: 1.5rem;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .btn-secondary,
  .btn-primary {
    width: 100%;
  }
}

@media (max-width: 576px) {
  h1 {
    font-size: 1.5rem;
  }

  .map-container {
    height: 350px;
  }

  .hawker-details,
  .empty-state,
  .error-state {
    padding: 1.5rem;
  }

  .detail-header h3 {
    font-size: 1.25rem;
  }

  .dist-value {
    font-size: 1.125rem;
  }

  .location-text {
    font-size: 0.9rem;
  }

  .btn-location {
    padding: 0.75rem 1.25rem;
  }
}

/* scrollbar */
.suggestions-list::-webkit-scrollbar,
.modal-box::-webkit-scrollbar {
  width: 8px;
}

.suggestions-list::-webkit-scrollbar-track,
.modal-box::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 10px;
}

.suggestions-list::-webkit-scrollbar-thumb,
.modal-box::-webkit-scrollbar-thumb {
  background: #dee2e6;
  border-radius: 10px;
}

.suggestions-list::-webkit-scrollbar-thumb:hover,
.modal-box::-webkit-scrollbar-thumb:hover {
  background: #ced4da;
}

@media print {
  .btn-location,
  .btn-directions,
  .btn-primary-full,
  .btn-retry {
    display: none;
  }
  
  .map-container {
    height: 400px;
    page-break-inside: avoid;
  }
}
</style>
