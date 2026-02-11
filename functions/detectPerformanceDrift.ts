import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { agent_name, lookback_days = 30 } = await req.json();
    
    // Get performance metrics for the specified period
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - lookback_days);
    
    const metrics = await base44.asServiceRole.entities.AIPerformanceMetric.filter({
      agent_name: agent_name || undefined
    });
    
    const recentMetrics = metrics.filter(m => 
      new Date(m.metric_date) >= cutoffDate
    );

    if (recentMetrics.length < 7) {
      return Response.json({ 
        drift_detected: false,
        message: 'Insufficient data for drift detection (minimum 7 days required)'
      });
    }

    // Sort by date
    recentMetrics.sort((a, b) => new Date(a.metric_date) - new Date(b.metric_date));

    // Calculate baselines (first week)
    const baselineMetrics = recentMetrics.slice(0, 7);
    const baselineAvgLatency = baselineMetrics.reduce((sum, m) => sum + (m.avg_latency_ms || 0), 0) / baselineMetrics.length;
    const baselineErrorRate = baselineMetrics.reduce((sum, m) => sum + (m.error_rate || 0), 0) / baselineMetrics.length;
    const baselineAvgRating = baselineMetrics.reduce((sum, m) => sum + (m.avg_rating || 0), 0) / baselineMetrics.length;

    // Calculate recent metrics (last week)
    const recentWindow = recentMetrics.slice(-7);
    const recentAvgLatency = recentWindow.reduce((sum, m) => sum + (m.avg_latency_ms || 0), 0) / recentWindow.length;
    const recentErrorRate = recentWindow.reduce((sum, m) => sum + (m.error_rate || 0), 0) / recentWindow.length;
    const recentAvgRating = recentWindow.reduce((sum, m) => sum + (m.avg_rating || 0), 0) / recentWindow.length;

    // Detect drift (>20% change is considered drift)
    const latencyDrift = ((recentAvgLatency - baselineAvgLatency) / baselineAvgLatency) * 100;
    const errorRateDrift = ((recentErrorRate - baselineErrorRate) / (baselineErrorRate || 1)) * 100;
    const ratingDrift = ((recentAvgRating - baselineAvgRating) / (baselineAvgRating || 1)) * 100;

    const driftDetected = Math.abs(latencyDrift) > 20 || Math.abs(errorRateDrift) > 20 || Math.abs(ratingDrift) > 20;

    const driftAnalysis = {
      drift_detected: driftDetected,
      agent_name: agent_name || 'all',
      analysis_period_days: lookback_days,
      baseline_period: baselineMetrics[0].metric_date + ' to ' + baselineMetrics[6].metric_date,
      recent_period: recentWindow[0].metric_date + ' to ' + recentWindow[6].metric_date,
      metrics: {
        latency: {
          baseline_avg: baselineAvgLatency.toFixed(2),
          recent_avg: recentAvgLatency.toFixed(2),
          drift_percentage: latencyDrift.toFixed(2),
          drift_detected: Math.abs(latencyDrift) > 20
        },
        error_rate: {
          baseline_avg: baselineErrorRate.toFixed(2),
          recent_avg: recentErrorRate.toFixed(2),
          drift_percentage: errorRateDrift.toFixed(2),
          drift_detected: Math.abs(errorRateDrift) > 20
        },
        user_rating: {
          baseline_avg: baselineAvgRating.toFixed(2),
          recent_avg: recentAvgRating.toFixed(2),
          drift_percentage: ratingDrift.toFixed(2),
          drift_detected: Math.abs(ratingDrift) > 20
        }
      },
      alerts: []
    };

    // Generate alerts
    if (Math.abs(latencyDrift) > 20) {
      driftAnalysis.alerts.push({
        severity: latencyDrift > 50 ? 'critical' : 'warning',
        metric: 'latency',
        message: `Latency has ${latencyDrift > 0 ? 'increased' : 'decreased'} by ${Math.abs(latencyDrift).toFixed(1)}%`,
        recommendation: latencyDrift > 0 ? 'Investigate infrastructure capacity and model performance' : 'Monitor for consistency'
      });
    }

    if (Math.abs(errorRateDrift) > 20) {
      driftAnalysis.alerts.push({
        severity: errorRateDrift > 50 ? 'critical' : 'warning',
        metric: 'error_rate',
        message: `Error rate has ${errorRateDrift > 0 ? 'increased' : 'decreased'} by ${Math.abs(errorRateDrift).toFixed(1)}%`,
        recommendation: errorRateDrift > 0 ? 'Review error logs and model behavior immediately' : 'Continue monitoring'
      });
    }

    if (Math.abs(ratingDrift) > 20) {
      driftAnalysis.alerts.push({
        severity: ratingDrift < -30 ? 'critical' : 'warning',
        metric: 'user_rating',
        message: `User ratings have ${ratingDrift > 0 ? 'improved' : 'declined'} by ${Math.abs(ratingDrift).toFixed(1)}%`,
        recommendation: ratingDrift < 0 ? 'Review user feedback and consider model retraining' : 'Identify what improved and replicate'
      });
    }

    // Create risk alert if critical drift detected
    if (driftDetected && driftAnalysis.alerts.some(a => a.severity === 'critical')) {
      await base44.asServiceRole.entities.RiskAlert.create({
        alert_type: 'performance_drift',
        severity: 'high',
        title: `Performance Drift Detected: ${agent_name || 'Multiple Agents'}`,
        description: `Significant performance degradation detected over the last ${lookback_days} days`,
        affected_component: agent_name,
        metrics: driftAnalysis.metrics,
        recommended_actions: driftAnalysis.alerts.map(a => a.recommendation),
        status: 'active'
      });
    }

    return Response.json(driftAnalysis);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});