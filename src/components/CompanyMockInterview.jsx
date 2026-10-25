import React, { useState } from 'react';
import { generateInterviewQuestions, evaluateInterviewAnswers } from '../utils/geminiApi';

// Fallback interview questions when AI is unavailable
function getFallbackInterviewQuestions(companyName, role) {
  return [
    {
      id: 1,
      question: `Tell me about yourself and why you're interested in the ${role} role at ${companyName}.`,
      category: 'Behavioral',
      tips: 'Cover your background, relevant skills, and specific reasons for wanting this role at this company.'
    },
    {
      id: 2,
      question: `Explain a complex technical concept relevant to ${role} as if you were teaching it to a non-technical person.`,
      category: 'Technical',
      tips: 'Use analogies, avoid jargon, and show clear understanding of fundamentals.'
    },
    {
      id: 3,
      question: `Describe a challenging project you worked on. What were the technical decisions you made and why?`,
      category: 'Technical',
      tips: 'Use the STAR format. Focus on your specific contributions, trade-offs considered, and measurable outcomes.'
    },
    {
      id: 4,
      question: `How would you design a simplified version of a system like ${companyName}'s core product? Walk me through your high-level approach.`,
      category: 'System Design',
      tips: 'Start with requirements, discuss components, data flow, scalability considerations, and trade-offs.'
    },
    {
      id: 5,
      question: `Describe a time when you had a disagreement with a teammate. How did you handle it and what was the outcome?`,
      category: 'Situational',
      tips: 'Show conflict resolution skills, empathy, communication, and a positive outcome.'
    }
  ];
}

// Basic keyword-based evaluation when AI is unavailable
function basicEvaluation(companyName, role, questionsAndAnswers) {
  const technicalKeywords = [
    'algorithm', 'data structure', 'complexity', 'database', 'api', 'server',
    'optimization', 'scalability', 'performance', 'architecture', 'design pattern',
    'testing', 'deployment', 'security', 'cache', 'queue', 'stack', 'tree',
    'graph', 'hash', 'array', 'linked list', 'react', 'node', 'sql', 'nosql',
    'docker', 'kubernetes', 'microservices', 'rest', 'graphql', 'ci/cd',
    'component', 'state', 'async', 'promise', 'callback', 'event', 'module'
  ];

  const behavioralKeywords = [
    'team', 'collaborate', 'communicate', 'lead', 'managed', 'resolved',
    'improved', 'learned', 'challenge', 'solution', 'outcome', 'result',
    'impact', 'growth', 'feedback', 'adapted', 'initiative', 'responsibility'
  ];

  const questionFeedback = questionsAndAnswers.map((qa) => {
    const answer = (qa.answer || '').toLowerCase();
    const wordCount = answer.split(/\s+/).filter(w => w.length > 0).length;

    let score = 3;
    let strengths = '';
    let improvements = '';

    // Length check
    if (wordCount === 0) {
      return {
        questionId: qa.id,
        score: 1,
        strengths: 'N/A — No answer was provided.',
        improvements: 'Please provide a detailed answer. Aim for at least 50-100 words covering specific examples and reasoning.',
        sampleAnswer: `For this ${qa.category.toLowerCase()} question, provide specific examples from your experience, explain your thought process, and discuss the outcome or impact.`
      };
    }

    if (wordCount >= 80) { score += 2; strengths += 'Good answer length with detailed response. '; }
    else if (wordCount >= 40) { score += 1; strengths += 'Adequate answer length. '; }
    else { improvements += 'Answer is too brief — aim for more detail and specific examples. '; }

    // Keyword relevance
    const keywords = qa.category === 'Behavioral' || qa.category === 'Situational'
      ? behavioralKeywords
      : technicalKeywords;

    const matchedKeywords = keywords.filter(kw => answer.includes(kw));

    if (matchedKeywords.length >= 4) {
      score += 2;
      strengths += 'Strong use of relevant terminology. ';
    } else if (matchedKeywords.length >= 2) {
      score += 1;
      strengths += 'Some relevant keywords present. ';
    } else {
      improvements += `Include more ${qa.category.toLowerCase()}-relevant terms and concepts. `;
    }

    // Structure check
    if (answer.includes('because') || answer.includes('therefore') || answer.includes('for example') || answer.includes('as a result')) {
      score += 1;
      strengths += 'Good logical reasoning and structure. ';
    } else {
      improvements += 'Add reasoning with words like "because", "therefore", or "for example" to strengthen your answer. ';
    }

    // Company mention
    if (answer.includes(companyName.toLowerCase())) {
      score += 1;
      strengths += `Good — referenced ${companyName} specifically. `;
    }

    score = Math.min(10, Math.max(1, score));

    return {
      questionId: qa.id,
      score,
      strengths: strengths.trim() || 'Answer was provided.',
      improvements: improvements.trim() || 'Consider adding more specific examples and quantified results.',
      sampleAnswer: `A strong answer to this ${qa.category.toLowerCase()} question would include specific examples, demonstrate your problem-solving approach, and relate to the ${role} role at ${companyName}.`
    };
  });

  const overallScore = Math.round(
    questionFeedback.reduce((sum, f) => sum + f.score, 0) / questionFeedback.length
  );

  return {
    overallScore,
    overallFeedback: overallScore >= 7
      ? `Good overall performance! You demonstrated solid preparation for the ${role} role at ${companyName}. Focus on the specific improvement areas noted below.`
      : overallScore >= 4
        ? `Decent attempt. Several answers could be strengthened with more specific examples, technical depth, and structured responses using the STAR method.`
        : `Your responses need significant improvement. Practice answering with more detail, specific examples, and technical depth. Review the suggestions below carefully.`,
    questionFeedback
  };
}

