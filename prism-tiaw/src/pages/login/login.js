const API_USUARIOS = 'http://localhost:3000/usuarios';

/* ── Toast ──────────────────────── */
function showToast(msg, tipo = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  const icon = tipo === 'success' ? '✅' : tipo === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

/* ── Alternar entre aba Entrar / Criar Conta ────────────────── */
function alternarAba(aba) {
  const ehLogin = aba === 'login';
  document.getElementById('formLogin').style.display = ehLogin ? 'flex' : 'none';
  document.getElementById('formCadastro').style.display = ehLogin ? 'none' : 'flex';
  document.getElementById('tabLogin').classList.toggle('active', ehLogin);
  document.getElementById('tabCadastro').classList.toggle('active', !ehLogin);
}

/* ── Mostrar/ocultar senha ───────────────────────────────────── */
function alternarVisibilidadeSenha(inputId, botao) {
  const input = document.getElementById(inputId);
  const oculto = input.type === 'password';
  input.type = oculto ? 'text' : 'password';
  botao.textContent = oculto ? 'Ocultar' : 'Ver';
}

/* ── Helpers de erro de campo ────────────────────────────────── */
function limparErros(form) {
  form.querySelectorAll('.field-error').forEach(el => el.textContent = '');
  form.querySelectorAll('input').forEach(el => el.classList.remove('invalid'));
}
function marcarErro(inputId, erroId, msg) {
  document.getElementById(inputId)?.classList.add('invalid');
  const erro = document.getElementById(erroId);
  if (erro) erro.textContent = msg;
}
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ═══════════════════════════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════════════════════════ */
async function validarESubmeterLogin(e) {
  e.preventDefault();
  const form = document.getElementById('formLogin');
  limparErros(form);

  const email = document.getElementById('loginEmail').value.trim();
  const senha = document.getElementById('loginSenha').value;
  let valido = true;

  if (!email || !validarEmail(email)) {
    marcarErro('loginEmail', 'erroLoginEmail', 'Informe um e-mail válido.');
    valido = false;
  }
  if (!senha) {
    marcarErro('loginSenha', 'erroLoginSenha', 'Informe sua senha.');
    valido = false;
  }
  if (!valido) return;

  const btn = document.getElementById('btnEntrar');
  btn.disabled = true;
  btn.textContent = 'Entrando...';

  try {
    const res = await fetch(`${API_USUARIOS}?email=${encodeURIComponent(email)}`);
    if (!res.ok) throw new Error('Falha ao consultar usuários');
    const usuarios = await res.json();
    const usuario = usuarios.find(u => u.senha === senha);

    if (!usuario) {
      showToast('E-mail ou senha incorretos.', 'error');
      return;
    }

    const manterConectado = document.getElementById('manterConectado').checked;
    const storage = manterConectado ? localStorage : sessionStorage;
    storage.setItem('usuarioLogado', JSON.stringify({ id: usuario.id, nome: usuario.nome, email: usuario.email }));

    showToast(`Bem-vindo(a), ${usuario.nome.split(' ')[0]}! 🎉`);
    setTimeout(() => { window.location.href = 'postos.html'; }, 1000);
  } catch (err) {
    showToast('Erro ao conectar. Verifique se o JSONServer está rodando.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span class="btn-icon">🔓</span> Entrar';
  }
}

/* ═══════════════════════════════════════════════════════════════
   CADASTRO
═══════════════════════════════════════════════════════════════ */
async function validarESubmeterCadastro(e) {
  e.preventDefault();
  const form = document.getElementById('formCadastro');
  limparErros(form);

  const nome = document.getElementById('cadastroNome').value.trim();
  const email = document.getElementById('cadastroEmail').value.trim();
  const senha = document.getElementById('cadastroSenha').value;
  const confirmarSenha = document.getElementById('cadastroConfirmarSenha').value;
  let valido = true;

  if (!nome) {
    marcarErro('cadastroNome', 'erroCadastroNome', 'Informe seu nome completo.');
    valido = false;
  }
  if (!email || !validarEmail(email)) {
    marcarErro('cadastroEmail', 'erroCadastroEmail', 'Informe um e-mail válido.');
    valido = false;
  }
  if (!senha || senha.length < 6) {
    marcarErro('cadastroSenha', 'erroCadastroSenha', 'A senha deve ter ao menos 6 caracteres.');
    valido = false;
  }
  if (confirmarSenha !== senha) {
    marcarErro('cadastroConfirmarSenha', 'erroCadastroConfirmarSenha', 'As senhas não coincidem.');
    valido = false;
  }
  if (!valido) return;

  const btn = document.getElementById('btnCriarConta');
  btn.disabled = true;
  btn.textContent = 'Criando conta...';

  try {
    const existeRes = await fetch(`${API_USUARIOS}?email=${encodeURIComponent(email)}`);
    const existentes = await existeRes.json();
    if (existentes.length > 0) {
      showToast('Já existe uma conta com esse e-mail.', 'error');
      return;
    }

    await fetch(API_USUARIOS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha, dataCadastro: new Date().toISOString() })
    });

    showToast('Conta criada com sucesso! Faça login para continuar. 🎉');
    form.reset();
    alternarAba('login');
    document.getElementById('loginEmail').value = email;
  } catch (err) {
    showToast('Erro ao criar conta. Verifique se o JSONServer está rodando.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span class="btn-icon">✅</span> Criar Conta';
  }
}

/* ── Inicialização ───────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('formLogin').addEventListener('submit', validarESubmeterLogin);
  document.getElementById('formCadastro').addEventListener('submit', validarESubmeterCadastro);

  document.getElementById('btnVerSenhaLogin').addEventListener('click', function () {
    alternarVisibilidadeSenha('loginSenha', this);
  });
  document.getElementById('btnVerSenhaCadastro').addEventListener('click', function () {
    alternarVisibilidadeSenha('cadastroSenha', this);
  });

  document.getElementById('linkEsqueciSenha').addEventListener('click', e => {
    e.preventDefault();
    showToast('Funcionalidade de recuperação de senha em desenvolvimento.', 'info');
  });

  // Se já houver sessão ativa, redireciona direto
  const logado = localStorage.getItem('usuarioLogado') || sessionStorage.getItem('usuarioLogado');
  if (logado) {
    showToast('Você já está conectado, redirecionando...');
    setTimeout(() => { window.location.href = 'postos.html'; }, 800);
  }
});
