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

    <!-- cuisine category filter-->
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

    <!-- Stall information part -->
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
            @error="handleImageError($event)"
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

const IMAGE_LIBRARY = {
  chickenRice:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Hainanese_chicken_rice.jpg/800px-Hainanese_chicken_rice.jpg',
  porridge:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Chicken_congee_at_Psar_Chaa_Market_in_Siem_Reap%2C_Cambodia.jpg/800px-Chicken_congee_at_Psar_Chaa_Market_in_Siem_Reap%2C_Cambodia.jpg',
  laksa:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Laksa_Noodle_Soup.jpg/800px-Laksa_Noodle_Soup.jpg',
  curryRice:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Hainanese_Curry_Rice_by_Banej.jpg/800px-Hainanese_Curry_Rice_by_Banej.jpg',
  curryPuff:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Karipap_Daging.jpg/800px-Karipap_Daging.jpg',
  charKwayTeow:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Malaysian_Char_Kuey_Teow.jpg/800px-Malaysian_Char_Kuey_Teow.jpg',
  fishSoup:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Sliced_fish_soup%2C_Pek_Kio_Market_%26_Food_Centre_%2825065937730%29.jpg/800px-Sliced_fish_soup%2C_Pek_Kio_Market_%26_Food_Centre_%2825065937730%29.jpg',
  fishballNoodles:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Fishball_Noodles.jpg/800px-Fishball_Noodles.jpg',
  satay:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Chicken_satay_on_banana_leaf_in_Java.jpg/800px-Chicken_satay_on_banana_leaf_in_Java.jpg',
  stingray:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Grilled_Stingray.JPG/800px-Grilled_Stingray.JPG',
  bakKutTeh:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Bak_kut_teh_zz.jpg/800px-Bak_kut_teh_zz.jpg',
  zongzi:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Yellowzongzi.jpg/800px-Yellowzongzi.jpg',
  oysterOmelette:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Oyster_omelette_-_Singapore_style.JPG/800px-Oyster_omelette_-_Singapore_style.JPG',
  nasiLemak:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Nasi_lemak_on_banana_leaf.jpg/800px-Nasi_lemak_on_banana_leaf.jpg',
  hokkienMee:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Singapore_style_Hokkien_mee.jpg/800px-Singapore_style_Hokkien_mee.jpg',
  lorMee:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Lor_Mee.jpg/800px-Lor_Mee.jpg',
  beefNoodle:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Taiwanese_Beef_Noodle_Soup.jpg/800px-Taiwanese_Beef_Noodle_Soup.jpg',
  mincedMeatNoodle:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Singapore_Minced_Meat_Noodle.jpg/800px-Singapore_Minced_Meat_Noodle.jpg',
  carrotCake:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Fried_Chinese_Carrot_Cake_by_Banej.jpg/800px-Fried_Chinese_Carrot_Cake_by_Banej.jpg',
  vadai:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Vada_%28food%29.JPG/800px-Vada_%28food%29.JPG',
  coffee:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Kopi_O.jpg/800px-Kopi_O.jpg',
  sugarcane:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Sugarcanejuice.jpg/800px-Sugarcanejuice.jpg',
  soymilk:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Soymilk_can_and_glass_2.jpg/800px-Soymilk_can_and_glass_2.jpg',
  cendol:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Jakarta_street-side_Es_Cendol_4.jpg/800px-Jakarta_street-side_Es_Cendol_4.jpg',
  iceKacang:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Singapore_food_-_Ice_kacang_at_Food_Republic_Nov_2016.jpg/800px-Singapore_food_-_Ice_kacang_at_Food_Republic_Nov_2016.jpg',
  roastDuck:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Roast_duck_Cantonese_styleCNE.jpg/800px-Roast_duck_Cantonese_styleCNE.jpg',
  chickenWings:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/BBQ_chicken_wings.jpg/800px-BBQ_chicken_wings.jpg',
  noodleBowl:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Taiwanese_Beef_Noodle_Soup.jpg/800px-Taiwanese_Beef_Noodle_Soup.jpg',
  popiah:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Popiah_2.jpg/800px-Popiah_2.jpg',
  dimSum:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Dim_sum_collection_in_lunch.jpg/800px-Dim_sum_collection_in_lunch.jpg',
  westernPlate:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Steak_frites.jpg/600px-Steak_frites.jpg',
  indianPlate:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Masala_Dosa_and_Vada.jpg/800px-Masala_Dosa_and_Vada.jpg'
}