export default function CompanyMockInterview({ company, onBack }) {
  const [questions, setQuestions] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [isAiEvaluated, setIsAiEvaluated] = useState(false);

  const companyName = company.name;
  const role = company.role || 'Software Engineer';

  const handleStartInterview = async () => {
    setLoading(true);
    setFeedback(null);
    setCurrentIndex(0);
    setAnswers({});

    const aiQuestions = await generateInterviewQuestions(companyName, role);

    if (aiQuestions) {
      setQuestions(aiQuestions);
      setIsAiGenerated(true);
    } else {
      setQuestions(getFallbackInterviewQuestions(companyName, role));
      setIsAiGenerated(false);
    }

    setLoading(false);
  };

  const handleAnswerChange = (value) => {
    setAnswers(prev => ({ ...prev, [questions[currentIndex].id]: value }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmitAll = async () => {
    setEvaluating(true);

    const questionsAndAnswers = questions.map(q => ({
      id: q.id,
      question: q.question,
      category: q.category,
      answer: answers[q.id] || ''
    }));

    // Try AI evaluation first
    const aiFeedback = await evaluateInterviewAnswers(companyName, role, questionsAndAnswers);

    if (aiFeedback) {
      setFeedback(aiFeedback);
      setIsAiEvaluated(true);
    } else {
      setFeedback(basicEvaluation(companyName, role, questionsAndAnswers));
      setIsAiEvaluated(false);
    }

    setEvaluating(false);
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Behavioral': return 'var(--violet)';
      case 'Technical': return 'var(--neon-cyan)';
      case 'System Design': return 'var(--mint)';
      case 'Situational': return 'var(--yellow)';
      default: return 'var(--muted)';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 7) return 'var(--mint)';
    if (score >= 4) return 'var(--yellow)';
    return 'var(--coral)';
  };

  // Initial state
  if (!questions && !loading) {
    return (
      <div className="mock" style={{ padding: '32px' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', color: 'var(--neon-cyan)',
            cursor: 'pointer', fontSize: '13px', fontWeight: '600',
            marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px',
            fontFamily: 'inherit', textShadow: '0 0 8px rgba(0, 240, 255, 0.4)'
          }}
        >
          ← Back to Company Details
        </button>

        <div style={{ textAlign: 'center', padding: '30px 10px' }}>
          <span style={{ fontSize: '52px', display: 'block', marginBottom: '16px' }}>🎤</span>
          <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>
            {companyName} — Mock Interview
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: '14.5px', marginBottom: '8px', lineHeight: '1.5' }}>
            Practice with 5 interview questions tailored for<br />
            <strong style={{ color: 'var(--neon-cyan)', textShadow: '0 0 6px rgba(0, 240, 255, 0.4)' }}>{role}</strong> role at <strong style={{ color: 'var(--ink-strong)' }}>{companyName}</strong>
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '12.5px', marginBottom: '28px' }}>
            Answer each question and receive detailed feedback after completing all.
          </p>
          <button onClick={handleStartInterview} className="btn-primary" style={{ justifyContent: 'center', width: '100%', maxWidth: '280px' }}>
            Start Mock Interview
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="mock" style={{ padding: '32px' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', color: 'var(--neon-cyan)',
            cursor: 'pointer', fontSize: '13px', fontWeight: '600',
            marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px',
            fontFamily: 'inherit', textShadow: '0 0 8px rgba(0, 240, 255, 0.4)'
          }}
        >
          ← Back to Company Details
        </button>
        <div style={{ textAlign: 'center', padding: '60px 10px' }}>
          <div style={{
            width: '40px', height: '40px', border: '3px solid var(--line)',
            borderTopColor: 'var(--violet)', borderRadius: '50%',
            animation: 'spin 1s linear infinite', margin: '0 auto 18px'
          }}></div>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
            Preparing interview questions for {companyName}...
          </p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Feedback/results view
  if (feedback) {
    const overallPercentage = feedback.overallScore * 10;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* Header */}
        <div className="mock" style={{ padding: '24px 32px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none', border: 'none', color: 'var(--neon-cyan)',
              cursor: 'pointer', fontSize: '13px', fontWeight: '600',
              marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px',
              fontFamily: 'inherit', textShadow: '0 0 8px rgba(0, 240, 255, 0.4)'
            }}
          >
            ← Back to Company Details
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>
              Interview Results — {companyName}
            </h3>
            <span className="mono" style={{
              fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px',
              background: isAiEvaluated ? 'rgba(0, 240, 255, 0.08)' : 'var(--violet-soft)',
              color: isAiEvaluated ? 'var(--neon-cyan)' : 'var(--violet)',
              border: isAiEvaluated ? '1px solid rgba(0, 240, 255, 0.2)' : '1px solid rgba(124, 110, 240, 0.3)',
              textShadow: isAiEvaluated ? '0 0 6px rgba(0, 240, 255, 0.4)' : 'none'
            }}>
              {isAiEvaluated ? '✦ AI EVALUATION' : '📊 BASIC EVALUATION'}
            </span>
          </div>
        </div>

        {/* Overall Score */}
        <div className="mock" style={{ padding: '28px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{
              width: '90px', height: '90px', borderRadius: '50%',
              background: `conic-gradient(${getScoreColor(feedback.overallScore)} 0deg ${overallPercentage * 3.6}deg, var(--paper-3) ${overallPercentage * 3.6}deg 360deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%', background: 'var(--paper-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: '700', fontSize: '22px', color: 'var(--ink-strong)' }}>
                  {feedback.overallScore}/10
                </span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '6px' }}>Overall Assessment</h4>
              <p style={{ color: 'var(--muted)', fontSize: '13.5px', lineHeight: '1.55', marginBottom: '14px' }}>
                {feedback.overallFeedback}
              </p>
              <button onClick={handleStartInterview} className="btn-primary" style={{ padding: '10px 20px', fontSize: '12.5px' }}>
                ↻ Retry Interview
              </button>
            </div>
          </div>
        </div>

        {/* Per-question Feedback */}
        {questions.map((q, idx) => {
          const qf = feedback.questionFeedback?.find(f => f.questionId === q.id) || feedback.questionFeedback?.[idx];
          if (!qf) return null;

          return (
            <div key={q.id} className="mock" style={{ padding: '24px 28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="mono" style={{ fontSize: '12px', fontWeight: '700', color: 'var(--neon-cyan)', textShadow: '0 0 6px rgba(0, 240, 255, 0.4)' }}>
                    Q{idx + 1}
                  </span>
                  <span className="mono" style={{
                    fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px',
                    background: `${getCategoryColor(q.category)}15`,
                    color: getCategoryColor(q.category)
                  }}>
                    {q.category.toUpperCase()}
                  </span>
                </div>
                <span className="mono" style={{
                  fontSize: '12px', fontWeight: '700',
                  color: getScoreColor(qf.score)
                }}>
                  {qf.score}/10
                </span>
              </div>

              <p style={{ fontSize: '14px', fontWeight: '600', lineHeight: '1.5', marginBottom: '10px', color: 'var(--ink-strong)' }}>
                {q.question}
              </p>

              <div style={{
                padding: '10px 14px', borderRadius: '8px', marginBottom: '12px',
                background: 'var(--paper)', border: '1px solid var(--line)',
                fontSize: '13px', color: 'var(--ink)', lineHeight: '1.5', whiteSpace: 'pre-wrap'
              }}>
                <span className="mono" style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: '700' }}>YOUR ANSWER:</span>
                <br />
                {answers[q.id] || '(No answer provided)'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {qf.strengths && (
                  <div style={{
                    padding: '10px 14px', borderRadius: '8px',
                    background: 'var(--mint-soft)', borderLeft: '3px solid var(--mint)',
                    fontSize: '12.5px', color: 'var(--ink)', lineHeight: '1.5'
                  }}>
                    <strong style={{ color: 'var(--mint)' }}>Strengths:</strong> {qf.strengths}
                  </div>
                )}
                {qf.improvements && (
                  <div style={{
                    padding: '10px 14px', borderRadius: '8px',
                    background: 'var(--coral-soft)', borderLeft: '3px solid var(--coral)',
                    fontSize: '12.5px', color: 'var(--ink)', lineHeight: '1.5'
                  }}>
                    <strong style={{ color: 'var(--coral)' }}>Improve:</strong> {qf.improvements}
                  </div>
                )}
                {qf.sampleAnswer && (
                  <div style={{
                    padding: '10px 14px', borderRadius: '8px',
                    background: 'var(--paper-2)', borderLeft: '3px solid var(--neon-cyan)',
                    fontSize: '12.5px', color: 'var(--ink)', lineHeight: '1.5'
                  }}>
                    <strong style={{ color: 'var(--neon-cyan)', textShadow: '0 0 6px rgba(0, 240, 255, 0.4)' }}>Ideal approach:</strong> {qf.sampleAnswer}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Evaluating state
  if (evaluating) {
    return (
      <div className="mock" style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', padding: '60px 10px' }}>
          <div style={{
            width: '40px', height: '40px', border: '3px solid var(--line)',
            borderTopColor: 'var(--mint)', borderRadius: '50%',
            animation: 'spin 1s linear infinite', margin: '0 auto 18px'
          }}></div>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
            Evaluating your interview responses...
          </p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Interview question view
  const currentQ = questions[currentIndex];
  const currentAnswer = answers[currentQ.id] || '';
  const answeredCount = Object.values(answers).filter(a => a && a.trim().length > 0).length;
  const allAnswered = answeredCount === questions.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header */}
      <div className="mock" style={{ padding: '24px 32px' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', color: 'var(--neon-cyan)',
            cursor: 'pointer', fontSize: '13px', fontWeight: '600',
            marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px',
            fontFamily: 'inherit', textShadow: '0 0 8px rgba(0, 240, 255, 0.4)'
          }}
        >
          ← Back to Company Details
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Mock Interview — {companyName}</h3>
            <span className="mono" style={{ fontSize: '11px', color: 'var(--muted)' }}>
              Role: {role} • Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
          <span className="mono" style={{
            fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px',
            background: isAiGenerated ? 'rgba(0, 240, 255, 0.08)' : 'var(--violet-soft)',
            color: isAiGenerated ? 'var(--neon-cyan)' : 'var(--violet)',
            border: isAiGenerated ? '1px solid rgba(0, 240, 255, 0.2)' : '1px solid rgba(124, 110, 240, 0.3)',
            textShadow: isAiGenerated ? '0 0 6px rgba(0, 240, 255, 0.4)' : 'none'
          }}>
            {isAiGenerated ? '✦ AI GENERATED' : '📋 STANDARD SET'}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: '14px', display: 'flex', gap: '4px' }}>
          {questions.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                flex: 1, height: '4px', borderRadius: '2px', cursor: 'pointer',
                background: idx === currentIndex
                  ? 'var(--violet)'
                  : answers[questions[idx].id]?.trim()
                    ? 'var(--mint)'
                    : 'var(--paper-3)',
                boxShadow: idx === currentIndex ? 'var(--neon-violet-glow)' : 'none',
                transition: 'all 0.3s'
              }}
            />
          ))}
        </div>
      </div>

      {/* Current Question */}
      <div className="mock" style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span className="mono" style={{ fontSize: '13px', fontWeight: '700', color: 'var(--neon-cyan)', textShadow: '0 0 6px rgba(0, 240, 255, 0.4)' }}>
            Q{currentIndex + 1}
          </span>
          <span className="mono" style={{
            fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px',
            background: `${getCategoryColor(currentQ.category)}15`,
            color: getCategoryColor(currentQ.category)
          }}>
            {currentQ.category.toUpperCase()}
          </span>
        </div>

        <p style={{ fontSize: '16px', fontWeight: '600', lineHeight: '1.55', marginBottom: '8px', color: 'var(--ink-strong)' }}>
          {currentQ.question}
        </p>

        {currentQ.tips && (
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '18px', fontStyle: 'italic' }}>
            💡 Tip: {currentQ.tips}
          </p>
        )}

        <textarea
          value={currentAnswer}
          onChange={(e) => handleAnswerChange(e.target.value)}
          placeholder="Type your answer here... Be specific, use examples, and structure your response clearly."
          style={{
            width: '100%', minHeight: '180px', padding: '14px',
            borderRadius: '12px', border: '1.5px solid var(--line)',
            fontSize: '13.5px', fontFamily: 'inherit', resize: 'vertical',
            outline: 'none', background: 'var(--paper)', color: 'var(--ink)',
            lineHeight: '1.55'
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--violet)'; e.target.style.boxShadow = '0 0 0 3px var(--violet-soft)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none'; }}
        />

        <div style={{
          marginTop: '10px', fontSize: '11px', color: 'var(--muted)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span>{currentAnswer.split(/\s+/).filter(w => w.length > 0).length} words</span>
          <span>{answeredCount} of {questions.length} answered</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="mock" style={{
        padding: '16px 28px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'
      }}>
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="btn-ghost"
          style={{
            padding: '8px 16px', fontSize: '12.5px',
            opacity: currentIndex === 0 ? 0.4 : 1,
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          ← Previous
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          {currentIndex < questions.length - 1 ? (
            <button onClick={handleNext} className="btn-primary" style={{ padding: '8px 20px', fontSize: '12.5px' }}>
              Next Question →
            </button>
          ) : (
            <button
              onClick={handleSubmitAll}
              className="btn-primary"
              style={{
                padding: '8px 20px', fontSize: '12.5px',
                background: allAnswered ? 'var(--mint)' : 'var(--violet)',
                boxShadow: allAnswered ? '0 0 10px rgba(52, 211, 153, 0.5)' : 'var(--neon-violet-glow)'
              }}
            >
              {allAnswered ? '✓ Submit Interview' : 'Submit Interview'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
