const LogoutService = {
  async logout () {
    if (localStorage.accessToken) {
        localStorage.removeItem('accessToken')
        return true
      }
  },
}

export default LogoutService
