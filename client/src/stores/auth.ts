import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apolloClient } from '@/apollo'
import { gql } from '@apollo/client/core'
import { useRouter } from 'vue-router'

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        firstName
        lastName
        role
      }
    }
  }
`

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      firstName
      lastName
      role
      isActive
      createdAt
    }
  }
`

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isActive?: boolean
  createdAt?: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isManager = computed(() => user.value?.role === 'MANAGER' || isAdmin.value)

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const { data } = await apolloClient.mutate({
        mutation: LOGIN_MUTATION,
        variables: { email, password },
      })

      if (data?.login) {
        token.value = data.login.token
        user.value = data.login.user
        localStorage.setItem('token', data.login.token)
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchUser() {
    if (!token.value) return

    try {
      const { data } = await apolloClient.query({
        query: ME_QUERY,
        fetchPolicy: 'network-only',
      })

      if (data?.me) {
        user.value = data.me
      }
    } catch (error) {
      console.error('Fetch user error:', error)
      logout()
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    apolloClient.clearStore()
  }

  return {
    token,
    user,
    loading,
    isAuthenticated,
    isAdmin,
    isManager,
    login,
    fetchUser,
    logout,
  }
})