const DEFAULT_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Maxwell_Food_Centre%2C_2024_%2811%29.jpg/800px-Maxwell_Food_Centre%2C_2024_%2811%29.jpg'

const CUISINE_IMAGE_MAP = {
  chinese: IMAGE_LIBRARY.dimSum,
  malay: IMAGE_LIBRARY.nasiLemak,
  indian: IMAGE_LIBRARY.indianPlate,
  western: IMAGE_LIBRARY.westernPlate,
  seafood: IMAGE_LIBRARY.stingray,
  fusion: IMAGE_LIBRARY.noodleBowl,
  peranakan: IMAGE_LIBRARY.laksa,
  dessert: IMAGE_LIBRARY.iceKacang,
  beverage: IMAGE_LIBRARY.coffee,
  snack: IMAGE_LIBRARY.curryPuff
}

const KEYWORD_IMAGE_MAP = [
  { pattern: /curry puff|karipap/i, url: IMAGE_LIBRARY.curryPuff },
  { pattern: /porridge|congee/i, url: IMAGE_LIBRARY.porridge },
  { pattern: /laksa/i, url: IMAGE_LIBRARY.laksa },
  { pattern: /curry/i, url: IMAGE_LIBRARY.curryRice },
  { pattern: /char\s*kway\s*teow|kuey\s*teow/i, url: IMAGE_LIBRARY.charKwayTeow },
  { pattern: /stingray/i, url: IMAGE_LIBRARY.stingray },
  { pattern: /fishball/i, url: IMAGE_LIBRARY.fishballNoodles },
  { pattern: /fish soup/i, url: IMAGE_LIBRARY.fishSoup },
  { pattern: /satay/i, url: IMAGE_LIBRARY.satay },
  { pattern: /bak\s*kut\s*teh/i, url: IMAGE_LIBRARY.bakKutTeh },
  { pattern: /bak\s*chang|zongzi|rice dumpling/i, url: IMAGE_LIBRARY.zongzi },
  { pattern: /oyster omelette|oyster cake/i, url: IMAGE_LIBRARY.oysterOmelette },
  { pattern: /nasi\s*lemak/i, url: IMAGE_LIBRARY.nasiLemak },
  { pattern: /hokkien\s*mee/i, url: IMAGE_LIBRARY.hokkienMee },
  { pattern: /lor\s*mee/i, url: IMAGE_LIBRARY.lorMee },
  { pattern: /beef\s*noodle/i, url: IMAGE_LIBRARY.beefNoodle },
  { pattern: /minced\s*meat|mee\s*pok|bak\s*chor/i, url: IMAGE_LIBRARY.mincedMeatNoodle },
  { pattern: /carrot\s*cake|chai\s*tow/i, url: IMAGE_LIBRARY.carrotCake },
  { pattern: /vada[iy]?/i, url: IMAGE_LIBRARY.vadai },
  { pattern: /kway\s*teow/i, url: IMAGE_LIBRARY.charKwayTeow },
  { pattern: /sugarcane/i, url: IMAGE_LIBRARY.sugarcane },
  { pattern: /soy\s*milk|soya/i, url: IMAGE_LIBRARY.soymilk },
  { pattern: /coffee|kopi/i, url: IMAGE_LIBRARY.coffee },
  { pattern: /cendol/i, url: IMAGE_LIBRARY.cendol },
  { pattern: /kacang/i, url: IMAGE_LIBRARY.iceKacang },
  { pattern: /rojak/i, url: IMAGE_LIBRARY.rojak },
  { pattern: /popiah/i, url: IMAGE_LIBRARY.popiah },
  { pattern: /duck/i, url: IMAGE_LIBRARY.roastDuck },
  { pattern: /chicken\s*wings?/i, url: IMAGE_LIBRARY.chickenWings },
  { pattern: /seafood|bbq seafood/i, url: IMAGE_LIBRARY.stingray },
  { pattern: /noodle/i, url: IMAGE_LIBRARY.noodleBowl }
]

