import { createRouter, createWebHistory } from 'vue-router'
const HomePage = () => import('../views/HomePage.vue')
const StallInfo = () => import('../views/StallInfo.vue')
const MenuInfo = () => import('../views/Menuinfo.vue')
const Cart = () => import('../views/Cart.vue')
const Login = () => import('../views/Login.vue')
const Order = () => import('../views/Order.vue')
const HawkerActions = () => import('../views/HawkerActions.vue')
const StallAction = () => import('../views/StallAction.vue')

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
    //accordingly to stallid
    path: '/stall/:stallId',
    name: 'StallAction',
    component: StallAction,
    props: true
  },

  {
    //accordingly to stallid
    path: '/stall/:stallId/menu',
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
