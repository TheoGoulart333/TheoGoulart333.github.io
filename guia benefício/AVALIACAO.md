# Guia-Benefício · Postos de Saúde
## Documento de Orientação de Avaliação — Sprint 1 & 2
> PUC Minas · Engenharia de Software · 2025

---

## 1. Descrição da Funcionalidade

A página **Postos de Saúde** permite que o usuário informe seu endereço e visualize uma lista de unidades de saúde pública próximas, organizada por distância. O usuário pode pesquisar, filtrar, ordenar e acessar detalhes completos de cada posto. Administradores podem realizar o CRUD completo (cadastrar, editar, excluir postos) diretamente pela interface.

---

## 2. Tecnologias Utilizadas

| Tecnologia       | Finalidade                                      |
|------------------|-------------------------------------------------|
| HTML5            | Estrutura semântica da página                   |
| CSS3             | Estilização, responsividade, animações          |
| JavaScript (ES6+)| Lógica, eventos, DOM, Fetch API, async/await    |
| JSONServer       | API REST local (CRUD de postos e usuários)      |
| Google Fonts     | Tipografia (Nunito + Inter)                     |
| ViaCEP API       | Autopreenchimento de endereço via CEP           |

---

## 3. Estrutura de Pastas

```
postos-saude/
├── postos.html       ← Página principal
├── postos.css        ← Estilos integrados ao Guia-Benefício
├── postos.js         ← Lógica JavaScript completa
├── db.json           ← Banco de dados JSONServer
└── AVALIACAO.md      ← Este documento
```

---

## 4. Estrutura de Dados (db.json)

### Coleção: `postos`
```json
{
  "id": 1,
  "nome": "UBS Vila Esperança",
  "endereco": "Rua das Flores, 123",
  "bairro": "Vila Esperança",
  "cidade": "Belo Horizonte",
  "cep": "30140-000",
  "telefone": "(31) 3277-1100",
  "horario": "Segunda a Sexta: 07h às 17h",
  "tipo": "UBS",
  "servicos": ["Clínica Geral", "Vacinação", "Pré-Natal", "Odontologia"],
  "distancia": 0.8,
  "ativo": true
}
```

### Coleção: `usuarios`
```json
{
  "id": 1,
  "nome": "Maria Silva",
  "endereco": "Rua das Acácias, 55",
  "bairro": "Centro",
  "cidade": "Belo Horizonte",
  "cep": "30120-000",
  "dataCadastro": "2025-05-01T10:00:00.000Z"
}
```

**Endpoints gerados pelo JSONServer:**
- `GET    /postos`        → lista todos
- `GET    /postos/:id`    → busca por id
- `POST   /postos`        → cadastra novo
- `PUT    /postos/:id`    → atualiza completo
- `DELETE /postos/:id`    → remove

---

## 5. Como Executar

### Pré-requisitos
- Node.js instalado
- npm ou npx disponível

### Passo a passo

```bash
# 1. Instalar JSONServer globalmente (apenas 1x)
npm install -g json-server

# 2. Entrar na pasta do projeto
cd postos-saude

# 3. Iniciar o servidor
json-server --watch db.json --port 3000

# 4. Abrir no navegador
# Abra postos.html com Live Server (VS Code) ou
# abra diretamente: postos.html
```

>  O JSONServer deve estar rodando em http://localhost:3000 antes de abrir a página.

---

## 6. Funcionalidades Implementadas

### Interface e UX
- [x] Navbar integrada ao Guia-Benefício com link ativo
- [x] Hero visual com gradiente azul/verde da identidade
- [x] Formulário de endereço com validação de campos
- [x] Autopreenchimento de endereço via ViaCEP (API externa)
- [x] Máscara automática no campo CEP
- [x] Mensagens de erro campo a campo
- [x] Loading spinner durante chamadas assíncronas
- [x] Empty state quando sem resultados
- [x] Toast notifications (sucesso, erro, info)
- [x] Responsividade completa (mobile, tablet, desktop)
- [x] Animação de entrada nos cards (fadeUp)

