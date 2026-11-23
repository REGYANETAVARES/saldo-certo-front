interface SidebarProps {
  menuAberto: boolean
  onFecharMenu: () => void
}

export function Sidebar({ menuAberto, onFecharMenu }: SidebarProps) {
  return (
    <>
      <aside className={`sidebar ${menuAberto ? 'sidebar--aberta' : ''}`}>
        <div className="marca">
          <span className="marca__icone" aria-hidden="true">✓</span>
          <span className="marca__nome">Saldo Certo</span>
        </div>

        <nav className="menu" aria-label="Menu principal">
          <p className="menu__titulo">Financeiro</p>
          <a className="menu__item menu__item--ativo" href="#" aria-current="page" onClick={onFecharMenu}>
            Contas a pagar
          </a>
          <span className="menu__item menu__item--desabilitado" title="Disponível na próxima versão">
            Contas a receber <small>em breve</small>
          </span>
        </nav>

        <p className="sidebar__rodape">Versão 1.0 · Front-End Web</p>
      </aside>

      {menuAberto && <div className="sidebar__fundo" onClick={onFecharMenu} aria-hidden="true" />}
    </>
  )
}
