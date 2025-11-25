import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { webhookUrl, title, message, themeColor, sections } = await req.json();

    if (!webhookUrl) {
      return Response.json({ 
        error: 'Teams webhook URL required' 
      }, { status: 400 });
    }

    const card = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      themeColor: themeColor || "E88A1D",
      summary: title,
      sections: sections || [{
        activityTitle: title,
        text: message,
        facts: [
          { name: "Sent by", value: user.full_name },
          { name: "Time", value: new Date().toLocaleString() }
        ]
      }]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card)
    });

    if (!response.ok) {
      throw new Error('Teams webhook failed');
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});