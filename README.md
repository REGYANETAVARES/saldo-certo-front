# Saldo Certo – Front-End (Contas a Pagar)

React + TypeScript + CSS, criado com Vite.

## Como rodar
1. Deixe a API (projeto `api-contas`) rodando em http://localhost:8080
2. Nesta pasta, no terminal:
   ```
   npm install
   npm run dev
   ```
3. Abra http://localhost:5173

## Organização
```
src/
  types/conta.ts            tipos dos dados da API (ContaPagar, ContaPagarForm, ErroApi)
  services/api.ts           chamadas à API REST com fetch (GET, POST, PUT, PATCH, DELETE)
  utils/formatar.ts         moeda, datas e cálculo da situação "Vencida"
  components/
    Sidebar.tsx             menu lateral
    ResumoCards.tsx         cards de total a pagar, vencidas e pagas
    FiltroSituacao.tsx      abas Todas / Pendentes / Vencidas / Pagas
    TabelaContas.tsx        tabela (vira cards no celular) + estados carregando, erro e vazio
    SeloSituacao.tsx        etiqueta colorida da situação
    FormularioConta.tsx     modal de cadastro e edição com validação
    Aviso.tsx               mensagem rápida de sucesso/erro
  pages/ContasPagarPage.tsx página que junta tudo e guarda o estado
  index.css                 identidade visual, layout e responsividade
```

## Integração com a API
O `vite.config.ts` tem um proxy: as chamadas para `/api` vão para `http://localhost:8080`.

| Ação na tela | Requisição |
|---|---|
| Abrir a página | GET /api/contas-pagar |
| Cadastrar conta | POST /api/contas-pagar |
| Editar conta | PUT /api/contas-pagar/{id} |
| Botão "Pagar" | PATCH /api/contas-pagar/{id}/pagar |
| Botão "Excluir" | DELETE /api/contas-pagar/{id} |
