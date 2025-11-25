import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channel, message, blocks } = await req.json();

    // This is a placeholder - requires Slack webhook URL in secrets
    const webhookUrl = Deno.env.get("SLACK_WEBHOOK_URL");
    
    if (!webhookUrl) {
      return Response.json({ 
        error: 'Slack webhook not configured',
        note: 'Add SLACK_WEBHOOK_URL to secrets' 
      }, { status: 400 });
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel,
        text: message,
        blocks
      })
    });

    if (!response.ok) {
      throw new Error('Slack API error');
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});