import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.1';

/**
 * Export Assessment Executive Summary as PDF
 * 
 * PLACEHOLDER NOTE: This implementation uses jsPDF for basic PDF generation.
 * For production-grade PDFs with advanced formatting, consider:
 * - pdfmake (for more layout control)
 * - Puppeteer (for HTML-to-PDF rendering)
 * - PDFKit (for Node.js-based generation)
 * 
 * Current limitations:
 * - Basic text formatting only
 * - Limited styling options
 * - No complex tables or charts
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

        // Initialize PDF
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        let yPosition = margin;

        // Helper function to add text with word wrap
        const addText = (text, fontSize = 12, isBold = false) => {
            doc.setFontSize(fontSize);
            if (isBold) {
                doc.setFont(undefined, 'bold');
            } else {
                doc.setFont(undefined, 'normal');
            }

            const lines = doc.splitTextToSize(text, pageWidth - (margin * 2));
            
            lines.forEach(line => {
                if (yPosition > pageHeight - margin) {
                    doc.addPage();
                    yPosition = margin;
                }
                doc.text(line, margin, yPosition);
                yPosition += fontSize * 0.5;
            });
            yPosition += 5;
        };

        // Add header
        doc.setFillColor(30, 41, 59); // slate-800
        doc.rect(0, 0, pageWidth, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text('Enterprise AI Assessment Report', margin, 25);
        doc.setTextColor(0, 0, 0);
        yPosition = 50;

        // Organization info
        addText(`Organization: ${assessment.organization_name}`, 16, true);
        addText(`Assessment Date: ${new Date(assessment.assessment_date).toLocaleDateString()}`, 12);
        yPosition += 5;

        // Add horizontal line
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;

        // Top Recommendation
        const topRec = assessment.recommended_platforms?.[0];
        if (topRec) {
            addText('TOP RECOMMENDATION', 14, true);
            addText(`${topRec.platform_name} (Score: ${topRec.score.toFixed(0)}/100)`, 16, true);
            addText(topRec.justification, 11);
            yPosition += 5;
        }

        // Executive Summary
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
        addText('EXECUTIVE SUMMARY', 14, true);
        
        // Parse markdown-style summary
        const summary = assessment.executive_summary || '';
        const summaryLines = summary.split('\n');
        
        summaryLines.forEach(line => {
            if (line.startsWith('# ')) {
                addText(line.substring(2), 16, true);
            } else if (line.startsWith('## ')) {
                addText(line.substring(3), 14, true);
            } else if (line.startsWith('### ')) {
                addText(line.substring(4), 12, true);
            } else if (line.startsWith('- ')) {
                addText(`  • ${line.substring(2)}`, 11);
            } else if (line.trim()) {
                addText(line, 11);
            } else {
                yPosition += 3;
            }
        });

        // ROI Summary (if space permits)
        if (yPosition < pageHeight - 80) {
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 10;
            addText('ROI HIGHLIGHTS', 14, true);

            const roiData = assessment.roi_calculations?.[topRec?.platform];
            if (roiData) {
                addText(`Annual Net Savings: $${roiData.net_annual_savings?.toLocaleString() || '0'}`, 11);
                addText(`1-Year ROI: ${roiData.one_year_roi?.toFixed(0) || '0'}%`, 11);
                addText(`3-Year ROI: ${roiData.three_year_roi?.toFixed(0) || '0'}%`, 11);
            }
        }

        // Add footer
        const totalPages = doc.internal.pages.length - 1;
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text(
                `Page ${i} of ${totalPages}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
            doc.text(
                'Enterprise AI Assessment Tool',
                margin,
                pageHeight - 10
            );
        }

        // Generate PDF as ArrayBuffer
        const pdfBytes = doc.output('arraybuffer');

        return new Response(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${assessment.organization_name.replace(/[^a-z0-9]/gi, '_')}_AI_Assessment.pdf"`
            }
        });

    } catch (error) {
        console.error('PDF generation error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});