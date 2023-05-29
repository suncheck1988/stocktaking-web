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
    component: () => import('../components/layouts/app.vue'),
    children: [
      { path: '', name: 'AppIndex', component: () => import('../views/app/index.vue') },

      { path: 'employee', name: 'AppEmployeeIndex', component: () => import('../views/app/employee/index.vue') },
      { path: 'employee/create', name: 'AppEmployeeCreate', component: () => import('../views/app/employee/create.vue') },
      { path: 'employee/:id/update', name: 'AppEmployeeUpdate', component: () => import('../views/app/employee/update.vue') },

      { path: 'counterparty', name: 'AppCounterpartyIndex', component: () => import('../views/app/counterparty/index.vue') },
      { path: 'counterparty/create', name: 'AppCounterpartyCreate', component: () => import('../views/app/counterparty/create.vue') },
      { path: 'counterparty/:id/update', name: 'AppCounterpartyUpdate', component: () => import('../views/app/counterparty/update.vue') },

      { path: 'category', name: 'AppCategoryIndex', component: () => import('../views/app/category/index.vue') },
      { path: 'category/create', name: 'AppCategoryCreate', component: () => import('../views/app/category/create.vue') },
      { path: 'category/:id/update', name: 'AppCategoryUpdate', component: () => import('../views/app/category/update.vue') },

      { path: 'warehouse', name: 'AppWarehouseIndex', component: () => import('../views/app/warehouse/index.vue') },
      { path: 'warehouse/create', name: 'AppWarehouseCreate', component: () => import('../views/app/warehouse/create.vue') },
      { path: 'warehouse/:id/update', name: 'AppWarehouseUpdate', component: () => import('../views/app/warehouse/update.vue') },

      { path: 'position', name: 'AppPositionIndex', component: () => import('../views/app/position/index.vue') },
      { path: 'position/create', name: 'AppPositionCreate', component: () => import('../views/app/position/create.vue') },
      { path: 'position/:id/update', name: 'AppPositionUpdate', component: () => import('../views/app/position/update.vue') },

      { path: 'position-unit', name: 'AppPositionUnitIndex', component: () => import('../views/app/position-unit/index.vue') },
      { path: 'position-unit/create', name: 'AppPositionUnitCreate', component: () => import('../views/app/position-unit/create.vue') },
      { path: 'position-unit/:id/update', name: 'AppPositionUnitUpdate', component: () => import('../views/app/position-unit/update.vue') },

      { path: 'vat', name: 'AppVatIndex', component: () => import('../views/app/vat/index.vue') },
      { path: 'vat/create', name: 'AppVatCreate', component: () => import('../views/app/vat/create.vue') },
      { path: 'vat/:id/update', name: 'AppVatUpdate', component: () => import('../views/app/vat/update.vue') },

      { path: 'fixed-asset', name: 'AppFixedAssetIndex', component: () => import('../views/app/fixed-asset/index.vue') },
      { path: 'fixed-asset/create', name: 'AppFixedAssetCreate', component: () => import('../views/app/fixed-asset/create.vue') },
      { path: 'fixed-asset/:id/update', name: 'AppFixedAssetUpdate', component: () => import('../views/app/fixed-asset/update.vue') },

      { path: 'delivery-type', name: 'AppDeliveryTypeIndex', component: () => import('../views/app/delivery-type/index.vue') },
      { path: 'delivery-type/create', name: 'AppDeliveryTypeCreate', component: () => import('../views/app/delivery-type/create.vue') },
      { path: 'delivery-type/:id/update', name: 'AppDeliveryTypeUpdate', component: () => import('../views/app/delivery-type/update.vue') },

      { path: 'payment-method', name: 'AppPaymentMethodIndex', component: () => import('../views/app/payment-method/index.vue') },
      { path: 'payment-method/create', name: 'AppPaymentMethodCreate', component: () => import('../views/app/payment-method/create.vue') },
      { path: 'payment-method/:id/update', name: 'AppPaymentMethodUpdate', component: () => import('../views/app/payment-method/update.vue') },
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
