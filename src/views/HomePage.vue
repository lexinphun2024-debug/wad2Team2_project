<template>
  <div class="d-flex flex-column min-vh-100">
    <!-- NavBar -->
    <NavBar />

    <!-- Hero Carousel with Search -->
    <div class="hero-section">
      <div id="hawkerCarousel" class="carousel slide" data-bs-ride="carousel" data-bs-interval="4000">
        <!-- Indicators -->
        <div class="carousel-indicators">
          <button data-bs-target="#hawkerCarousel" data-bs-slide-to="0" class="active"></button>
          <button data-bs-target="#hawkerCarousel" data-bs-slide-to="1"></button>
          <button data-bs-target="#hawkerCarousel" data-bs-slide-to="2"></button>
        </div>
        
        <div class="carousel-inner">
          <!-- First -->
          <div class="carousel-item active">
            <div class="carousel-image-wrapper">
              <img src="/images/hawkerimg1.jpg" class="d-block w-100" alt="hawkerimg1">
              <div class="overlay"></div>
            </div>
          </div>

          <!-- Second -->
          <div class="carousel-item">
            <div class="carousel-image-wrapper">
              <img src="/images/hawkerimg2.jpg" class="d-block w-100" alt="hawkerimg2">
              <div class="overlay"></div>
            </div>
          </div>

          <!-- Third -->
          <div class="carousel-item">
            <div class="carousel-image-wrapper">
              <img src="/images/hawkerimg3.jpg" class="d-block w-100" alt="hawkerimg3">
              <div class="overlay"></div>
            </div>
          </div>

          <!-- Content Overlay -->
          <div class="hero-content">
            <div class="container">
              <h1 class="hero-title">
                Hawker Centre Hub
              </h1>
              <p class="hero-subtitle">
                One-stop platform to find queues, seats, stalls, and nearest locations
              </p>
              
              <!-- Search Bar -->
              <HawkerSearch @search="handleSearch" />
            </div>
          </div>


        </div>
      </div>
    </div>

    <!-- Features Section -->
    <section class="features-section py-5">
      <div class="container">
        <h2 class="section-title text-center mb-4">
          Everything You Need for <br>
          <span class="highlight-text">Perfect Meal</span>
        </h2>
        <p class="section-subtitle text-center mb-5 mx-auto">
          Your comprehensive platform brings together all tools you need to discover, order, and enjoy 
          Singapore's incredible hawker food scene.
        </p>
        
        <div class="row g-4">
          <!-- Feature 1: Stall Information -->
          <div class="col-md-6">
            <div class="feature-card h-100">
              <div class="feature-icon">📋</div>
              <h3 class="feature-title">Stall Information</h3>
              <p class="feature-description">
                Access detailed information about each hawker stall instantly. View food menu that stall offered
                to make informed dining decisions
              </p>
            </div>
          </div>
          
          <!-- Feature 2: Interactive Map -->
          <div class="col-md-6">
            <div class="feature-card h-100">
              <div class="feature-icon">🗺️</div>
              <h3 class="feature-title">Interactive Map</h3>
              <p class="feature-description">
                Discover nearby hawker centres with our interactive map. Find directions, distance, and travel time instantly.
              </p>
            </div>
          </div>

          <!-- Feature 3: Smart Recommendation -->
          <div class="col-md-6">
            <div class="feature-card h-100">
              <div class="feature-icon">🤖</div>
              <h3 class="feature-title">Smart Recommendation</h3>
              <p class="feature-description">
                Receive intelligent suggestions for alternative hawker centres when your preferred location is closed for maintenance
              </p>
            </div>
          </div>

          <!-- Feature 4: Pre-Order Advance -->
          <div class="col-md-6">
            <div class="feature-card h-100">
              <div class="feature-icon">⏰</div>
              <h3 class="feature-title">Pre-Order Advance</h3>
              <p class="feature-description">
                Skip the queue by ordering your favourite dish ahead of time. Schedule pickups secure your meals
                during peak hours with our seamless pre-ordering system
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Popular Stalls Section -->
    <section class="popular-stalls-section py-5">
      <div class="container">
        <!-- Section Badge - Centered -->
        <div class="text-center mb-3">
          <div class="section-badge d-inline-flex">
            <span class="badge-icon">🏆</span>
            <span class="badge-text">Top 3 Across All Hawker Centres</span>
          </div>
        </div>

        <!-- Section Header - Centered -->
        <h2 class="popular-title text-center mb-3">
          Most Popular <span class="highlight">Food Stalls</span>
        </h2>
        <p class="popular-subtitle text-center mb-5 mx-auto">
          The highest-rated stalls island-wide with the most customer orders and rave reviews.
        </p>

        <!-- Stalls Grid - 2 per row on md/lg -->
        <div class="row g-4">
          <div class="col-12 col-md-6 col-lg-6" v-for="(stall, index) in topStalls" :key="index">
            <div class="stall-card h-100">
              <div class="stall-rank-badge">#{{ index + 1 }}</div>
              
              <div class="stall-content">
                <h3 class="stall-name">{{ stall.name }}</h3>
                <p class="stall-location">📍 {{ stall.location }}</p>
                <p class="stall-description">{{ stall.description }}</p>

                <!-- Top 3 Favorite Dishes -->
                <div class="dishes-section">
                  <div class="dishes-header">
                    <span class="trending-icon">📈</span>
                    <span class="dishes-title">Top 3 Favorite Dishes</span>
                  </div>

                  <div class="dish-list">
                    <div class="dish-item" v-for="(dish, idx) in stall.dishes" :key="idx">
                      <div class="dish-info">
                        <span class="dish-number">{{ idx + 1 }}</span>
                        <span class="dish-name">{{ dish.name }}</span>
                        <span class="dish-orders">{{ dish.orders }} orders</span>
                      </div>
                      <span class="dish-price">{{ dish.price }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Enhanced Footer -->
    <footer class="enhanced-footer mt-auto">
      <div class="footer-cta py-5">
        <div class="container text-center">
          <h2 class="cta-title mb-4">Ready to Start Your Hawker Food Journey?</h2>
          <button class="cta-button">Get Started Now</button>
        </div>
      </div>
      
      <div class="footer-stats py-5">
        <div class="container">
          <div class="row g-4">
            <div class="col-4">
              <div class="stat-card text-center">
                <div class="stat-icon">📦</div>
                <div class="stat-number">{{ stats.orders.toLocaleString() }}+</div>
                <div class="stat-label">Orders Placed</div>
              </div>
            </div>
            
            <div class="col-4">
              <div class="stat-card text-center">
                <div class="stat-icon">⭐</div>
                <div class="stat-number">{{ stats.rating }}</div>
                <div class="stat-label">App Rating</div>
              </div>
            </div>
            
            <div class="col-4">
              <div class="stat-card text-center">
                <div class="stat-icon">👥</div>
                <div class="stat-number">{{ stats.users.toLocaleString() }}+</div>
                <div class="stat-label">Users Signed Up</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom py-4 text-center">
        <div class="container">
          <p class="mb-2">Making your hawker center experience better and quick access</p>
          <p class="copyright mb-0">© 2025 EasyEat. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import HawkerSearch from '@/components/HawkerSearch.vue'

export default {
  name: 'HomePage',
  components: {
    NavBar,
    HawkerSearch
  },
  data() {
    return {
      stats: {
        orders: 125000,
        rating: 4.8,
        users: 50000
      },
      topStalls: [
        {
          name: 'Tian Tian Hainanese Chicken Rice',
          location: 'Maxwell Food Centre',
          description: 'Legendary chicken rice stall famous for its tender, succulent chicken served with fragrant rice cooked in chicken stock. A must-try for both locals and tourists.',
          dishes: [
            { name: 'Roasted Chicken Rice', price: '$4.50', orders: '2,847' },
            { name: 'Steamed Chicken Rice', price: '$4.00', orders: '2,156' },
            { name: 'Mixed Chicken Rice', price: '$5.00', orders: '1,923' }
          ]
        },
        {
          name: 'Liao Fan Hawker Chan',
          location: 'Chinatown Complex',
          description: 'Singapore\'s first Michelin-starred street food stall. Known worldwide for its incredibly flavorful soy sauce chicken with a perfect balance of sweet and savory.',
          dishes: [
            { name: 'Soy Sauce Chicken Rice', price: '$3.80', orders: '3,421' },
            { name: 'Char Siew Rice', price: '$4.50', orders: '2,654' },
            { name: 'BBQ Pork Noodles', price: '$4.00', orders: '1,876' }
          ]
        },
        {
          name: 'Hill Street Tai Hwa Pork Noodle',
          location: 'Crawford Lane',
          description: 'Award-winning Bak Chor Mee with springy noodles, minced pork, and signature chili. The first street food stall in Singapore to earn a Michelin star.',
          dishes: [
            { name: 'Minced Meat Noodle', price: '$6.00', orders: '2,234' },
            { name: 'Mushroom Minced Noodle', price: '$7.00', orders: '1,987' },
            { name: 'Special Dry Noodle', price: '$8.00', orders: '1,543' }
          ]
        }
      ]
    }
  },
  methods: {
    handleSearch(hawkerName) {
      this.$router.push({
        name: 'StallInfo',
        params: { hawkerName }
      })
    }
  }
}
</script>

<style scoped>
/* Hero Section - Bigger Height */
.hero-section {
  position: relative;
  min-height: 85vh;
  margin-bottom: 3rem;
  overflow:visible;
  /*allow dropdown to overflow*/
}

.carousel {
  height: 100%;
  overflow: visible;
  overflow: visible;
}

.carousel-inner {
  height: 85vh;
}

.carousel-item {
  height: 100%;
}

.carousel-image-wrapper {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.carousel-image-wrapper img {
  object-fit: cover;
  height: 100%;
  width: 100%;
  filter: brightness(0.85);
}

/* Lighter overlay for better text visibility */
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(255, 107, 53, 0.3) 0%,
    rgba(255, 140, 66, 0.2) 50%,
    rgba(0, 0, 0, 0.4) 100%
  );
}

