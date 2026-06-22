const Auth = {
  // Verifica se existe usuário logado na sessão
  usuarioLogado() {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Redireciona para o login se não houver usuário logado.
  // Caminho relativo: como todas as páginas (login, index, detalhes, visualizacao)
  // vivem na mesma pasta /pages/, "login.html" funciona em qualquer uma delas.
  protegerPagina() {
    if (!this.usuarioLogado()) {
      window.location.href = '/pages/login.html';
    }
  },

  logout() {
    sessionStorage.removeItem('user');
    window.location.href = '/pages/login.html';
  }
};
