import type { ReactNode } from 'react';

interface Props {
    titulo: string;
    onCerrar: () => void;
    children: ReactNode;
}

export default function Modal({ titulo, onCerrar, children }: Props) {
    return (
        <div className="modal__overlay" onClick={onCerrar}>
        <div className="modal__contenido" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
            <h3 className="modal__titulo">{titulo}</h3>
            <button type="button" className="modal__cerrar" onClick={onCerrar}>
                ✕
            </button>
            </div>
            {children}
        </div>
        </div>
    );
}