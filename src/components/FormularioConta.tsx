import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ApiError, cadastrosApi, pagamentosApi } from '../services/api'
import type { Categoria, Fornecedor, Pagamento, PagamentoForm } from '../types/conta'
import { hojeIso, nomeCategoria } from '../utils/formatar'
import { Campo, Modal } from './Modal'

// No formulário tudo é texto (o usuário pode digitar "98,50"); vira número só ao enviar.
interface DadosDigitados {
  titulo: string
  descricao: string
  fornecedorId: string
  categoriaId: string
  emissao: string
  vencto: string
  valor: string
  observacoes: string
}

type CamposErro = Partial<Record<keyof DadosDigitados, string>>

interface FormularioContaProps {
  conta: Pagamento | null // null = nova conta
  fornecedores: Fornecedor[]
  categorias: Categoria[]
  onNovoFornecedor: (f: Fornecedor) => void
  onNovaCategoria: (c: Categoria) => void
  onFechar: () => void
  onSalvo: (conta: Pagamento, editando: boolean) => void
}

function dadosIniciais(conta: Pagamento | null): DadosDigitados {
  if (!conta) {
    return { titulo: '', descricao: '', fornecedorId: '', categoriaId: '', emissao: hojeIso(), vencto: '', valor: '', observacoes: '' }
  }
  return {
    titulo: conta.titulo,
    descricao: conta.descricao,
    fornecedorId: String(conta.fornecedorId),
    categoriaId: String(conta.categoriaId),
    emissao: conta.emissao,
    vencto: conta.vencto,
    valor: String(conta.valor).replace('.', ','),
    observacoes: conta.observacoes ?? '',
  }
}

/** Mesmas regras da API, conferidas antes de enviar. */
function validar(d: DadosDigitados): CamposErro {
  const erros: CamposErro = {}
  if (!d.titulo.trim()) erros.titulo = 'Informe o título (número do documento)'
  else if (d.titulo.trim().length > 20) erros.titulo = 'Máximo de 20 caracteres'
  if (!d.descricao.trim()) erros.descricao = 'Informe a descrição'
  if (!d.fornecedorId) erros.fornecedorId = 'Escolha o fornecedor'
  if (!d.categoriaId) erros.categoriaId = 'Escolha a categoria'
  if (!d.emissao) erros.emissao = 'Informe a emissão'
  else if (d.emissao > hojeIso()) erros.emissao = 'A emissão não pode ser futura'
  if (!d.vencto) erros.vencto = 'Informe o vencimento'
  else if (d.emissao && d.vencto < d.emissao) erros.vencto = 'O vencimento não pode ser antes da emissão'
  const valor = Number(d.valor.replace(/\./g, '').replace(',', '.'))
  if (!d.valor || Number.isNaN(valor) || valor <= 0) erros.valor = 'Informe um valor maior que zero'
  return erros
}

