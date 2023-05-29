<template>
  <nav class="navbar navbar-light bg-light">
    <div class="container-fluid">
      <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="offcanvasNavbarLabel">Stocktaking</h5>
          <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
          <ul class="navbar-nav justify-content-end flex-grow-1 pe-3">
            <li class="nav-item">
              <router-link class="nav-link" :to="{ name: 'AppIndex' }">
                Домашняя страница
              </router-link>
            </li>
            <li class="nav-item" v-if="hasAccess(UserPermission.SectionEmployees)">
              <router-link class="nav-link" :to="{ name: 'AppEmployeeIndex' }">
                Сотрудники
              </router-link>
            </li>
            <li class="nav-item" v-if="hasAccess(UserPermission.SectionCounterparties)">
              <router-link class="nav-link" :to="{ name: 'AppCounterpartyIndex' }">
                Контрагенты
              </router-link>
            </li>
            <li class="nav-item" v-if="hasAccess(UserPermission.SectionCategories)">
              <router-link class="nav-link" :to="{ name: 'AppCategoryIndex' }">
                Категории
              </router-link>
            </li>
            <li class="nav-item" v-if="hasAccess(UserPermission.SectionWarehouses)">
              <router-link class="nav-link" :to="{ name: 'AppWarehouseIndex' }">
                Склады
              </router-link>
            </li>
            <li class="nav-item" v-if="hasAccess(UserPermission.SectionPositions)">
              <router-link class="nav-link" :to="{ name: 'AppPositionIndex' }">
                Позиции
              </router-link>
            </li>
            <li class="nav-item" v-if="hasAccess(UserPermission.SectionPositionUnits)">
              <router-link class="nav-link" :to="{ name: 'AppPositionUnitIndex' }">
                Единицы измерения
              </router-link>
            </li>
            <li class="nav-item" v-if="hasAccess(UserPermission.SectionVats)">
              <router-link class="nav-link" :to="{ name: 'AppVatIndex' }">
                Ставки НДС
              </router-link>
            </li>
            <li class="nav-item" v-if="hasAccess(UserPermission.SectionFixedAssets)">
              <router-link class="nav-link" :to="{ name: 'AppFixedAssetIndex' }">
                Основные средства
              </router-link>
            </li>
            <li class="nav-item" v-if="hasAccess(UserPermission.SectionDeliveryTypes)">
              <router-link class="nav-link" :to="{ name: 'AppDeliveryTypeIndex' }">
                Типы доставки
              </router-link>
            </li>
            <li class="nav-item" v-if="hasAccess(UserPermission.SectionPaymentMethods)">
              <router-link class="nav-link" :to="{ name: 'AppPaymentMethodIndex' }">
                Методы оплаты
              </router-link>
            </li>
          </ul>
          <div v-if="userId !== ''" class="mt-5">
            <button class="btn btn-outline-secondary" type="button" @click="logoutClick">Выход</button>
          </div>
        </div>
      </div>
    </div>
  </nav>
  <main class="ms-sm-auto px-md-4 pt-4">
    <router-view />
  </main>
</template>

<style lang="scss">
@import "../../scss/app";
</style>

<script>
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { Offcanvas } from 'bootstrap'
import AuthService from '../../auth/auth-service'
import LogoutService from '../../auth/logout-service'
import {UserPermission} from "@/models/user";

export default defineComponent({
  computed: {
    UserPermission() {
      return UserPermission
    }
  },
  mounted () {
    const router = useRouter()
    const collapse = new Offcanvas(document.getElementById('offcanvasNavbar'), {
      toggle: false
    })

    router.beforeEach(async (to, from, next) => {
      collapse.hide()
      next()
    })
  },
  setup () {
    const { push } = useRouter()

    const role = AuthService.getRole()
    const hasAccess = AuthService.hasPermission

    function logoutClick() {
      LogoutService.logout()
      push({ name: 'AuthUserLogin' })
    }

    return {
      role,
      logoutClick,
      hasAccess,
      userId: AuthService.getId()
    }
  }
})
</script>
