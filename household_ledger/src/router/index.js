import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'
import report from '@/pages/report.vue'
import inoutList from '@/pages/inOut.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: "home"
    },
    {
      path: '/report',
      component: report
    },
    {
      path: '/inout',
      component: inoutList
    }
  ]
})

export default router;
