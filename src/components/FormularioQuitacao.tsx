import { useState, type FormEvent } from 'react'
import { ApiError, pagamentosApi } from '../services/api'
import type { FormaPagamento, Pagamento } from '../types/conta'
import { formatarData, formatarMoeda, hojeIso, rotuloForma } from '../utils/formatar'
import { Campo, Modal } from './Modal'

const FORMAS = Object.keys(rotuloForma) as FormaPagamento[]

interface FormularioQuitacaoProps {
  conta: Pagamento
  onFechar: () => void
  onPago: (conta: Pagamento) => void
}

/** Registra o pagamento: PATCH /api/pagamentos/{titulo}/quitar com data e forma de pagamento. */
export function FormularioQuitacao({ conta, onFechar, onPago }: FormularioQuitacaoProps) {
  const [data, setData] = useState(hojeIso())
  const [forma, setForma] = useState<FormaPagamento>('PIX')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    // Mesma regra da API: entre a emissão e hoje
    if (!data || data < conta.emissao || data > hojeIso()) {
      setErro(`A data deve estar entre ${formatarData(conta.emissao)} e hoje.`)
      return
    }
    setEnviando(true)
    try {
      onPago(await pagamentosApi.quitar(conta.titulo, { data, formaPagamento: forma }))
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Erro inesperado ao registrar o pagamento')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal titulo="Registrar pagamento" onFechar={onFechar} largura={440}>
      <form className="formulario" onSubmit={enviar} noValidate>
        <div className="quitacao__resumo">
          <span>{conta.descricao}</span>
          <strong>{formatarMoeda(conta.valor)}</strong>
        </div>
        {erro && (
          <p className="formulario__erro-geral" role="alert">
            {erro}
          </p>
        )}
        <div className="formulario__linha">
          <Campo id="data-pagto" rotulo="Data do pagamento">
            <input
              id="data-pagto"
              type="date"
              value={data}
              min={conta.emissao}
              max={hojeIso()}
              onChange={(e) => {
                setData(e.target.value)
                setErro(null)
              }}
            />
          </Campo>
          <Campo id="forma" rotulo="Forma de pagamento">
            <select id="forma" value={forma} onChange={(e) => setForma(e.target.value as FormaPagamento)}>
              {FORMAS.map((f) => (
                <option key={f} value={f}>
                  {rotuloForma[f]}
                </option>
              ))}
            </select>
          </Campo>
        </div>
        <footer className="formulario__acoes">
          <button type="button" className="botao botao--secundario" onClick={onFechar}>
            Voltar
          </button>
          <button type="submit" className="botao botao--primario" disabled={enviando}>
            {enviando ? 'Salvando...' : 'Confirmar pagamento'}
          </button>
        </footer>
      </form>
    </Modal>
  )
}
