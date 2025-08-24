import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    if (req.method === 'GET') {
      // Verificação do webhook pela Meta
      const url = new URL(req.url)
      const mode = url.searchParams.get('hub.mode')
      const token = url.searchParams.get('hub.verify_token')
      const challenge = url.searchParams.get('hub.challenge')

      console.log('Webhook verification:', { mode, token, challenge })

      // Buscar token de verificação do banco
      const { data: config } = await supabase
        .from('whatsapp_config')
        .select('webhook_verify_token')
        .eq('active', true)
        .single()

      if (mode === 'subscribe' && token === config?.webhook_verify_token) {
        console.log('Webhook verificado com sucesso!')
        return new Response(challenge, { status: 200 })
      }
      
      console.log('Webhook verification failed')
      return new Response('Forbidden', { status: 403 })
    }

    if (req.method === 'POST') {
      // Receber atualizações de status das mensagens
      const body = await req.json()
      console.log('Webhook payload:', JSON.stringify(body, null, 2))

      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'messages') {
            const value = change.value
            
            // Processar status de entrega
            if (value.statuses) {
              for (const status of value.statuses) {
                await updateMessageStatus(supabase, status)
              }
            }
            
            // Processar mensagens recebidas (respostas dos clientes)
            if (value.messages) {
              for (const message of value.messages) {
                await processIncomingMessage(supabase, message)
              }
            }
          }
        }
      }

      return new Response('OK', { status: 200 })
    }

    return new Response('Method not allowed', { status: 405 })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})

// Atualizar status da mensagem
async function updateMessageStatus(supabase: any, status: any) {
  try {
    const updateData: any = {
      delivery_status: status.status
    }

    if (status.status === 'delivered') {
      updateData.delivered_at = new Date(status.timestamp * 1000).toISOString()
    } else if (status.status === 'read') {
      updateData.read_at = new Date(status.timestamp * 1000).toISOString()
    } else if (status.status === 'failed') {
      updateData.error_message = status.errors?.[0]?.title || 'Falha na entrega'
      updateData.error_code = status.errors?.[0]?.code || 'DELIVERY_FAILED'
    }

    const { error } = await supabase
      .from('whatsapp_logs')
      .update(updateData)
      .eq('message_id', status.id)

    if (error) {
      console.error('Erro ao atualizar status:', error)
    } else {
      console.log(`Status atualizado: ${status.id} -> ${status.status}`)
    }

  } catch (error) {
    console.error('Erro em updateMessageStatus:', error)
  }
}

// Processar mensagens recebidas
async function processIncomingMessage(supabase: any, message: any) {
  try {
    // Log da mensagem recebida
    await supabase.from('whatsapp_logs').insert({
      phone: message.from,
      message_type: 'incoming',
      message_id: message.id,
      status: 'received',
      template_parameters: {
        text: message.text?.body || '',
        type: message.type,
        timestamp: message.timestamp
      }
    })

    console.log(`Mensagem recebida de ${message.from}: ${message.text?.body || message.type}`)

  } catch (error) {
    console.error('Erro em processIncomingMessage:', error)
  }
}