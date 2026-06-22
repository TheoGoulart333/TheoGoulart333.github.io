// ==========================================
// 1. VARIÁVEIS GLOBAIS E DE ESTADO
// ==========================================
let beneficiosRecomendados = [];
let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
let exibindoFavoritos = false;
let infoUsuario;

// ==========================================
// 2. SELEÇÃO DE ELEMENTOS DO DOM
// ==========================================
const filtroCategoria = document.getElementById('filtro-categoria');
const ordenacao = document.getElementById('ordenacao');
const contador = document.getElementById('contador-beneficios');
const limparFiltros = document.getElementById('limpar-filtros');
const contadorFavoritos = document.getElementById('contador-favoritos');
const mostrarFavoritosBtn = document.getElementById('mostrar-favoritos');

// ==========================================
// 3. FUNÇÕES DE DADOS E API
// ==========================================
function checarSessao() {
    const usuarioSessao = localStorage.getItem("form-daniel-wizard-draft");
    if (usuarioSessao) {
        usuario = JSON.parse(usuarioSessao)
        infoUsuario = usuario.data;
        console.log(infoUsuario);
        return true;
    } else {
        return false;
    }
}
function extrairPerfisDoUsuario(usuario) {
    const perfis = [];

    const anoAtual = new Date().getFullYear();
    const idade = anoAtual - parseInt(usuario.year);

    const rendasBaixas = ["extrema", "pobreza", "meio"];
    if (rendasBaixas.includes(usuario.renda)) {
        perfis.push("BAIXA_RENDA");
    }

    if (idade >= 60) {
        perfis.push("IDOSO");
    } else if (idade >= 15 && idade <= 29) {
        perfis.push("JOVENS");
    } else if (idade >= 18 && idade < 60) {
        perfis.push("ADULTOS");
    } else if (idade <= 12) {
        // Benefícios de primeira infância geralmente vão até 6 anos, mas abrange crianças no geral
        perfis.push("CRIANCAS");
    }

    if (usuario.pcd === "sim") {
        perfis.push("PCD");
    }

    const moradiasVulneraveis = ["alugada", "cedida", "ocupada", "risco", "rua"];
    if (moradiasVulneraveis.includes(usuario.moradia)) {
        perfis.push("SEM_IMOVEL");
    }

    return perfis;
}
async function carregarBeneficios(dadosUsuario) {
    try {
        const resposta = await fetch('http://localhost:3000/beneficios');
        const beneficios = await resposta.json();

        const perfisDoUsuario = extrairPerfisDoUsuario(dadosUsuario);

        const beneficiosFiltrados = beneficios.filter(beneficio => {

            const atendePublicoAlvo = beneficio.publicoAlvo.every(perfil =>
                perfisDoUsuario.includes(perfil)
            );

            const exigeCadUnico = beneficio.requisitos.some(req =>
                req.toLowerCase().includes("cadúnico") || req.toLowerCase().includes("cadastro único")
            );

            const atendeCadUnico = exigeCadUnico ? dadosUsuario.cadunico === "sim" : true;

            return atendePublicoAlvo && atendeCadUnico;
        });

        return beneficiosFiltrados;

    } catch (erro) {
        console.error("Erro ao carregar os benefícios do servidor:", erro);
    }
}

function atualizarFavoritos() {
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    contadorFavoritos.textContent = `Favoritos: ${favoritos.length}`;
}

// ==========================================
// 4. FUNÇÕES DE RENDERIZAÇÃO E INTERFACE
// ==========================================
function renderizarCards(beneficios) {
    const container = document.querySelector('.beneficios');
    container.innerHTML = '';

    const intro = document.querySelector('.intro p');
    intro.innerHTML = `Encontramos <strong>${beneficios.length} benefícios</strong> com base no seu perfil. Clique em cada um para saber mais sobre como solicitar.`;

    beneficios.forEach(beneficio => {
        const linkDestino = `pagina-do-beneficio.html?id=${beneficio.id}`;
        const card = document.createElement('div');
        card.classList.add('card-beneficio');
        card.innerHTML = `
            <div class="card-header">
                <h2>${beneficio.nome}</h2>
                <span class="orgao">${beneficio.orgaoResponsavel}</span>
            </div>
            <p class="descricao">${beneficio.descricao}</p>
            <div class="card-footer">
            <span class="categoria">${beneficio.categoria}</span>
            ${beneficio.valorBase ? `<p class="valor">Valor Base: R$ ${beneficio.valorBase.toFixed(2)}</p>` : ''}
            </div>
            <div class=favoritar>
            <button>
            ${favoritos.includes(beneficio.id)
                ? '<img width="20" height="20" src="https://img.icons8.com/ios-filled/50/like--v1.png" alt="like--v1"/> Favoritado'
                : '<img width="20" height="20" src="https://img.icons8.com/ios/50/like--v1.png" alt="like"/> Favoritar'}
        </button>
        </div>
            <a href="detalhes-beneficio.html?id=${beneficio.id}" class="botao-azul">Mais Detalhes</a>
        `;
        container.appendChild(card);
        const botaoFavorito = card.querySelector('.favoritar');

        botaoFavorito.addEventListener('click', () => {
            if (favoritos.includes(beneficio.id)) {
                favoritos = favoritos.filter(id => id !== beneficio.id);
            } else {
                favoritos.push(beneficio.id);
            }

            atualizarFavoritos();
            filtrarBeneficios();
        });
    });
}

// ==========================================
// 5. FUNÇÕES DE LÓGICA E REGRAS DE NEGÓCIO
// ==========================================
function filtrarBeneficios() {
    let filtrados = beneficiosRecomendados;

    const textoPesquisa = pesquisa.value.toLowerCase();

    filtrados = filtrados.filter(beneficio =>
        beneficio.nome.toLowerCase().includes(textoPesquisa)
    );

    const categoriaSelecionada = filtroCategoria.value;

    if (categoriaSelecionada !== '') {
        filtrados = filtrados.filter(
            beneficio => beneficio.categoria === categoriaSelecionada
        );
    }

    if (ordenacao.value === 'maior') {
        filtrados.sort((a, b) => b.valorBase - a.valorBase);
    }

    if (ordenacao.value === 'menor') {
        filtrados.sort((a, b) => a.valorBase - b.valorBase);
    }

    if (exibindoFavoritos) {
        filtrados = filtrados.filter(
            beneficio => favoritos.includes(beneficio.id)
        );
    }

    renderizarCards(filtrados);
}

function resetarFiltros() {
    pesquisa.value = '';
    filtroCategoria.value = '';
    ordenacao.value = '';

    renderizarCards(beneficiosRecomendados);
}

// ==========================================
// 6. INICIALIZAÇÃO E EVENT LISTENERS
// ==========================================
async function inicializar() {
    checarSessao();
    beneficiosRecomendados = await carregarBeneficios(infoUsuario);
    renderizarCards(beneficiosRecomendados);
    atualizarFavoritos();
}

pesquisa.addEventListener('input', filtrarBeneficios);
filtroCategoria.addEventListener('change', filtrarBeneficios);
ordenacao.addEventListener('change', filtrarBeneficios);
limparFiltros.addEventListener('click', resetarFiltros);

mostrarFavoritosBtn.addEventListener('click', () => {
    exibindoFavoritos = !exibindoFavoritos;

    mostrarFavoritosBtn.textContent =
        exibindoFavoritos
            ? 'Mostrar Todos'
            : 'Mostrar Favoritos';

    filtrarBeneficios();
});

window.addEventListener('load', () => {
    inicializar();
});