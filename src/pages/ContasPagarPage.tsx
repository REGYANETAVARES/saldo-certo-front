import { useCallback, useEffect, useMemo, useState } from 'react'
import { Aviso, type AvisoDados } from '../components/Aviso'
import { FiltroSituacao } from '../components/FiltroSituacao'
import { FormularioConta } from '../components/FormularioConta'
import { FormularioQuitacao } from '../components/FormularioQuitacao'
import { ResumoCards } from '../components/ResumoCards'
import { TabelaContas } from '../components/TabelaContas'
import { ApiError, cadastrosApi, pagamentosApi } from '../services/api'
import type { Categoria, Filtro, Fornecedor, Pagamento } from '../types/conta'
import { nomeCategoria } from '../utils/formatar'

// Qual janela está aberta: nenhuma, cadastro/edição ou registro de pagamento
type Janela =
  | { tipo: 'nenhuma' }
  | { tipo: 'formulario'; conta: Pagamento | null }
  | { tipo: 'quitacao'; conta: Pagamento }

function mensagemDe(erro: unknown): string {
  return erro instanceof ApiError ? erro.message : 'Erro inesperado'
}

export function ContasPagarPage() {
  const [contas, setContas] = useState<Pagamento[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<Filtro>('TODAS')
  const [busca, setBusca] = useState('')
  const [janela, setJanela] = useState<Janela>({ tipo: 'nenhuma' })
  const [tituloEmAcao, setTituloEmAcao] = useState<string | null>(null)
  const [aviso, setAviso] = useState<AvisoDados | null>(null)

  // GET /api/pagamentos, /api/fornecedores e /api/plano-contas ao mesmo tempo
  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      const [listaContas, listaFornecedores, listaCategorias] = await Promise.all([
        pagamentosApi.listar(),
        cadastrosApi.fornecedores(),
        cadastrosApi.categorias(),
      ])
      setContas(listaContas)
      setFornecedores(listaFornecedores)
      setCategorias(listaCategorias)
    } catch (e) {
      setErro(mensagemDe(e))
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    void carregar()
  }, [carregar])

  // A API devolve só os ids; aqui transformamos em nomes para exibir
  const nomeFornecedor = useCallback(
    (id: number) => fornecedores.find((f) => f.registro === id)?.fornecedor ?? `Fornecedor ${id}`,
    [fornecedores],
  )
  const nomeDaCategoria = useCallback(
    (id: number) => {
      const categoria = categorias.find((c) => c.planoContas === id)
      return categoria ? nomeCategoria(categoria) : `Categoria ${id}`
    },
    [categorias],
  )

  const contagem = useMemo(() => {
    const total: Record<Filtro, number> = { TODAS: contas.length, ABERTA: 0, VENCIDA: 0, PAGA: 0, CANCELADA: 0 }
    contas.forEach((c) => {
      total[c.status] += 1
    })
    return total
  }, [contas])

  // Filtro por situação + busca por texto, ordenado por vencimento
  const contasVisiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return contas
      .filter((c) => filtro === 'TODAS' || c.status === filtro)
      .filter(
        (c) =>
          !termo ||
          [c.descricao, c.titulo, nomeFornecedor(c.fornecedorId), nomeDaCategoria(c.categoriaId)].some((t) =>
            t.toLowerCase().includes(termo),
          ),
      )
      .sort((a, b) => a.vencto.localeCompare(b.vencto))
  }, [contas, filtro, busca, nomeFornecedor, nomeDaCategoria])

  const fecharJanela = useCallback(() => setJanela({ tipo: 'nenhuma' }), [])
  const limparAviso = useCallback(() => setAviso(null), [])

  // Troca a conta alterada na lista (ou acrescenta, se for nova)
  function substituir(conta: Pagamento) {
    setContas((lista) =>
      lista.some((c) => c.titulo === conta.titulo)
        ? lista.map((c) => (c.titulo === conta.titulo ? conta : c))
        : [...lista, conta],
    )
  }

  function aoSalvar(salva: Pagamento, editando: boolean) {
    substituir(salva)
    setJanela({ tipo: 'nenhuma' })
    setAviso({ tipo: 'sucesso', texto: editando ? 'Conta atualizada' : 'Conta cadastrada' })
  }

  function aoPagar(paga: Pagamento) {
    substituir(paga)
    setJanela({ tipo: 'nenhuma' })
    setAviso({ tipo: 'sucesso', texto: `"${paga.descricao}" marcada como paga` })
  }

  // PATCH /api/pagamentos/{titulo}/cancelar
  async function cancelar(conta: Pagamento) {
    if (!window.confirm(`Cancelar a conta "${conta.descricao}"? O registro fica no histórico.`)) return
    setTituloEmAcao(conta.titulo)
    try {
      substituir(await pagamentosApi.cancelar(conta.titulo))
      setAviso({ tipo: 'sucesso', texto: 'Conta cancelada' })
    } catch (e) {
      setAviso({ tipo: 'erro', texto: mensagemDe(e) })
    } finally {
      setTituloEmAcao(null)
    }
  }

  // DELETE /api/pagamentos/{titulo}
  async function excluir(conta: Pagamento) {
    if (!window.confirm(`Excluir definitivamente a conta "${conta.descricao}"?`)) return
    setTituloEmAcao(conta.titulo)
    try {
      await pagamentosApi.excluir(conta.titulo)
      setContas((lista) => lista.filter((c) => c.titulo !== conta.titulo))
      setAviso({ tipo: 'sucesso', texto: 'Conta excluída' })
    } catch (e) {
      setAviso({ tipo: 'erro', texto: mensagemDe(e) })
    } finally {
      setTituloEmAcao(null)
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
          onClick={() => setJanela({ tipo: 'formulario', conta: null })}
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
            placeholder="Buscar por descrição, título, fornecedor..."
            aria-label="Buscar contas"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <TabelaContas
          contas={contasVisiveis}
          carregando={carregando}
          erro={erro}
          tituloEmAcao={tituloEmAcao}
          nomeFornecedor={nomeFornecedor}
          nomeCategoria={nomeDaCategoria}
          onTentarNovamente={() => void carregar()}
          onNovaConta={() => setJanela({ tipo: 'formulario', conta: null })}
          onEditar={(conta) => setJanela({ tipo: 'formulario', conta })}
          onPagar={(conta) => setJanela({ tipo: 'quitacao', conta })}
          onCancelar={(conta) => void cancelar(conta)}
          onExcluir={(conta) => void excluir(conta)}
        />
      </section>

      {janela.tipo === 'formulario' && (
        <FormularioConta
          conta={janela.conta}
          fornecedores={fornecedores}
          categorias={categorias}
          onNovoFornecedor={(f) => setFornecedores((lista) => [...lista, f])}
          onNovaCategoria={(c) => setCategorias((lista) => [...lista, c])}
          onFechar={fecharJanela}
          onSalvo={aoSalvar}
        />
      )}

      {janela.tipo === 'quitacao' && (
        <FormularioQuitacao conta={janela.conta} onFechar={fecharJanela} onPago={aoPagar} />
      )}

      <Aviso aviso={aviso} onSumir={limparAviso} />
    </>
  )
}
