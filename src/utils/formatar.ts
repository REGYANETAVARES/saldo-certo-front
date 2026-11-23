import type { Categoria, FormaPagamento, StatusConta } from '../types/conta'

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

export const rotuloSituacao: Record<StatusConta, string> = {
  ABERTA: 'Aberta',
  VENCIDA: 'Vencida',
  PAGA: 'Paga',
  CANCELADA: 'Cancelada',
}

export const rotuloForma: Record<FormaPagamento, string> = {
  PIX: 'Pix',
  BOLETO: 'Boleto',
  DINHEIRO: 'Dinheiro',
  CARTAO: 'Cartão',
  TRANSFERENCIA: 'Transferência',
  CHEQUE: 'Cheque',
  OUTRA: 'Outra',
}

export function nomeCategoria(categoria: Categoria): string {
  return categoria.descricao ? categoria.descricao : categoria.conta
}

/** Conta ainda em aberto (aceita pagar, editar, cancelar e excluir). */
export function emAberto(status: StatusConta): boolean {
  return status === 'ABERTA' || status === 'VENCIDA'
}
