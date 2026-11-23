import type { StatusConta } from '../types/conta'
import { rotuloSituacao } from '../utils/formatar'

export function SeloSituacao({ situacao }: { situacao: StatusConta }) {
  return <span className={`selo selo--${situacao.toLowerCase()}`}>{rotuloSituacao[situacao]}</span>
}
