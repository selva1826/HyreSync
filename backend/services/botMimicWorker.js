import Application from '../models/Application.js';
import Job from '../models/Job.js';
import ActivityLog from '../models/ActivityLog.js';
import resumeParser from './resumeParser.js';
import scoringEngine from './scoringEngine.js';

/**
 * 🤖 BOT MIMIC AUTOMATION WORKER
 * Processes technical role applications automatically
 * Runs every 30 seconds to check for new applications
 */

class BotMimicWorker {
  constructor() {
    this.isProcessing = false;
    this.processedCount = 0;
  }

  /**
   * Start the worker (called from server.js)
   */
  start() {
    console.log('🤖 Bot Mimic Worker started - Monitoring applications...');
    
    // Process immediately on startup
    this.processApplications();
    
    // Then process every 30 seconds
    setInterval(() => {
      this.processApplications();
    }, 30000); // 30 seconds
  }

  /**
   * Main processing loop
   */
  async processApplications() {
    if (this.isProcessing) {
      return; // Prevent concurrent processing
    }

    try {
      this.isProcessing = true;

      // Find unprocessed applications for TECHNICAL roles only
      const applications = await Application.find({
        'evaluation.isProcessed': false,
        status: 'Applied'
      }).populate('jobId applicantId');

      if (applications.length === 0) {
        return;
      }

      console.log(`🤖 Bot Mimic: Found ${applications.length} new application(s) to process`);

      for (const application of applications) {
        // Skip if job is non-technical
        if (application.jobId.type !== 'technical') {
          console.log(`⏭️  Skipping Application ${application._id} - Non-technical role`);
          continue;
        }

        await this.processApplication(application);
      }

    } catch (error) {
      console.error('❌ Bot Mimic Worker Error:', error.message);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single application
   */
  async processApplication(application) {
    const startTime = Date.now();
    console.log(`\n🔍 Processing Application ${application._id}...`);

    try {
      // STEP 1: Parse resume
      console.log('  📄 Parsing resume...');
      const parsedData = await resumeParser.parse(application.resumeText);
      
      // Update application with parsed data
      application.parsedData = parsedData;

      // STEP 2: Score candidate
      console.log('  🧠 Evaluating candidate...');
      const evaluation = await scoringEngine.evaluateCandidate(
        parsedData,
        application.jobId.requirements
      );

      // STEP 3: Make decision
      const newStatus = evaluation.decision === 'passed' ? 'Reviewed' : 'Rejected';
      const oldStatus = application.status;

      // Update application
      application.evaluation = {
        isProcessed: true,
        processedAt: new Date(),
        score: evaluation.overallScore,
        breakdown: evaluation.breakdown,
        decision: evaluation.decision,
        reasoning: evaluation.reasoning,
        confidence: evaluation.confidence
      };
      
      application.status = newStatus;
      
      if (newStatus === 'Rejected') {
        application.rejectionReason = evaluation.reasoning;
      }

      // Update current stage
      const workflow = application.jobId.workflow.stages;
      const newStage = workflow.find(s => s.name === newStatus);
      if (newStage) {
        application.currentStage = {
          name: newStage.name,
          order: newStage.order,
          enteredAt: new Date()
        };
      }

      await application.save();

      // STEP 4: Create activity log
      await ActivityLog.create({
        applicationId: application._id,
        actor: {
          type: 'bot_mimic',
          id: null,
          name: 'Bot Mimic (Automated)'
        },
        action: 'application_evaluated',
        details: {
          fromStatus: oldStatus,
          toStatus: newStatus,
          score: evaluation.overallScore,
          reasoning: evaluation.reasoning
        }
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log(`  ✅ Application ${application._id} processed in ${duration}s`);
      console.log(`     Score: ${evaluation.overallScore}/100`);
      console.log(`     Decision: ${evaluation.decision.toUpperCase()}`);
      console.log(`     Status: ${oldStatus} → ${newStatus}`);
      
      this.processedCount++;

      // TODO: Send email notification to applicant (optional for localhost)

    } catch (error) {
      console.error(`  ❌ Error processing application ${application._id}:`, error.message);
      
      // Mark as processed with error
      application.evaluation.isProcessed = true;
      application.evaluation.processedAt = new Date();
      await application.save();
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalProcessed: this.processedCount,
      isCurrentlyProcessing: this.isProcessing
    };
  }
}

export default new BotMimicWorker();
