import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { webhookUrl, eventType, data } = await req.json();

    if (!webhookUrl) {
      return Response.json({ 
        error: 'Webhook URL required' 
      }, { status: 400 });
    }

    const payload = {
      event_type: eventType,
      timestamp: new Date().toISOString(),
      user: {
        email: user.email,
        name: user.full_name
      },
      data
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Webhook delivery failed');
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});