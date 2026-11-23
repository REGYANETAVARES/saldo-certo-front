import type { Filtro } from '../types/conta'

const OPCOES: { valor: Filtro; rotulo: string }[] = [
  { valor: 'TODAS', rotulo: 'Todas' },
  { valor: 'ABERTA', rotulo: 'Abertas' },
  { valor: 'VENCIDA', rotulo: 'Vencidas' },
  { valor: 'PAGA', rotulo: 'Pagas' },
  { valor: 'CANCELADA', rotulo: 'Canceladas' },
]

interface FiltroSituacaoProps {
  filtro: Filtro
  contagem: Record<Filtro, number>
  onMudar: (filtro: Filtro) => void
}

export function FiltroSituacao({ filtro, contagem, onMudar }: FiltroSituacaoProps) {
  return (
    <div className="filtro" role="tablist" aria-label="Filtrar por situação">
      {OPCOES.map((opcao) => (
        <button
          key={opcao.valor}
          type="button"
          role="tab"
          aria-selected={filtro === opcao.valor}
          className={`filtro__botao ${filtro === opcao.valor ? 'filtro__botao--ativo' : ''}`}
          onClick={() => onMudar(opcao.valor)}
        >
          {opcao.rotulo}
          <span className="filtro__contagem">{contagem[opcao.valor]}</span>
        </button>
      ))}
    </div>
  )
}
