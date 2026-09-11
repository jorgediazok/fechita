// Envío de mail vía la API REST de Resend (sin el SDK — un POST alcanza, uno menos para
// instalar). Igual que con las VAPID keys de push: sin RESEND_API_KEY esta capa es no-op y
// la app funciona igual (solo que nadie recibe el mail de verificación).
const RESEND_API_KEY = process.env.RESEND_API_KEY;
// Dominio de pruebas de Resend: manda a cualquier destinatario sin verificar un dominio
// propio. Cambiar a un remitente del dominio real (fechita.app) cuando exista.
const EMAIL_FROM = process.env.EMAIL_FROM ?? "Fechita <onboarding@resend.dev>";

export function isEmailConfigured(): boolean {
  return Boolean(RESEND_API_KEY);
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn(`[email] RESEND_API_KEY no configurada — no se manda "${subject}" a ${to}`);
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: EMAIL_FROM, to, subject, html }),
    });
    if (!res.ok) {
      console.error(`[email] Resend respondió ${res.status}:`, await res.text());
    }
  } catch (err) {
    // Nunca tirar la request del usuario por un mail que no salió.
    console.error("[email] error de red mandando mail:", err);
  }
}
