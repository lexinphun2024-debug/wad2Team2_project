import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'

const history = createWebHistory()
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/find-locator',
    name: 'FindLocator',
    component: () => import('../views/FIndLocator.vue')
  },
  {
    path: '/stall-info/:hawkerName',
    name: 'StallInfo',
    component: () => import('../views/StallInfo.vue'),
    props: true
  }
]

const router = createRouter({
  history,
  routes
})

export default router