import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { ApiError, contasApi } from '../services/api'
import type { ContaPagar, ContaPagarForm } from '../types/conta'

type CamposErro = Partial<Record<keyof ContaPagarForm, string>>

// No formulário o valor é texto (o usuário pode digitar "98,50"); vira número só ao enviar.
interface DadosDigitados {
  descricao: string
  fornecedor: string
  categoria: string
  vencimento: string
  valor: string
}

const VAZIO: DadosDigitados = { descricao: '', fornecedor: '', categoria: '', vencimento: '', valor: '' }

const CATEGORIAS = ['Utilidades', 'Aluguel', 'Suprimentos', 'Impostos', 'Serviços', 'Folha de pagamento']

interface FormularioContaProps {
  conta: ContaPagar | null // null = nova conta
  onFechar: () => void
  onSalvo: (conta: ContaPagar, editando: boolean) => void
}

/** Validação no próprio navegador, antes de chamar a API. */
function validar(dados: DadosDigitados): CamposErro {
  const erros: CamposErro = {}
  if (!dados.descricao.trim()) erros.descricao = 'Informe a descrição'
  if (!dados.fornecedor.trim()) erros.fornecedor = 'Informe o fornecedor'
  if (!dados.categoria.trim()) erros.categoria = 'Informe a categoria'
  if (!dados.vencimento) erros.vencimento = 'Informe a data de vencimento'
  const valor = Number(dados.valor.replace(',', '.'))
  if (!dados.valor || Number.isNaN(valor) || valor <= 0) erros.valor = 'Informe um valor maior que zero'
  return erros
}

export function FormularioConta({ conta, onFechar, onSalvo }: FormularioContaProps) {
  const editando = conta !== null
  const [dados, setDados] = useState<DadosDigitados>(
    conta
      ? {
          descricao: conta.descricao,
          fornecedor: conta.fornecedor,
          categoria: conta.categoria,
          vencimento: conta.vencimento,
          valor: String(conta.valor).replace('.', ','),
        }
      : VAZIO,
  )
  const [erros, setErros] = useState<CamposErro>({})
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const primeiroCampo = useRef<HTMLInputElement>(null)

  // Foca o primeiro campo e fecha com a tecla Esc
  useEffect(() => {
    primeiroCampo.current?.focus()
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar()
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [onFechar])

  function alterarCampo(campo: keyof DadosDigitados, valor: string) {
    setDados((anterior) => ({ ...anterior, [campo]: valor }))
    setErros((anterior) => ({ ...anterior, [campo]: undefined }))
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErroGeral(null)

    const errosEncontrados = validar(dados)
    if (Object.keys(errosEncontrados).length > 0) {
      setErros(errosEncontrados)
      return
    }

    const corpo: ContaPagarForm = {
      descricao: dados.descricao.trim(),
      fornecedor: dados.fornecedor.trim(),
      categoria: dados.categoria.trim(),
      vencimento: dados.vencimento,
      valor: Number(dados.valor.replace(',', '.')),
    }

    setEnviando(true)
    try {
      const salva = editando ? await contasApi.alterar(conta.id, corpo) : await contasApi.cadastrar(corpo)
      onSalvo(salva, editando)
    } catch (erro) {
      if (erro instanceof ApiError) {
        setErroGeral(erro.message)
        if (erro.campos) setErros(erro.campos)
      } else {
        setErroGeral('Erro inesperado ao salvar')
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="modal__fundo" onClick={onFechar}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-formulario"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal__cabecalho">
          <h2 id="titulo-formulario">{editando ? 'Editar conta' : 'Nova conta a pagar'}</h2>
          <button type="button" className="modal__fechar" onClick={onFechar} aria-label="Fechar">
            ×
          </button>
        </header>

        <form className="formulario" onSubmit={enviar} noValidate>
          {erroGeral && (
            <p className="formulario__erro-geral" role="alert">
              {erroGeral}
            </p>
          )}

          <Campo rotulo="Descrição" erro={erros.descricao} id="descricao">
            <input
              ref={primeiroCampo}
              id="descricao"
              value={dados.descricao}
              placeholder="Conta de energia"
              onChange={(e) => alterarCampo('descricao', e.target.value)}
            />
          </Campo>

          <Campo rotulo="Fornecedor" erro={erros.fornecedor} id="fornecedor">
            <input
              id="fornecedor"
              value={dados.fornecedor}
              placeholder="Equatorial Goiás"
              onChange={(e) => alterarCampo('fornecedor', e.target.value)}
            />
          </Campo>

          <Campo rotulo="Categoria" erro={erros.categoria} id="categoria">
            <input
              id="categoria"
              list="lista-categorias"
              value={dados.categoria}
              placeholder="Utilidades"
              onChange={(e) => alterarCampo('categoria', e.target.value)}
            />
            <datalist id="lista-categorias">
              {CATEGORIAS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Campo>

          <div className="formulario__linha">
            <Campo rotulo="Vencimento" erro={erros.vencimento} id="vencimento">
              <input
                id="vencimento"
                type="date"
                value={dados.vencimento}
                onChange={(e) => alterarCampo('vencimento', e.target.value)}
              />
            </Campo>

            <Campo rotulo="Valor (R$)" erro={erros.valor} id="valor">
              <input
                id="valor"
                inputMode="decimal"
                value={dados.valor}
                placeholder="0,00"
                onChange={(e) => alterarCampo('valor', e.target.value)}
              />
            </Campo>
          </div>

          <footer className="formulario__acoes">
            <button type="button" className="botao botao--secundario" onClick={onFechar}>
              Cancelar
            </button>
            <button type="submit" className="botao botao--primario" disabled={enviando}>
              {enviando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Cadastrar conta'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

interface CampoProps {
  id: string
  rotulo: string
  erro?: string
  children: ReactNode
}

function Campo({ id, rotulo, erro, children }: CampoProps) {
  return (
    <div className={`campo ${erro ? 'campo--erro' : ''}`}>
      <label htmlFor={id}>{rotulo}</label>
      {children}
      {erro && <span className="campo__mensagem">{erro}</span>}
    </div>
  )
}
