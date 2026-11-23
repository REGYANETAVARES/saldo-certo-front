import type { ContaPagar, SituacaoExibida } from '../types/conta'

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatarMoeda(valor: number): string {
  return moeda.format(valor)
}

/** "2026-11-05" -> "05/11/2026" (sem usar Date, para não ter problema de fuso horário). */
export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

/** Data de hoje no formato "AAAA-MM-DD", no horário local. */
export function hojeIso(): string {
  const agora = new Date()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')
  return `${agora.getFullYear()}-${mes}-${dia}`
}

/** Pendente com vencimento antes de hoje = vencida. */
export function situacaoExibida(conta: ContaPagar): SituacaoExibida {
  if (conta.situacao === 'PENDENTE' && conta.vencimento < hojeIso()) {
    return 'VENCIDA'
  }
  return conta.situacao
}

export const rotuloSituacao: Record<SituacaoExibida, string> = {
  PENDENTE: 'Pendente',
  VENCIDA: 'Vencida',
  PAGA: 'Paga',
}
