import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  titulo: string
  onFechar: () => void
  children: ReactNode
  largura?: number
}

/** Janela sobre a página (fecha com Esc ou clicando fora). */
export function Modal({ titulo, onFechar, children, largura = 560 }: ModalProps) {
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar()
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [onFechar])

  return (
    <div className="modal__fundo" onClick={onFechar}>
      <div
        className="modal"
        style={{ maxWidth: largura }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal__cabecalho">
          <h2 id="titulo-modal">{titulo}</h2>
          <button type="button" className="modal__fechar" onClick={onFechar} aria-label="Fechar">
            ×
          </button>
        </header>
        {children}
      </div>
    </div>
  )
}

interface CampoProps {
  id: string
  rotulo: string
  erro?: string
  children: ReactNode
}

export function Campo({ id, rotulo, erro, children }: CampoProps) {
  return (
    <div className={`campo ${erro ? 'campo--erro' : ''}`}>
      <label htmlFor={id}>{rotulo}</label>
      {children}
      {erro && <span className="campo__mensagem">{erro}</span>}
    </div>
  )
}
