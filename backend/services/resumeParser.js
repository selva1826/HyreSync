import natural from 'natural';
import compromise from 'compromise';
import stringSimilarity from 'string-similarity';

/**
 * 🧠 ADVANCED RESUME PARSER
 * Uses multi-layer NLP to extract structured data from raw resume text
 */

class ResumeParser {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
    
    // 📚 SKILL TAXONOMY DATABASE (expandable)
    this.skillDatabase = this.buildSkillDatabase();
  }

  /**
   * Build comprehensive skill database with synonyms and categories
   */
  buildSkillDatabase() {
    return {
      // Frontend
      'react': { synonyms: ['reactjs', 'react.js', 'react js'], category: 'frontend', weight: 1.0 },
      'vue': { synonyms: ['vuejs', 'vue.js', 'vue js'], category: 'frontend', weight: 1.0 },
      'angular': { synonyms: ['angularjs', 'angular.js'], category: 'frontend', weight: 1.0 },
      'javascript': { synonyms: ['js', 'ecmascript', 'es6'], category: 'frontend', weight: 1.0 },
      'typescript': { synonyms: ['ts'], category: 'frontend', weight: 1.0 },
      'html': { synonyms: ['html5'], category: 'frontend', weight: 0.8 },
      'css': { synonyms: ['css3', 'scss', 'sass'], category: 'frontend', weight: 0.8 },
      
      // Backend
      'node': { synonyms: ['nodejs', 'node.js', 'node js'], category: 'backend', weight: 1.0 },
      'express': { synonyms: ['expressjs', 'express.js'], category: 'backend', weight: 1.0 },
      'python': { synonyms: ['py'], category: 'backend', weight: 1.0 },
      'django': { synonyms: [], category: 'backend', weight: 1.0 },
      'flask': { synonyms: [], category: 'backend', weight: 1.0 },
      'java': { synonyms: [], category: 'backend', weight: 1.0 },
      'spring': { synonyms: ['spring boot', 'springboot'], category: 'backend', weight: 1.0 },
      
      // Databases
      'mongodb': { synonyms: ['mongo'], category: 'database', weight: 1.0 },
      'postgresql': { synonyms: ['postgres', 'psql'], category: 'database', weight: 1.0 },
      'mysql': { synonyms: ['sql'], category: 'database', weight: 1.0 },
      'redis': { synonyms: [], category: 'database', weight: 1.0 },
      
      // DevOps
      'docker': { synonyms: [], category: 'devops', weight: 1.0 },
      'kubernetes': { synonyms: ['k8s'], category: 'devops', weight: 1.0 },
      'aws': { synonyms: ['amazon web services'], category: 'cloud', weight: 1.0 },
      'azure': { synonyms: ['microsoft azure'], category: 'cloud', weight: 1.0 },
      'gcp': { synonyms: ['google cloud'], category: 'cloud', weight: 1.0 },
      
      // Tools
      'git': { synonyms: ['github', 'gitlab', 'bitbucket'], category: 'tools', weight: 0.9 },
      'jenkins': { synonyms: [], category: 'tools', weight: 0.9 },
      'jira': { synonyms: [], category: 'tools', weight: 0.7 }
    };
  }

  /**
   * Main parsing function
   */
  async parse(resumeText) {
    const cleanText = this.preprocessText(resumeText);
    
    return {
      skills: this.extractSkills(cleanText),
      experience: this.extractExperience(cleanText),
      education: this.extractEducation(cleanText),
      certifications: this.extractCertifications(cleanText),
      totalExperience: this.calculateTotalExperience(cleanText)
    };
  }

  /**
   * Preprocess text: remove noise, normalize
   */
  preprocessText(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s.,\-()]/g, ' ') // Remove special chars except basic punctuation
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * 🎯 EXTRACT SKILLS - Multi-layer approach
   */
  extractSkills(text) {
    const detectedSkills = new Set();
    const tokens = this.tokenizer.tokenize(text);
    
    // Layer 1: Exact matching
    for (const [skill, data] of Object.entries(this.skillDatabase)) {
      const pattern = new RegExp(`\\b${skill}\\b`, 'i');
      if (pattern.test(text)) {
        detectedSkills.add(skill);
      }
      
      // Check synonyms
      for (const synonym of data.synonyms) {
        const synPattern = new RegExp(`\\b${synonym}\\b`, 'i');
        if (synPattern.test(text)) {
          detectedSkills.add(skill);
        }
      }
    }
    
    // Layer 2: Fuzzy matching (catches typos)
    const skillNames = Object.keys(this.skillDatabase);
    tokens.forEach(token => {
      const matches = stringSimilarity.findBestMatch(token, skillNames);
      if (matches.bestMatch.rating > 0.85) {
        detectedSkills.add(matches.bestMatch.target);
      }
    });
    
    return Array.from(detectedSkills);
  }

  /**
   * 💼 EXTRACT EXPERIENCE - Pattern matching + NLP
   */
  extractExperience(text) {
    const doc = compromise(text);
    const experiences = [];
    
    // Pattern 1: "Software Engineer at Company (2020-2023)"
    const expPattern1 = /([a-z\s]+)\s+at\s+([a-z\s&]+)\s*\(?\s*(\d{4})\s*-\s*(\d{4}|present)\s*\)?/gi;
    let match;
    
    while ((match = expPattern1.exec(text)) !== null) {
      const [, title, company, startYear, endYear] = match;
      const start = new Date(startYear, 0);
      const end = endYear === 'present' ? new Date() : new Date(endYear, 0);
      const duration = Math.round((end - start) / (1000 * 60 * 60 * 24 * 30)); // months
      
      experiences.push({
        title: title.trim(),
        company: company.trim(),
        duration,
        startDate: start,
        endDate: end
      });
    }
    
    // Pattern 2: "2020-2023: Software Engineer"
    const expPattern2 = /(\d{4})\s*-\s*(\d{4}|present)\s*:?\s*([a-z\s]+)/gi;
    while ((match = expPattern2.exec(text)) !== null) {
      const [, startYear, endYear, title] = match;
      const start = new Date(startYear, 0);
      const end = endYear === 'present' ? new Date() : new Date(endYear, 0);
      const duration = Math.round((end - start) / (1000 * 60 * 60 * 24 * 30));
      
      experiences.push({
        title: title.trim(),
        company: 'Not specified',
        duration,
        startDate: start,
        endDate: end
      });
    }
    
    return experiences;
  }

  /**
   * 🎓 EXTRACT EDUCATION
   */
  extractEducation(text) {
    const educationKeywords = [
      'bachelor', 'master', 'phd', 'doctorate', 'diploma',
      'b.tech', 'b.e', 'm.tech', 'm.s', 'mba', 'bba',
      'computer science', 'engineering', 'information technology'
    ];
    
    const found = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (educationKeywords.some(keyword => lowerLine.includes(keyword))) {
        found.push(line.trim());
      }
    });
    
    return found;
  }

  /**
   * 📜 EXTRACT CERTIFICATIONS
   */
  extractCertifications(text) {
    const certPatterns = [
      /aws\s+certified/i,
      /azure\s+certified/i,
      /google\s+cloud\s+certified/i,
      /cisco\s+certified/i,
      /pmp\s+certified/i,
      /certified\s+kubernetes/i,
      /oracle\s+certified/i,
      /microsoft\s+certified/i,
      /certified\s+scrum\s+master/i,
      /comptia/i
    ];
    
    const found = [];
    certPatterns.forEach(pattern => {
      const match = text.match(pattern);
      if (match) {
        found.push(match[0]);
      }
    });
    
    return found;
  }

  /**
   * ⏱️ CALCULATE TOTAL EXPERIENCE (in years)
   */
  calculateTotalExperience(text) {
    // Pattern: "X years of experience"
    const expPattern = /(\d+)\+?\s*years?\s+(?:of\s+)?experience/i;
    const match = text.match(expPattern);
    
    if (match) {
      return parseInt(match[1]);
    }
    
    // Fallback: Calculate from experience dates
    const yearPattern = /(\d{4})\s*-\s*(\d{4}|present)/gi;
    const matches = [...text.matchAll(yearPattern)];
    
    if (matches.length > 0) {
      let totalMonths = 0;
      matches.forEach(([, start, end]) => {
        const startYear = parseInt(start);
        const endYear = end === 'present' ? new Date().getFullYear() : parseInt(end);
        totalMonths += (endYear - startYear) * 12;
      });
      return Math.floor(totalMonths / 12);
    }
    
    return 0;
  }
}

export default new ResumeParser();
