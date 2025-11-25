import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, baseId, tableId, recordId, fields, filterFormula } = await req.json();

    const apiKey = Deno.env.get("AIRTABLE_API_KEY");
    
    if (!apiKey) {
      return Response.json({ 
        error: 'Airtable not configured',
        note: 'Add AIRTABLE_API_KEY to secrets' 
      }, { status: 400 });
    }

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };

    const baseUrl = `https://api.airtable.com/v0/${baseId}/${tableId}`;
    let result;

    if (action === 'list') {
      const url = filterFormula ? `${baseUrl}?filterByFormula=${encodeURIComponent(filterFormula)}` : baseUrl;
      const response = await fetch(url, { headers });
      result = await response.json();
    } else if (action === 'create') {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ fields })
      });
      result = await response.json();
    } else if (action === 'update') {
      const response = await fetch(`${baseUrl}/${recordId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ fields })
      });
      result = await response.json();
    } else if (action === 'delete') {
      const response = await fetch(`${baseUrl}/${recordId}`, {
        method: 'DELETE',
        headers
      });
      result = await response.json();
    }

    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});