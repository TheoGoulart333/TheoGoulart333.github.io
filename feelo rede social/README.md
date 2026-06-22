# Feelo — Share What You Feel

Projeto acadêmico desenvolvido para a disciplina de **Desenvolvimento de Interfaces Web (DIW)** do curso de Engenharia de Software na **PUC Minas**.

## Dados do Aluno

* **Nome:** Theo Goulart
* **Curso:** Engenharia de Software
* **Instituição:** PUC Minas

## Descrição do Projeto

O **Feelo** é uma rede social focada no compartilhamento de emoções e estados de espírito. O sistema conta com autenticação de usuários, feed interativo e visualização de dados.

## Como Executar o Projeto

### Pré-requisitos

* Node.js instalado

### Passo a Passo

1. **Inicie o JSON Server** (necessário para Login e Feed).
   Na pasta raiz do projeto, execute:

   ```bash
   npx json-server --watch db.json --port 3000
   ```

2. **Inicie o servidor de arquivos.**
   Em um novo terminal, na pasta raiz, execute:

   ```bash
   npx serve .
   ```

3. **Acesse no navegador:**

   ```
   http://localhost:3000/pages/login.html
   ```

## Funcionalidades e Estrutura

### Páginas Disponíveis

| Página | Descrição |
|---|---|
| `/pages/login.html` | Tela de entrada (Autenticação) |
| `/pages/index.html` | Feed principal |
| `/pages/visualizacao.html` | Visualização de dados com Chart.js |
| `/pages/detalhes.html` | Detalhes de um feel |

### Autenticação

O projeto utiliza `sessionStorage` para persistir o estado do usuário logado. A validação é feita consultando a rota `/usuarios` do JSON Server.

### Visualização de Dados

A página `visualizacao.html` utiliza **Chart.js** com gráficos interativos:

* Distribuição de sentimentos (Doughnut)
* Ranking de curtidas (Barras)
* Comparativo radial e métricas normalizadas (Radar/Polar)

---

© 2026 Feelo — Desenvolvido por Theo Goulart
