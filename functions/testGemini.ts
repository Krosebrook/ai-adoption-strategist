import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, model = 'gemini-1.5-flash' } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('GOOGLE_API_KEY');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return Response.json({ 
        error: data.error?.message || 'Gemini API error',
        platform: 'Google Gemini'
      }, { status: response.status });
    }

    return Response.json({
      platform: 'Google Gemini',
      model,
      response: data.candidates[0].content.parts[0].text,
      usage: data.usageMetadata,
      status: 'success'
    });
  } catch (error) {
    return Response.json({ 
      error: error.message,
      platform: 'Google Gemini',
      status: 'error'
    }, { status: 500 });
  }
});