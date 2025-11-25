import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { datasetName, data, refreshDataset } = await req.json();

    // This generates a Power BI-compatible JSON export
    // For full integration, use Microsoft Power BI REST API with Azure AD auth

    const powerBIData = {
      name: datasetName,
      tables: [
        {
          name: "Assessments",
          columns: [
            { name: "id", dataType: "string" },
            { name: "organization_name", dataType: "string" },
            { name: "status", dataType: "string" },
            { name: "created_date", dataType: "dateTime" },
            { name: "top_platform", dataType: "string" },
            { name: "roi_score", dataType: "double" }
          ],
          rows: data?.assessments?.map(a => ({
            id: a.id,
            organization_name: a.organization_name,
            status: a.status,
            created_date: a.created_date,
            top_platform: a.recommended_platforms?.[0]?.platform_name,
            roi_score: a.recommended_platforms?.[0]?.score
          })) || []
        },
        {
          name: "Strategies",
          columns: [
            { name: "id", dataType: "string" },
            { name: "organization_name", dataType: "string" },
            { name: "platform", dataType: "string" },
            { name: "status", dataType: "string" },
            { name: "progress", dataType: "double" },
            { name: "risk_score", dataType: "double" }
          ],
          rows: data?.strategies?.map(s => ({
            id: s.id,
            organization_name: s.organization_name,
            platform: s.platform,
            status: s.status,
            progress: s.progress_tracking?.overall_progress || 0,
            risk_score: s.risk_analysis?.risk_score || 0
          })) || []
        }
      ]
    };

    return Response.json({ 
      success: true, 
      data: powerBIData,
      note: "Export to Power BI Desktop or use Push API for real-time updates"
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});