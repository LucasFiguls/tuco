import { useEffect, useRef } from "react";

/**
 * Pushes a history entry when a drawer opens so the Android back button
 * closes the drawer instead of navigating to the previous page.
 */
export function useDrawerBackButton(isOpen: boolean, onClose: () => void) {
  const pushed = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    history.pushState({ drawer: true }, "");
    pushed.current = true;

    function handlePopState() {
      pushed.current = false;
      onCloseRef.current();
    }

    window.addEventListener("popstate", handlePopState, { once: true });

    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (pushed.current) {
        pushed.current = false;
        history.back();
      }
    };
  }, [isOpen]);
}
