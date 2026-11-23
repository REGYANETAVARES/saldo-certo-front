import { useCallback, useEffect, useMemo, useState } from 'react'
import { Aviso, type AvisoDados } from '../components/Aviso'
import { FiltroSituacao } from '../components/FiltroSituacao'
import { FormularioConta } from '../components/FormularioConta'
import { ResumoCards } from '../components/ResumoCards'
import { TabelaContas } from '../components/TabelaContas'
import { ApiError, contasApi } from '../services/api'
import type { ContaPagar, Filtro } from '../types/conta'
import { situacaoExibida } from '../utils/formatar'

// Controle do formulário: fechado, nova conta ou editando uma conta
type EstadoFormulario = { aberto: false } | { aberto: true; conta: ContaPagar | null }

function mensagemDe(erro: unknown): string {
  return erro instanceof ApiError ? erro.message : 'Erro inesperado'
}

export function ContasPagarPage() {
  const [contas, setContas] = useState<ContaPagar[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<Filtro>('TODAS')
  const [busca, setBusca] = useState('')
  const [formulario, setFormulario] = useState<EstadoFormulario>({ aberto: false })
  const [idEmAcao, setIdEmAcao] = useState<number | null>(null)
  const [aviso, setAviso] = useState<AvisoDados | null>(null)

  // GET /api/contas-pagar
  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      setContas(await contasApi.listar())
    } catch (e) {
      setErro(mensagemDe(e))
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    void carregar()
  }, [carregar])

  // Quantidade de contas em cada filtro (aparece nas abas)
  const contagem = useMemo(() => {
    const total: Record<Filtro, number> = { TODAS: contas.length, PENDENTE: 0, VENCIDA: 0, PAGA: 0 }
    contas.forEach((c) => {
      total[situacaoExibida(c)] += 1
    })
    return total
  }, [contas])

  // Aplica o filtro de situação e a busca por texto
  const contasVisiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return contas.filter((c) => {
      const passaFiltro = filtro === 'TODAS' || situacaoExibida(c) === filtro
      const passaBusca =
        !termo || [c.descricao, c.fornecedor, c.categoria].some((t) => t.toLowerCase().includes(termo))
      return passaFiltro && passaBusca
    })
  }, [contas, filtro, busca])

  const fecharFormulario = useCallback(() => setFormulario({ aberto: false }), [])
  const limparAviso = useCallback(() => setAviso(null), [])

  // Depois de POST ou PUT: atualiza a lista sem precisar recarregar tudo
  function aoSalvar(salva: ContaPagar, editando: boolean) {
    setContas((lista) =>
      editando ? lista.map((c) => (c.id === salva.id ? salva : c)) : [...lista, salva],
    )
    setFormulario({ aberto: false })
    setAviso({ tipo: 'sucesso', texto: editando ? 'Conta atualizada' : 'Conta cadastrada' })
  }

  // PATCH /api/contas-pagar/{id}/pagar
  async function pagar(conta: ContaPagar) {
    setIdEmAcao(conta.id)
    try {
      const paga = await contasApi.pagar(conta.id)
      setContas((lista) => lista.map((c) => (c.id === paga.id ? paga : c)))
      setAviso({ tipo: 'sucesso', texto: `"${conta.descricao}" marcada como paga` })
    } catch (e) {
      setAviso({ tipo: 'erro', texto: mensagemDe(e) })
    } finally {
      setIdEmAcao(null)
    }
  }

  // DELETE /api/contas-pagar/{id}
  async function excluir(conta: ContaPagar) {
    if (!window.confirm(`Excluir a conta "${conta.descricao}"?`)) return
    setIdEmAcao(conta.id)
    try {
      await contasApi.excluir(conta.id)
      setContas((lista) => lista.filter((c) => c.id !== conta.id))
      setAviso({ tipo: 'sucesso', texto: 'Conta excluída' })
    } catch (e) {
      setAviso({ tipo: 'erro', texto: mensagemDe(e) })
    } finally {
      setIdEmAcao(null)
    }
  }

  return (
    <>
      <header className="pagina__cabecalho">
        <div>
          <p className="pagina__sobretitulo">Financeiro</p>
          <h1 className="pagina__titulo">Contas a pagar</h1>
        </div>
        <button
          type="button"
          className="botao botao--primario"
          onClick={() => setFormulario({ aberto: true, conta: null })}
        >
          + Nova conta
        </button>
      </header>

      {!carregando && !erro && <ResumoCards contas={contas} />}

      <section className="painel" aria-label="Lista de contas">
        <div className="painel__barra">
          <FiltroSituacao filtro={filtro} contagem={contagem} onMudar={setFiltro} />
          <input
            className="busca"
            type="search"
            placeholder="Buscar por descrição, fornecedor..."
            aria-label="Buscar contas"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <TabelaContas
          contas={contasVisiveis}
          carregando={carregando}
          erro={erro}
          idEmAcao={idEmAcao}
          onTentarNovamente={() => void carregar()}
          onNovaConta={() => setFormulario({ aberto: true, conta: null })}
          onEditar={(conta) => setFormulario({ aberto: true, conta })}
          onPagar={(conta) => void pagar(conta)}
          onExcluir={(conta) => void excluir(conta)}
        />
      </section>

      {formulario.aberto && (
        <FormularioConta conta={formulario.conta} onFechar={fecharFormulario} onSalvo={aoSalvar} />
      )}

      <Aviso aviso={aviso} onSumir={limparAviso} />
    </>
  )
}
