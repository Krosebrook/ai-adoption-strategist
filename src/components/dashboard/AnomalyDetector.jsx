import { base44 } from '@/api/base44Client';

// Detect anomalies in assessment metrics
export async function detectAnomalies(assessments, userEmail) {
  if (!assessments || assessments.length < 5) return; // Need baseline data

  const anomalies = [];

  // Calculate baselines
  const roiValues = [];
  const complianceValues = [];
  const costValues = [];

  assessments.forEach(a => {
    if (a.roi_calculations) {
      Object.values(a.roi_calculations).forEach(roi => {
        roiValues.push(roi.one_year_roi || 0);
        costValues.push(roi.total_cost || 0);
      });
    }
    if (a.compliance_scores) {
      Object.values(a.compliance_scores).forEach(score => {
        complianceValues.push(score.overall_score || 0);
      });
    }
  });

  // Calculate mean and standard deviation
  const getMean = (arr) => arr.reduce((sum, v) => sum + v, 0) / arr.length;
  const getStdDev = (arr, mean) => {
    const variance = arr.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / arr.length;
    return Math.sqrt(variance);
  };

  const roiMean = getMean(roiValues);
  const roiStdDev = getStdDev(roiValues, roiMean);
  const complianceMean = getMean(complianceValues);
  const complianceStdDev = getStdDev(complianceValues, complianceMean);
  const costMean = getMean(costValues);
  const costStdDev = getStdDev(costValues, costMean);

  // Check recent assessments for anomalies
  const recent = assessments.slice(0, 3);
  
  for (const assessment of recent) {
    if (assessment.roi_calculations) {
      Object.entries(assessment.roi_calculations).forEach(([platform, roi]) => {
        const roiValue = roi.one_year_roi || 0;
        const deviation = Math.abs(roiValue - roiMean);
        
        if (deviation > roiStdDev * 2) { // 2 sigma threshold
          const deviationPercent = ((roiValue - roiMean) / roiMean) * 100;
          anomalies.push({
            user_email: userEmail,
            metric_type: 'roi',
            metric_name: `${platform} ROI`,
            current_value: roiValue,
            expected_value: roiMean,
            deviation_percent: deviationPercent,
            severity: deviation > roiStdDev * 3 ? 'high' : 'medium',
            status: 'new',
            detected_at: new Date().toISOString(),
            context: {
              assessment_id: assessment.id,
              platform
            }
          });
        }

        const costValue = roi.total_cost || 0;
        const costDeviation = Math.abs(costValue - costMean);
        
        if (costDeviation > costStdDev * 2) {
          const deviationPercent = ((costValue - costMean) / costMean) * 100;
          anomalies.push({
            user_email: userEmail,
            metric_type: 'cost',
            metric_name: `${platform} Cost`,
            current_value: costValue,
            expected_value: costMean,
            deviation_percent: deviationPercent,
            severity: costDeviation > costStdDev * 3 ? 'high' : 'medium',
            status: 'new',
            detected_at: new Date().toISOString(),
            context: {
              assessment_id: assessment.id,
              platform
            }
          });
        }
      });
    }

    if (assessment.compliance_scores) {
      Object.entries(assessment.compliance_scores).forEach(([platform, score]) => {
        const complianceValue = score.overall_score || 0;
        const deviation = Math.abs(complianceValue - complianceMean);
        
        if (deviation > complianceStdDev * 2) {
          const deviationPercent = ((complianceValue - complianceMean) / complianceMean) * 100;
          anomalies.push({
            user_email: userEmail,
            metric_type: 'compliance',
            metric_name: `${platform} Compliance`,
            current_value: complianceValue,
            expected_value: complianceMean,
            deviation_percent: deviationPercent,
            severity: deviation > complianceStdDev * 3 ? 'high' : 'medium',
            status: 'new',
            detected_at: new Date().toISOString(),
            context: {
              assessment_id: assessment.id,
              platform
            }
          });
        }
      });
    }
  }

  // Save anomalies to database
  if (anomalies.length > 0) {
    await base44.entities.MetricAnomaly.bulkCreate(anomalies);
  }

  return anomalies;
}