import type {
  Categoria,
  ErroApi,
  Fornecedor,
  Pagamento,
  PagamentoForm,
  QuitacaoForm,
} from '../types/conta'

// Com o proxy do Vite, "/api" é repassado para http://localhost:8080/api
const BASE_URL = '/api'

/** Erro com a mensagem (e os campos inválidos) devolvidos pela API. */
export class ApiError extends Error {
  readonly status: number
  readonly campos: Record<string, string>

  constructor(status: number, corpo: ErroApi) {
    const mensagens = Array.isArray(corpo.mensagem) ? corpo.mensagem : [corpo.mensagem]
    super(Array.isArray(corpo.mensagem) ? 'Verifique os campos informados' : corpo.mensagem)
    this.status = status
    // Erros de validação chegam como "campo: mensagem"
    this.campos = {}
    for (const texto of mensagens) {
      const separador = texto.indexOf(':')
      if (Array.isArray(corpo.mensagem) && separador > 0) {
        this.campos[texto.slice(0, separador).trim()] = texto.slice(separador + 1).trim()
      }
    }
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
    // Alteração do grupo: 502/504 = o proxy do Vite não encontrou a API (ela está desligada)
    if (resposta.status === 502 || resposta.status === 504) {
      throw new ApiError(resposta.status, { mensagem: 'A API não está respondendo. Verifique se ela está rodando.' })
    }
    const corpo = (await resposta.json().catch(() => null)) as ErroApi | null
    throw new ApiError(resposta.status, corpo ?? { mensagem: `Erro ${resposta.status} na API` })
  }

  // DELETE responde 204 (sem corpo)
  if (resposta.status === 204) {
    return undefined as T
  }
  return (await resposta.json()) as T
}

const enviar = (metodo: string, corpo?: unknown): RequestInit => ({
  method: metodo,
  body: corpo === undefined ? undefined : JSON.stringify(corpo),
})

// O título é a chave da conta e pode ter caracteres especiais, por isso vai codificado na URL
const id = (titulo: string) => `/pagamentos/${encodeURIComponent(titulo)}`

export const pagamentosApi = {
  listar: () => requisicao<Pagamento[]>('/pagamentos'),
  cadastrar: (dados: PagamentoForm) => requisicao<Pagamento>('/pagamentos', enviar('POST', dados)),
  alterar: (titulo: string, dados: PagamentoForm) => requisicao<Pagamento>(id(titulo), enviar('PUT', dados)),
  quitar: (titulo: string, dados: QuitacaoForm) => requisicao<Pagamento>(`${id(titulo)}/quitar`, enviar('PATCH', dados)),
  cancelar: (titulo: string) => requisicao<Pagamento>(`${id(titulo)}/cancelar`, enviar('PATCH')),
  excluir: (titulo: string) => requisicao<void>(id(titulo), enviar('DELETE')),
}

export const cadastrosApi = {
  fornecedores: () => requisicao<Fornecedor[]>('/fornecedores'),
  categorias: () => requisicao<Categoria[]>('/plano-contas'),
  novoFornecedor: (nome: string) => requisicao<Fornecedor>('/fornecedores', enviar('POST', { fornecedor: nome })),
  novaCategoria: (conta: string, descricao: string) =>
    requisicao<Categoria>('/plano-contas', enviar('POST', { conta, descricao })),
}