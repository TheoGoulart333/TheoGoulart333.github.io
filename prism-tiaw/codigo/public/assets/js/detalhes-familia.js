const API_BASE = 'http://localhost:3000';
 
function getFamiliaIdFromURL() {
    return new URLSearchParams(window.location.search).get('id');
}
 
function formatarData(dataISO) {
    if (!dataISO) return '—';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}
 
function formatarMoeda(valor) {
    if (valor === 0) return 'Gratuito';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
 
function iconeBeneficio(categoria) {
    const icones = {
        alimentacao: '🍽️', moradia: '🏠', energia: '⚡', gas: '🔥',
        assistencia: '🤝', agua: '💧', transporte: '🚌',
        cultura_transporte: '🎫', maternidade: '👶', educacao: '📚',
    };
    return icones[categoria] ?? '📋';
}
 
// Fallback com avatar de iniciais caso a imagem não carregue
function avatarUrl(nome) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=003CA3&color=fff&size=200&rounded=true`;
}
 
// Cards dos Membros 
 
function criarCardMembro(membro) {
    const imagemSrc = membro["imagem-membro"] || avatarUrl(membro.nome);
    const fallback  = avatarUrl(membro.nome);
 
    const badgeClass = membro.categoria === 'Responsável' ? 'badge-responsavel' : 'badge-dependente';
    const badgeLabel = membro.categoria === 'Responsável' ? 'Responsável' : 'Dependente';
 
    const listaBeneficios = membro.beneficiosIndividuais?.length
        ? membro.beneficiosIndividuais.map(b => `
            <li class="list-group-item d-flex justify-content-between align-items-center px-2 py-1">
                <small>${b.nome}</small>
                <span class="fw-bold text-verde ms-2">${formatarMoeda(b.valor)}</span>
            </li>`).join('')
        : '<li class="list-group-item px-2 py-1 text-muted fst-italic"><small>Nenhum benefício individual</small></li>';
 
    return `
    <div class="col">
        <div class="card h-100 shadow-sm card-hover">
            <div class="card-body d-flex gap-3">
                <div class="flex-shrink-0">
                    <img src="${imagemSrc}"
                         alt="Foto de ${membro.nome}"
                         class="foto-membro rounded-circle"
                         onerror="this.onerror=null;this.src='${fallback}'">
                </div>
                <div class="flex-grow-1 min-w-0">
                    <div class="d-flex align-items-center flex-wrap gap-2 mb-2">
                        <h6 class="mb-0 fw-bold">${membro.nome}</h6>
                        <span class="badge ${badgeClass}">${badgeLabel}</span>
                    </div>
                    <div class="row row-cols-2 g-1 small">
                        <div class="col">
                            <div class="label-detalhe">Parentesco</div>
                            <div>${membro.parentesco}</div>
                        </div>
                        <div class="col">
                            <div class="label-detalhe">Nascimento</div>
                            <div>${formatarData(membro.dataNascimento)}</div>
                        </div>
                        <div class="col">
                            <div class="label-detalhe">Escolaridade</div>
                            <div>${membro.escolaridade}</div>
                        </div>
                        <div class="col">
                            <div class="label-detalhe">Ocupação</div>
                            <div>${membro.ocupacao}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-footer bg-light px-3 pt-2 pb-3">
                <p class="label-detalhe mb-1">Benefícios individuais</p>
                <ul class="list-group list-group-flush">
                    ${listaBeneficios}
                </ul>
            </div>
        </div>
    </div>`;
}
 
function renderizarMembros(membros) {
    const container = document.getElementById('cards-membros');
    if (!container) return;
    container.className = 'row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 justify-content-center';
    container.innerHTML = membros.map(criarCardMembro).join('');
}
 
// Informações da Assistente Social
 
function renderizarAssistente(assistente) {
    const container = document.querySelector('.info-assistente-social');
    if (!container) return;
 
    const imagemSrc = assistente["imagem-assistente"] || avatarUrl(assistente.nome);
    const fallback  = avatarUrl(assistente.nome);
 
    container.className = 'info-assistente-social card shadow-sm overflow-hidden';
    container.innerHTML = `
        <div class="row g-0">
            <div class="col-md-8 d-flex align-items-center">
                <div class="p-4 p-lg-5">
                    <h2 class="fw-bold text-azul mb-3">${assistente.nome}</h2>
                    <dl class="row mb-0 small">
                        <dt class="col-sm-4 label-detalhe">CRAS / Unidade</dt>
                        <dd class="assistente-info col-sm-8">${assistente.cras}</dd>
 
                        <dt class="col-sm-4 label-detalhe">Telefone</dt>
                        <dd class="col-sm-8">
                            <a href="tel:${assistente.telefone.replace(/\D/g, '')}" class="assistente-info text-decoration-none">${assistente.telefone}</a>
                        </dd>
 
                        <dt class="col-sm-4 label-detalhe">E-mail</dt>
                        <dd class="col-sm-8">
                            <a href="mailto:${assistente.email}" class="assistente-info text-decoration-none">${assistente.email}</a>
                        </dd>
 
                        <dt class="col-sm-4 label-detalhe">Famílias</dt>
                        <dd class="assistente-info col-sm-8">${assistente['familias-assistidas'].length} assistidas</dd>
                    </dl>
                </div>
            </div>
            <div class="col-md-4 foto-assistente-wrapper">
                <img src="${imagemSrc}"
                     alt="Foto de ${assistente.nome}"
                     class="w-100 h-100 object-fit-cover"
                     onerror="this.onerror=null;this.src='${fallback}'">
            </div>
        </div>`;
}
 
// ─── SEÇÃO 3 — Benefícios da Família ────────────────────────
 
function criarCardBeneficioFamiliar(beneficio) {
    const icone = iconeBeneficio(beneficio.categoria ?? '');
 
    return `
    <div id="beneficios-familia" class="col">
        <div class="card h-100 shadow-sm card-hover">
            <div class="card-body d-flex gap-3">
                <div class="icone-beneficio flex-shrink-0">${icone}</div>
                <div class="flex-grow-1">
                    <h6 class="fw-bold mb-1">${beneficio.nome}</h6>
                    <p class="text-muted small mb-0">${beneficio.descricao ?? ''}</p>
                </div>
            </div>
            <div class="card-footer d-flex justify-content-between align-items-center bg-white border-top">
                <small class="label-detalhe">${beneficio.orgaoResponsavel ?? ''}</small>
                <span class="fw-bold text-verde fs-6">${formatarMoeda(beneficio.valorBase ?? beneficio.valor)}</span>
            </div>
        </div>
    </div>`;
}
 
async function renderizarBeneficiosFamiliares(beneficiosFamiliares) {
    const container = document.getElementById('cards-beneficios');
    if (!container) return;
 
    const detalhes = await Promise.all(
        beneficiosFamiliares.map(async (b) => {
            try {
                const res = await fetch(`${API_BASE}/beneficios?id=${b.idBeneficio}`);
                if (!res.ok) throw new Error();
                const [dados] = await res.json();
                if (!dados) throw new Error();
                return { ...dados, valor: b.valor };
            } catch {
                return { nome: b.nome, valor: b.valor, descricao: '', orgaoResponsavel: '', categoria: '' };
            }
        })
    );
 
    container.className = 'row row-cols-1 row-cols-md-2 g-4 justify-content-center';
    container.innerHTML = detalhes.map(criarCardBeneficioFamiliar).join('');
}
 
// ─── Inicialização ───────────────────────────────────────────
 
async function inicializar() {
    const familiaId = getFamiliaIdFromURL();
 
    if (!familiaId) {
        document.getElementById('info-familias').innerHTML =
            '<div class="alert alert-danger">Família não encontrada. Verifique o parâmetro <code>?id=</code> na URL.</div>';
        return;
    }
 
    try {
        const resFamilia = await fetch(`${API_BASE}/familias?idFamilia=${familiaId}`);
        if (!resFamilia.ok) throw new Error('Família não encontrada.');
        const [familia] = await resFamilia.json();
        if (!familia) throw new Error('Família não encontrada.');
 
        document.title = `${familia.nomeFamilia} — Guia-Benefício`;
 
        const idAssistente = familia.assistenteSocial?.idAssistente;
        let assistente = null;
        if (idAssistente) {
            const resAS = await fetch(`${API_BASE}/assistentes-sociais?id=${idAssistente}`);
            if (resAS.ok) {
                const [dados] = await resAS.json();
                assistente = dados ?? null;
            }
        }
 
        renderizarMembros(familia.membros ?? []);
 
        if (assistente) {
            renderizarAssistente(assistente);
        } else {
            document.querySelector('.info-assistente-social').innerHTML =
                '<div class="alert alert-secondary m-3">Nenhuma assistente social vinculada.</div>';
        }
 
        await renderizarBeneficiosFamiliares(familia.beneficiosFamiliares ?? []);
 
    } catch (err) {
        console.error(err);
        document.getElementById('info-familias').innerHTML =
            `<div class="alert alert-danger">Erro ao carregar os dados: ${err.message}</div>`;
    }
}
 
document.addEventListener('DOMContentLoaded', inicializar);