const STALL_IMAGE_MAP = {
  'a noodle story': IMAGE_LIBRARY.noodleBowl,
  'ah chee bbq seafood': IMAGE_LIBRARY.stingray,
  'ah seng (hai nam) coffee': IMAGE_LIBRARY.coffee,
  'ah ter teochew fishball noodle': IMAGE_LIBRARY.fishballNoodles,
  'alliance seafood': IMAGE_LIBRARY.stingray,
  'amoy banana leaf curry': IMAGE_LIBRARY.curryRice,
  'amoy street fried kway teow': IMAGE_LIBRARY.charKwayTeow,
  'amoy western grill': IMAGE_LIBRARY.westernPlate,
  'bak kut teh': IMAGE_LIBRARY.bakKutTeh,
  'bbq chicken wings': IMAGE_LIBRARY.chickenWings,
  'bee heng satay': IMAGE_LIBRARY.satay,
  'beef noodle house': IMAGE_LIBRARY.beefNoodle,
  'boon tat bbq stingray': IMAGE_LIBRARY.stingray,
  'char kway teow king': IMAGE_LIBRARY.charKwayTeow,
  'coffee break': IMAGE_LIBRARY.coffee,
  'curry puff express': IMAGE_LIBRARY.curryPuff,
  'dim sum corner': IMAGE_LIBRARY.dimSum,
  'fishball noodles': IMAGE_LIBRARY.fishballNoodles,
  'fried kway teow king': IMAGE_LIBRARY.charKwayTeow,
  'fried oyster omelette': IMAGE_LIBRARY.oysterOmelette,
  'hainanese curry rice': IMAGE_LIBRARY.curryRice,
  'haji satay corner': IMAGE_LIBRARY.satay,
  'han kee fish soup': IMAGE_LIBRARY.fishSoup,
  'heng carrot cake': IMAGE_LIBRARY.carrotCake,
  'hokkien mee': IMAGE_LIBRARY.hokkienMee,
  'hong kee beef noodle': IMAGE_LIBRARY.beefNoodle,
  'hong kee dumpling': IMAGE_LIBRARY.dimSum,
  'hong kong soya sauce chicken noodle': IMAGE_LIBRARY.chickenRice,
  'hoo kee bak chang': IMAGE_LIBRARY.zongzi,
  'hup kee fried oyster omelette': IMAGE_LIBRARY.oysterOmelette,
  'ice kachang': IMAGE_LIBRARY.iceKacang,
  'j2 famous crispy curry puff': IMAGE_LIBRARY.curryPuff,
  'jit kee chicken rice': IMAGE_LIBRARY.chickenRice,
  'laksa delight': IMAGE_LIBRARY.laksa,
  'maxwell laksa': IMAGE_LIBRARY.laksa,
  'nasi lemak': IMAGE_LIBRARY.nasiLemak,
  'newton char kway teow': IMAGE_LIBRARY.charKwayTeow,
  'newton fuzhou oyster cake': IMAGE_LIBRARY.oysterOmelette,
  'newton hokkien mee': IMAGE_LIBRARY.hokkienMee,
  'newton ice kachang & chendol': IMAGE_LIBRARY.iceKacang,
  'newton rojak': IMAGE_LIBRARY.rojak,
  'newton western delights': IMAGE_LIBRARY.westernPlate,
  'old amoy chendol': IMAGE_LIBRARY.cendol,
  'pak hoi satay bee hoon': IMAGE_LIBRARY.satay,
  'pepper bowl': IMAGE_LIBRARY.westernPlate,
  'piao ji fish porridge': IMAGE_LIBRARY.porridge,
  'roast duck delight': IMAGE_LIBRARY.roastDuck,
  'rojak & popiah': IMAGE_LIBRARY.popiah,
  'satay corner': IMAGE_LIBRARY.satay,
  'seng kee mushroom minced meat noodle': IMAGE_LIBRARY.mincedMeatNoodle,
  'soon heng lor mee': IMAGE_LIBRARY.lorMee,
  'soon wah fishball kway teow mee': IMAGE_LIBRARY.fishballNoodles,
  'soya milk stall': IMAGE_LIBRARY.soymilk,
  'swee kee sugarcane juice': IMAGE_LIBRARY.sugarcane,
  'the original vadai': IMAGE_LIBRARY.vadai,
  'tian tian chicken rice': IMAGE_LIBRARY.chickenRice,
  'tkr chicken wings': IMAGE_LIBRARY.chickenWings,
  'yuan chun famous lor mee': IMAGE_LIBRARY.lorMee,
  'zhen zhen porridge': IMAGE_LIBRARY.porridge,
  'zhong zhong fine spice laksa': IMAGE_LIBRARY.laksa
}

