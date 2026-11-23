import type { ContaPagar, ContaPagarForm, ErroApi } from '../types/conta'

// Endereço base da API. Com o proxy do Vite, "/api" vai para http://localhost:8080/api
const BASE_URL = '/api/contas-pagar'

/** Erro com a mensagem (e os campos inválidos) que vieram da API. */
export class ApiError extends Error {
  readonly status: number
  readonly campos: ErroApi['campos']

  constructor(status: number, corpo: ErroApi) {
    super(corpo.mensagem)
    this.status = status
    this.campos = corpo.campos
  }
}

async function requisicao<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  let resposta: Response
  try {
    resposta = await fetch(BASE_URL + caminho, {
      ...opcoes,
      headers: { 'Content-Type': 'application/json', ...opcoes.headers },
    })
  } catch {
    throw new ApiError(0, { mensagem: 'Não foi possível conectar à API. Ela está rodando?' })
  }

  if (!resposta.ok) {
    const corpo = (await resposta.json().catch(() => null)) as ErroApi | null
    throw new ApiError(resposta.status, corpo ?? { mensagem: `Erro ${resposta.status} na API` })
  }

  // DELETE responde 204 (sem corpo)
  if (resposta.status === 204) {
    return undefined as T
  }
  return (await resposta.json()) as T
}

export const contasApi = {
  listar: () => requisicao<ContaPagar[]>(''),

  cadastrar: (dados: ContaPagarForm) =>
    requisicao<ContaPagar>('', { method: 'POST', body: JSON.stringify(dados) }),

  alterar: (id: number, dados: ContaPagarForm) =>
    requisicao<ContaPagar>(`/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),

  pagar: (id: number) => requisicao<ContaPagar>(`/${id}/pagar`, { method: 'PATCH' }),

  excluir: (id: number) => requisicao<void>(`/${id}`, { method: 'DELETE' }),
}
