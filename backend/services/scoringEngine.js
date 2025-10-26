import stringSimilarity from 'string-similarity';

/**
 * 🧠 ADVANCED SCORING ENGINE
 * Multi-dimensional evaluation with confidence scoring and explainable AI
 */

class ScoringEngine {
  
  /**
   * Main scoring function
   * @param {Object} parsedResume - Output from resumeParser
   * @param {Object} jobRequirements - Job requirements from DB
   * @returns {Object} - Comprehensive scoring result
   */
  async evaluateCandidate(parsedResume, jobRequirements) {
    const weights = jobRequirements.weights || {
      skillsMatch: 40,
      experienceMatch: 30,
      educationMatch: 20,
      certificationsMatch: 10
    };
    
    // Calculate individual scores
    const skillsEval = this.evaluateSkills(
      parsedResume.skills,
      jobRequirements.skills
    );
    
    const experienceEval = this.evaluateExperience(
      parsedResume.totalExperience,
      jobRequirements.experience
    );
    
    const educationEval = this.evaluateEducation(
      parsedResume.education,
      jobRequirements.education
    );
    
    const certificationsEval = this.evaluateCertifications(
      parsedResume.certifications,
      jobRequirements.certifications
    );
    
    // Calculate weighted overall score
    const overallScore = (
      (skillsEval.score * weights.skillsMatch) +
      (experienceEval.score * weights.experienceMatch) +
      (educationEval.score * weights.educationMatch) +
      (certificationsEval.score * weights.certificationsMatch)
    ) / 100;
    
    // Generate decision
    const decision = this.makeDecision(
      overallScore,
      jobRequirements.passingScore,
      { skillsEval, experienceEval, educationEval, certificationsEval }
    );
    
    return {
      overallScore: Math.round(overallScore),
      breakdown: {
        skillsScore: skillsEval.score,
        experienceScore: experienceEval.score,
        educationScore: educationEval.score,
        certificationsScore: certificationsEval.score
      },
      decision: decision.outcome,
      reasoning: decision.reasoning,
      confidence: decision.confidence,
      details: {
        skills: skillsEval,
        experience: experienceEval,
        education: educationEval,
        certifications: certificationsEval
      }
    };
  }

  /**
   * 🎯 EVALUATE SKILLS - Advanced matching with fuzzy logic
   */
  evaluateSkills(candidateSkills, requiredSkills) {
    if (!requiredSkills || requiredSkills.length === 0) {
      return { score: 100, matched: [], missing: [], details: 'No specific skills required' };
    }
    
    if (!candidateSkills || candidateSkills.length === 0) {
      return { score: 0, matched: [], missing: requiredSkills, details: 'No skills detected in resume' };
    }
    
    const matched = [];
    const missing = [];
    const candidateLower = candidateSkills.map(s => s.toLowerCase());
    const requiredLower = requiredSkills.map(s => s.toLowerCase());
    
    requiredLower.forEach(required => {
      // Exact match
      if (candidateLower.includes(required)) {
        matched.push(required);
        return;
      }
      
      // Fuzzy match (typos, variations)
      const similarities = candidateLower.map(candidate => 
        stringSimilarity.compareTwoStrings(required, candidate)
      );
      const maxSimilarity = Math.max(...similarities);
      
      if (maxSimilarity > 0.8) {
        matched.push(required);
      } else {
        missing.push(required);
      }
    });
    
    // Calculate score with bonuses
    let baseScore = (matched.length / requiredSkills.length) * 100;
    
    // Bonus: Extra skills beyond requirements
    const extraSkills = candidateSkills.length - matched.length;
    if (extraSkills > 0) {
      baseScore += Math.min(extraSkills * 2, 10); // Max +10 bonus
    }
    
    const finalScore = Math.min(Math.round(baseScore), 100);
    
    return {
      score: finalScore,
      matched,
      missing,
      details: `Matched ${matched.length}/${requiredSkills.length} required skills. ${extraSkills > 0 ? `+${extraSkills} additional skills.` : ''}`
    };
  }

  /**
   * 💼 EVALUATE EXPERIENCE - Contextual scoring
   */
  evaluateExperience(candidateYears, requiredRange) {
    if (!requiredRange || (requiredRange.min === 0 && requiredRange.max === 20)) {
      return { score: 100, details: 'No specific experience requirement' };
    }
    
    const { min, max } = requiredRange;
    
    // Perfect match: within range
    if (candidateYears >= min && candidateYears <= max) {
      return {
        score: 100,
        details: `${candidateYears} years experience (required: ${min}-${max} years) - Perfect fit`
      };
    }
    
    // Overqualified: bonus but not penalty
    if (candidateYears > max) {
      const excess = candidateYears - max;
      const score = Math.max(85, 100 - (excess * 2)); // Slight penalty for extreme overqualification
      return {
        score,
        details: `${candidateYears} years experience (required: ${min}-${max} years) - Overqualified but valuable`
      };
    }
    
    // Underqualified: graduated penalty
    if (candidateYears < min) {
      const deficit = min - candidateYears;
      const score = Math.max(0, 100 - (deficit * 25)); // -25% per year short
      return {
        score,
        details: `${candidateYears} years experience (required: ${min}-${max} years) - ${deficit} years short`
      };
    }
    
    return { score: 0, details: 'Unable to determine experience' };
  }