export default {
  name: 'StallInfo',
   components: {
    NavBar
  },
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
        const stalls = await getStallsByHawkerName(this.hawkerName)
        this.stalls = this.withGeneratedImages(stalls)
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
          const stalls = await getStallsByHawkerAndCuisine(this.hawkerName, category)
          this.filteredStalls = this.withGeneratedImages(stalls)
        }
      } catch (error) {
        console.error('Error filtering stalls:', error)
      } finally {
        this.loading = false
      }
    },
    handleImageError(event) {
      // If curated image fails, hide it to show placeholder
      event.target.style.display = 'none'
    },
    goBack() {
      this.$router.push('/')
    },
    openStallDetail(stall) {
      // Navigate to menu info page
      this.$router.push({ 
        name: 'StallAction', 
        params: { stallId: stall.id }
      })
    },
    withGeneratedImages(stalls = []) {
      return stalls.map(stall => ({
        ...stall,
        image_url: stall.image_url || this.generateImageUrl(stall)
      }))
    },
    generateImageUrl(stall) {
      const normalizedName = (stall?.name || '').trim().toLowerCase()
      if (STALL_IMAGE_MAP[normalizedName]) {
        return STALL_IMAGE_MAP[normalizedName]
      }

      const descriptor = `${stall?.name || ''} ${stall?.cuisine || ''}`.toLowerCase()
      const keywordMatch = KEYWORD_IMAGE_MAP.find(entry => entry.pattern.test(descriptor))
      if (keywordMatch) {
        return keywordMatch.url
      }

      const cuisineKey = (stall?.cuisine || '').trim().toLowerCase()
      if (CUISINE_IMAGE_MAP[cuisineKey]) {
        return CUISINE_IMAGE_MAP[cuisineKey]
      }

      return DEFAULT_IMAGE
    }
  }
}
</script>

<style scoped>
.stall-info-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 2rem;
  padding-top: 0;
}

/* Header part */
.header {
  background: linear-gradient(135deg, #eeb264 0%, #da7644 80%);
  color:  white;
  padding: calc(env(safe-area-inset-top, 0px) + 1rem) 1rem 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: sticky;
  top: var(--navbar-height, 90px);
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

/*cuisine category filter*/
.category-filter {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: calc(var(--navbar-height, 90px) + 70px);
  z-index: 99;
  margin-bottom: 5rem;
}

.category-filter::-webkit-scrollbar {
  height: 4px;
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

/* Loading state part */
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

/* Stall information part */
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
    top: calc(var(--navbar-height, 90px) + 60px);
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
