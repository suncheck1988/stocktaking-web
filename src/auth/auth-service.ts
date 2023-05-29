import api from './../api'
import { UserRole } from '@/models/user'

let id = '' as string
let role = 0 as UserRole
let permissions = [] as number[]

const AuthService = {
  async auth () {
    id = ''
    role = 0
    permissions = []
    if (localStorage.accessToken) {
        try {
          const response = await api.get('v1/user/me')
          id = response.id
          role = response.role
          permissions = response?.permissions
        } catch (e) {
          return false
        }
        return true
      } else {
        localStorage.removeItem('accessToken')
        return false
      }
  },

  hasPermission (permission: number): boolean {
    return permissions.indexOf(permission) !== -1
  },

  getId (): string {
    return id;
  },

  getRole (): UserRole {
    return role;
  }
}

export default AuthService
