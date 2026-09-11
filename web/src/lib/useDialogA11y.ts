import { useEffect, useRef, type RefObject } from "react";

// Comportamiento compartido de los diálogos que se portan a #phone-frame (StreakInfo,
// NotificationBell, TriviaModal — mismo patrón `createPortal` los tres): al abrir, mete el
// foco adentro del diálogo y saca el resto de la pantalla (el <main> con scroll y el nav de
// abajo, hermanos del diálogo dentro de #phone-frame) del árbol de accesibilidad y del
// tabbing con `inert` nativo — más simple y robusto que un focus-trap a mano, porque las
// únicas cosas enfocables que quedan mientras está abierto son las de adentro del diálogo
// mismo. Al cerrar, devuelve el foco a lo que lo abrió.
export function useDialogA11y(active: boolean, dialogRef: RefObject<HTMLElement | null>) {
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!active) return;

    triggerRef.current = document.activeElement;
    const root = document.getElementById("phone-frame");
    const siblings = root
      ? Array.from(root.querySelectorAll<HTMLElement>(":scope > main, :scope > nav"))
      : [];
    siblings.forEach((el) => el.setAttribute("inert", ""));
    dialogRef.current?.focus();

    return () => {
      siblings.forEach((el) => el.removeAttribute("inert"));
      if (triggerRef.current instanceof HTMLElement) triggerRef.current.focus();
    };
  }, [active, dialogRef]);
}
