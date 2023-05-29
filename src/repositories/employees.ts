import {reactive, ref} from 'vue'
import api from '../api'
import {Employee, EmployeeDto, EmployeeSearchDto} from '@/models/employee'
import {User} from "@/models/user";
import {Client} from "@/models/client";

export default function useEmployees() {
  const employee = reactive<Employee>({
    id: '',
    user: reactive<User>({
      id: '',
      name: '',
      email: '',
      role: 0,
      status: 0,
      permissions: []
    }),
    client: reactive<Client>({
      id: '',
      user: reactive<User>({
        id: '',
        name: '',
        email: '',
        role: 0,
        status: 0,
        permissions: []
      })
    }),
    isFinanciallyResponsiblePerson: false,
  })
  const employees = ref<Employee[]>([])
  const pageCount = ref(0)

  async function fetchEmployees (searchDto?: EmployeeSearchDto): Promise<void> {
    const query = {
      page: searchDto?.page || 1,
      withoutPagination: searchDto?.withoutPagination || '',
      id: searchDto?.id || '',
      name: searchDto?.name || '',
      status: searchDto?.status || ''
    }
    const result = await api.getWithHeaders('v1/employee', query)
    const data = await result.data

    employees.value = data.data
    pageCount.value = data['X-Page-Count']
  }

  async function fetchEmployee (id: string): Promise<void> {
    await api.get('v1/employee/' + id).then(response => {
      employee.id = response.id
      employee.user.id = response.user.id
      employee.user.name = response.user.name
      employee.user.email = response.user.email
      employee.user.permissions = response.user.permissions
      employee.user.role = response.user.role
      employee.user.status = response.user.status
      employee.isFinanciallyResponsiblePerson = response.isFinanciallyResponsiblePerson
    })
  }

  async function createEmployee (employee: EmployeeDto): Promise<void> {
    const data = Object.assign({}, employee)
    await api.post('v1/auth/registration/employee/request', data)
  }

  async function updateEmployee (employee: Employee): Promise<void> {
    const data = Object.assign({}, employee)
    await api.patch('v1/employee/' + employee.id, data)
  }

  async function activateEmployee (id: string): Promise<void> {
    await api.post('v1/employee/' + id + '/active', null)
  }

  async function blockEmployee (id: string): Promise<void> {
    await api.post('v1/employee/' + id + '/block', null)
  }

  return {
    employees,
    employee,
    pageCount,
    fetchEmployees,
    fetchEmployee,
    createEmployee,
    updateEmployee,
    activateEmployee,
    blockEmployee
  }
}
