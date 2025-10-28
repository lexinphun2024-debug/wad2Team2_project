<template>
  <div class="find-locator">
    <NavBar />
    <div class="container py-4">
      <h1 class="text-center mb-4">Find Hawker Centers</h1>
      <div class="map-container">
        <div id="map"></div>
      </div>
      <div class="hawker-list mt-4">
        <h3>Nearby Hawker Centers</h3>
        <div class="list-group">
          <button 
            v-for="center in hawkerCenters" 
            :key="center.id"
            class="list-group-item list-group-item-action"
            @click="showLocation(center)"
          >
            {{ center.name }}
            <small class="text-muted d-block">{{ center.address }}</small>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import NavBar from '@/components/NavBar.vue'

export default {
  name: 'FindLocator',
  components: {
    NavBar
  },
  data() {
    return {
      map: null,
      markers: [],
      hawkerCenters: [
        {
          id: 1,
          name: 'Maxwell Food Centre',
          address: '1 Kadayanallur St, Singapore 069184',
          coordinates: [1.2801, 103.8448]
        },
        {
          id: 2,
          name: 'Chinatown Complex Food Centre',
          address: '335 Smith Street, Singapore 050335',
          coordinates: [1.2817, 103.8442]
        },
        {
          id: 3,
          name: 'Lau Pa Sat',
          address: '18 Raffles Quay, Singapore 048582',
          coordinates: [1.2807, 103.8503]
        }
      ]
    }
  },
  mounted() {
    this.initMap()
    this.addHawkerCenters()
  },
  methods: {
    initMap() {
      // Initialize map centered on Singapore
      this.map = L.map('map').setView([1.2897, 103.8501], 13)
      
      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.map)
    },
    addHawkerCenters() {
      this.hawkerCenters.forEach(center => {
        const marker = L.marker(center.coordinates)
          .bindPopup(`
            <strong>${center.name}</strong><br>
            ${center.address}
          `)
          .addTo(this.map)
        this.markers.push(marker)
      })
    },
    showLocation(center) {
      this.map.setView(center.coordinates, 16)
      const marker = this.markers.find(m => 
        m.getLatLng().lat === center.coordinates[0] && 
        m.getLatLng().lng === center.coordinates[1]
      )
      if (marker) {
        marker.openPopup()
      }
    }
  }
}
</script>

<style scoped>
.find-locator {
  min-height: 100vh;
  background-color: #f8f9fa;
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

.hawker-list {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.list-group-item {
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.list-group-item:hover {
  border-left-color: #ff8c42;
  transform: translateX(5px);
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