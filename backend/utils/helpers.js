import jwt from 'jsonwebtoken';

/**
 * Generate JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Generate sample resume text (for testing)
 */
export const generateSampleResume = (skillSet, years) => {
  const skills = skillSet.join(', ');
  const endYear = new Date().getFullYear();
  const startYear = endYear - years;
  
  return `
PROFESSIONAL SUMMARY
${years}+ years of experience in software development with expertise in ${skills}.

TECHNICAL SKILLS
${skills}, Git, Agile, Problem Solving

PROFESSIONAL EXPERIENCE

Senior Software Engineer at TechCorp Inc. (${startYear}-${endYear})
- Developed scalable web applications using ${skillSet[0]} and ${skillSet[1]}
- Led team of 5 developers in implementing microservices architecture
- Improved system performance by 40% through optimization

Software Developer at StartupXYZ (${startYear - 2}-${startYear})
- Built full-stack applications with modern frameworks
- Collaborated with cross-functional teams

EDUCATION
Bachelor of Engineering in Computer Science
MIT, ${startYear - 4}

CERTIFICATIONS
AWS Certified Solutions Architect
MongoDB Certified Developer
  `.trim();
};