### CRUD Completo
- [x] **CREATE** — Modal para cadastrar novo posto
- [x] **READ** — Listagem dinâmica via Fetch GET
- [x] **UPDATE** — Modal pré-preenchido para editar
- [x] **DELETE** — Confirmação e remoção via Fetch DELETE
- [x] Atualização automática da lista após cada operação (sem F5)

### Filtros e Busca
- [x] Pesquisa dinâmica por nome e bairro (oninput)
- [x] Filtro por tipo (UBS / UPA / Centro de Saúde)
- [x] Ordenação por distância, nome A-Z, tipo
- [x] Contador de resultados em tempo real

### Modal de Detalhes
- [x] Nome, badge de tipo, endereço completo
- [x] Telefone, horário, distância, serviços como tags
- [x] Link direto para Google Maps com endereço do posto
- [x] Fechar com botão, clique fora, ou tecla ESC

### Eventos JavaScript utilizados
| Evento     | Onde                                            |
|------------|-------------------------------------------------|
| onsubmit   | Formulário de endereço e formulário de posto    |
| onclick    | Botões CRUD, fechar modais, buscar CEP          |
| oninput    | Pesquisa dinâmica, máscara CEP                  |
| onchange   | Filtros de tipo e ordenação                     |
| onload     | Inicialização, render admin grid                |
| onkeydown  | ESC fecha modais                                |
| onkeypress | Enter no campo CEP aciona busca                 |

---

## 7. Eventos e Técnicas de JavaScript Demonstradas

```javascript
// Fetch API com async/await (READ)
const res = await fetch('http://localhost:3000/postos');
const dados = await res.json();

// Fetch API com async/await (POST)
await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});

// Manipulação DOM dinâmica
const card = document.createElement('div');
card.className = 'posto-card';
card.innerHTML = `...`;
grid.appendChild(card);

// Filtro e busca em tempo real
postosFiltrados = todosPostos.filter(p =>
  p.nome.toLowerCase().includes(busca) && (tipo ? p.tipo === tipo : true)
);

// API externa (ViaCEP)
const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
```

---

## 8. Cenários de Teste

### CT-01: Buscar postos informando endereço válido
**Pré-condição:** JSONServer rodando  
**Passos:**
1. Preencher nome, CEP, endereço, bairro, cidade
2. Clicar em "Buscar Postos de Saúde"  
**Resultado esperado:** Seção de resultados aparece com cards dos postos ordenados por distância. Toast de boas-vindas exibido.

---

### CT-02: Autopreenchimento via CEP
**Passos:**
1. Digitar um CEP válido (ex: 30120-000)
2. Clicar em "Buscar" ao lado do CEP  
**Resultado esperado:** Campos endereço, bairro e cidade preenchidos automaticamente. Toast de confirmação exibido.

---

### CT-03: Validação de campos obrigatórios
**Passos:**
1. Deixar campos em branco
2. Clicar em "Buscar Postos"  
**Resultado esperado:** Mensagens de erro exibidas abaixo de cada campo inválido. Nenhuma requisição enviada.

---

### CT-04: Pesquisa dinâmica
**Passos:**
1. Após carregar postos, digitar "UPA" no campo de pesquisa  
**Resultado esperado:** Cards filtrados em tempo real, mostrando apenas postos com "UPA" no nome ou bairro. Contador atualizado.

---

### CT-05: Filtro por tipo
**Passos:**
1. Selecionar "UPA" no filtro de tipo  
**Resultado esperado:** Apenas postos do tipo UPA exibidos. Outros ocultados.

---

### CT-06: Ordenação por nome
**Passos:**
1. Selecionar "Ordenar: Nome A-Z"  
**Resultado esperado:** Cards reordenados alfabeticamente de imediato.

