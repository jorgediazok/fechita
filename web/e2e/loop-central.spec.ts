import { test, expect } from "@playwright/test";
import { login, dismissBadgeOverlayIfPresent } from "./helpers";

// Cubre el loop central: login real, cargar una ficha 1-X-2 en /pronosticos, simular el
// resultado del partido (panel dev, modo mock) y verificar que se acrediten los puntos.
// Corre en serie (playwright.config.ts: workers 1) porque muta el mismo partido/usuario fijo.
test("cargar un pronóstico y sumar puntos al terminar el partido", async ({ page }) => {
  await login(page);
  await dismissBadgeOverlayIfPresent(page);

  const pendingCard = page
    .locator('[data-testid="match-card"][data-match-status="pending"]')
    .first();
  await expect(pendingCard).toBeVisible();
  const matchId = await pendingCard.getAttribute("data-match-id");

  // Ficha 1-X-2: elegimos "gana el local" y después simulamos ese mismo resultado, así el
  // puntaje esperado es determinístico (3 pts, dirección correcta sin marcador exacto).
  await pendingCard.getByRole("button", { name: "Gana el local" }).click();
  await expect(pendingCard.locator('[aria-label="Pronóstico cargado"]')).toBeVisible();

  await pendingCard.locator('input[name="resultHomeScore"]').fill("2");
  await pendingCard.locator('input[name="resultAwayScore"]').fill("0");
  await pendingCard.getByRole("button", { name: "Terminar" }).click();
  await dismissBadgeOverlayIfPresent(page);

  const finishedCard = page.locator(
    `[data-testid="match-card"][data-match-status="finished"][data-match-id="${matchId}"]`
  );
  await expect(finishedCard).toBeVisible();
  await expect(finishedCard.getByText("+3")).toBeVisible();
  await expect(finishedCard.getByText("2-0")).toBeVisible();

  // Deja el partido como estaba (pendiente, sin pronóstico) para que el test se pueda
  // re-correr en el mismo Mongo de dev sin ir consumiendo las 3 fechas de datos mock.
  await finishedCard.getByRole("button", { name: "Reiniciar (dev)" }).click();
  await dismissBadgeOverlayIfPresent(page);
  await expect(
    page.locator(`[data-testid="match-card"][data-match-status="pending"][data-match-id="${matchId}"]`)
  ).toBeVisible();
});
