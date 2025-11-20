import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, platforms = ['openai', 'claude', 'gemini'] } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const results = [];
    const startTime = Date.now();

    // Test OpenAI
    if (platforms.includes('openai')) {
      try {
        const openaiStart = Date.now();
        const openaiResponse = await base44.functions.invoke('testOpenAI', { prompt, max_tokens: 300 });
        const openaiTime = Date.now() - openaiStart;
        results.push({
          ...openaiResponse.data,
          response_time_ms: openaiTime
        });
      } catch (error) {
        results.push({
          platform: 'OpenAI ChatGPT',
          status: 'error',
          error: error.message
        });
      }
    }

    // Test Claude
    if (platforms.includes('claude')) {
      try {
        const claudeStart = Date.now();
        const claudeResponse = await base44.functions.invoke('testClaude', { prompt, max_tokens: 300 });
        const claudeTime = Date.now() - claudeStart;
        results.push({
          ...claudeResponse.data,
          response_time_ms: claudeTime
        });
      } catch (error) {
        results.push({
          platform: 'Anthropic Claude',
          status: 'error',
          error: error.message
        });
      }
    }

    // Test Gemini
    if (platforms.includes('gemini')) {
      try {
        const geminiStart = Date.now();
        const geminiResponse = await base44.functions.invoke('testGemini', { prompt });
        const geminiTime = Date.now() - geminiStart;
        results.push({
          ...geminiResponse.data,
          response_time_ms: geminiTime
        });
      } catch (error) {
        results.push({
          platform: 'Google Gemini',
          status: 'error',
          error: error.message
        });
      }
    }

    const totalTime = Date.now() - startTime;

    return Response.json({
      prompt,
      results,
      total_time_ms: totalTime,
      tested_platforms: platforms,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ 
      error: error.message,
      status: 'error'
    }, { status: 500 });
  }
});