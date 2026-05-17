import type { APIRoute } from 'astro';
import { MAKE_WEBHOOK_URL } from '../../config';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Validación de campos requeridos
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: 'Nombre inválido. Mínimo 2 caracteres.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!data.phone || typeof data.phone !== 'string' || data.phone.trim().length < 8) {
      return new Response(
        JSON.stringify({ success: false, error: 'Número de teléfono inválido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!data.datetime || typeof data.datetime !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Fecha y hora son requeridas.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const selectedDate = new Date(data.datetime);
    const now = new Date();
    if (isNaN(selectedDate.getTime()) || selectedDate <= now) {
      return new Response(
        JSON.stringify({ success: false, error: 'La fecha y hora deben ser futuras.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!data.service || typeof data.service !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Debes seleccionar un servicio.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const payload = {
      name: data.name.trim(),
      phone: data.phone.trim(),
      datetime: data.datetime,
      service: data.service,
      serviceName: (data.serviceName || '').replace('🌿 ', ''),
      source: 'Website Form',
      lang: data.lang || 'es',
      submittedAt: new Date().toISOString(),
    };

    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.status}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('API Booking Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error de conexión al procesar tu reserva. Intenta por WhatsApp.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
