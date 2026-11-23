import type { ContaPagar } from '../types/conta'
import { formatarMoeda, situacaoExibida } from '../utils/formatar'

interface ResumoCardsProps {
  contas: ContaPagar[]
}

export function ResumoCards({ contas }: ResumoCardsProps) {
  const somar = (lista: ContaPagar[]) => lista.reduce((total, c) => total + c.valor, 0)

  const emAberto = contas.filter((c) => c.situacao === 'PENDENTE')
  const vencidas = contas.filter((c) => situacaoExibida(c) === 'VENCIDA')
  const pagas = contas.filter((c) => c.situacao === 'PAGA')

  return (
    <section className="resumo" aria-label="Resumo das contas">
      <article className="resumo__card resumo__card--destaque">
        <p className="resumo__rotulo">Total a pagar</p>
        <p className="resumo__valor">{formatarMoeda(somar(emAberto))}</p>
        <p className="resumo__detalhe">{emAberto.length} conta(s) em aberto</p>
      </article>

      <article className="resumo__card">
        <p className="resumo__rotulo">Vencidas</p>
        <p className="resumo__valor resumo__valor--alerta">{formatarMoeda(somar(vencidas))}</p>
        <p className="resumo__detalhe">{vencidas.length} conta(s) com prazo vencido</p>
      </article>

      <article className="resumo__card">
        <p className="resumo__rotulo">Pagas</p>
        <p className="resumo__valor">{formatarMoeda(somar(pagas))}</p>
        <p className="resumo__detalhe">{pagas.length} conta(s) quitada(s)</p>
      </article>
    </section>
  )
}