/* Hero Content - More padding from top */
.hero-content {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  z-index: 10;
  text-align: center;
  padding: 0 1rem;
  overflow: visible;
  /*allow dropdown to overflow*/
}

.hero-title {
  font-family: 'Poppins', sans-serif;
  font-size: 4.5rem;
  font-weight: 800;
  color: white;
  text-shadow: 3px 3px 20px rgba(0, 0, 0, 0.6);
  margin-bottom: 1.5rem;
  animation: fadeInDown 1s ease-out;
  letter-spacing: 2px;
  padding-top: 2rem;
}

.hero-subtitle {
  font-family: 'Poppins', sans-serif;
  font-size: 1.5rem;
  color: white;
  text-shadow: 2px 2px 15px rgba(0, 0, 0, 0.6);
  margin-bottom: 3rem;
  animation: fadeInUp 1s ease-out 0.2s backwards;
  max-width: 750px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.7;
  opacity: 0.95;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.carousel-control-prev,
.carousel-control-next {
  width: 5%;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.carousel-control-prev:hover,
.carousel-control-next:hover {
  opacity: 1;
}


.carousel-indicators button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  border: 2px solid white;
  transition: all 0.3s ease;
}

.carousel-indicators button.active {
  background-color: #ff6b35;
  transform: scale(1.3);
}

/* Features Section - Fade from top */
.features-section {
  background: linear-gradient(180deg, rgba(248, 249, 250, 0.3) 0%, #ffffff 50%);
  padding: 5rem 0 !important;
}

.section-title {
  font-family: 'Poppins', sans-serif;
  font-size: 2.8rem;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1.3;
}

.highlight-text {
  background: linear-gradient(135deg, #ff8c42 0%, #ffa566 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  font-family: 'Poppins', sans-serif;
  font-size: 1.15rem;
  color: #7f8c8d;
  max-width: 800px;
  line-height: 1.7;
}

.feature-card {
  background: white;
  border-radius: 20px;
  padding: 2.5rem 2rem;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 140, 66, 0.1);
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(255, 107, 53, 0.25);
  border-color: rgba(255, 140, 66, 0.3);
}

.feature-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.feature-title {
  font-family: 'Poppins', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.feature-description {
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  color: #7f8c8d;
  line-height: 1.6;
}

/* Popular Stalls Section */
.popular-stalls-section {
  background: linear-gradient(180deg, #fff8f3 0%, #ffffff 100%);
  padding: 5rem 0 !important;
}

.section-badge {
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #ffe8d6 0%, #ffd4b3 100%);
  padding: 0.75rem 1.75rem;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(255, 140, 66, 0.2);
}

.badge-icon {
  font-size: 1.5rem;
}

.badge-text {
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: #d97556;
}

.popular-title {
  font-family: 'Poppins', sans-serif;
  font-size: 3.5rem;
  font-weight: 800;
  color: #2c3e50;
  line-height: 1.2;
}

.popular-title .highlight {
  background: linear-gradient(135deg, #ff8c42 0%, #ffa566 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.popular-subtitle {
  font-family: 'Poppins', sans-serif;
  font-size: 1.2rem;
  color: #7f8c8d;
  max-width: 800px;
}

.stall-card {
  background: white;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

.stall-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 20px 50px rgba(255, 140, 66, 0.25);
}

.stall-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, #ff8c42 0%, #ffa566 100%);
}

.stall-rank-badge {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: linear-gradient(135deg, #ffd89b 0%, #ff8c42 100%);
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Poppins', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  box-shadow: 0 4px 15px rgba(255, 140, 66, 0.4);
}

.stall-content {
  padding-top: 1rem;
}

.stall-name {
  font-family: 'Poppins', sans-serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.75rem;
  padding-right: 60px;
  line-height: 1.3;
}

.stall-location {
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  color: #ff8c42;
  font-weight: 600;
  margin-bottom: 1rem;
}

.stall-description {
  font-family: 'Poppins', sans-serif;
  font-size: 0.95rem;
  color: #7f8c8d;
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.dishes-section {
  background: #fff8f3;
  border-radius: 16px;
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.dishes-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.trending-icon {
  font-size: 1.2rem;
}

.dishes-title {
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #d97556;
}

.dish-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dish-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  border-left: 4px solid #ff8c42;
  transition: all 0.3s ease;
}

.dish-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 15px rgba(255, 140, 66, 0.15);
}

.dish-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  flex-wrap: wrap;
}

.dish-number {
  background: linear-gradient(135deg, #ff8c42 0%, #ffa566 100%);
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Poppins', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  flex-shrink: 0;
}

.dish-name {
  font-family: 'Poppins', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
  flex: 1;
  min-width: 120px;
}

.dish-orders {
  font-family: 'Poppins', sans-serif;
  font-size: 0.8rem;
  color: #95a5a6;
  font-weight: 500;
}

.dish-price {
  font-family: 'Poppins', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #d97556;
  flex-shrink: 0;
  margin-left: 1rem;
}

/* Enhanced Footer */
.footer-cta {
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
}

.cta-title {
  font-family: 'Poppins', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
}

.cta-button {
  background: white;
  color: #ff6b35;
  border: none;
  padding: 1.2rem 3rem;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  font-family: 'Poppins', sans-serif;
}

.cta-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.3);
}

.footer-stats {
  background: linear-gradient(135deg, #fff5f0 0%, #ffe8d6 100%);
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 2rem 1.5rem;
  box-shadow: 0 8px 25px rgba(255, 140, 66, 0.15);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 35px rgba(255, 140, 66, 0.25);
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.stat-number {
  font-family: 'Poppins', sans-serif;
  font-size: 2.2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-family: 'Poppins', sans-serif;
  font-size: 0.95rem;
  color: #7f8c8d;
  font-weight: 600;
}

.footer-bottom {
  background: #2c3e50;
  color: white;
}

.footer-bottom p {
  margin: 0;
  font-family: 'Poppins', sans-serif;
}

.copyright {
  font-size: 0.9rem;
  opacity: 0.7;
}

/* Responsive adjustments */
@media (max-width: 991px) {
  .hero-title {
    font-size: 3rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .carousel-inner {
    height: 75vh;
  }
  
  .section-title {
    font-size: 2.2rem;
  }
  
  .popular-title {
    font-size: 2.8rem;
  }
}

@media (max-width: 767px) {
  .hero-title {
    font-size: 2.5rem;
    padding-top: 1rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .carousel-inner {
    height: 70vh;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .popular-title {
    font-size: 2.2rem;
  }
  
  .cta-title {
    font-size: 2rem;
  }
  
  .stat-icon {
    font-size: 2rem;
  }
  
  .stat-number {
    font-size: 1.8rem;
  }
  
  .stat-label {
    font-size: 0.85rem;
  }
}

@media (max-width: 576px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }

  .dish-info{
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .dish-price{
    margin-left: 0;
  }
}

</style>
