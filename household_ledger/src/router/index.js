import { createRouter, createWebHistory } from 'vue-router';
// import HomeView from '../views/HomeView.vue'
import report from '@/pages/report.vue';
import inoutList from '@/pages/inOut.vue';
import addInout from '@/pages/addInout.vue';
import editInout from '@/pages/editInout.vue';
import profile from '@/pages/profile.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: '/report',
        },
        {
            path: '/report',
            component: report,
        },
        {
            path: '/inout',
            component: inoutList,
        },
        {
            path: '/inout/add',
            component: addInout,
        },
        {
            path: '/inout/edit/:id',
            component: editInout,
        },
        {
            path: '/profile',
            component: profile,
        },
    ],
});

export default router;
