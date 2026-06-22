// ── UTILITÁRIOS LOCAIS ────────────────────────────────────────

function gerarAvatar(iniciais, cor) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
    <circle cx="40" cy="40" r="40" fill="${cor}"/>
    <text x="40" y="46" font-family="Arial,sans-serif" font-size="26"
      font-weight="bold" text-anchor="middle" fill="#fff">${iniciais}</text>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

function formatarCurtidas(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

// ── TOGGLE CURTIDA ───────────────────────────────────────────────

function toggleLike(btn) {
  btn.classList.toggle('liked');
  const span = btn.querySelector('span');
  if (!span) return;
  const isK = span.textContent.includes('k');
  const raw = parseFloat(span.textContent.replace('k', ''));
  const base = isK ? raw * 1000 : raw;
  const next = btn.classList.contains('liked') ? base + 1 : base - 1;
  span.textContent = next >= 1000 ? (next / 1000).toFixed(1) + 'k' : next;
}

// ── RENDERIZADORES ────────────────────────────────────────────

function renderizarCarrossel(feels) {
  const destaques = feels.filter(p => p.destaque);
  const indicators = document.getElementById('carousel-indicators');
  const inner = document.getElementById('carousel-inner');
  if (!indicators || !inner) return;

  indicators.innerHTML = '';
  inner.innerHTML = '';

  destaques.forEach((post, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('data-bs-target', '#carrosselDestaques');
    btn.setAttribute('data-bs-slide-to', String(idx));
    btn.setAttribute('aria-label', 'Slide ' + (idx + 1));
    if (idx === 0) { btn.classList.add('active'); btn.setAttribute('aria-current', 'true'); }
    indicators.appendChild(btn);

    const item = document.createElement('div');
    item.className = 'carousel-item' + (idx === 0 ? ' active' : '');
    const avatarSrc = gerarAvatar(post.avatarIniciais, post.avatarCor);
    const linkDetalhe = `detalhes.html?id=${post.id}`;
    item.innerHTML = `
      <div class="carousel-slide-wrapper" style="background-image: url('${post.imagemPrincipal}');">
        <div class="carousel-overlay"></div>
        <div class="carousel-caption-custom">
          <span class="feeling-tag-carousel">${post.sentimento}</span>
          <h3 class="carousel-titulo">${post.descricao}</h3>
          <p class="carousel-texto">"${post.texto}"</p>
          <div class="carousel-author">
            <img src="${avatarSrc}" alt="${post.autor}" class="carousel-avatar">
            <div>
              <span class="author-name">${post.autor}</span>
              <span class="author-handle d-block">${post.handle} · ${post.tempo}</span>
            </div>
          </div>
          <a href="${linkDetalhe}" class="btn-feel mt-3 d-inline-block text-decoration-none">
            <i class="bi bi-arrow-right-circle me-1"></i> Ver Feel completo
          </a>
        </div>
      </div>`;
    inner.appendChild(item);
  });
}

function renderizarCards(feels) {
  const container = document.getElementById('cards-container');
  if (!container) return;
  container.innerHTML = '';

  feels.forEach(post => {
    console.log("Processando post com ID:", post.id);
    console.log("Conteúdo do post:", post);s
    const avatarSrc = gerarAvatar(post.avatarIniciais, post.avatarCor);
    const curtidas = formatarCurtidas(post.curtidas);
    const linkDetalhe = window.location.origin + '/pages/detalhes.html?id=' + post.id;

    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-md-4';
    col.innerHTML = `
      <div class="post-card h-100">
        <a href="${linkDetalhe}" class="text-decoration-none d-block">
          <img src="${post.imagemPrincipal}" alt="${post.descricao}" class="card-img" loading="lazy">
        </a>
        <div class="card-author mt-2">
          <img src="${avatarSrc}" alt="${post.autor}" class="avatar">
          <div>
            <span class="author-name">${post.autor}</span>
            <span class="author-handle d-block">${post.handle} · ${post.tempo}</span>
          </div>
          <span class="feeling-tag">${post.sentimento}</span>
        </div>
        <a href="${linkDetalhe}" class="text-decoration-none">
          <p class="card-text mt-2">"${post.texto}"</p>
        </a>
        <div class="card-actions">
          <button class="action-btn like-btn">
            <i class="bi bi-heart-fill"></i><span>${curtidas}</span>
          </button>
          <button class="action-btn">
            <i class="bi bi-chat"></i><span>${post.comentarios}</span>
          </button>
          <a href="${linkDetalhe}" class="action-btn text-decoration-none" style="color:inherit;">
            <i class="bi bi-eye"></i><span>Ver mais</span>
          </a>
        </div>
      </div>`;

    col.querySelector('.like-btn').addEventListener('click', function() {
      toggleLike(this);
    });

    container.appendChild(col);
  });
}

function renderizarDetalhes(feel) {
  const conteudoDiv = document.getElementById('detalhe-conteudo');
  if (!conteudoDiv) return;

  const avatarSrc = gerarAvatar(feel.avatarIniciais, feel.avatarCor);
  const curtidas = formatarCurtidas(feel.curtidas);
  document.title = `Feelo — ${feel.autor} · ${feel.sentimento}`;

  const fotosHTML = (feel.fotos || []).map(foto => `
    <div class="col-6 col-sm-4">
      <div class="foto-card">
        <img src="${foto.imagem}" alt="${foto.titulo}" class="foto-thumb" loading="lazy">
        <p class="foto-titulo">${foto.titulo}</p>
      </div>
    </div>`).join('');

  conteudoDiv.innerHTML = `
    <div class="detalhe-secao mb-5">
      <h2 class="secao-titulo"><i class="bi bi-person-lines-fill me-2"></i>Informações Gerais</h2>
      <div class="detalhe-hero" style="background-image: url('${feel.imagemPrincipal}');">
        <div class="detalhe-hero-overlay"></div>
        <div class="detalhe-hero-badge">${feel.sentimento}</div>
      </div>
      <div class="detalhe-info-grid mt-4">
        <div class="info-item">
          <span class="info-label"><i class="bi bi-person-fill"></i> Autor</span>
          <div class="d-flex align-items-center gap-2 mt-1">
            <img src="${avatarSrc}" alt="${feel.autor}" class="avatar-sm">
            <div>
              <strong>${feel.autor}</strong>
              <span class="author-handle d-block">${feel.handle}</span>
            </div>
          </div>
        </div>
        <div class="info-item">
          <span class="info-label"><i class="bi bi-emoji-smile"></i> Sentimento</span>
          <p class="info-value">${feel.sentimento}</p>
        </div>
        <div class="info-item">
          <span class="info-label"><i class="bi bi-clock"></i> Publicado há</span>
          <p class="info-value">${feel.tempo}</p>
        </div>
        <div class="info-item">
          <span class="info-label"><i class="bi bi-heart-fill" style="color:#f06292;"></i> Curtidas</span>
          <p class="info-value">${curtidas}</p>
        </div>
        <div class="info-item">
          <span class="info-label"><i class="bi bi-chat-dots-fill"></i> Comentários</span>
          <p class="info-value">${feel.comentarios}</p>
        </div>
        <div class="info-item">
          <span class="info-label"><i class="bi bi-star-fill" style="color:#ffd700;"></i> Destaque</span>
          <p class="info-value">${feel.destaque ? '⭐ Sim' : 'Não destacado'}</p>
        </div>
      </div>
      <div class="detalhe-conteudo-bloco mt-4">
        <span class="info-label"><i class="bi bi-file-text"></i> Feel completo</span>
        <p class="detalhe-conteudo-texto mt-2">"${feel.conteudo}"</p>
      </div>
      <div class="detalhe-acoes d-flex gap-2 flex-wrap mt-4">
        <button class="action-btn like-btn btn-feel" id="btn-curtir" style="display:flex;align-items:center;gap:6px;">
          <i class="bi bi-heart-fill"></i> Curtir
        </button>
        <button class="btn-ca" id="btn-compartilhar">
          <i class="bi bi-share"></i> Compartilhar
        </button>
      </div>
    </div>
    <div class="detalhe-secao">
      <h2 class="secao-titulo"><i class="bi bi-images me-2"></i>Fotos do Feel</h2>
      <div class="row g-3 mt-2">${fotosHTML}</div>
    </div>
    <div class="mt-5">
      <a href="/pages/index.html" style="color:var(--accent);text-decoration:none;font-size:0.9rem;">
        <i class="bi bi-arrow-left"></i> Voltar ao feed
      </a>
    </div>`;

  document.getElementById('btn-curtir').addEventListener('click', function() {
    toggleLike(this);
  });
  document.getElementById('btn-compartilhar').addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => Ui.exibirToast('Link copiado!', 'sucesso'))
      .catch(() => Ui.exibirToast('Não foi possível copiar o link.', 'erro'));
  });
}

