import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, subject, htmlContent, templateId, dynamicData } = await req.json();

    const apiKey = Deno.env.get("SENDGRID_API_KEY");
    
    if (!apiKey) {
      return Response.json({ 
        error: 'SendGrid not configured',
        note: 'Add SENDGRID_API_KEY to secrets' 
      }, { status: 400 });
    }

    const emailData = {
      personalizations: [{ to: [{ email: to }], dynamic_template_data: dynamicData }],
      from: { email: Deno.env.get("SENDGRID_FROM_EMAIL") || "noreply@intinc.ai" },
      subject
    };

    if (templateId) {
      emailData.template_id = templateId;
    } else {
      emailData.content = [{ type: "text/html", value: htmlContent }];
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});