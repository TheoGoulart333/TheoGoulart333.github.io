/* ============================================================
   GUIA-BENEFÍCIO · POSTOS DE SAÚDE · postos.js
   CRUD completo via JSONServer (http://localhost:3000)
   Fetch API | Async/Await | DOM | Eventos
   ============================================================ */

const API_URL = 'http://localhost:3000/postos';
const API_USUARIOS = 'http://localhost:3000/usuarios';

/* ── Estado global ─────────────────────────────────────────── */
let todosPostos = [];         // cache de todos os postos
let postosFiltrados = [];     // lista após filtros/busca
let enderecoAtual = null;     // endereço preenchido pelo usuário

/* ── Utils ─────────────────────────────────────────────────── */
function formatCep(v) {
  return v.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9);
}
function tipoBadgeClass(tipo) {
  if (tipo === 'UBS') return 'badge-ubs';
  if (tipo === 'UPA') return 'badge-upa';
  return 'badge-cs';
}
function tipoCardClass(tipo) {
  if (tipo === 'UBS') return 'tipo-ubs';
  if (tipo === 'UPA') return 'tipo-upa';
  return 'tipo-cs';
}

/* ── Toast ─────────────────────────────────────────────────── */
function showToast(msg, tipo = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  const icon = tipo === 'success' ? '✅' : tipo === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

/* ── Campo errors ───────────────────────────────────────────── */
function clearErrors() {
  ['erroNome','erroCep','erroEndereco','erroBairro','erroCidade'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  ['nomeUsuario','cep','enderecoUsuario','bairroUsuario','cidadeUsuario'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('invalid');
  });
}
function showFieldError(fieldId, errorId, msg) {
  document.getElementById(fieldId)?.classList.add('invalid');
  const err = document.getElementById(errorId);
  if (err) err.textContent = msg;
}

/* ── Validação formulário de endereço ───────────────────────── */
function validarFormEndereco() {
  clearErrors();
  let valido = true;
  const nome    = document.getElementById('nomeUsuario').value.trim();
  const cep     = document.getElementById('cep').value.trim();
  const end     = document.getElementById('enderecoUsuario').value.trim();
  const bairro  = document.getElementById('bairroUsuario').value.trim();
  const cidade  = document.getElementById('cidadeUsuario').value.trim();

  if (!nome)   { showFieldError('nomeUsuario','erroNome','Informe seu nome completo.'); valido = false; }
  if (!cep || cep.replace(/\D/g,'').length < 8) {
    showFieldError('cep','erroCep','CEP inválido.'); valido = false;
  }
  if (!end)    { showFieldError('enderecoUsuario','erroEndereco','Informe o endereço.'); valido = false; }
  if (!bairro) { showFieldError('bairroUsuario','erroBairro','Informe o bairro.'); valido = false; }
  if (!cidade) { showFieldError('cidadeUsuario','erroCidade','Informe a cidade.'); valido = false; }
  return valido;
}

/* ── Busca CEP via ViaCEP ───────────────────────────────────── */
async function buscarCep(cepValue) {
  const cepLimpo = cepValue.replace(/\D/g, '');
  if (cepLimpo.length !== 8) { showToast('CEP deve ter 8 dígitos.', 'error'); return; }
  const btn = document.getElementById('btnBuscarCep');
  btn.textContent = '...';
  btn.disabled = true;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const data = await res.json();
    if (data.erro) { showToast('CEP não encontrado.', 'error'); return; }
    document.getElementById('enderecoUsuario').value = data.logradouro || '';
    document.getElementById('bairroUsuario').value   = data.bairro     || '';
    document.getElementById('cidadeUsuario').value   = data.localidade  || '';
    showToast('Endereço preenchido automaticamente! 🎉');
  } catch (e) {
    showToast('Erro ao buscar CEP. Verifique sua conexão.', 'error');
  } finally {
    btn.textContent = 'Buscar';
    btn.disabled = false;
  }
}

