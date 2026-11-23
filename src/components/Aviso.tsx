import { useEffect } from 'react'

export interface AvisoDados {
  texto: string
  tipo: 'sucesso' | 'erro'
}

interface AvisoProps {
  aviso: AvisoDados | null
  onSumir: () => void
}

/** Mensagem rápida no canto da tela, que some sozinha depois de 3,5 segundos. */
export function Aviso({ aviso, onSumir }: AvisoProps) {
  useEffect(() => {
    if (!aviso) return
    const timer = window.setTimeout(onSumir, 3500)
    return () => window.clearTimeout(timer)
  }, [aviso, onSumir])

  if (!aviso) return null
  return (
    <div className={`aviso aviso--${aviso.tipo}`} role="status" aria-live="polite">
      {aviso.texto}
    </div>
  )
}
