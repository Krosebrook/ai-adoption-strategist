import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, projectKey, issueData, issueKey } = await req.json();

    const domain = Deno.env.get("JIRA_DOMAIN");
    const email = Deno.env.get("JIRA_EMAIL");
    const apiToken = Deno.env.get("JIRA_API_TOKEN");
    
    if (!domain || !email || !apiToken) {
      return Response.json({ 
        error: 'Jira not configured',
        note: 'Add JIRA_DOMAIN, JIRA_EMAIL, JIRA_API_TOKEN to secrets' 
      }, { status: 400 });
    }

    const auth = btoa(`${email}:${apiToken}`);
    const headers = {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    };

    let result;

    if (action === 'create_issue') {
      const response = await fetch(`https://${domain}/rest/api/3/issue`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fields: {
            project: { key: projectKey },
            ...issueData
          }
        })
      });
      result = await response.json();
    } else if (action === 'get_issue') {
      const response = await fetch(`https://${domain}/rest/api/3/issue/${issueKey}`, {
        headers
      });
      result = await response.json();
    } else if (action === 'list_projects') {
      const response = await fetch(`https://${domain}/rest/api/3/project`, {
        headers
      });
      result = await response.json();
    }

    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});