/* ── Salvar usuário no JSONServer ───────────────────────────── */
async function salvarUsuario(dados) {
  try {
    await fetch(API_USUARIOS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...dados, dataCadastro: new Date().toISOString() })
    });
  } catch (_) { /* silencioso */ }
}

/* ═══════════════════════════════════════════════════════════════
   CRUD DE POSTOS
═══════════════════════════════════════════════════════════════ */

/* ── READ: carregar todos os postos ─────────────────────────── */
async function carregarPostos() {
  mostrarLoading(true);
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Erro ao buscar postos');
    todosPostos = await res.json();
    aplicarFiltros();
    renderAdminGrid();
  } catch (e) {
    mostrarLoading(false);
    showToast('Erro ao carregar postos. Verifique se o JSONServer está rodando.', 'error');
    document.getElementById('emptyState').style.display = 'block';
  }
}

/* ── CREATE / UPDATE ─────────────────────────────────────────── */
async function salvarPosto(e) {
  e.preventDefault();
  const id = document.getElementById('postoId').value;
  const servicos = document.getElementById('postoServicos').value
    .split(',').map(s => s.trim()).filter(Boolean);

  const payload = {
    nome:      document.getElementById('postoNome').value.trim(),
    endereco:  document.getElementById('postoEndereco').value.trim(),
    bairro:    document.getElementById('postoBairro').value.trim(),
    cidade:    document.getElementById('postoCidade').value.trim(),
    cep:       document.getElementById('postoCep').value.trim(),
    telefone:  document.getElementById('postoTelefone').value.trim(),
    horario:   document.getElementById('postoHorario').value.trim(),
    tipo:      document.getElementById('postoTipo').value,
    distancia: parseFloat(document.getElementById('postoDistancia').value) || 0,
    servicos,
    ativo: true
  };

  // validação mínima
  if (!payload.nome || !payload.endereco || !payload.bairro || !payload.cidade || !payload.tipo) {
    showToast('Preencha todos os campos obrigatórios.', 'error');
    return;
  }

  const btnSalvar = document.getElementById('btnSalvarPosto');
  btnSalvar.textContent = 'Salvando...';
  btnSalvar.disabled = true;

  try {
    const method = id ? 'PUT' : 'POST';
    const url    = id ? `${API_URL}/${id}` : API_URL;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error();
    showToast(id ? 'Posto atualizado com sucesso! ✏️' : 'Posto cadastrado com sucesso! 🏥');
    fecharModalForm();
    await carregarPostos();
  } catch (_) {
    showToast('Erro ao salvar posto. Tente novamente.', 'error');
  } finally {
    btnSalvar.textContent = 'Salvar Posto';
    btnSalvar.disabled = false;
  }
}

/* ── DELETE ─────────────────────────────────────────────────── */
async function excluirPosto(id, nome) {
  if (!confirm(`Deseja excluir o posto "${nome}"? Esta ação não pode ser desfeita.`)) return;
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    showToast('Posto excluído com sucesso.');
    await carregarPostos();
  } catch (_) {
    showToast('Erro ao excluir posto.', 'error');
  }
}

/* ═══════════════════════════════════════════════════════════════
   RENDERIZAÇÃO
═══════════════════════════════════════════════════════════════ */

function mostrarLoading(show) {
  document.getElementById('loadingPostos').style.display = show ? 'block' : 'none';
  document.getElementById('gridPostos').style.display    = show ? 'none'  : 'grid';
}

/* ── Filtros e Ordenação ─────────────────────────────────────── */
function aplicarFiltros() {
  const busca = document.getElementById('campoPesquisa')?.value.toLowerCase() || '';
  const tipo  = document.getElementById('filtroTipo')?.value   || '';
  const ordem = document.getElementById('filtroOrdem')?.value  || 'distancia';

  postosFiltrados = todosPostos.filter(p => {
    const matchBusca = !busca || p.nome.toLowerCase().includes(busca) || p.bairro.toLowerCase().includes(busca);
    const matchTipo  = !tipo  || p.tipo === tipo;
    return matchBusca && matchTipo;
  });

  postosFiltrados.sort((a, b) => {
    if (ordem === 'distancia') return (a.distancia || 0) - (b.distancia || 0);
    if (ordem === 'nome')      return a.nome.localeCompare(b.nome);
    if (ordem === 'tipo')      return a.tipo.localeCompare(b.tipo);
    return 0;
  });

  renderCards();
}

