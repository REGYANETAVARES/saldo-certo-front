import type { ContaPagar } from '../types/conta'
import { formatarData, formatarMoeda, situacaoExibida } from '../utils/formatar'
import { SeloSituacao } from './SeloSituacao'

interface TabelaContasProps {
  contas: ContaPagar[]
  carregando: boolean
  erro: string | null
  idEmAcao: number | null
  onTentarNovamente: () => void
  onNovaConta: () => void
  onEditar: (conta: ContaPagar) => void
  onPagar: (conta: ContaPagar) => void
  onExcluir: (conta: ContaPagar) => void
}

export function TabelaContas(props: TabelaContasProps) {
  const { contas, carregando, erro, idEmAcao } = props

  // Estado: carregando
  if (carregando) {
    return (
      <div className="tabela-estado" aria-busy="true" aria-live="polite">
        {[1, 2, 3].map((n) => (
          <div key={n} className="esqueleto" />
        ))}
        <p className="tabela-estado__texto">Carregando contas...</p>
      </div>
    )
  }

  // Estado: erro
  if (erro) {
    return (
      <div className="tabela-estado tabela-estado--erro" role="alert">
        <p className="tabela-estado__titulo">Não foi possível carregar as contas</p>
        <p className="tabela-estado__texto">{erro}</p>
        <button type="button" className="botao botao--secundario" onClick={props.onTentarNovamente}>
          Tentar novamente
        </button>
      </div>
    )
  }

  // Estado: vazio
  if (contas.length === 0) {
    return (
      <div className="tabela-estado">
        <p className="tabela-estado__titulo">Nenhuma conta por aqui</p>
        <p className="tabela-estado__texto">Cadastre uma conta ou escolha outro filtro.</p>
        <button type="button" className="botao botao--primario" onClick={props.onNovaConta}>
          Cadastrar conta
        </button>
      </div>
    )
  }

  return (
    <div className="tabela-container">
      <table className="tabela">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Categoria</th>
            <th>Vencimento</th>
            <th className="tabela__numero">Valor</th>
            <th>Situação</th>
            <th>
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {contas.map((conta) => {
            const situacao = situacaoExibida(conta)
            const ocupada = idEmAcao === conta.id
            return (
              <tr key={conta.id} className={situacao === 'PAGA' ? 'tabela__linha--paga' : ''}>
                <td data-rotulo="Descrição">
                  <span className="tabela__descricao">{conta.descricao}</span>
                  <span className="tabela__fornecedor">{conta.fornecedor}</span>
                </td>
                <td data-rotulo="Categoria">{conta.categoria}</td>
                <td data-rotulo="Vencimento">{formatarData(conta.vencimento)}</td>
                <td data-rotulo="Valor" className="tabela__numero">
                  {formatarMoeda(conta.valor)}
                </td>
                <td data-rotulo="Situação">
                  <SeloSituacao situacao={situacao} />
                </td>
                <td className="tabela__acoes">
                  <div className="tabela__acoes-grupo">
                  {conta.situacao === 'PENDENTE' ? (
                    <>
                      <button
                        type="button"
                        className="botao botao--pagar"
                        disabled={ocupada}
                        onClick={() => props.onPagar(conta)}
                      >
                        {ocupada ? 'Salvando...' : 'Pagar'}
                      </button>
                      <button type="button" className="botao botao--texto" onClick={() => props.onEditar(conta)}>
                        Editar
                      </button>
                    </>
                  ) : (
                    <span className="tabela__pago-em">
                      Paga em {conta.dataPagamento ? formatarData(conta.dataPagamento) : '-'}
                    </span>
                  )}
                  <button
                    type="button"
                    className="botao botao--texto botao--perigo"
                    disabled={ocupada}
                    onClick={() => props.onExcluir(conta)}
                  >
                    Excluir
                  </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