  /**
   * 🎓 EVALUATE EDUCATION - Pattern matching
   */
  evaluateEducation(candidateEducation, requiredEducation) {
    if (!requiredEducation || requiredEducation.length === 0) {
      return { score: 100, details: 'No specific education requirement' };
    }
    
    if (!candidateEducation || candidateEducation.length === 0) {
      return { score: 0, details: 'No education information found' };
    }
    
    const candidateText = candidateEducation.join(' ').toLowerCase();
    const matches = [];
    
    requiredEducation.forEach(req => {
      const reqLower = req.toLowerCase();
      
      // Check if requirement keywords are in candidate education
      const keywords = reqLower.split(' ');
      const matchCount = keywords.filter(keyword => candidateText.includes(keyword)).length;
      
      if (matchCount >= keywords.length * 0.6) { // 60% keyword match
        matches.push(req);
      }
    });
    
    const matchRatio = matches.length / requiredEducation.length;
    const score = Math.round(matchRatio * 100);
    
    return {
      score,
      details: `Matched ${matches.length}/${requiredEducation.length} education requirements`
    };
  }

  /**
   * 📜 EVALUATE CERTIFICATIONS - Exact + premium bonus
   */
  evaluateCertifications(candidateCerts, requiredCerts) {
    if (!requiredCerts || requiredCerts.length === 0) {
      // Even if not required, give bonus for having them
      if (candidateCerts && candidateCerts.length > 0) {
        return {
          score: 100,
          details: `${candidateCerts.length} certifications found (none required, bonus value)`
        };
      }
      return { score: 100, details: 'No certifications required' };
    }
    
    if (!candidateCerts || candidateCerts.length === 0) {
      return { score: 0, details: 'No certifications found' };
    }
    
    const candidateText = candidateCerts.join(' ').toLowerCase();
    const matched = [];
    
    requiredCerts.forEach(req => {
      const reqLower = req.toLowerCase();
      
      // Fuzzy matching for certifications
      const similarity = stringSimilarity.findBestMatch(reqLower, candidateCerts.map(c => c.toLowerCase()));
      
      if (similarity.bestMatch.rating > 0.7) {
        matched.push(req);
      }
    });
    
    const baseScore = (matched.length / requiredCerts.length) * 100;
    
    // Premium certifications bonus
    const premiumKeywords = ['aws', 'azure', 'gcp', 'kubernetes', 'architect'];
    const hasPremium = candidateCerts.some(cert => 
      premiumKeywords.some(keyword => cert.toLowerCase().includes(keyword))
    );
    
    const finalScore = Math.min(Math.round(hasPremium ? baseScore + 15 : baseScore), 100);
    
    return {
      score: finalScore,
      details: `Matched ${matched.length}/${requiredCerts.length} certifications.${hasPremium ? ' Premium certifications detected (+15%)' : ''}`
    };
  }

  /**
   * ⚖️ MAKE FINAL DECISION - Multi-factor analysis
   */
  makeDecision(overallScore, passingScore, evaluations) {
    const { skillsEval, experienceEval, educationEval, certificationsEval } = evaluations;
    
    // Decision outcome
    const outcome = overallScore >= passingScore ? 'passed' : 'rejected';
    
    // Calculate confidence (how sure are we?)
    let confidence = 0.5;
    
    // High confidence if all components are strong or all weak
    const scores = [
      skillsEval.score,
      experienceEval.score,
      educationEval.score,
      certificationsEval.score
    ];
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length;
    
    // Low variance = high confidence
    confidence = Math.max(0.6, 1 - (variance / 1000));
    
    // Generate human-readable reasoning
    const reasoning = this.generateReasoning(overallScore, passingScore, evaluations, outcome);
    
    return {
      outcome,
      confidence: Math.round(confidence * 100) / 100,
      reasoning
    };
  }

  /**
   * 📝 GENERATE EXPLAINABLE REASONING
   */
  generateReasoning(overallScore, passingScore, evaluations, outcome) {
    const { skillsEval, experienceEval, educationEval, certificationsEval } = evaluations;
    
    let reasoning = `Overall score: ${Math.round(overallScore)}/100 (threshold: ${passingScore}). `;
    
    if (outcome === 'passed') {
      reasoning += '✅ CANDIDATE PASSED. ';
      
      // Highlight strengths
      const strengths = [];
      if (skillsEval.score >= 80) strengths.push(`Strong skills match (${skillsEval.matched.length}/${skillsEval.matched.length + skillsEval.missing.length})`);
      if (experienceEval.score >= 90) strengths.push(`Excellent experience level`);
      if (educationEval.score >= 80) strengths.push(`Education requirements met`);
      if (certificationsEval.score >= 80) strengths.push(`Relevant certifications`);
      
      if (strengths.length > 0) {
        reasoning += `Strengths: ${strengths.join(', ')}. `;
      }
      
      reasoning += `Recommended for next stage.`;
      
    } else {
      reasoning += '❌ CANDIDATE REJECTED. ';
      
      // Highlight weaknesses
      const weaknesses = [];
      if (skillsEval.score < 60) weaknesses.push(`Skills gap: Missing ${skillsEval.missing.join(', ')}`);
      if (experienceEval.score < 50) weaknesses.push(`Insufficient experience`);
      if (educationEval.score < 50) weaknesses.push(`Education requirements not met`);
      
      if (weaknesses.length > 0) {
        reasoning += `Reasons: ${weaknesses.join('; ')}. `;
      }
      
      reasoning += `Does not meet minimum qualifications.`;
    }
    
    return reasoning;
  }
}

export default new ScoringEngine();
