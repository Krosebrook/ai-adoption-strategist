import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Export Assessment Full Report as PowerPoint
 * 
 * ⚠️ PLACEHOLDER IMPLEMENTATION ⚠️
 * 
 * This function currently generates a JSON structure representing PowerPoint content.
 * For actual PowerPoint (.pptx) generation, you would need:
 * 
 * RECOMMENDED LIBRARIES:
 * 1. PptxGenJS (https://gitbrent.github.io/PptxGenJS/)
 *    - Client-side and server-side PowerPoint generation
 *    - Rich API for slides, charts, tables, images
 *    - Example: npm:pptxgenjs@3.12.0
 * 
 * 2. officegen (Node.js only)
 *    - Generate Office Open XML files
 *    - Supports PowerPoint, Word, Excel
 * 
 * 3. node-pptx
 *    - Another PowerPoint generation library
 * 
 * IMPLEMENTATION APPROACH:
 * ```javascript
 * import pptxgen from 'npm:pptxgenjs@3.12.0';
 * 
 * const pptx = new pptxgen();
 * 
 * // Title slide
 * let slide = pptx.addSlide();
 * slide.addText('Enterprise AI Assessment', { 
 *   x: 1, y: 2, fontSize: 44, bold: true 
 * });
 * 
 * // Add charts, tables, etc.
 * slide.addChart(pptx.ChartType.bar, chartData, chartOptions);
 * 
 * // Export
 * const pptxBuffer = await pptx.write('arraybuffer');
 * return new Response(pptxBuffer, {...});
 * ```
 * 
 * For now, this returns a structured JSON that could be used to generate PowerPoint.
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { assessmentId } = await req.json();

        if (!assessmentId) {
            return Response.json({ error: 'Assessment ID is required' }, { status: 400 });
        }

        // Fetch assessment data
        const assessments = await base44.entities.Assessment.filter({ id: assessmentId });
        const assessment = assessments[0];

        if (!assessment) {
            return Response.json({ error: 'Assessment not found' }, { status: 404 });
        }

        // Generate PowerPoint structure (JSON representation)
        const powerPointStructure = {
            metadata: {
                title: `${assessment.organization_name} - AI Platform Assessment`,
                author: user.full_name || user.email,
                subject: 'Enterprise AI Assessment Report',
                created: new Date().toISOString()
            },
            slides: [
                // Slide 1: Title
                {
                    type: 'title',
                    title: 'Enterprise AI Platform Assessment',
                    subtitle: assessment.organization_name,
                    date: new Date(assessment.assessment_date).toLocaleDateString(),
                    footer: 'Confidential'
                },
                // Slide 2: Executive Summary
                {
                    type: 'content',
                    title: 'Executive Summary',
                    content: [
                        {
                            type: 'text',
                            text: assessment.executive_summary?.substring(0, 500) || 'No summary available'
                        }
                    ]
                },
                // Slide 3: Top Recommendation
                {
                    type: 'content',
                    title: 'Top Recommendation',
                    content: assessment.recommended_platforms?.slice(0, 1).map(rec => ({
                        type: 'recommendation_card',
                        platform: rec.platform_name,
                        score: rec.score,
                        justification: rec.justification,
                        metrics: {
                            roi: rec.roi_score,
                            compliance: rec.compliance_score,
                            integration: rec.integration_score,
                            pain_points: rec.pain_point_score
                        }
                    }))
                },
                // Slide 4: Platform Comparison
                {
                    type: 'comparison',
                    title: 'Platform Comparison',
                    platforms: assessment.recommended_platforms?.map(rec => ({
                        name: rec.platform_name,
                        score: rec.score,
                        roi: rec.roi_score,
                        compliance: rec.compliance_score,
                        integration: rec.integration_score
                    }))
                },
                // Slide 5: ROI Analysis
                {
                    type: 'chart',
                    title: 'ROI Analysis by Platform',
                    chartType: 'bar',
                    data: Object.entries(assessment.roi_calculations || {}).map(([platform, data]) => ({
                        platform: platform.replace(/_/g, ' '),
                        net_savings: data.net_annual_savings,
                        one_year_roi: data.one_year_roi
                    }))
                },
                // Slide 6: Compliance Matrix
                {
                    type: 'table',
                    title: 'Compliance Scorecard',
                    headers: ['Platform', 'Score', ...assessment.compliance_requirements || []],
                    rows: Object.entries(assessment.compliance_scores || {}).map(([platform, data]) => ({
                        platform: platform.replace(/_/g, ' '),
                        score: `${data.compliance_score.toFixed(0)}%`,
                        statuses: assessment.compliance_requirements?.map(req => 
                            data.status_details?.[req] || 'unknown'
                        )
                    }))
                },
                // Slide 7: Integration Compatibility
                {
                    type: 'table',
                    title: 'Integration Compatibility',
                    content: Object.entries(assessment.integration_scores || {}).map(([platform, data]) => ({
                        platform: platform.replace(/_/g, ' '),
                        score: `${data.integration_score.toFixed(0)}%`,
                        native: data.native,
                        api: data.api,
                        limited: data.limited,
                        not_supported: data.not_supported
                    }))
                },
                // Slide 8: Department Breakdown
                {
                    type: 'content',
                    title: 'Department Overview',
                    content: assessment.departments?.map(dept => ({
                        type: 'department_card',
                        name: dept.name,
                        users: dept.user_count,
                        hourly_rate: dept.hourly_rate,
                        annual_spend: dept.annual_spend
                    }))
                },
                // Slide 9: Pain Points & Solutions
                {
                    type: 'bullets',
                    title: 'Pain Points & AI Solutions',
                    bullets: assessment.pain_point_mappings?.map(mapping => ({
                        pain_point: mapping.pain_point,
                        solution: mapping.solution,
                        platforms: mapping.recommended_platforms
                    }))
                },
                // Slide 10: Next Steps
                {
                    type: 'bullets',
                    title: 'Recommended Next Steps',
                    bullets: [
                        'Schedule pilot program with recommended platform',
                        'Identify 10-20 early adopters from key departments',
                        'Establish success metrics and KPIs',
                        'Plan phased rollout over 6-12 months',
                        'Set up training and change management programs',
                        'Monitor and measure ROI quarterly'
                    ]
                }
            ]
        };

        // TODO: Replace this with actual PowerPoint generation using PptxGenJS
        // For now, return JSON structure that could be used by frontend
        // or converted to PowerPoint format

        // Option 1: Return JSON for frontend processing
        return Response.json({
            success: true,
            message: 'PowerPoint structure generated. In production, this would be a .pptx file.',
            structure: powerPointStructure,
            instructions: {
                library: 'PptxGenJS',
                npm_package: 'npm:pptxgenjs@3.12.0',
                implementation_note: 'Install PptxGenJS and use the structure above to generate actual .pptx file'
            }
        });

        // Option 2: Generate a simple text file as placeholder
        // Uncomment below to download a text representation instead:
        /*
        const textContent = JSON.stringify(powerPointStructure, null, 2);
        const encoder = new TextEncoder();
        const bytes = encoder.encode(textContent);

        return new Response(bytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="${assessment.organization_name.replace(/[^a-z0-9]/gi, '_')}_Assessment_Structure.json"`
            }
        });
        */

    } catch (error) {
        console.error('PowerPoint generation error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});