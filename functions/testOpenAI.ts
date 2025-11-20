import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, model = 'gpt-4o-mini', max_tokens = 500 } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`
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
        error: data.error?.message || 'OpenAI API error',
        platform: 'OpenAI ChatGPT'
      }, { status: response.status });
    }

    return Response.json({
      platform: 'OpenAI ChatGPT',
      model: data.model,
      response: data.choices[0].message.content,
      usage: data.usage,
      status: 'success'
    });
  } catch (error) {
    return Response.json({ 
      error: error.message,
      platform: 'OpenAI ChatGPT',
      status: 'error'
    }, { status: 500 });
  }
});