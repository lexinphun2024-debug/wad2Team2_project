import L from 'leaflet'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://your-project-ref.supabase.co' // Replace with your Supabase URL
const SUPABASE_ANON_KEY = 'your-anon-key' // Replace with your Supabase anon key

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function getLocations() {
  const { data, error } = await supabase
    .from('locations')
    .select('id, name, address, latitude, longitude, description')

  if (error) {
    console.error('Supabase getLocations error:', error)
    return []
  }
  return data || []
}

export async function initMap(containerId, options = {}) {
  if (typeof L === 'undefined') {
    throw new Error('Leaflet not loaded')
  }

  const locations = await getLocations()
  const fallbackCenter = options.center || [1.2897, 103.8501] // Singapore coordinates
  const zoom = options.zoom ?? 13

  const map = L.map(containerId).setView(fallbackCenter, zoom)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  const markers = []
  locations.forEach(loc => {
    if (loc.latitude == null || loc.longitude == null) return
    const marker = L.marker([loc.latitude, loc.longitude]).addTo(map)
    const popupHtml = `
      <strong>${escapeHtml(loc.name || 'Untitled')}</strong>
      ${loc.address ? `<div>${escapeHtml(loc.address)}</div>` : ''}
      ${loc.description ? `<div>${escapeHtml(loc.description)}</div>` : ''}
    `
    marker.bindPopup(popupHtml)
    markers.push({
      marker,
      id: loc.id,
      lat: loc.latitude,
      lng: loc.longitude
    })
  })

  return {
    map,
    markers,
    refresh: async () => await refreshMarkers(map)
  }
}

async function refreshMarkers(map) {
  // Clear existing markers
  map.eachLayer(layer => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer)
    }
  })

  const locations = await getLocations()
  const markers = []

  locations.forEach(loc => {
    if (loc.latitude == null || loc.longitude == null) return
    const marker = L.marker([loc.latitude, loc.longitude]).addTo(map)
    const popupHtml = `
      <strong>${escapeHtml(loc.name || 'Untitled')}</strong>
      ${loc.address ? `<div>${escapeHtml(loc.address)}</div>` : ''}
      ${loc.description ? `<div>${escapeHtml(loc.description)}</div>` : ''}
    `
    marker.bindPopup(popupHtml)
    markers.push({
      marker,
      id: loc.id,
      lat: loc.latitude,
      lng: loc.longitude
    })
  })

  return markers
}

function escapeHtml(str = '') {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}