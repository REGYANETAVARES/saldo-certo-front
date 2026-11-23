// Tipos que representam os dados da API do Projeto Integrador (Contas a Pagar e a Receber).

/** Situação devolvida pela API. "VENCIDA" é calculada pela própria API a partir do vencimento. */
export type StatusConta = 'ABERTA' | 'VENCIDA' | 'PAGA' | 'CANCELADA'

/** Filtro escolhido pelo usuário na lista. */
export type Filtro = 'TODAS' | StatusConta

export type FormaPagamento = 'DINHEIRO' | 'PIX' | 'BOLETO' | 'CARTAO' | 'CHEQUE' | 'TRANSFERENCIA' | 'OUTRA'

/** Conta a pagar como a API devolve em GET /api/pagamentos. Datas chegam como "AAAA-MM-DD". */
export interface Pagamento {
  titulo: string
  descricao: string
  fornecedorId: number
  categoriaId: number
  cgc: string | null
  valor: number
  emissao: string
  vencto: string
  observacoes: string | null
  status: StatusConta
  pagto: string | null
  formaPagamento: FormaPagamento | null
  valorQuitado: number | null
}

/** Dados enviados para cadastrar (POST) ou alterar (PUT) uma conta a pagar. */
export interface PagamentoForm {
  titulo: string
  descricao: string
  fornecedorId: number
  categoriaId: number
  valor: number
  emissao: string
  vencto: string
  observacoes: string | null
}

/** Corpo do PATCH /api/pagamentos/{titulo}/quitar */
export interface QuitacaoForm {
  data: string
  formaPagamento: FormaPagamento
}

/** Fornecedor (GET /api/fornecedores). */
export interface Fornecedor {
  registro: number
  fornecedor: string
  cgc: string | null
}

/** Categoria do plano de contas (GET /api/plano-contas). */
export interface Categoria {
  planoContas: number
  conta: string
  descricao: string | null
}

/** Formato dos erros da API: "mensagem" pode ser um texto ou uma lista "campo: mensagem". */
export interface ErroApi {
  status?: number
  erro?: string
  mensagem: string | string[]
}
