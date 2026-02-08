import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { progressId, moduleId } = body;

    // Get progress record
    const progress = await base44.entities.TrainingProgress.get(progressId);
    
    if (progress.user_email !== user.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get module details
    const module = await base44.entities.TrainingModule.get(moduleId);

    // Verify completion
    if (progress.status !== 'completed') {
      return Response.json({ 
        success: false, 
        error: 'Module not completed' 
      }, { status: 400 });
    }

    // Verify passing score
    if (progress.best_score < module.passing_score) {
      return Response.json({ 
        success: false, 
        error: `Score ${progress.best_score}% is below passing score ${module.passing_score}%` 
      }, { status: 400 });
    }

    // Check if certificate already issued
    if (progress.certificate_issued) {
      const existingCert = await base44.entities.TrainingCertificate.get(progress.certificate_id);
      return Response.json({
        success: true,
        certificate: existingCert,
        message: 'Certificate already issued'
      });
    }

    // Generate unique certificate number
    const certNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const verificationCode = Math.random().toString(36).substr(2, 12).toUpperCase();

    // Create certificate
    const certificate = await base44.entities.TrainingCertificate.create({
      user_email: user.email,
      user_name: user.full_name,
      module_id: moduleId,
      module_title: module.title,
      certificate_number: certNumber,
      issue_date: new Date().toISOString(),
      score_achieved: progress.best_score,
      skills_mastered: module.skills_covered || [],
      verification_code: verificationCode,
      status: 'active',
      metadata: {
        completion_time_minutes: progress.time_spent_minutes,
        attempts_taken: progress.quiz_attempts?.length || 1,
        platform: module.platform
      }
    });

    // Update progress with certificate info
    await base44.entities.TrainingProgress.update(progressId, {
      certificate_issued: true,
      certificate_id: certificate.id
    });

    // Update learning path progress if applicable
    const learningPaths = await base44.entities.LearningPath.filter({
      user_email: user.email,
      status: 'active'
    });

    for (const path of learningPaths) {
      const recommendedModules = path.recommended_modules || [];
      const completedCount = recommendedModules.filter(rm => {
        const prog = progress.find(p => p.module_id === rm.module_id && p.status === 'completed');
        return !!prog;
      }).length;
      
      const progressPercentage = recommendedModules.length > 0 
        ? (completedCount / recommendedModules.length) * 100 
        : 0;

      await base44.entities.LearningPath.update(path.id, {
        progress_percentage: Math.round(progressPercentage)
      });
    }

    // Log audit
    await base44.asServiceRole.entities.AuditLog.create({
      user_email: user.email,
      action_type: 'create',
      entity_type: 'TrainingCertificate',
      entity_id: certificate.id,
      success: true
    });

    return Response.json({
      success: true,
      certificate,
      message: 'Certificate issued successfully'
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});