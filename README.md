# Saldo Certo – Front-End de Contas a Pagar

React + TypeScript + CSS (Vite), integrado à API REST do Projeto Integrador
(repositório GuilhermeCarrijoIF/ContasAPagar).

## 1. Subir a API do grupo (porta 8080)
No **Prompt de Comando**, dentro da pasta do projeto ContasAPagar:
```
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
```
O perfil `local` usa banco H2 em arquivo (não precisa de MySQL).
Espere aparecer "Started ContasPagarReceberApplication".

## 2. Subir o front-end (porta 5173)
Nesta pasta, no terminal do VS Code:
```
npm.cmd install
npm.cmd run dev
```
Abra http://localhost:5173

## Integração
O `vite.config.ts` repassa as chamadas `/api` para `http://localhost:8080`.

| Ação na tela | Requisição |
|---|---|
| Abrir a página | GET /api/pagamentos, GET /api/fornecedores, GET /api/plano-contas |
| Cadastrar conta | POST /api/pagamentos |
| Editar conta | PUT /api/pagamentos/{titulo} |
| Pagar | PATCH /api/pagamentos/{titulo}/quitar (data + forma de pagamento) |
| Cancelar | PATCH /api/pagamentos/{titulo}/cancelar |
| Excluir | DELETE /api/pagamentos/{titulo} |
| "+ Novo" fornecedor | POST /api/fornecedores |
| "+ Nova" categoria | POST /api/plano-contas |
