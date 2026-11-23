import type { Pagamento } from '../types/conta'
import { emAberto, formatarData, formatarMoeda, rotuloForma } from '../utils/formatar'
import { SeloSituacao } from './SeloSituacao'

interface TabelaContasProps {
  contas: Pagamento[]
  carregando: boolean
  erro: string | null
  tituloEmAcao: string | null
  nomeFornecedor: (id: number) => string
  nomeCategoria: (id: number) => string
  onTentarNovamente: () => void
  onNovaConta: () => void
  onEditar: (conta: Pagamento) => void
  onPagar: (conta: Pagamento) => void
  onCancelar: (conta: Pagamento) => void
  onExcluir: (conta: Pagamento) => void
}

export function TabelaContas(props: TabelaContasProps) {
  const { contas, carregando, erro, tituloEmAcao } = props

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
            const ocupada = tituloEmAcao === conta.titulo
            const aberta = emAberto(conta.status)
            return (
              <tr key={conta.titulo} className={aberta ? '' : 'tabela__linha--fechada'}>
                <td data-rotulo="Descrição">
                  <span className="tabela__descricao">{conta.descricao}</span>
                  <span className="tabela__fornecedor">
                    {props.nomeFornecedor(conta.fornecedorId)} · título {conta.titulo}
                  </span>
                </td>
                <td data-rotulo="Categoria">{props.nomeCategoria(conta.categoriaId)}</td>
                <td data-rotulo="Vencimento">{formatarData(conta.vencto)}</td>
                <td data-rotulo="Valor" className="tabela__numero">
                  {formatarMoeda(conta.status === 'PAGA' && conta.valorQuitado !== null ? conta.valorQuitado : conta.valor)}
                </td>
                <td data-rotulo="Situação">
                  <SeloSituacao situacao={conta.status} />
                </td>
                <td className="tabela__acoes">
                  <div className="tabela__acoes-grupo">
                    {aberta ? (
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
                        <button
                          type="button"
                          className="botao botao--texto"
                          disabled={ocupada}
                          onClick={() => props.onCancelar(conta)}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          className="botao botao--texto botao--perigo"
                          disabled={ocupada}
                          onClick={() => props.onExcluir(conta)}
                        >
                          Excluir
                        </button>
                      </>
                    ) : conta.status === 'PAGA' ? (
                      <span className="tabela__pago-em">
                        Paga em {conta.pagto ? formatarData(conta.pagto) : '-'}
                        {conta.formaPagamento ? ` · ${rotuloForma[conta.formaPagamento]}` : ''}
                      </span>
                    ) : (
                      <span className="tabela__pago-em">Conta cancelada</span>
                    )}
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
