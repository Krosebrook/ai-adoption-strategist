import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      return Response.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { topic, duration = 120 } = requestBody;

    // Validate input
    if (!topic) {
      return Response.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Validate duration
    const validDuration = Math.min(Math.max(parseInt(duration) || 120, 30), 300);

    // Use Gemini to generate a comprehensive video script overview
    const apiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!apiKey) {
      console.error('GOOGLE_API_KEY environment variable not set');
      return Response.json({ 
        error: 'Google API key not configured. Please set GOOGLE_API_KEY in environment variables.' 
      }, { status: 500 });
    }

    const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    const prompt = `You are a professional video script writer creating an engaging ${duration}-second overview video for an enterprise AI platform adoption tool.

Topic: ${topic}

Create a compelling video script that includes:

1. **Hook (0-10 seconds)**: An attention-grabbing opening that immediately conveys value
2. **Problem Statement (10-30 seconds)**: Identify the key challenges organizations face
3. **Solution Overview (30-90 seconds)**: Explain how the platform solves these problems with specific features
4. **Call to Action (90-${validDuration} seconds)**: Clear next steps for the viewer

Format your response as a structured video script with:
- Timestamp markers
- Visual suggestions (what should be shown on screen)
- Voiceover narration text
- Key messaging points
- On-screen text suggestions

Make it professional, engaging, and actionable. Focus on enterprise value proposition.`;

    let geminiResponse;
    try {
      geminiResponse = await fetch(`${geminiUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
      });
    } catch (fetchError) {
      console.error('Gemini API fetch error:', fetchError);
      return Response.json(
        { error: 'Failed to connect to Gemini API', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!geminiResponse.ok) {
      const error = await geminiResponse.text();
      console.error('Gemini API error:', error);
      return Response.json(
        { error: 'Failed to generate video overview', details: error },
        { status: 500 }
      );
    }

    const geminiData = await geminiResponse.json();
    const scriptContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!scriptContent) {
      return Response.json(
        { error: 'No content generated from Gemini' },
        { status: 500 }
      );
    }

    // Parse the script into structured sections
    const sections = parseVideoScript(scriptContent);

    // Generate key visuals suggestions using Gemini
    const visualsPrompt = `Based on this video script about ${topic}, suggest 5-7 specific visual elements or animations that would make this video engaging. Format as a JSON array of objects with "timestamp", "visual", and "description" fields.

Script:
${scriptContent}`;

    const visualsResponse = await fetch(`${geminiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: visualsPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 20,
          topP: 0.9,
          maxOutputTokens: 1024,
        }
      })
    });

    let visualSuggestions = [];
    if (visualsResponse.ok) {
      const visualsData = await visualsResponse.json();
      const visualsText = visualsData.candidates?.[0]?.content?.parts?.[0]?.text;
      try {
        // Extract JSON from the response
        const jsonMatch = visualsText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          visualSuggestions = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error('Error parsing visual suggestions:', e);
      }
    }

    return Response.json({
      success: true,
      overview: {
        topic,
        duration: validDuration,
        script: scriptContent,
        sections,
        visualSuggestions,
        metadata: {
          generatedAt: new Date().toISOString(),
          generatedBy: 'Gemini 1.5 Flash',
          wordCount: scriptContent.split(/\s+/).length,
          estimatedReadingTime: Math.ceil(scriptContent.split(/\s+/).length / 150)
        }
      }
    });

  } catch (error) {
    console.error('Unexpected error in generateVideoOverview:', error);
    return Response.json(
      { 
        error: 'Internal server error', 
        message: error.message
      },
      { status: 500 }
    );
  }
});

function parseVideoScript(script) {
  // Parse script into structured sections
  const sections = [];
  const lines = script.split('\n');
  
  let currentSection = null;
  let currentContent = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check for section headers (e.g., "1. Hook", "## Hook", etc.)
    const sectionMatch = trimmedLine.match(/^(?:\d+\.|##|###|\*\*)\s*(.+?)(?:\*\*)?(?:\s*\((\d+-?\d*)\s*(?:seconds?|s)\))?/i);
    
    if (sectionMatch) {
      // Save previous section
      if (currentSection) {
        sections.push({
          ...currentSection,
          content: currentContent.join('\n').trim()
        });
        currentContent = [];
      }

      // Start new section
      const title = sectionMatch[1].replace(/\*\*/g, '').trim();
      const timestamp = sectionMatch[2] || '';
      
      currentSection = {
        title,
        timestamp
      };
    } else if (currentSection && trimmedLine) {
      currentContent.push(trimmedLine);
    }
  }

  // Add last section
  if (currentSection && currentContent.length > 0) {
    sections.push({
      ...currentSection,
      content: currentContent.join('\n').trim()
    });
  }

  return sections.length > 0 ? sections : [{
    title: 'Full Script',
    timestamp: '0-120',
    content: script
  }];
}