const API_URL = 'http://localhost:3000';
let listaBeneficiosDisponiveis = [];

const assistenteLogada = JSON.parse(localStorage.getItem('usuarioLogado')) || { idAssistente: "AS-001" };

// Carrega os benefícios cadastrados no banco na inicialização
async function carregarBeneficios() {
    try {
        const response = await fetch(`${API_URL}/beneficios`);
        if (!response.ok) throw new Error('Não foi possível carregar os benefícios.');
        listaBeneficiosDisponiveis = await response.json();
    } catch (error) {
        console.error('Erro ao buscar benefícios:', error);
        alert('Erro ao conectar com o json-server. Certifique-se de que ele está rodando.');
    }
}

// Retorna as opções HTML baseadas nos benefícios carregados do db.json
function gerarOpcoesBeneficios() {
    return listaBeneficiosDisponiveis
        .map(b => `<option value="${b.id}">${b.nome} (R$ ${b.valorBase.toFixed(2)})</option>`)
        .join('');
}

function converterParaBase64(arquivo) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(arquivo);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// --- GERENCIAMENTO DE BENEFÍCIOS DA FAMÍLIA ---
const containerBeneficiosFamilia = document.getElementById('container-beneficios-familia');
document.getElementById('btn-add-beneficio-familia').addEventListener('click', () => {
    const div = document.createElement('div');
    div.className = 'item-dinamico-linha';
    div.innerHTML = `
        <div style="flex: 1;">
            <select class="select-beneficio-familia" required>
                <option value="">-- Selecione um Benefício --</option>
                ${gerarOpcoesBeneficios()}
            </select>
        </div>
        <button type="button" class="btn btn-danger btn-remover">Remover</button>
    `;
    
    div.querySelector('.btn-remover').addEventListener('click', () => div.remove());
    containerBeneficiosFamilia.appendChild(div);
});

// --- GERENCIAMENTO DE MEMBROS ---
const containerMembros = document.getElementById('container-membros');
let contadorMembros = 0;

document.getElementById('btn-add-membro').addEventListener('click', () => {
    contadorMembros++;
    const idUnicoMembro = `membro-${contadorMembros}`;
    
    const card = document.createElement('div');
    card.className = 'card-dinamico';
    card.id = idUnicoMembro;
    
    card.innerHTML = `
        <div class="membro-header">
            <h4>Membro da Família</h4>
            <button type="button" class="btn btn-danger btn-remover-membro">Remover Membro</button>
        </div>
        <div class="grid-2">
            <div class="form-group">
                <label>Nome Completo *</label>
                <input type="text" class="membro-nome" required>
            </div>
            <div class="form-group">
                <label>CPF *</label>
                <input type="text" class="membro-cpf" placeholder="000.000.000-00" required>
            </div>
        </div>
        <div class="grid-3">
            <div class="form-group">
                <label>Categoria *</label>
                <select class="membro-categoria" required>
                    <option value="Dependente">Dependente</option>
                    <option value="Responsável">Responsável</option>
                </select>
            </div>
            <div class="form-group">
                <label>Data de Nascimento *</label>
                <input type="date" class="membro-dataNascimento" required>
            </div>
            <div class="form-group">
                <label>Parentesco *</label>
                <input type="text" class="membro-parentesco" placeholder="Ex: Filho, Cônjuge" required>
            </div>
        </div>
        <div class="grid-2">
            <div class="form-group">
                <label>Escolaridade *</label>
                <input type="text" class="membro-escolaridade" placeholder="Ex: Ensino Fundamental" required>
            </div>
            <div class="form-group">
                <label>Ocupação *</label>
                <input type="text" class="membro-ocupacao" placeholder="Ex: Estudante, Autônomo" required>
            </div>
        </div>
        <div class="form-group">
            <label>Foto do Membro (Anexo) *</label>
            <input type="file" class="membro-imagem-file" accept="image/*">
        </div>

        <div class="sub-secao-beneficios">
            <h5>Benefícios Individuais do Membro</h5>
            <div class="container-beneficios-individuais" style="margin-top: 0.5rem;"></div>
            <button type="button" class="btn btn-secondary btn-small btn-add-beneficio-individual" style="margin-top: 0.5rem; padding: 0.4rem 0.8rem; font-size: 0.85rem;">
                + Adicionar Benefício Individual
            </button>
        </div>
    `;

    // Ação para remover o card do membro completo
    card.querySelector('.btn-remover-membro').addEventListener('click', () => card.remove());

    // Ação para adicionar benefícios individuais dentro deste membro específico
    const containerIndividuais = card.querySelector('.container-beneficios-individuais');
    card.querySelector('.btn-add-beneficio-individual').addEventListener('click', () => {
        const linhaBen = document.createElement('div');
        linhaBen.className = 'item-dinamico-linha';
        linhaBen.innerHTML = `
            <div style="flex: 1;">
                <select class="select-beneficio-individual" required>
                    <option value="">-- Selecione um Benefício --</option>
                    ${gerarOpcoesBeneficios()}
                </select>
            </div>
            <button type="button" class="btn btn-danger btn-remover" style="padding: 0.4rem 0.8rem;">X</button>
        `;
        linhaBen.querySelector('.btn-remover').addEventListener('click', () => linhaBen.remove());
        containerIndividuais.appendChild(linhaBen);
    });

    containerMembros.appendChild(card);
});

