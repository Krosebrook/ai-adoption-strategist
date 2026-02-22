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

    // Use Core AI integration for video script generation
    const scriptResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional video script writer creating an engaging ${validDuration}-second overview video for an enterprise AI platform adoption tool.

Topic: ${topic}

Create a compelling video script that includes:

1. **Hook (0-10 seconds)**: An attention-grabbing opening that immediately conveys value
2. **Problem Statement (10-30 seconds)**: Identify the key challenges organizations face
3. **Solution Overview (30-90 seconds)**: Explain how the platform solves these problems with specific features
4. **Call to Action (90-${validDuration} seconds)**: Clear next steps for the viewer

The platform helps organizations:
- Assess AI readiness and maturity
- Compare 70+ AI platforms (Claude, ChatGPT, Gemini, Copilot, etc.)
- Generate ROI projections and cost analysis
- Create implementation roadmaps
- Monitor governance and compliance
- Train teams with personalized learning paths

Format your response as a structured video script with timestamp markers, visual suggestions, voiceover narration text, and key messaging points. Make it professional, engaging, and actionable.`,
      add_context_from_internet: false
    });

    if (!scriptResponse) {
      return Response.json({ error: 'Failed to generate video script' }, { status: 500 });
    }

    const scriptContent = typeof scriptResponse === 'string' ? scriptResponse : JSON.stringify(scriptResponse);

    // Parse the script into structured sections
    const sections = parseVideoScript(scriptContent);

    // Generate visual suggestions
    const visualsResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on this video script about ${topic}, suggest 5-7 specific visual elements or animations that would make this video engaging.

Script:
${scriptContent.substring(0, 1500)}

Return a simple array of visual suggestion strings.`,
      add_context_from_internet: false,
      response_json_schema: {
        type: 'object',
        properties: {
          suggestions: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    });

    const visualSuggestions = visualsResponse?.suggestions || [];

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