// ── MODAL "NOVO FEEL" ──────────────────────────────────────────

function abrirModal(usuario) {
  const modal = document.getElementById('modal');
  if (!modal) return;

  const userInfo = document.getElementById('modal-user-info');
  if (userInfo && usuario) {
    const avatarSrc = gerarAvatar(
      usuario.avatarIniciais || usuario.nome.substring(0, 2).toUpperCase(),
      usuario.avatarCor || '#9b8afb'
    );
    userInfo.innerHTML = `
      <img src="${avatarSrc}" alt="${usuario.nome}" class="avatar">
      <span>${usuario.nome}</span>`;
  }

  modal.classList.add('active');
}

function fecharModal() {
  const modal = document.getElementById('modal');
  if (modal) modal.classList.remove('active');
}

// ── PUBLICAR FEEL ─────────────────────────────────────────────

async function publicarFeel(usuario, sentimento, texto) {
  if (!texto.trim()) {
    Ui.exibirToast('Escreva algo antes de publicar!', 'erro');
    return false;
  }
  if (!sentimento) {
    Ui.exibirToast('Selecione um sentimento!', 'erro');
    return false;
  }

  const novoFeel = {
    usuarioId: usuario.id,
    autor: usuario.nome,
    handle: usuario.handle || `@${usuario.nome.toLowerCase()}`,
    tempo: 'agora',
    sentimento,
    descricao: texto.substring(0, 80),
    texto,
    conteudo: texto,
    curtidas: 0,
    comentarios: 0,
    destaque: false,
    avatarIniciais: usuario.avatarIniciais || usuario.nome.substring(0, 2).toUpperCase(),
    avatarCor: usuario.avatarCor || '#9b8afb',
    imagemPrincipal: 'https://images.unsplash.com/photo-1518398046578-8cca57782e17?w=900&q=80',
    fotos: []
  };

  await Api.criarFeel(novoFeel);
  return true;
}

