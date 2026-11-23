import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { ContasPagarPage } from './pages/ContasPagarPage'

export default function App() {
  const [menuAberto, setMenuAberto] = useState(false)

  return (
    <div className="layout">
      <Sidebar menuAberto={menuAberto} onFecharMenu={() => setMenuAberto(false)} />

      <div className="layout__conteudo">
        {/* Barra que só aparece no celular, com o botão do menu */}
        <div className="topo-mobile">
          <button type="button" className="topo-mobile__menu" onClick={() => setMenuAberto(true)} aria-label="Abrir menu">
            ☰
          </button>
          <span className="marca__nome">Saldo Certo</span>
        </div>

        <main className="pagina">
          <ContasPagarPage />
        </main>
      </div>
    </div>
  )
}
