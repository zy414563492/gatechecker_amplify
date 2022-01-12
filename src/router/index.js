import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import store from "../store";

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    // component: Home
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      requireAuth: false
    }
  },
]

const router = new VueRouter({
  routes
})

// 路由守卫
// router.beforeEach((to, from, next)=>{
//   if (to.matched.some(record => record.meta.requireAuth)) {
//     if (to.path === '/login') { // 如果是登录页面的话，直接next() -->解决注销后的循环执行bug
//       next();
//     } else if (to.path === '/result'){
//       if (from.path === '/login') // 否则 仅在login->result时正常执行跳转
//         next()
//       else
//         next({ path: '/login' });
//     }
//   } else {
//     next();
//   }
// })

export default router
