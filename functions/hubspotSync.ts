import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, contactData, dealData } = await req.json();

    const apiKey = Deno.env.get("HUBSPOT_API_KEY");
    
    if (!apiKey) {
      return Response.json({ 
        error: 'HubSpot not configured',
        note: 'Add HUBSPOT_API_KEY to secrets' 
      }, { status: 400 });
    }

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };

    let result;

    if (action === 'create_contact') {
      const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers,
        body: JSON.stringify({ properties: contactData })
      });
      result = await response.json();
    } else if (action === 'create_deal') {
      const response = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
        method: 'POST',
        headers,
        body: JSON.stringify({ properties: dealData })
      });
      result = await response.json();
    } else if (action === 'get_contacts') {
      const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=100', {
        headers
      });
      result = await response.json();
    }

    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});