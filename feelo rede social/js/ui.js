const Ui = {
  // Renderiza o menu de navegação (#nav-menu) de acordo com o usuário logado.
  // Itens de administrador só são inseridos no DOM quando usuario.admin === true,
  // garantindo que usuários comuns nunca tenham acesso a esses links.
  renderizarMenu(usuario) {
    const menu = document.getElementById('nav-menu');
    if (!menu) return;
    menu.innerHTML = '';

    const itensPadrao = [
      { href: 'index.html', icon: 'bi-house-fill', label: 'Início' },
      { href: 'index.html#todos', icon: 'bi-grid-fill', label: 'Todos os Feels' },
      { href: 'index.html#destaques', icon: 'bi-star-fill', label: 'Destaques' }
    ];

    itensPadrao.forEach(item => {
      const li = document.createElement('li');
      li.className = 'nav-item';
      li.innerHTML = `<a class="nav-link" href="${item.href}"><i class="bi ${item.icon}"></i> ${item.label}</a>`;
      menu.appendChild(li);
    });

    // Item exclusivo de administrador
    if (usuario && usuario.admin) {
      const liAdmin = document.createElement('li');
      liAdmin.className = 'nav-item';
      liAdmin.innerHTML = `<a class="nav-link" href="/pages/visualizacao.html"><i class="bi bi-bar-chart-fill"></i> Visualização</a>`;
      menu.appendChild(liAdmin);
    }

    const liAuth = document.createElement('li');
    liAuth.className = 'nav-item ms-lg-2';
    if (usuario) {
      liAuth.innerHTML = `<a class="nav-link" href="#" id="link-logout"><i class="bi bi-box-arrow-right"></i> Sair (${usuario.nome})</a>`;
    } else {
      liAuth.innerHTML = `<a class="nav-link" href="/pages/login.html"><i class="bi bi-box-arrow-in-right"></i> Login</a>`;
    }
    menu.appendChild(liAuth);

    const linkLogout = document.getElementById('link-logout');
    if (linkLogout) {
      linkLogout.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
      });
    }
  },

  // Alterna o estado de "carregando" de um botão (usado ao publicar um feel)
  toggleBotaoCarregando(btn, carregando, textoPadrao) {
    if (!btn) return;
    if (carregando) {
      btn.dataset.textoOriginal = btn.dataset.textoOriginal || btn.textContent;
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Publicando...`;
    } else {
      btn.disabled = false;
      btn.textContent = textoPadrao || btn.dataset.textoOriginal || 'Enviar';
    }
  },

  exibirToast(mensagem, tipo) {
    console.log(`[${(tipo || 'info').toUpperCase()}] ${mensagem}`);
    alert(mensagem);
  }
};
