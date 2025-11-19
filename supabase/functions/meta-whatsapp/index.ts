import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface WhatsAppConfig {
  business_account_id: string
  phone_number_id: string
  access_token: string
  api_version: string
  test_mode: boolean
}

interface MessageTemplate {
  name: string
  language: { code: string }
  components: Array<{
    type: string
    parameters: Array<{ type: string; text: string }>
  }>
}

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Buscar configuração ativa do WhatsApp
    const { data: config, error: configError } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('active', true)
      .single()

    if (configError || !config) {
      throw new Error('Configuração WhatsApp não encontrada')
    }

    const whatsappConfig: WhatsAppConfig = config

    // Buscar agendamentos que precisam de lembretes
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000)

    // Lembretes 24h antes
    const { data: appointments24h } = await supabase
      .from('appointments')
      .select(`
        *,
        clients(name, phone),
        nail_designers(name)
      `)
      .eq('date', tomorrow.toISOString().split('T')[0])
      .eq('status', 'confirmed')
      .is('reminder_24h_sent_at', null)
      .eq('whatsapp_reminder_status', 'pending')

    // Lembretes 2h antes
    const { data: appointments2h } = await supabase
      .from('appointments')
      .select(`
        *,
        clients(name, phone),
        nail_designers(name)
      `)
      .eq('date', now.toISOString().split('T')[0])
      .eq('status', 'confirmed')
      .is('reminder_2h_sent_at', null)
      .gte('time', in2Hours.toTimeString().slice(0, 5))
      .lte('time', new Date(in2Hours.getTime() + 30 * 60 * 1000).toTimeString().slice(0, 5))

    let successCount = 0
    let errorCount = 0
    const results = []

    // Processar lembretes 24h
    for (const appointment of appointments24h || []) {
      try {
        const result = await sendWhatsAppTemplate(
          whatsappConfig,
          appointment.clients.phone,
          'appointment_reminder_24h',
          [
            appointment.clients.name,
            formatDate(appointment.date),
            appointment.time,
            appointment.nail_designers.name
          ]
        )

        // Log da mensagem
        await supabase.from('whatsapp_logs').insert({
          appointment_id: appointment.id,
          phone: appointment.clients.phone,
          message_type: 'reminder_24h',
          message_id: result.messages[0].id,
          template_name: 'appointment_reminder_24h',
          template_parameters: [
            appointment.clients.name,
            formatDate(appointment.date),
            appointment.time,
            appointment.nail_designers.name
          ],
          status: 'sent'
        })

        // Atualizar appointment
        await supabase
          .from('appointments')
          .update({ 
            reminder_24h_sent_at: new Date().toISOString(),
            whatsapp_reminder_status: 'sent'
          })
          .eq('id', appointment.id)

        successCount++
        results.push({ type: '24h', appointment_id: appointment.id, status: 'success' })

      } catch (error) {
        console.error(`Erro 24h para ${appointment.clients.phone}:`, error)
        
        await supabase.from('whatsapp_logs').insert({
          appointment_id: appointment.id,
          phone: appointment.clients.phone,
          message_type: 'reminder_24h',
          template_name: 'appointment_reminder_24h',
          status: 'failed',
          error_message: error.message,
          error_code: error.code || 'UNKNOWN'
        })

        errorCount++
        results.push({ type: '24h', appointment_id: appointment.id, status: 'error', error: error.message })
      }
    }

    // Processar lembretes 2h
    for (const appointment of appointments2h || []) {
      try {
        const result = await sendWhatsAppTemplate(
          whatsappConfig,
          appointment.clients.phone,
          'appointment_reminder_2h',
          [
            appointment.clients.name,
            appointment.time,
            appointment.nail_designers.name
          ]
        )

        await supabase.from('whatsapp_logs').insert({
          appointment_id: appointment.id,
          phone: appointment.clients.phone,
          message_type: 'reminder_2h',
          message_id: result.messages[0].id,
          template_name: 'appointment_reminder_2h',
          template_parameters: [
            appointment.clients.name,
            appointment.time,
            appointment.nail_designers.name
          ],
          status: 'sent'
        })

        await supabase
          .from('appointments')
          .update({ 
            reminder_2h_sent_at: new Date().toISOString(),
            whatsapp_reminder_status: 'sent'
          })
          .eq('id', appointment.id)

        successCount++
        results.push({ type: '2h', appointment_id: appointment.id, status: 'success' })

      } catch (error) {
        console.error(`Erro 2h para ${appointment.clients.phone}:`, error)
        
        await supabase.from('whatsapp_logs').insert({
          appointment_id: appointment.id,
          phone: appointment.clients.phone,
          message_type: 'reminder_2h',
          template_name: 'appointment_reminder_2h',
          status: 'failed',
          error_message: error.message,
          error_code: error.code || 'UNKNOWN'
        })

        errorCount++
        results.push({ type: '2h', appointment_id: appointment.id, status: 'error', error: error.message })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total_processed: successCount + errorCount,
          successful: successCount,
          errors: errorCount,
          appointments_24h: appointments24h?.length || 0,
          appointments_2h: appointments2h?.length || 0
        },
        results
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Erro geral na Edge Function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

// Função para enviar template via Meta API
async function sendWhatsAppTemplate(
  config: WhatsAppConfig,
  phone: string,
  templateName: string,
  parameters: string[]
) {
  const url = `https://graph.facebook.com/${config.api_version}/${config.phone_number_id}/messages`
  
  const payload = {
    messaging_product: "whatsapp",
    to: `55${phone.replace(/\D/g, '')}`, // Remove caracteres não numéricos
    type: "template",
    template: {
      name: templateName,
      language: { code: "pt_BR" },
      components: [{
        type: "body",
        parameters: parameters.map(param => ({ type: "text", text: param }))
      }]
    }
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Meta API Error: ${errorData.error?.message || response.status} - ${JSON.stringify(errorData)}`)
  }

  return response.json()
}

// Função para formatar data
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}