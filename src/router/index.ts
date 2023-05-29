import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import AuthService from '../auth/auth-service'

const routes: Array<RouteRecordRaw> = [
  { path: '', redirect: { name: 'AppIndex' } },

  {
    path: '/auth',
    component: () => import(/* webpackChunkName: "auth" */ '../components/layouts/auth.vue'),
    children: [
      { path: 'login', name: 'AuthUserLogin', component: () => import(/* webpackChunkName: "auth-login-request" */ '../views/auth/user/login.vue') },

      { path: 'reset-password/request', name: 'AuthUserResetPasswordRequest', component: () => import(/* webpackChunkName: "auth-reset-password-request" */ '../views/auth/user/reset-password/request.vue') },
      { path: 'reset-password/confirm', name: 'AuthUserResetPasswordConfirm', component: () => import(/* webpackChunkName: "auth-reset-password-confirm" */ '../views/auth/user/reset-password/confirm.vue') },

      { path: 'registration/request', name: 'AuthRegistrationRequest', component: () => import(/* webpackChunkName: "auth-registration-request" */ '../views/auth/registration/request.vue') },
      { path: 'registration/confirm', name: 'AuthRegistrationConfirm', component: () => import(/* webpackChunkName: "auth-registration-confirm" */ '../views/auth/registration/confirm.vue') },
      { path: 'registration/recreate-email-confirm', name: 'AuthRegistrationRecreateEmailConfirm', component: () => import(/* webpackChunkName: "auth-registration-recreate-email-confirm" */ '../views/auth/registration/recreate-email-confirm.vue') },
    ]
  },

  {
    path: '/app',
    component: () => import(/* webpackChunkName: "app-" */ '../components/layouts/app.vue'),
    children: [
      { path: '', name: 'AppIndex', component: () => import(/* webpackChunkName: "app-index" */ '../views/app/index.vue') },

      { path: 'employee', name: 'AppEmployeeIndex', component: () => import(/* webpackChunkName: "app-employee-index" */ '../views/app/employee/index.vue') },
      { path: 'employee/create', name: 'AppEmployeeCreate', component: () => import(/* webpackChunkName: "app-employee-create" */ '../views/app/employee/create.vue') },
      { path: 'employee/:id/update', name: 'AppEmployeeUpdate', component: () => import(/* webpackChunkName: "app-employee-update" */ '../views/app/employee/update.vue') },

      { path: 'counterparty', name: 'AppCounterpartyIndex', component: () => import(/* webpackChunkName: "app-counterparty-index" */ '../views/app/counterparty/index.vue') },
      { path: 'counterparty/create', name: 'AppCounterpartyCreate', component: () => import(/* webpackChunkName: "app-counterparty-create" */ '../views/app/counterparty/create.vue') },
      { path: 'counterparty/:id/update', name: 'AppCounterpartyUpdate', component: () => import(/* webpackChunkName: "app-counterparty-update" */ '../views/app/counterparty/update.vue') },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env["BASE_URL"]),
  routes
})

router.beforeEach(async (to, from, next) => {
  if (
    to.name === 'AuthUserLogin'
    || to.name === 'AuthRegistrationRequest'
    || to.name === 'AuthRegistrationConfirm'
    || to.name === 'AuthRegistrationRecreateEmailConfirm'
    || to.name === 'AuthUserResetPasswordRequest'
    || to.name === 'AuthUserResetPasswordConfirm'
  ) {
    next()
  } else {
    if (await AuthService.auth()) {
      next()
    } else {
      next({ name: 'AuthUserLogin' })
    }
  }
})

export default router
