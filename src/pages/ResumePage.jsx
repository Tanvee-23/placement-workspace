import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loadUserData, saveUserData, recordStreakActivity } from '../utils/storage';

const ROLE_SKILLS = {
  'Frontend Developer': ['javascript', 'typescript', 'react', 'redux', 'next.js', 'html', 'css', 'tailwind', 'webpack', 'git', 'testing'],
  'Backend Developer': ['node.js', 'express', 'python', 'django', 'java', 'spring', 'go', 'postgresql', 'mongodb', 'redis', 'docker', 'system design', 'sql', 'microservices'],
  'Fullstack Developer': ['react', 'node.js', 'typescript', 'express', 'postgresql', 'mongodb', 'docker', 'system design', 'javascript', 'html', 'css', 'git'],
  'Data Scientist': ['python', 'r', 'sql', 'machine learning', 'deep learning', 'pandas', 'numpy', 'scikit-learn', 'pytorch', 'tensorflow', 'tableau', 'spark'],
  'DevOps Engineer': ['docker', 'kubernetes', 'aws', 'terraform', 'jenkins', 'gitlab', 'linux', 'bash', 'prometheus', 'grafana', 'nginx', 'cicd']
};

export default function ResumePage({ session }) {
  const [userData, setUserData] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadError, setUploadError] = useState('');

  // Load user data on mount
  useEffect(() => {
    if (!session) return;
    const data = loadUserData(session.email);
    setUserData(data);
    if (data.resumeData) {
      setTargetRole(data.resumeData.targetRole || '');
      setResumeText(data.resumeData.parsedText || '');
      if (data.resumeData.fileName) {
        setFile({ name: data.resumeData.fileName });
        setUploadStatus('success');
      }
    }
  }, [session]);

  if (!session) {
    return (
      <div className="wrap" style={{ padding: '80px 32px 120px', display: 'flex', justifyContent: 'center' }}>
        <div className="mock" style={{ width: '100%', maxWidth: '460px', padding: '40px 32px', textAlign: 'center' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '14px' }}>🔒</span>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Workspace Locked</h3>
          <p style={{ color: 'var(--muted)', fontSize: '14.5px', marginBottom: '24px', lineHeight: '1.5' }}>
            Please sign in or continue as a guest to access your personalized placement mentor workspace.
          </p>
          <Link to="/auth" className="btn-primary" style={{ display: 'inline-flex', justifyContent: 'center', width: '100%' }}>
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  const generateMockResumeText = (fileName, role) => {
    const nameBase = fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
    const name = nameBase.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'John Doe';
    const roleSkills = ROLE_SKILLS[role] || ['programming'];
    const skillsToInclude = roleSkills.slice(0, Math.ceil(roleSkills.length * 0.7));
    
    return `
${name.toUpperCase()}
Email: ${name.toLowerCase().replace(/\s+/g, '')}@university.edu | Phone: +91 98765 43210
LinkedIn: linkedin.com/in/${name.toLowerCase().replace(/\s+/g, '')} | GitHub: github.com/${name.toLowerCase().replace(/\s+/g, '')}

PROFESSIONAL SUMMARY
Dedicated and results-driven aspiring ${role} with strong foundations in software development. Experienced in building scalable applications, optimization, and working in agile teams. Proven track record of delivering clean and efficient code.

EDUCATION
Bachelor of Technology in Computer Science & Engineering
GPA: 8.9/10

WORK EXPERIENCE
Software Engineer Intern | Tech Solutions
- Responsible for assisting with codebase improvements and database optimizations.
- Collaborated on front-facing feature modules using ${skillsToInclude.slice(0, 2).join(', ')}.
- Worked on improving response latency and refactoring legacy scripts.

PROJECTS
E-Commerce Platform & Analytics Dashboard
- Engineered an end-to-end full-stack web application.
- Implemented state management, user authentication, and data visualization.
- Optimized page load speed by 35% and reduced bundle size by 15%.

SKILLS
Core Competencies: ${skillsToInclude.join(', ')}
Tools & Platforms: Git, VS Code, Linux

CERTIFICATIONS
Advanced Software Development, AWS Certified Cloud Practitioner
    `;
  };

  const handleFile = (uploadedFile) => {
    setUploadError('');
    setUploadStatus('idle');
    
    if (!uploadedFile) return;

    const allowedExtensions = ['pdf', 'doc', 'docx', 'txt'];
    const fileExtension = uploadedFile.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      setUploadError(`Unsupported file type (.${fileExtension}). Please upload a PDF, DOC, DOCX, or TXT file.`);
      setUploadStatus('error');
      setFile(null);
      return;
    }

    setFile(uploadedFile);
    setUploadStatus('loading');

    if (fileExtension === 'txt') {
      const reader = new FileReader();
      reader.onload = (event) => {
        setResumeText(event.target.result || '');
        setUploadStatus('success');
      };
      reader.onerror = () => {
        setUploadError('Failed to read TXT file content.');
        setUploadStatus('error');
      };
      reader.readAsText(uploadedFile);
    } else {
      // Simulate text extraction for PDF/Word files
      setTimeout(() => {
        const mockText = generateMockResumeText(uploadedFile.name, targetRole || 'Frontend Developer');
        setResumeText(mockText);
        setUploadStatus('success');
      }, 1000);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = () => {
    if (!targetRole) {
      alert('Please select a target role first.');
      return;
    }
    if (!resumeText.trim()) {
      alert('Please upload a resume file or paste your resume text in the text area.');
      return;
    }

    setAnalyzing(true);

    setTimeout(() => {
      const report = runRuleBasedAnalysis(resumeText, targetRole);
      
      // Update streak for qualifying activity
      recordStreakActivity(session.email);
      const finalData = loadUserData(session.email);

      const updatedData = {
        ...finalData,
        resumeData: {
          score: report.overallScore,
          targetRole,
          fileName: file ? file.name : 'pasted_resume.txt',
          parsedText: resumeText,
          analysisReport: report
        }
      };

      setUserData(updatedData);
      saveUserData(session.email, updatedData);
      setAnalyzing(false);
    }, 1500);
  };

  const handleReset = () => {
    const updatedData = {
      ...userData,
      resumeData: {
        score: null,
        targetRole: '',
        fileName: '',
        parsedText: '',
        analysisReport: null
      }
    };
    setUserData(updatedData);
    saveUserData(session.email, updatedData);
    setTargetRole('');
    setResumeText('');
    setFile(null);
    setUploadStatus('idle');
    setUploadError('');
  };


  const runRuleBasedAnalysis = (text, role) => {
    const lowerText = text.toLowerCase();
    let score = 100;
    
    // 1. SECTION HEADINGS DETECTION
    const sections = {
      contact: { name: 'Contact Info', keywords: ['phone', 'email', 'linkedin', 'github', 'address', 'contact', '@'], present: false },
      summary: { name: 'Professional Summary', keywords: ['summary', 'profile', 'objective', 'about me'], present: false },
      education: { name: 'Education', keywords: ['education', 'degree', 'university', 'college', 'gpa', 'btech', 'bs', 'ms'], present: false },
      experience: { name: 'Work Experience', keywords: ['experience', 'employment', 'work history', 'intern', 'job'], present: false },
      projects: { name: 'Projects', keywords: ['projects', 'academic projects', 'personal projects'], present: false },
      skills: { name: 'Skills', keywords: ['skills', 'core competencies', 'technologies', 'technical skills'], present: false },
      certifications: { name: 'Certifications', keywords: ['certifications', 'licenses', 'coursework', 'certificates'], present: false },
      achievements: { name: 'Achievements', keywords: ['achievements', 'awards', 'honors', 'milestones'], present: false },
      extracurriculars: { name: 'Extracurriculars', keywords: ['extracurricular', 'volunteer', 'activities', 'leadership'], present: false }
    };

    Object.keys(sections).forEach(key => {
      const matches = sections[key].keywords.some(kw => lowerText.includes(kw));
      if (matches) {
        sections[key].present = true;
      } else {
        score -= 5; // Deduct 5 points per missing section
      }
    });

    // 2. CONTACT INFORMATION CHECKS
    const contactChecks = {
      email: { label: 'Email Address', present: /@/.test(lowerText) },
      phone: { label: 'Phone Number', present: /\+?\d[\d-\s\(\)]{8,}\d/.test(lowerText) },
      linkedin: { label: 'LinkedIn Profile URL', present: /linkedin\.com/i.test(lowerText) }
    };

    Object.keys(contactChecks).forEach(key => {
      if (!contactChecks[key].present) {
        score -= 5;
      }
    });

    // 3. WEAK BULLET POINTS & ACTION VERBS
    const passivePhrases = [
      { weak: 'responsible for', replacement: 'Spearheaded / Managed' },
      { weak: 'assisted with', replacement: 'Collaborated on / Supported' },
      { weak: 'worked on', replacement: 'Engineered / Implemented' },
      { weak: 'helped in', replacement: 'Facilitated / Accelerated' },
      { weak: 'handled', replacement: 'Directed / Orchestrated' }
    ];

    const detectedWeakBullets = [];
    passivePhrases.forEach(item => {
      if (lowerText.includes(item.weak)) {
        score -= 4;
        // Mock extract surrounding sentence or just show rewrite recommendation
        detectedWeakBullets.push({
          weakPhrase: item.weak,
          original: `... responsible for maintaining the application and testing database queries ...`,
          problem: `Uses the passive phrase "${item.weak}" which doesn't convey active leadership or technical ownership.`,
          improved: `"${item.replacement} the maintenance operations of core applications and optimized relational database queries."`
        });
      }
    });

    // 4. MEASURABLE ACHIEVEMENTS CHECK (Metrics)
    // Scan for percentages or numbers indicating statistics
    const hasMetrics = /\b\d+%|\b\d+\s*(?:million|thousand|users|queries|percent|reduced|increased|optimized)\b/g.test(lowerText);
    if (!hasMetrics) {
      score -= 8;
    }

    // 5. SKILLS ANALYSIS
    const roleSkills = ROLE_SKILLS[role] || [];
    const existingSkills = [];
    const missingSkills = [];

    roleSkills.forEach(skill => {
      if (lowerText.includes(skill.toLowerCase())) {
        existingSkills.push(skill);
      } else {
        missingSkills.push(skill);
        score -= 3; // Deduct 3 points for each missing core skill
      }
    });

    const outdatedSkillsList = ['jquery', 'svn', 'cvs', 'ftp', 'php 5'];
    const weakOutdatedSkills = outdatedSkillsList.filter(skill => lowerText.includes(skill));
    if (weakOutdatedSkills.length > 0) {
      score -= 3;
    }

    // Floor score to minimum 35
    score = Math.max(35, score);

    // 6. SECTION DETAILS BUILDER
    const sectionReports = {};
    Object.keys(sections).forEach(key => {
      const present = sections[key].present;
      if (key === 'contact') {
        sectionReports[key] = {
          good: present ? 'Contact details are present in the header.' : 'N/A',
          missing: Object.keys(contactChecks).filter(k => !contactChecks[k].present).map(k => contactChecks[k].label).join(', ') || 'None',
          change: !present ? 'Add an isolated header section containing your contact data.' : 'Ensure professional handles are used.',
          recommendation: 'Place email, phone, and professional GitHub/LinkedIn handles at the top center of page.'
        };
      } else if (key === 'summary') {
        sectionReports[key] = {
          good: present ? 'Summary paragraph summarizes goals.' : 'N/A',
          missing: !present ? 'Objective or Professional summary is missing.' : 'None',
          change: 'Avoid generic sentences like "Hardworking student seeking job opportunities".',
          recommendation: `Tailor summary to target role: "Aspiring ${role} with experience in ${existingSkills.slice(0, 3).join(', ') || 'programming'} seeking to leverage developer skills..."`
        };
      } else if (key === 'experience') {
        sectionReports[key] = {
          good: present ? 'Experience chronological order seems structured.' : 'N/A',
          missing: !present ? 'No professional experiences or internships found.' : 'None',
          change: !hasMetrics ? 'Bullet points lack measurable metrics.' : 'Change passive verb phrases.',
          recommendation: 'Use the STAR format (Situation, Task, Action, Result) for bullet points, specifying exact numerical indicators (e.g. optimized queries by 30%).'
        };
      } else if (key === 'skills') {
        sectionReports[key] = {
          good: present ? 'Skills block uses bullet columns.' : 'N/A',
          missing: missingSkills.slice(0, 3).join(', ') || 'None',
          change: 'Outdated or auxiliary frameworks should be categorized under libraries.',
          recommendation: `Group skills by categories: Languages, Frameworks, Developer Tools. Add critical skills: ${missingSkills.slice(0, 2).join(', ')}.`
        };
      } else {
        sectionReports[key] = {
          good: present ? 'Section exists and lists items correctly.' : 'N/A',
          missing: !present ? 'Section is entirely missing from layout.' : 'None',
          change: !present ? 'Add this missing section block.' : 'Format spacing to fit standard margins.',
          recommendation: `Ensure this section is cleanly visible with a distinct ${sections[key].name} header.`
        };
      }
    });

    // 7. GAP QUESTIONS
    const gapQuestions = [];
    if (!lowerText.includes('intern') && !lowerText.includes('co-op')) {
      gapQuestions.push('Do you have any past software internship or part-time developer experience to list?');
    }
    if (missingSkills.length > 3) {
      gapQuestions.push(`Why are core technologies like ${missingSkills.slice(0, 2).join(' and ')} not listed in your tech stack?`);
    }
    if (!hasMetrics) {
      gapQuestions.push('What were the specific performance results or business metrics achieved during your project work?');
    }
    if (!lowerText.includes('leetcode') && !lowerText.includes('hackerrank') && !lowerText.includes('dsa')) {
      gapQuestions.push('Do you have a profile on platforms like LeetCode or Codeforces with a significant number of solved DSA problems?');
    }

    // 8. PERSONALIZED LEARNING PATH
    const learningPath = missingSkills.map(skill => {
      let explanation = `Critical technology for modern engineering teams.`;
      let importance = 'HIGH';
      let learnWhat = `Fundamental syntax, state flow, and routing patterns.`;
      
      if (['react', 'next.js', 'redux'].includes(skill.toLowerCase())) {
        explanation = `Industry-standard library for building rich interactive Single-Page Applications (SPAs).`;
        learnWhat = `React hooks, state management, and server-side loading logic.`;
      } else if (['docker', 'kubernetes'].includes(skill.toLowerCase())) {
        explanation = `Essential containerization tooling used to run software consistently across developer machines and cloud hosts.`;
        importance = 'MEDIUM';
        learnWhat = `Writing custom Dockerfiles, setting up multiple services, and deployment pipelines.`;
      } else if (['system design', 'microservices'].includes(skill.toLowerCase())) {
        explanation = `Highly valued knowledge when interviewing for scalable infrastructure architectural designs.`;
        learnWhat = `Load balancers, SQL/NoSQL database selection, data replication, and API gateways.`;
      }

      return {
        skill,
        explanation,
        importance,
        learnWhat
      };
    });

    // 9. PRIORITIZED ACTION PLAN
    const actionPlan = [];
    if (Object.keys(contactChecks).some(k => !contactChecks[k].present)) {
      actionPlan.push({ priority: 'First', action: 'Update contact information header', details: 'Add missing professional email, phone number, or active LinkedIn profile link at the top.' });
    }
    if (missingSkills.length > 0) {
      actionPlan.push({ priority: 'Second', action: `Integrate core target skills: ${missingSkills.slice(0, 3).join(', ')}`, details: `Acquire and list skills corresponding to ${role} roles to bypass automated ATS filters.` });
    }
    if (detectedWeakBullets.length > 0) {
      actionPlan.push({ priority: 'Next', action: 'Rewrite weak bullet descriptions using active verbs', details: 'Scan through your experiences and swap phrases like "responsible for" with strong verbs (Spearheaded, Optimized).' });
    }
    if (!hasMetrics) {
      actionPlan.push({ priority: 'Then', action: 'Quantify impact metrics', details: 'Add percentages, database response times, or user metrics to demonstrate results.' });
    }
    
    // Add default plans if empty
    if (actionPlan.length === 0) {
      actionPlan.push({ priority: 'First', action: 'Perform routine format alignment', details: 'Ensure page layout, font sizes, and line margins are uniform.' });
      actionPlan.push({ priority: 'Second', action: 'Update project descriptions', details: 'Add details regarding newer tech stack integrations.' });
    }

    return {
      overallScore: score,
      scoreExplanation: `Your resume scored a ${score}/100 matching against standard industry ${role} criteria. Points were deducted due to missing role-specific keywords, lack of statistical metrics, or missing formatting checks.`,
      sectionsReport: sectionReports,
      weakBullets: detectedWeakBullets,
      skillsReport: {
        existing: existingSkills,
        missing: missingSkills,
        outdated: weakOutdatedSkills
      },
      gapQuestions,
      learningPath,
      actionPlan,
      hasMetrics
    };
  };

  const report = userData?.resumeData?.analysisReport;

  return (
    <div className="wrap" style={{ padding: '60px 32px 100px' }}>
      <div className="section-head">
        <span className="kicker">Stage 01 — Assess</span>
        <h2>Resume &amp; Skill Dashboard</h2>
        <p>Analyze your resume score, review ATS formatting, and obtain target role recommendations.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Upload Interface Block */}
        <div className="mock" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '14px' }}>Analyze New Resume</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '22px' }}>
            <div>
              <label className="mono" style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '6px', fontWeight: '700' }}>
                TARGET ROLE *
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--line)',
                  fontSize: '13.5px',
                  outline: 'none',
                  background: '#fff',
                  fontFamily: 'inherit'
                }}
              >
                <option value="">Select a Target Role...</option>
                {Object.keys(ROLE_SKILLS).map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mono" style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '6px', fontWeight: '700' }}>
                UPLOAD RESUME (SUPPORTED: PDF, DOC, DOCX, TXT)
              </label>
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  border: isDragging ? '2px dashed var(--violet)' : '1.5px dashed var(--line)',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  background: isDragging ? 'var(--violet-soft)' : 'var(--paper)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  minHeight: '120px',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
              >
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.txt" 
                  onChange={(e) => handleFile(e.target.files[0])} 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                    zIndex: 2
                  }}
                />
                {file ? (
                  <div style={{ pointerEvents: 'none', zIndex: 1 }}>
                    <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>📄</span>
                    <strong style={{ fontSize: '13px', color: 'var(--ink)', display: 'block', wordBreak: 'break-all' }}>
                      {file.name}
                    </strong>
                    {uploadStatus === 'loading' && (
                      <span style={{ fontSize: '12px', color: 'var(--violet)', fontWeight: '600', display: 'block', marginTop: '6px' }}>
                        ⏳ Extracting text content...
                      </span>
                    )}
                    {uploadStatus === 'success' && (
                      <span style={{ fontSize: '12px', color: 'var(--mint)', fontWeight: '600', display: 'block', marginTop: '6px' }}>
                        ✓ Ready for analysis scan
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={{ pointerEvents: 'none', zIndex: 1 }}>
                    <span style={{ fontSize: '24px', display: 'block', marginBottom: '6px' }}>📁</span>
                    <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--ink)', display: 'block' }}>
                      Drag &amp; drop here, or <span style={{ color: 'var(--violet)', textDecoration: 'underline' }}>Browse</span>
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginTop: '4px' }}>
                      PDF, DOC, DOCX, TXT files
                    </span>
                  </div>
                )}
              </div>
              {uploadError && (
                <div style={{ 
                  marginTop: '12px', 
                  background: 'var(--coral-soft)', 
                  color: 'var(--coral)', 
                  padding: '10px 14px', 
                  borderRadius: '8px', 
                  fontSize: '13px', 
                  fontWeight: '500' 
                }}>
                  ⚠️ {uploadError}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label className="mono" style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '6px', fontWeight: '700' }}>
              PASTE RESUME CONTENT OR DRAG FILE ABOVE *
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your raw resume text here to run an ATS scan (recommended for PDF/Word text content copies)..."
              style={{
                width: '100%',
                height: '140px',
                padding: '12px',
                borderRadius: '10px',
                border: '1.5px solid var(--line)',
                fontSize: '13px',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
                background: '#fff'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {analyzing ? (
                <>
                  <div style={{ width: '14px', height: '14px', border: '2px solid var(--violet-soft)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  Analyzing...
                </>
              ) : (
                'Run Analyzer Scan'
              )}
            </button>
            {(resumeText || file) && (
              <button onClick={handleReset} className="btn-ghost" style={{ background: '#fff' }}>
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Detailed Report View */}
        {report ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Score Box & Overall Assessment */}
            <div style={{ display: 'grid', gridTemplateColumns: '0.65fr 1.35fr', gap: '28px' }}>
              <div className="mock" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>ATS Score</h4>
                <div 
                  className="score-ring" 
                  style={{ 
                    margin: '20px auto 14px',
                    background: `conic-gradient(var(--mint) 0deg ${report.overallScore * 3.6}deg, var(--paper-2) ${report.overallScore * 3.6}deg 360deg)` 
                  }}
                >
                  <span>{report.overallScore}</span>
                </div>
                <span className="mono" style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                  Target: {targetRole}
                </span>
              </div>

              <div className="mock" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>Assessment Summary</h3>
                <p style={{ color: 'var(--ink)', fontSize: '14.5px', lineHeight: '1.6', marginBottom: '16px' }}>
                  {report.scoreExplanation}
                </p>
                
                <div style={{ display: 'flex', gap: '14px' }}>
                  <div style={{ padding: '8px 12px', background: report.hasMetrics ? 'var(--mint-soft)' : 'var(--coral-soft)', borderRadius: '8px', border: '1px solid', borderColor: report.hasMetrics ? 'var(--mint)' : 'var(--coral)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: report.hasMetrics ? 'var(--mint)' : 'var(--coral)' }}>
                    <span>{report.hasMetrics ? '✓' : '⚠️'}</span>
                    <span>{report.hasMetrics ? 'Measurable Metrics Detected' : 'No Measurable Metrics Detected'}</span>
                  </div>

                  <div style={{ padding: '8px 12px', background: report.weakBullets.length === 0 ? 'var(--mint-soft)' : 'var(--coral-soft)', borderRadius: '8px', border: '1px solid', borderColor: report.weakBullets.length === 0 ? 'var(--mint)' : 'var(--coral)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: report.weakBullets.length === 0 ? 'var(--mint)' : 'var(--coral)' }}>
                    <span>{report.weakBullets.length === 0 ? '✓' : '⚠️'}</span>
                    <span>{report.weakBullets.length === 0 ? 'Strong Action Verbs' : `${report.weakBullets.length} Weak Verb Detections`}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ATS Compatibility: Sections Reports */}
            <div className="mock" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Section-by-Section Evaluation</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {Object.entries(report.sectionsReport).map(([key, data]) => {
                  const details = sectionsDetails[key] || { title: key };
                  const isPresent = data.good !== 'N/A';
                  return (
                    <div 
                      key={key} 
                      style={{ 
                        border: '1px solid var(--line)', 
                        borderRadius: '14px', 
                        padding: '20px',
                        background: 'var(--paper)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: '700' }}>{details.title}</h4>
                        <span 
                          className="mono" 
                          style={{ 
                            fontSize: '10.5px', 
                            fontWeight: '700',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: isPresent ? 'var(--mint-soft)' : 'var(--coral-soft)',
                            color: isPresent ? 'var(--mint)' : 'var(--coral)'
                          }}
                        >
                          {isPresent ? 'DETECTED' : 'MISSING'}
                        </span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
                        <div>
                          <div style={{ color: 'var(--muted)', fontWeight: '600', marginBottom: '4px' }}>GOOD</div>
                          <p style={{ color: 'var(--ink)' }}>{data.good}</p>
                        </div>
                        <div>
                          <div style={{ color: 'var(--muted)', fontWeight: '600', marginBottom: '4px' }}>MISSING / DEFICIENT</div>
                          <p style={{ color: 'var(--ink)' }}>{data.missing}</p>
                        </div>
                        <div>
                          <div style={{ color: 'var(--muted)', fontWeight: '600', marginBottom: '4px' }}>CHANGES REQUIRED</div>
                          <p style={{ color: 'var(--ink)' }}>{data.change}</p>
                        </div>
                        <div>
                          <div style={{ color: 'var(--muted)', fontWeight: '600', marginBottom: '4px' }}>RECOMMENDATION</div>
                          <p style={{ color: 'var(--ink)' }}>{data.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bullet Point Analyzer */}
            {report.weakBullets.length > 0 && (
              <div className="mock" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Bullet Point Grammar &amp; Action Verb Analyzer</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {report.weakBullets.map((bullet, idx) => (
                    <div key={idx} style={{ padding: '16px', background: 'var(--paper)', borderRadius: '12px', borderLeft: '4px solid var(--coral)', fontSize: '13px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--coral)', marginBottom: '6px' }}>DETECTED WEAK DESCRIPTION</div>
                      <p style={{ fontStyle: 'italic', color: 'var(--muted)', marginBottom: '10px' }}>{bullet.original}</p>
                      
                      <div style={{ fontWeight: '700', color: 'var(--ink)', marginBottom: '4px' }}>PROBLEM</div>
                      <p style={{ color: 'var(--ink)', marginBottom: '10px' }}>{bullet.problem}</p>
                      
                      <div style={{ fontWeight: '700', color: 'var(--mint)', marginBottom: '4px' }}>PROPOSED REWRITE (ACTIVE STAR FORMAT)</div>
                      <p style={{ fontWeight: '600', color: 'var(--ink)' }}>{bullet.improved}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Analysis */}
            <div className="mock" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Skills &amp; Keywords Analysis</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '13.5px' }}>
                <div style={{ padding: '16px', background: 'var(--paper)', borderRadius: '12px', border: '1px solid var(--line)' }}>
                  <h4 style={{ fontWeight: '700', color: 'var(--mint)', marginBottom: '10px' }}>Identified Keywords / Skills</h4>
                  {report.skillsReport.existing.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {report.skillsReport.existing.map(s => (
                        <span key={s} className="mono" style={{ fontSize: '11px', background: 'var(--mint-soft)', color: 'var(--mint)', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--muted)' }}>No target role skills identified in resume text.</span>
                  )}
                </div>

                <div style={{ padding: '16px', background: 'var(--paper)', borderRadius: '12px', border: '1px solid var(--line)' }}>
                  <h4 style={{ fontWeight: '700', color: 'var(--coral)', marginBottom: '10px' }}>Missing Target Stack Skills</h4>
                  {report.skillsReport.missing.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {report.skillsReport.missing.map(s => (
                        <span key={s} className="mono" style={{ fontSize: '11px', background: 'var(--coral-soft)', color: 'var(--coral)', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--mint)', fontWeight: '600' }}>All core role skills detected!</span>
                  )}
                </div>
              </div>
              
              {report.skillsReport.outdated.length > 0 && (
                <div style={{ marginTop: '16px', padding: '14px', background: 'var(--yellow-soft)', borderRadius: '10px', border: '1px solid #dca000', fontSize: '13px' }}>
                  <strong style={{ color: '#855b00' }}>Outdated or weak technologies detected: </strong>
                  <span className="mono" style={{ fontWeight: '700' }}>{report.skillsReport.outdated.join(', ')}</span>. Consider replacing these with modern equivalents to keep your CV state-of-the-art.
                </div>
              )}
            </div>

            {/* Gap Analysis Questions */}
            {report.gapQuestions.length > 0 && (
              <div className="mock" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Gap Analysis &amp; Placement Questions</h3>
                <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '16px' }}>
                  Based on gaps detected in your profile, prepare answers for the following potential interview queries:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {report.gapQuestions.map((q, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', padding: '12px', background: 'var(--paper)', borderRadius: '10px', border: '1px solid var(--line)', fontSize: '13.5px' }}>
                      <span className="mono" style={{ fontWeight: '700', color: 'var(--violet-deep)' }}>Q{idx + 1}</span>
                      <p style={{ fontWeight: '500' }}>{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personalized Learning Recommendations */}
            {report.learningPath.length > 0 && (
              <div className="mock" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Personalized Learning Path</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {report.learningPath.map((item, idx) => (
                    <div key={idx} style={{ padding: '20px', background: 'var(--paper)', borderRadius: '14px', border: '1px solid var(--line)', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span className="mono" style={{ fontWeight: '700', fontSize: '14px', color: 'var(--ink)' }}>{item.skill.toUpperCase()}</span>
                        <span className="mono" style={{ fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', background: item.importance === 'HIGH' ? 'var(--coral-soft)' : 'var(--violet-soft)', color: item.importance === 'HIGH' ? 'var(--coral)' : 'var(--violet-deep)' }}>
                          {item.importance} PRIORITY
                        </span>
                      </div>
                      <div style={{ color: 'var(--muted)', fontWeight: '600', marginBottom: '2px' }}>WHY IT MATTERS</div>
                      <p style={{ color: 'var(--ink)', marginBottom: '10px' }}>{item.explanation}</p>
                      
                      <div style={{ color: 'var(--muted)', fontWeight: '600', marginBottom: '2px' }}>WHAT TO LEARN</div>
                      <p style={{ color: 'var(--ink)', fontWeight: '600' }}>{item.learnWhat}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prioritized Action Plan */}
            <div className="mock" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Prioritized Action Plan</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {report.actionPlan.map((plan, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <div className="mono" style={{ fontSize: '12px', background: 'var(--ink)', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontWeight: '700', minWidth: '70px', textAlign: 'center' }}>
                      {plan.priority}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--ink)' }}>{plan.action}</h4>
                      <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>{plan.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--muted)', fontSize: '14px' }}>
            No analysis report exists yet. Set target role, upload resume or paste text, and click 'Run Analyzer Scan'.
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const sectionsDetails = {
  contact: { title: '1. Contact & Identity Information' },
  summary: { title: '2. Professional Summary or Objective' },
  education: { title: '3. Education & Degree Information' },
  experience: { title: '4. Professional Experience' },
  projects: { title: '5. Academic / Personal Projects' },
  skills: { title: '6. Technical Skills Stack' },
  certifications: { title: '7. Course Certifications' },
  achievements: { title: '8. Professional Achievements & Awards' },
  extracurriculars: { title: '9. Extracurriculars & Volunteer Work' }
};
