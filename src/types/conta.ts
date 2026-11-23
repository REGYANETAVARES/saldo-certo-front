// Tipos que representam os dados trocados com a API.

/** Situação gravada no back-end. */
export type Situacao = 'PENDENTE' | 'PAGA'

/** Situação exibida na tela: "VENCIDA" é calculada no front (pendente com data passada). */
export type SituacaoExibida = Situacao | 'VENCIDA'

/** Filtro escolhido pelo usuário na lista. */
export type Filtro = 'TODAS' | SituacaoExibida

/** Conta como a API devolve (GET). Datas chegam no formato "AAAA-MM-DD". */
export interface ContaPagar {
  id: number
  descricao: string
  fornecedor: string
  categoria: string
  vencimento: string
  valor: number
  situacao: Situacao
  dataPagamento: string | null
}

/** Dados enviados para cadastrar ou alterar (POST / PUT). */
export interface ContaPagarForm {
  descricao: string
  fornecedor: string
  categoria: string
  vencimento: string
  valor: number
}

/** Formato das mensagens de erro devolvidas pela API. */
export interface ErroApi {
  mensagem: string
  campos?: Partial<Record<keyof ContaPagarForm, string>>
}
