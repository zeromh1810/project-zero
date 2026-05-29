"use server"

/**
 * Contact form using Formspree
 * - Free tier: 50 submissions/month
 * - No API key required in code
 * - Built-in spam protection
 * - Emails sent directly to configured address
 */

// Formspree endpoint - emails will be sent to c.hickmann86@gmail.com
// To set this up: Go to formspree.io, create account with your email, create a form, and get the form ID
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mvzdvbwz"

interface ContactFormData {
  name: string
  email: string
  message: string
}

interface ActionResult {
  success: boolean
  error?: string
}

export async function sendContactEmail(data: ContactFormData): Promise<ActionResult> {
  // Validate input
  if (!data.name || !data.email || !data.message) {
    return { success: false, error: "Todos los campos son requeridos" }
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email)) {
    return { success: false, error: "Email inválido" }
  }

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        message: data.message,
        _subject: `Nuevo mensaje de contacto de ${data.name}`,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Formspree error:", errorData)
      return { success: false, error: "Error al enviar el mensaje. Intenta de nuevo." }
    }

    return { success: true }
  } catch (err) {
    console.error("Contact form error:", err)
    return { success: false, error: "Error al enviar el mensaje. Intenta de nuevo." }
  }
}