---

### CT-07: Cadastrar novo posto (CREATE)
**Passos:**
1. Clicar em "+ Cadastrar Posto"
2. Preencher todos os campos obrigatórios
3. Clicar em "Cadastrar Posto"  
**Resultado esperado:** Modal fecha. Toast "Posto cadastrado com sucesso". Lista atualizada automaticamente com o novo card.

---

### CT-08: Editar posto existente (UPDATE)
**Passos:**
1. Clicar no ícone ✏️ de qualquer card ou linha admin
2. Alterar o campo "Telefone"
3. Clicar em "Salvar Alterações"  
**Resultado esperado:** Modal fecha. Toast "Posto atualizado". Card mostra o novo telefone sem recarregar a página.

---

### CT-09: Excluir posto (DELETE)
**Passos:**
1. Clicar no ícone 🗑️ de qualquer posto
2. Confirmar no dialog de confirmação  
**Resultado esperado:** Toast "Posto excluído". Card removido da lista imediatamente.

---

### CT-10: Visualizar detalhes completos (Modal)
**Passos:**
1. Clicar em "Ver Detalhes" em qualquer card  
**Resultado esperado:** Modal abre com todas as informações, tags de serviços, e link para Google Maps.

---

### CT-11: Fechar modal com ESC
**Passos:**
1. Abrir qualquer modal
2. Pressionar a tecla ESC  
**Resultado esperado:** Modal fecha imediatamente.

---

### CT-12: Erro de API (JSONServer offline)
**Passos:**
1. Parar o JSONServer
2. Tentar buscar postos  
**Resultado esperado:** Toast de erro "Verifique se o JSONServer está rodando". Empty state exibido.

---

### CT-13: Responsividade mobile
**Passos:**
1. Abrir no DevTools com viewport de 375px
2. Navegar por todos os recursos  
**Resultado esperado:** Layout adapta corretamente. Menu hamburguer funciona. Cards em coluna única. Formulário em coluna única.

---

## 9. Diferenciais Implementados

| Diferencial                          | Descrição                                                    |
|--------------------------------------|--------------------------------------------------------------|
| Integração ViaCEP                    | Autopreenchimento de endereço por CEP real                   |
| Link Google Maps                     | Cada posto tem link direto para navegação                    |
| Toast system                         | Notificações não-intrusivas com tipos e auto-dismiss         |
| Animações CSS                        | Cards entram com fadeUp escalonado (animation-delay)         |
| Admin Grid separado                  | Visão tabular para gestão administrativa                     |
| Persistência de usuário              | Endereço do usuário salvo no JSONServer (/usuarios)          |
| Máscara automática                   | Campo CEP formata automaticamente enquanto digita            |
| ESC fecha modais                     | Acessibilidade e UX aprimorados                             |
| Nenhum framework                     | 100% HTML + CSS + JS puro — dentro das regras               |
| Visual integrado ao Guia-Benefício   | Mesma paleta, fontes, cards e navbar do projeto principal    |

---

## 10. Critérios da Disciplina Atendidos

| Critério Sprint 1/2             | Atendido? |
|---------------------------------|-----------|
| HTML semântico                  | ✅        |
| CSS responsivo                  | ✅        |
| JavaScript puro                 | ✅        |
| JSONServer como API REST        | ✅        |
| Fetch API                       | ✅        |
| Manipulação DOM                 | ✅        |
| CRUD completo (C/R/U/D)         | ✅        |
| Múltiplos eventos               | ✅        |
| Dados persistidos               | ✅        |
| Interface dinâmica (sem F5)     | ✅        |
| Pesquisa e filtros              | ✅        |
| Código limpo e organizado       | ✅        |
| Responsividade                  | ✅        |
| Integração visual ao projeto    | ✅        |
| Cenários de teste               | ✅        |

---

*Documento gerado para avaliação académica — PUC Minas 2025*
