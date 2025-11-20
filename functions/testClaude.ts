import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, model = 'claude-3-5-sonnet-20241022', max_tokens = 500 } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY'),
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json({ 
        error: data.error?.message || 'Claude API error',
        platform: 'Anthropic Claude'
      }, { status: response.status });
    }

    return Response.json({
      platform: 'Anthropic Claude',
      model: data.model,
      response: data.content[0].text,
      usage: data.usage,
      status: 'success'
    });
  } catch (error) {
    return Response.json({ 
      error: error.message,
      platform: 'Anthropic Claude',
      status: 'error'
    }, { status: 500 });
  }
});