/* ── Renderizar cards ────────────────────────────────────────── */
function renderCards() {
  mostrarLoading(false);
  const grid = document.getElementById('gridPostos');
  const counter = document.getElementById('contadorResultados');
  const empty   = document.getElementById('emptyState');

  grid.innerHTML = '';
  const total = postosFiltrados.length;
  counter.textContent = `${total} posto${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`;

  if (total === 0) { empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  postosFiltrados.forEach((posto, idx) => {
    const card = document.createElement('div');
    card.className = `posto-card ${tipoCardClass(posto.tipo)}`;
    card.style.animationDelay = `${idx * 0.05}s`;

    card.innerHTML = `
      <div class="card-top">
        <span class="card-nome">${posto.nome}</span>
        <span class="badge ${tipoBadgeClass(posto.tipo)}">${posto.tipo}</span>
      </div>
      <div class="card-info">
        <div class="card-info-row"><span>📍</span><span>${posto.endereco}, ${posto.bairro} — ${posto.cidade}</span></div>
        <div class="card-info-row"><span>📞</span><span>${posto.telefone}</span></div>
        <div class="card-info-row"><span>🕐</span><span>${posto.horario}</span></div>
      </div>
      ${posto.distancia ? `<div class="distancia-chip">📏 ${posto.distancia} km de você</div>` : ''}
      <div class="card-actions">
        <button class="btn-detalhes" onclick="abrirModalDetalhes(${posto.id})">Ver Detalhes</button>
        <button class="btn-icon-sm btn-edit"   title="Editar"  onclick="abrirModalEditar(${posto.id})">✏️</button>
        <button class="btn-icon-sm btn-delete" title="Excluir" onclick="excluirPosto(${posto.id}, '${posto.nome.replace(/'/g,"\\'")}')">🗑️</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* ── Admin Grid ─────────────────────────────────────────────── */
function renderAdminGrid() {
  const grid = document.getElementById('adminGrid');
  if (!grid) return;
  if (todosPostos.length === 0) {
    grid.innerHTML = '<p style="color:var(--gray-600);text-align:center;padding:24px">Nenhum posto cadastrado ainda.</p>';
    return;
  }
  grid.innerHTML = todosPostos.map(p => `
    <div class="admin-row">
      <span class="admin-nome">${p.nome}</span>
      <span class="admin-info">${p.bairro} · ${p.tipo}</span>
      <span class="admin-info">${p.telefone}</span>
      <div class="admin-actions">
        <button class="btn-icon-sm btn-view"   title="Detalhes" onclick="abrirModalDetalhes(${p.id})">👁️</button>
        <button class="btn-icon-sm btn-edit"   title="Editar"   onclick="abrirModalEditar(${p.id})">✏️</button>
        <button class="btn-icon-sm btn-delete" title="Excluir"  onclick="excluirPosto(${p.id}, '${p.nome.replace(/'/g,"\\'")}')">🗑️</button>
      </div>
    </div>
  `).join('');
}

/* ═══════════════════════════════════════════════════════════════
   MODAIS
═══════════════════════════════════════════════════════════════ */

/* ── Modal Detalhes ─────────────────────────────────────────── */
function abrirModalDetalhes(id) {
  const posto = todosPostos.find(p => String(p.id) === String(id));
  if (!posto) return;

  document.getElementById('modalNome').textContent      = posto.nome;
  document.getElementById('modalEndereco').textContent  = `${posto.endereco}, ${posto.bairro} — ${posto.cidade} · CEP ${posto.cep}`;
  document.getElementById('modalTelefone').textContent  = posto.telefone;
  document.getElementById('modalHorario').textContent   = posto.horario;
  document.getElementById('modalDistancia').textContent = posto.distancia ? `${posto.distancia} km de você` : 'Não informada';

  const badge = document.getElementById('modalTipoBadge');
  badge.textContent = posto.tipo;
  badge.className   = `modal-badge badge ${tipoBadgeClass(posto.tipo)}`;

  const tagsEl = document.getElementById('modalServicos');
  tagsEl.innerHTML = (posto.servicos || []).map(s => `<span class="servico-tag">${s}</span>`).join('') || '<em>Não informado</em>';

  const enderecoCod = encodeURIComponent(`${posto.nome} ${posto.endereco} ${posto.cidade}`);
  document.getElementById('modalMapsLink').href = `https://www.google.com/maps/search/?api=1&query=${enderecoCod}`;

  document.getElementById('modalDetalhes').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function fecharModalDetalhes() {
  document.getElementById('modalDetalhes').style.display = 'none';
  document.body.style.overflow = '';
}

/* ── Modal Formulário (CREATE) ───────────────────────────────── */
function abrirModalCadastrar() {
  document.getElementById('modalFormTitulo').textContent = 'Cadastrar Novo Posto';
  document.getElementById('formPosto').reset();
  document.getElementById('postoId').value = '';
  document.getElementById('btnSalvarPosto').textContent = 'Cadastrar Posto';
  document.getElementById('modalForm').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

/* ── Modal Formulário (UPDATE) ───────────────────────────────── */
function abrirModalEditar(id) {
  const posto = todosPostos.find(p => String(p.id) === String(id));
  if (!posto) return;

  document.getElementById('modalFormTitulo').textContent   = 'Editar Posto de Saúde';
  document.getElementById('postoId').value                 = posto.id;
  document.getElementById('postoNome').value               = posto.nome;
  document.getElementById('postoEndereco').value           = posto.endereco;
  document.getElementById('postoBairro').value             = posto.bairro;
  document.getElementById('postoCidade').value             = posto.cidade;
  document.getElementById('postoCep').value                = posto.cep;
  document.getElementById('postoTelefone').value           = posto.telefone;
  document.getElementById('postoHorario').value            = posto.horario;
  document.getElementById('postoTipo').value               = posto.tipo;
  document.getElementById('postoDistancia').value          = posto.distancia || '';
  document.getElementById('postoServicos').value           = (posto.servicos || []).join(', ');
  document.getElementById('btnSalvarPosto').textContent    = 'Salvar Alterações';

  document.getElementById('modalForm').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function fecharModalForm() {
  document.getElementById('modalForm').style.display = 'none';
  document.body.style.overflow = '';
}

/* ═══════════════════════════════════════════════════════════════
   EVENTOS
═══════════════════════════════════════════════════════════════ */

/* onload */
window.addEventListener('load', () => {
  renderAdminGrid(); // renderiza admin (vazio inicialmente)
});

/* Formulário de endereço onsubmit */
document.getElementById('formEndereco').addEventListener('submit', async function(e) {
  e.preventDefault();
  if (!validarFormEndereco()) return;

  enderecoAtual = {
    nome:     document.getElementById('nomeUsuario').value.trim(),
    endereco: document.getElementById('enderecoUsuario').value.trim(),
    bairro:   document.getElementById('bairroUsuario').value.trim(),
    cidade:   document.getElementById('cidadeUsuario').value.trim(),
    cep:      document.getElementById('cep').value.trim()
  };

  // Exibir seção de resultados
  document.getElementById('secaoResultados').style.display = 'block';
  document.getElementById('secaoResultados').scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Atualizar subtítulo
  document.getElementById('subtituloResultados').textContent =
    `Postos próximos a "${enderecoAtual.bairro}, ${enderecoAtual.cidade}"`;

  // Salvar usuário no JSONServer
  await salvarUsuario(enderecoAtual);

  // Carregar postos
  await carregarPostos();
  showToast(`Olá, ${enderecoAtual.nome}! Mostrando postos próximos a você. 🏥`);
});

/* Botão limpar */
document.getElementById('btnLimpar').addEventListener('click', () => {
  document.getElementById('formEndereco').reset();
  document.getElementById('secaoResultados').style.display = 'none';
  clearErrors();
});

/* Buscar CEP onclick */
document.getElementById('btnBuscarCep').addEventListener('click', () => {
  buscarCep(document.getElementById('cep').value);
});

/* CEP máscara + enter */
document.getElementById('cep').addEventListener('input', function() {
  this.value = formatCep(this.value);
});
document.getElementById('cep').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') { e.preventDefault(); buscarCep(this.value); }
});

/* Pesquisa dinâmica (input) */
document.addEventListener('input', function(e) {
  if (e.target.id === 'campoPesquisa') aplicarFiltros();
});

/* Filtros de tipo e ordem (change) */
document.addEventListener('change', function(e) {
  if (['filtroTipo','filtroOrdem'].includes(e.target.id)) aplicarFiltros();
});

/* ── Exportar CSV ───────────────────────────────────────────── */
function exportarCSV() {
  const lista = postosFiltrados.length > 0 ? postosFiltrados : todosPostos;

  if (lista.length === 0) {
    showToast('Nenhum posto para exportar.', 'error');
    return;
  }

  const colunas = ['id', 'nome', 'tipo', 'endereco', 'bairro', 'cidade', 'cep',
                   'telefone', 'horario', 'distancia', 'servicos', 'ativo'];

  const escapar = (valor) => {
    if (valor === null || valor === undefined) return '';
    const str = Array.isArray(valor) ? valor.join(' | ') : String(valor);
    // Envolver em aspas se contiver vírgula, aspas ou quebra de linha
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  const cabecalho = colunas.join(',');
  const linhas = lista.map(posto =>
    colunas.map(col => escapar(posto[col])).join(',')
  );

  const csvConteudo = [cabecalho, ...linhas].join('\n');
  const blob = new Blob(['\uFEFF' + csvConteudo], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const agora = new Date();
  const timestamp = `${agora.getFullYear()}${String(agora.getMonth()+1).padStart(2,'0')}${String(agora.getDate()).padStart(2,'0')}_${String(agora.getHours()).padStart(2,'0')}${String(agora.getMinutes()).padStart(2,'0')}`;
  const nomeArquivo = `postos_saude_${timestamp}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  const filtroAtivo = postosFiltrados.length > 0 && postosFiltrados.length < todosPostos.length;
  const msg = filtroAtivo
    ? `${lista.length} posto(s) filtrado(s) exportado(s) com sucesso! 📄`
    : `${lista.length} posto(s) exportado(s) com sucesso! 📄`;
  showToast(msg, 'success');
}

/* Botão adicionar posto */
document.getElementById('btnAdicionarPosto').addEventListener('click', abrirModalCadastrar);
document.getElementById('btnExportarCSV').addEventListener('click', exportarCSV);

/* Form posto onsubmit */
document.getElementById('formPosto').addEventListener('submit', salvarPosto);

/* Fechar modais */
document.getElementById('btnFecharModal').addEventListener('click', fecharModalDetalhes);
document.getElementById('btnFecharModalFooter').addEventListener('click', fecharModalDetalhes);
document.getElementById('btnFecharFormModal').addEventListener('click', fecharModalForm);
document.getElementById('btnCancelarForm').addEventListener('click', fecharModalForm);

/* Fechar modal clicando fora */
document.getElementById('modalDetalhes').addEventListener('click', function(e) {
  if (e.target === this) fecharModalDetalhes();
});
document.getElementById('modalForm').addEventListener('click', function(e) {
  if (e.target === this) fecharModalForm();
});

/* Fechar modal com ESC */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    fecharModalDetalhes();
    fecharModalForm();
  }
});

/* Navbar toggle mobile */
document.getElementById('navToggle')?.addEventListener('click', () => {
  document.querySelector('.nav-links')?.classList.toggle('open');
});

/* Máscara CEP no form de posto */
document.getElementById('postoCep').addEventListener('input', function() {
  this.value = formatCep(this.value);
});