export function FormularioConta(props: FormularioContaProps) {
  const { conta, fornecedores, categorias, onFechar, onSalvo } = props
  const editando = conta !== null
  const [dados, setDados] = useState<DadosDigitados>(() => dadosIniciais(conta))
  const [erros, setErros] = useState<CamposErro>({})
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const primeiroCampo = useRef<HTMLInputElement>(null)

  useEffect(() => {
    primeiroCampo.current?.focus()
  }, [])

  function alterar(campo: keyof DadosDigitados, valor: string) {
    setDados((anterior) => ({ ...anterior, [campo]: valor }))
    setErros((anterior) => ({ ...anterior, [campo]: undefined }))
  }

  // Cadastro rápido, para quando ainda não existe fornecedor/categoria na API
  async function criarFornecedor() {
    const nome = window.prompt('Nome do novo fornecedor:')?.trim()
    if (!nome) return
    try {
      const novo = await cadastrosApi.novoFornecedor(nome)
      props.onNovoFornecedor(novo)
      alterar('fornecedorId', String(novo.registro))
    } catch (e) {
      setErroGeral(e instanceof ApiError ? e.message : 'Erro ao cadastrar fornecedor')
    }
  }

  async function criarCategoria() {
    const descricao = window.prompt('Nome da nova categoria (ex.: Energia elétrica):')?.trim()
    if (!descricao) return
    const codigo = window.prompt('Código no plano de contas (ex.: 2.1.01):')?.trim()
    if (!codigo) return
    try {
      const nova = await cadastrosApi.novaCategoria(codigo, descricao)
      props.onNovaCategoria(nova)
      alterar('categoriaId', String(nova.planoContas))
    } catch (e) {
      setErroGeral(e instanceof ApiError ? e.message : 'Erro ao cadastrar categoria')
    }
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErroGeral(null)

    const encontrados = validar(dados)
    if (Object.keys(encontrados).length > 0) {
      setErros(encontrados)
      return
    }

    const corpo: PagamentoForm = {
      titulo: dados.titulo.trim(),
      descricao: dados.descricao.trim(),
      fornecedorId: Number(dados.fornecedorId),
      categoriaId: Number(dados.categoriaId),
      emissao: dados.emissao,
      vencto: dados.vencto,
      valor: Number(dados.valor.replace(/\./g, '').replace(',', '.')),
      observacoes: dados.observacoes.trim() || null,
    }

    setEnviando(true)
    try {
      const salva = editando
        ? await pagamentosApi.alterar(conta.titulo, corpo)
        : await pagamentosApi.cadastrar(corpo)
      onSalvo(salva, editando)
    } catch (e) {
      if (e instanceof ApiError) {
        setErroGeral(e.message)
        setErros(e.campos as CamposErro)
      } else {
        setErroGeral('Erro inesperado ao salvar')
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal titulo={editando ? 'Editar conta a pagar' : 'Nova conta a pagar'} onFechar={onFechar} largura={600}>
      <form className="formulario" onSubmit={enviar} noValidate>
        {erroGeral && (
          <p className="formulario__erro-geral" role="alert">
            {erroGeral}
          </p>
        )}

        <div className="formulario__linha formulario__linha--titulo">
          <Campo id="titulo" rotulo="Título (nº do documento)" erro={erros.titulo}>
            <input
              ref={primeiroCampo}
              id="titulo"
              value={dados.titulo}
              placeholder="NF-1023"
              maxLength={20}
              disabled={editando}
              onChange={(e) => alterar('titulo', e.target.value)}
            />
          </Campo>
          <Campo id="descricao" rotulo="Descrição" erro={erros.descricao}>
            <input
              id="descricao"
              value={dados.descricao}
              placeholder="Conta de energia"
              onChange={(e) => alterar('descricao', e.target.value)}
            />
          </Campo>
        </div>

        <Campo id="fornecedor" rotulo="Fornecedor" erro={erros.fornecedorId}>
          <div className="campo__com-acao">
            <select id="fornecedor" value={dados.fornecedorId} onChange={(e) => alterar('fornecedorId', e.target.value)}>
              <option value="">Selecione...</option>
              {fornecedores.map((f) => (
                <option key={f.registro} value={f.registro}>
                  {f.fornecedor}
                </option>
              ))}
            </select>
            <button type="button" className="botao botao--secundario" onClick={() => void criarFornecedor()}>
              + Novo
            </button>
          </div>
        </Campo>

        <Campo id="categoria" rotulo="Categoria (plano de contas)" erro={erros.categoriaId}>
          <div className="campo__com-acao">
            <select id="categoria" value={dados.categoriaId} onChange={(e) => alterar('categoriaId', e.target.value)}>
              <option value="">Selecione...</option>
              {categorias.map((c) => (
                <option key={c.planoContas} value={c.planoContas}>
                  {c.conta} – {nomeCategoria(c)}
                </option>
              ))}
            </select>
            <button type="button" className="botao botao--secundario" onClick={() => void criarCategoria()}>
              + Nova
            </button>
          </div>
        </Campo>

        <div className="formulario__linha formulario__linha--3">
          <Campo id="emissao" rotulo="Emissão" erro={erros.emissao}>
            <input id="emissao" type="date" value={dados.emissao} max={hojeIso()} onChange={(e) => alterar('emissao', e.target.value)} />
          </Campo>
          <Campo id="vencto" rotulo="Vencimento" erro={erros.vencto}>
            <input id="vencto" type="date" value={dados.vencto} onChange={(e) => alterar('vencto', e.target.value)} />
          </Campo>
          <Campo id="valor" rotulo="Valor (R$)" erro={erros.valor}>
            <input
              id="valor"
              inputMode="decimal"
              value={dados.valor}
              placeholder="0,00"
              onChange={(e) => alterar('valor', e.target.value)}
            />
          </Campo>
        </div>

        <Campo id="observacoes" rotulo="Observações (opcional)" erro={erros.observacoes}>
          <textarea
            id="observacoes"
            rows={2}
            value={dados.observacoes}
            onChange={(e) => alterar('observacoes', e.target.value)}
          />
        </Campo>

        <footer className="formulario__acoes">
          <button type="button" className="botao botao--secundario" onClick={onFechar}>
            Cancelar
          </button>
          <button type="submit" className="botao botao--primario" disabled={enviando}>
            {enviando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Cadastrar conta'}
          </button>
        </footer>
      </form>
    </Modal>
  )
}
