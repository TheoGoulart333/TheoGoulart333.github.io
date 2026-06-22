const API_BASE = 'http://localhost:3000'

// Função que pega o ID da URL
function getBeneficioFromURL() {
    return new URLSearchParams(window.location.search).get('id');
}

function preencherLista(idElemento, lista) {
  const ul = document.getElementById(idElemento);

  ul.innerHTML = "";

  lista.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    ul.appendChild(li);
  });
}
 
/**
 *
 * @param {string} idLista     - ID do <ul> onde os checkboxes serão inseridos
 * @param {string} idBarra     - ID do <div> da barra de progresso
 * @param {string} idTexto     - ID do <span> com o texto "X de Y documentos"
 * @param {string[]} documentos - Array de strings com os nomes dos documentos
 * @param {string} prefixo     - Prefixo único para os IDs dos checkboxes 
 */

// Função que preenche o checklist
function preencherChecklist(idLista, idBarra, idTexto, documentos, prefixo) {
  const ul = document.getElementById(idLista);
  ul.innerHTML = "";
 
  documentos.forEach((doc, index) => {
    const li = document.createElement("li");
    li.classList.add("mb-2");
 
    const checkId = `${prefixo}-doc-${index}`;
 
    li.innerHTML = `
      <div class="form-check">
        <input
          class="form-check-input checklist-item"
          type="checkbox"
          id="${checkId}"
          data-lista="${idLista}"
          data-barra="${idBarra}"
          data-texto="${idTexto}"
        >
        <label class="form-check-label" for="${checkId}">
          ${doc}
        </label>
      </div>
    `;
 
    ul.appendChild(li);
  });
 
  atualizarProgresso(idLista, idBarra, idTexto, documentos.length);
 
  
  ul.querySelectorAll(".checklist-item").forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      atualizarProgresso(idLista, idBarra, idTexto, documentos.length);
    });
  });
}
 
// Funçào que atualiza barra de progresso
function atualizarProgresso(idLista, idBarra, idTexto, total) {
  const ul = document.getElementById(idLista);
  const marcados = ul.querySelectorAll(".checklist-item:checked").length;
  const porcentagem = total > 0 ? Math.round((marcados / total) * 100) : 0;
 
  const barra = document.getElementById(idBarra);
  barra.style.width = `${porcentagem}%`;
  barra.setAttribute("aria-valuenow", porcentagem);
  barra.textContent = `${porcentagem}%`;
 
  barra.classList.remove("bg-danger", "bg-warning", "bg-success");
  if (porcentagem === 100) {
    barra.classList.add("bg-success");
  } else if (porcentagem >= 50) {
    barra.classList.add("bg-warning");
  } else {
    barra.classList.add("bg-danger");
  }
 
  document.getElementById(idTexto).textContent = `${marcados} de ${total} documentos`;
}

// Funcão que carrega os dados na tela
function carregarDados(beneficio) {
  

  if (beneficio) {
    document.getElementById("nome-beneficio-mobile").textContent = beneficio.nome;
    document.getElementById("nome-beneficio-desktop").textContent = beneficio.nome;

    document.getElementById("descricao-beneficio-mobile").textContent = beneficio.descricaoCompleta;
    document.getElementById("descricao-beneficio-desktop").textContent = beneficio.descricaoCompleta;

    document.getElementById("valor-beneficio-mobile").textContent = "R$ " + beneficio.valorBase;
    document.getElementById("valor-beneficio-desktop").textContent = "R$ " + beneficio.valorBase;

    preencherLista("requisitos-beneficio-mobile", beneficio.requisitos);
    preencherLista("requisitos-beneficio-desktop", beneficio.requisitos);

    preencherLista("condicoes-beneficio-mobile", beneficio.condicoes);
    preencherLista("condicoes-beneficio-desktop", beneficio.condicoes);

    preencherChecklist(
      "documentos-checklist-mobile",   
      "barra-progresso-mobile",        
      "progresso-texto-mobile",       
      beneficio.documentos,
      "mobile"                         
    );
 
    preencherChecklist(
      "documentos-checklist-desktop",  
      "barra-progresso-desktop",       
      "progresso-texto-desktop",       
      beneficio.documentos,
      "desktop"                        
    );
  } else {
    document.getElementById("nome-beneficio-mobile").textContent = "Benefício não encontrado";
    document.getElementById("nome-beneficio-desktop").textContent = "Benefício não encontrado";
  }

}

async function inicializar() {
    const beneficioId = getBeneficioFromURL();
 
    if (!beneficioId) {
        document.getElementById('info-beneficios').innerHTML =
            '<div class="alert alert-danger"> Benefício não encontrado. Verifique o parâmetro <code>?id=</code> na URL.</div>';
        return;
    }
 
    try {
        const response = await fetch(`${API_BASE}/beneficios?id=${beneficioId}`);
        if (!response.ok) throw new Error('Benefício não encontrada.');
        const [beneficio] = await response.json();
        if (!beneficio) throw new Error('Benefício não encontrado.');
 
        carregarDados(beneficio)
 
    } catch (err) {
        console.error(err);
        document.getElementById('info-beneficios').innerHTML =
            `<div class="alert alert-danger">Erro ao carregar os dados: ${err.message}</div>`;
    }
}
 
document.addEventListener('DOMContentLoaded', inicializar);