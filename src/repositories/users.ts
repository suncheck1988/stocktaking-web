import {ref} from 'vue'
import api from '../api'
import {User, UserSearchDto} from '@/models/user'

export default function useUsers() {
  const user = ref<User>()
  const users = ref<User[]>([])
  const pageCount = ref(0)

  async function fetchUsers (searchDto?: UserSearchDto): Promise<User[]> {
    const query = {
      page: searchDto?.page || 1,
      id: searchDto?.id || '',
      name: searchDto?.name || '',
      status: searchDto?.status || '',
      role: searchDto?.role || ''
    }
    const result = await api.getWithHeaders('v1/user', query)
    const data = await result.data

    users.value = data.data
    pageCount.value = data['X-Page-Count']
  }

  async function fetchUser (id: string): Promise<User> {
    user.value = await api.get('v1/user/' + id)
  }

  async function updateUser (user: User): Promise<void> {
    const data = Object.assign({}, user)
    await api.patch('v1/user/' + user.id, data)
  }

  async function blockUser (id: string): Promise<void> {
    await api.post('v1/user/' + id + '/block', null)
  }

  return {
    users,
    user,
    pageCount,
    fetchUsers,
    fetchUser,
    updateUser,
    blockUser
  }
}
