import { useEffect } from 'react';
import tutorialGif from '../assets/tutorial-placeholder.gif';

type TutorialModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const useBodyScrollLock = (isLocked: boolean) => {
    useEffect(() => {
        if (!isLocked) {
            return;
        }

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isLocked]);
};

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
    useBodyScrollLock(isOpen);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="tutorial-modal__backdrop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tutorial-modal-title"
            onClick={onClose}
        >
            <div className="tutorial-modal__content" role="document" onClick={(event) => event.stopPropagation()}>
                <button
                    type="button"
                    className="tutorial-modal__close"
                    onClick={onClose}
                    aria-label="Cerrar tutorial"
                >
                    ×
                </button>

                <h2 className="tutorial-modal__title" id="tutorial-modal-title">
                    ¿Cómo jugar Rush Hour?
                </h2>
                <p className="tutorial-modal__description">
                    Observa el siguiente tutorial animado para aprender las reglas básicas y entender cómo resolver cada
                    nivel.
                </p>

                <div className="tutorial-modal__media" aria-label="Animación del tutorial">
                    <img src={tutorialGif} alt="Animación del tutorial del juego" className="tutorial-modal__image" />
                </div>

                <p className="tutorial-modal__hint">
                    Reemplaza este GIF cuando lo tengas listo en <code>src/assets/tutorial-placeholder.gif</code> para ver tu
                    versión final.
                </p>

                <button type="button" className="tutorial-modal__action" onClick={onClose}>
                    ¡Listo, a jugar!
                </button>
            </div>
        </div>
    );
}
