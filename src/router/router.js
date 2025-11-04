import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import StallInfo from '../views/StallInfo.vue'
import MenuInfo from '../views/Menuinfo.vue'
import Cart from '../views/Cart.vue'
import Login from '../views/Login.vue'
import Order from '../views/Order.vue'
import HawkerActions from '../views/HawkerActions.vue'

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
    component: () => import('../views/FindLocator.vue')
  },
  {
    path: '/hawker/:hawkerName/actions',
    name: 'HawkerActions',
    component: HawkerActions,
    props: true
  },
  {
    path: '/stall-info/:hawkerName',
    name: 'StallInfo',
    component:  StallInfo,
    props: true
  },

  {
    path: '/menu/:stallId',
    name: 'MenuInfo',
    component: MenuInfo,
    props: true
  },
  {
    path: '/cart',
    name: 'Cart',
    component:  Cart
  },

  {
    path:'/login',
    name:'Login',
    component: Login
  },

  {
    path:'/order',
    name:'Order',
    component: Order
  }


]

const router = createRouter({
  history,
  routes
})

export default router