// --- SUBMISSÃO DO FORMULÁRIO ---
document.getElementById('form-cadastro').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (containerMembros.children.length === 0) {
        alert('Por favor, adicione pelo menos um membro à família.');
        return;
    }

    // --- NOVA CAPTURA: Conversão da Foto da Família ---
    const inputFotoFamilia = document.getElementById('fotoFamiliaFile');
    let fotoFamiliaBase64 = "";

    if (inputFotoFamilia.files && inputFotoFamilia.files[0]) {
        try {
            fotoFamiliaBase64 = await converterParaBase64(inputFotoFamilia.files[0]);
        } catch (erro) {
            console.error("Erro ao processar imagem da família:", erro);
        }
    }

    // Coleta dos Benefícios da Família
    const beneficiosFamiliares = [];
    document.querySelectorAll('.select-beneficio-familia').forEach(select => {
        const idBen = select.value;
        const beneficioOriginal = listaBeneficiosDisponiveis.find(b => b.id === idBen);
        if (beneficioOriginal) {
            beneficiosFamiliares.push({
                idBeneficio: beneficioOriginal.id,
                nome: beneficioOriginal.nome,
                valor: beneficioOriginal.valorBase
            });
        }
    });

    // Coleta dos Membros e seus Benefícios Individuais (Mantendo o laço for...of que já tínhamos)
    const membros = [];
    const cardsMembros = document.querySelectorAll('.card-dinamico');
    
    for (const [index, card] of cardsMembros.entries()) {
        const beneficiosIndividuais = [];
        card.querySelectorAll('.select-beneficio-individual').forEach(select => {
            const idBen = select.value;
            const beneficioOriginal = listaBeneficiosDisponiveis.find(b => b.id === idBen);
            if (beneficioOriginal) {
                beneficiosIndividuais.push({
                    idBeneficio: beneficioOriginal.id,
                    nome: beneficioOriginal.nome,
                    valor: beneficioOriginal.valorBase
                });
            }
        });

        const inputArquivo = card.querySelector('.membro-imagem-file');
        let fotoMembroBase64 = "";

        if (inputArquivo.files && inputArquivo.files[0]) {
            try {
                fotoMembroBase64 = await converterParaBase64(inputArquivo.files[0]);
            } catch (erro) {
                console.error("Erro ao processar imagem do membro:", erro);
            }
        }

        membros.push({
            idPessoa: `PES-${Date.now()}-${index}`,
            nome: card.querySelector('.membro-nome').value,
            cpf: card.querySelector('.membro-cpf').value,
            categoria: card.querySelector('.membro-categoria').value,
            dataNascimento: card.querySelector('.membro-dataNascimento').value,
            "imagem-membro": fotoMembroBase64,
            parentesco: card.querySelector('.membro-parentesco').value,
            escolaridade: card.querySelector('.membro-escolaridade').value,
            ocupacao: card.querySelector('.membro-ocupacao').value,
            beneficiosIndividuais: beneficiosIndividuais
        });
    }

    // Montagem do Payload Final estruturado
    const novaFamilia = {
        idFamilia: `FAM-${Date.now()}`,
        nomeFamilia: document.getElementById('nomeFamilia').value,
        fotoFamilia: fotoFamiliaBase64, // <--- ATUALIZADO: Agora salva o texto Base64 da família aqui
        endereco: {
            rua: document.getElementById('rua').value,
            numero: document.getElementById('numero').value,
            bairro: document.getElementById('bairro').value,
            cidade: document.getElementById('cidade').value,
            estado: document.getElementById('estado').value.toUpperCase(),
            cep: document.getElementById('cep').value
        },
        telefone: document.getElementById('telefone').value,
        rendaFamiliar: parseFloat(document.getElementById('rendaFamiliar').value),
        assistenteSocial: {
            idAssistente: assistenteLogada.idAssistente
        },
        beneficiosFamiliares: beneficiosFamiliares,
        membros: membros
    };

    // Envio dos dados para o json-server
    try {
        const response = await fetch(`${API_URL}/familias`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novaFamilia)
        });

        if (response.ok) {
            alert('Família cadastrada com sucesso!');
            document.getElementById('form-cadastro').reset();
            containerBeneficiosFamilia.innerHTML = '';
            containerMembros.innerHTML = '';
        } else {
            throw new Error('Falha ao registrar dados no servidor.');
        }
    } catch (error) {
        console.error('Erro na submissão:', error);
        alert('Erro ao salvar os dados da família. Verifique a conexão com o json-server.');
    }
});

// Inicialização da página
carregarBeneficios();