// ── INICIALIZAÇÃO — INDEX.HTML ────────────────────────────────

async function inicializarIndex() {
  if (!document.getElementById('cards-container')) return;

  Auth.protegerPagina();
  const usuario = Auth.usuarioLogado();

  Ui.renderizarMenu(usuario);

  // Preenche o avatar da caixa de "compor feel" (estava vazio no HTML original)
  const composeAvatar = document.getElementById('compose-avatar');
  if (composeAvatar && usuario) {
    composeAvatar.src = gerarAvatar(
      usuario.avatarIniciais || usuario.nome.substring(0, 2).toUpperCase(),
      usuario.avatarCor || '#9b8afb'
    );
  }

  try {
    const feels = await Api.getFeels();
    renderizarCarrossel(feels);
    renderizarCards(feels);
  } catch (erro) {
    Ui.exibirToast('Erro ao carregar o feed. Verifique se o JSON Server está rodando.', 'erro');
    console.error('[App] Erro ao carregar feels:', erro);
  }

  let sentimentoSelecionado = '';

  document.querySelectorAll('.feel-option').forEach(opcao => {
    opcao.addEventListener('click', () => {
      document.querySelectorAll('.feel-option').forEach(o => o.classList.remove('selected'));
      opcao.classList.add('selected');
      sentimentoSelecionado = opcao.dataset.feeling;
    });
  });

  // Qualquer um destes elementos abre o modal de publicação
  ['btn-novo-feel', 'btn-abrir-modal-emocao', 'btn-abrir-modal-foto', 'btn-abrir-modal-cs', 'compose-input']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', () => abrirModal(usuario));
    });

  document.getElementById('btn-fechar-modal')?.addEventListener('click', fecharModal);

  // Fecha o modal ao clicar fora da caixa (na sobreposição escura)
  document.getElementById('modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal') fecharModal();
  });

  const btnPublicar = document.getElementById('btn-publicar');
  if (btnPublicar) {
    btnPublicar.addEventListener('click', async () => {
      const texto = document.getElementById('post-text')?.value || '';
      Ui.toggleBotaoCarregando(btnPublicar, true, 'Publicar Feel');
      try {
        const sucesso = await publicarFeel(usuario, sentimentoSelecionado, texto);
        if (sucesso) {
          Ui.exibirToast('Feel publicado com sucesso! 🎉', 'sucesso');
          const feels = await Api.getFeels();
          renderizarCarrossel(feels);
          renderizarCards(feels);
          fecharModal();
          sentimentoSelecionado = '';
          document.querySelectorAll('.feel-option').forEach(o => o.classList.remove('selected'));
          if (document.getElementById('post-text')) document.getElementById('post-text').value = '';
        }
      } catch (erro) {
        Ui.exibirToast('Erro ao publicar. Tente novamente.', 'erro');
        console.error('[App] Erro ao publicar feel:', erro);
      } finally {
        Ui.toggleBotaoCarregando(btnPublicar, false, 'Publicar Feel');
      }
    });
  }
}

// ── INICIALIZAÇÃO — DETALHES.HTML ─────────────────────────────

async function inicializarDetalhes() {
    const container = document.getElementById('detalhe-conteudo');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');

    if (!id) {
        const urlParts = window.location.href.split('id=');
        if (urlParts.length > 1) {
            id = urlParts[1];
        }
    }

    console.log("ID capturado após tentativa dupla:", id); 

    if (!id) {
        console.error("ID não encontrado na URL");
        container.innerHTML = `<div class="text-center py-5"><p>ID inválido.</p></div>`;
        return;
    }

    try {
        const feel = await Api.buscarFeelPorId(id);
        renderizarDetalhes(feel);
    } catch (erro) {
    }
}
// ── ENTRY POINT ───────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  inicializarIndex();
  inicializarDetalhes();
});
