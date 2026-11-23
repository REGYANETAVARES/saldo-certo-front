import type { SituacaoExibida } from '../types/conta'
import { rotuloSituacao } from '../utils/formatar'

export function SeloSituacao({ situacao }: { situacao: SituacaoExibida }) {
  return <span className={`selo selo--${situacao.toLowerCase()}`}>{rotuloSituacao[situacao]}</span>
}
