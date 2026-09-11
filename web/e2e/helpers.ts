import { type Page, expect } from "@playwright/test";

export const E2E_EMAIL = "jugador@e2e.local";
export const E2E_PASSWORD = "e2e1234";

export async function login(page: Page) {
  await page.goto("/login");
  await page.getByPlaceholder("Email").fill(E2E_EMAIL);
  await page.getByPlaceholder("Contraseña").fill(E2E_PASSWORD);
  await page.getByRole("button", { name: "ENTRAR" }).click();
  await expect(page).toHaveURL(/\/pronosticos/);
}

// Ganar una insignia nueva (ej. "Cantaste la sorpresa") tapa toda la pantalla con
// BadgeUnlockOverlay — puede disparar en cualquier sync, no solo la primera vez. Si aparece,
// la cerramos (puede haber más de una, el overlay las muestra de a una) antes de seguir.
// `isVisible()` no espera — mira el DOM tal como está en ese instante — así que justo después
// de una navegación (login) o una server action (sync) el overlay puede no estar montado
// todavía y un chequeo sin espera lo pasaría por alto; por eso cada vuelta le da una ventana
// corta a `waitFor` para aparecer antes de darlo por ausente.
export async function dismissBadgeOverlayIfPresent(page: Page) {
  const dialog = page.getByRole("dialog", { name: /^Insignia desbloqueada/ });
  for (;;) {
    const appeared = await dialog
      .waitFor({ state: "visible", timeout: 2000 })
      .then(() => true)
      .catch(() => false);
    if (!appeared) return;

    const button = dialog.getByRole("button", { name: /^(DALE|SIGUIENTE)$/ });
    // "SIGUIENTE" solo avanza el carrusel en el cliente (no deshabilita el botón); "DALE" (la
    // última insignia) dispara la server action que la marca vista — mientras esa resuelve el
    // botón queda disabled y después el diálogo entero se desmonta. Si ya está disabled es que
    // un click anterior sigue en vuelo: esperar a que se vaya en vez de reintentar sobre el
    // mismo botón (si no, el reintento corre la carrera contra su propio desmontaje y nunca
    // resuelve).
    if (await button.isDisabled()) {
      await dialog.waitFor({ state: "hidden", timeout: 10_000 }).catch(() => {});
      continue;
    }
    await button.click();
  }
}
