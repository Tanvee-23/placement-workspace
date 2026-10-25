import React, { useState } from 'react';
import { generateQuizQuestions } from '../utils/geminiApi';

// Fallback static questions when AI is unavailable
function getFallbackQuestions(companyName, role) {
  const aptitudeQuestions = [
    {
      id: 1,
      question: `If a team at ${companyName} has 8 members and needs to form a committee of 3, how many different committees can be formed?`,
      options: ['56', '336', '24', '512'],
      correctIndex: 0,
      explanation: 'This is a combination problem: C(8,3) = 8! / (3! × 5!) = 56.',
      category: 'Aptitude'
    },
    {
      id: 2,
      question: 'A program takes 12 seconds to process 1000 records. How long will it take to process 5000 records, assuming linear time complexity?',
      options: ['48 seconds', '60 seconds', '120 seconds', '36 seconds'],
      correctIndex: 1,
      explanation: 'With linear complexity: 12 × (5000/1000) = 60 seconds.',
      category: 'Aptitude'
    },
    {
      id: 3,
      question: 'In a sequence: 2, 6, 12, 20, 30, ... what is the next number?',
      options: ['40', '42', '44', '36'],
      correctIndex: 1,
      explanation: 'The differences are 4, 6, 8, 10, so the next difference is 12. Hence 30 + 12 = 42.',
      category: 'Aptitude'
    }
  ];

  const technicalByRole = {
    'Frontend Developer': [
      {
        id: 4,
        question: 'Which React hook is used to perform side effects in functional components?',
        options: ['useState', 'useEffect', 'useRef', 'useMemo'],
        correctIndex: 1,
        explanation: 'useEffect is specifically designed for handling side effects like data fetching, subscriptions, and DOM manipulation.',
        category: 'Technical'
      },
      {
        id: 5,
        question: 'What is the time complexity of accessing an element in a JavaScript array by index?',
        options: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
        correctIndex: 1,
        explanation: 'Array access by index is a constant time O(1) operation as arrays use contiguous memory allocation.',
        category: 'Technical'
      },
      {
        id: 6,
        question: 'What does the CSS property "box-sizing: border-box" do?',
        options: [
          'Includes padding and border in the element\'s total width and height',
          'Only includes padding in the element\'s total width',
          'Excludes margin from the element\'s total width',
          'Creates a border around the box model'
        ],
        correctIndex: 0,
        explanation: 'border-box includes padding and border (but not margin) in the element\'s specified width and height.',
        category: 'Technical'
      },
      {
        id: 7,
        question: 'Which data structure would be most efficient for implementing a browser\'s back/forward navigation?',
        options: ['Queue', 'Stack', 'Array', 'Linked List'],
        correctIndex: 1,
        explanation: 'Two stacks (one for back, one for forward) efficiently handle browser navigation with O(1) push/pop operations.',
        category: 'Technical'
      }
    ],
    'default': [
      {
        id: 4,
        question: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
        correctIndex: 1,
        explanation: 'Binary search divides the search space in half each iteration, resulting in O(log n) time complexity.',
        category: 'Technical'
      },
      {
        id: 5,
        question: 'Which sorting algorithm has the best average-case time complexity?',
        options: ['Bubble Sort - O(n²)', 'Merge Sort - O(n log n)', 'Selection Sort - O(n²)', 'Insertion Sort - O(n²)'],
        correctIndex: 1,
        explanation: 'Merge Sort consistently achieves O(n log n) in average and worst cases through divide and conquer.',
        category: 'Technical'
      },
      {
        id: 6,
        question: 'What is a deadlock in operating systems?',
        options: [
          'When a process terminates unexpectedly',
          'When two or more processes are waiting for each other to release resources',
          'When the CPU is overloaded',
          'When memory is fully utilized'
        ],
        correctIndex: 1,
        explanation: 'A deadlock occurs when processes hold resources and wait for others held by different processes, creating a circular wait.',
        category: 'Technical'
      },
      {
        id: 7,
        question: 'Which SQL clause is used to filter grouped results?',
        options: ['WHERE', 'HAVING', 'GROUP BY', 'FILTER'],
        correctIndex: 1,
        explanation: 'HAVING filters results after GROUP BY aggregation, while WHERE filters individual rows before grouping.',
        category: 'Technical'
      }
    ]
  };

  const roleSpecificQuestions = [
    {
      id: 8,
      question: `What is most important when preparing for a ${role} interview at ${companyName}?`,
      options: [
        'Only focus on coding problems',
        'Balance of DSA, system design, and behavioral preparation',
        'Memorize all possible questions',
        'Only study the company\'s tech stack'
      ],
      correctIndex: 1,
      explanation: `Top companies like ${companyName} evaluate candidates holistically across technical skills, problem-solving, system design, and cultural fit.`,
      category: 'Role-Specific'
    },
    {
      id: 9,
      question: 'Which of the following best describes the STAR method for behavioral interviews?',
      options: [
        'Study, Test, Apply, Review',
        'Situation, Task, Action, Result',
        'Simplify, Think, Act, Reflect',
        'Scope, Timeline, Approach, Retrospect'
      ],
      correctIndex: 1,
      explanation: 'STAR (Situation, Task, Action, Result) is a structured method for answering behavioral interview questions with concrete examples.',
      category: 'Role-Specific'
    },
    {
      id: 10,
      question: `When asked "Why do you want to join ${companyName}?" in an interview, what approach is most effective?`,
      options: [
        'Focus only on salary and benefits',
        'Mention specific projects, values, or tech that align with your goals',
        'Say you need any job available',
        'Criticize your current/previous employer'
      ],
      correctIndex: 1,
      explanation: `Demonstrating specific knowledge about ${companyName}'s mission, products, and engineering culture shows genuine interest and preparation.`,
      category: 'Role-Specific'
    }
  ];

  const techQuestions = technicalByRole[role] || technicalByRole['default'];

  return [...aptitudeQuestions, ...techQuestions, ...roleSpecificQuestions];
}

export default function CompanyQuiz({ company, onBack }) {
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [error, setError] = useState('');

  const companyName = company.name;
  const role = company.role || 'Software Engineer';

  const handleStartQuiz = async () => {
    setLoading(true);
    setError('');
    setSubmitted(false);
    setAnswers({});

    const aiQuestions = await generateQuizQuestions(companyName, role);

    if (aiQuestions) {
      setQuestions(aiQuestions);
      setIsAiGenerated(true);
    } else {
      setQuestions(getFallbackQuestions(companyName, role));
      setIsAiGenerated(false);
    }

    setLoading(false);
  };

  const handleSelectAnswer = (questionId, optionIndex) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) {
      setError('Please answer all questions before submitting.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  const getScore = () => {
    if (!questions) return 0;
    return questions.filter(q => answers[q.id] === q.correctIndex).length;
  };

  const getCategoryIcon = (cat) => {
    if (cat === 'Aptitude') return '🧮';
    if (cat === 'Technical') return '💻';
    return '🎯';
  };

  // Initial state - show start button
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
          <span style={{ fontSize: '52px', display: 'block', marginBottom: '16px' }}>🧠</span>
          <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>
            {companyName} — Placement Quiz
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: '14.5px', marginBottom: '8px', lineHeight: '1.5' }}>
            Test your preparation with 10 MCQs customized for<br />
            <strong style={{ color: 'var(--neon-cyan)', textShadow: '0 0 6px rgba(0, 240, 255, 0.4)' }}>{role}</strong> role at <strong style={{ color: 'var(--ink-strong)' }}>{companyName}</strong>
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '12.5px', marginBottom: '28px' }}>
            Includes aptitude, technical, and role-relevant questions.
          </p>
          <button onClick={handleStartQuiz} className="btn-primary" style={{ justifyContent: 'center', width: '100%', maxWidth: '280px' }}>
            Generate Quiz
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
            Generating questions for {companyName}...
          </p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const score = getScore();
  const total = questions.length;
  const percentage = Math.round((score / total) * 100);

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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>
              {companyName} — Placement Quiz
            </h3>
            <span className="mono" style={{ fontSize: '11px', color: 'var(--muted)' }}>
              Role: {role} • {total} Questions
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="mono" style={{
              fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px',
              background: isAiGenerated ? 'rgba(0, 240, 255, 0.08)' : 'var(--violet-soft)',
              color: isAiGenerated ? 'var(--neon-cyan)' : 'var(--violet)',
              border: isAiGenerated ? '1px solid rgba(0, 240, 255, 0.2)' : '1px solid rgba(124, 110, 240, 0.3)',
              textShadow: isAiGenerated ? '0 0 6px rgba(0, 240, 255, 0.4)' : 'none'
            }}>
              {isAiGenerated ? '✦ AI GENERATED' : '📋 STANDARD SET'}
            </span>
            {submitted && (
              <span className="mono" style={{
                fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px',
                background: percentage >= 70 ? 'var(--mint-soft)' : percentage >= 40 ? 'var(--yellow-soft)' : 'var(--coral-soft)',
                color: percentage >= 70 ? 'var(--mint)' : percentage >= 40 ? 'var(--yellow)' : 'var(--coral)'
              }}>
                SCORE: {score}/{total}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Score Card (shown after submission) */}
      {submitted && (
        <div className="mock" style={{ padding: '28px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{
              width: '90px', height: '90px', borderRadius: '50%',
              background: `conic-gradient(${percentage >= 70 ? 'var(--mint)' : percentage >= 40 ? 'var(--yellow)' : 'var(--coral)'} 0deg ${percentage * 3.6}deg, var(--paper-3) ${percentage * 3.6}deg 360deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0
            }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%', background: 'var(--paper-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: '700', fontSize: '22px', color: 'var(--ink-strong)' }}>
                  {percentage}%
                </span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '6px' }}>
                {percentage >= 70 ? '🎉 Great Job!' : percentage >= 40 ? '📈 Keep Practicing!' : '💪 Needs Improvement'}
              </h4>
              <p style={{ color: 'var(--muted)', fontSize: '13.5px', lineHeight: '1.5', marginBottom: '14px' }}>
                You answered {score} out of {total} questions correctly.
                {percentage >= 70
                  ? ` You're well prepared for ${companyName}'s placement process!`
                  : ` Review the explanations below and try again to improve your score.`
                }
              </p>
              <button
                onClick={handleStartQuiz}
                className="btn-primary"
                style={{ padding: '10px 20px', fontSize: '12.5px' }}
              >
                ↻ Retake Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions */}
      {questions.map((q, qIdx) => {
        const userAnswer = answers[q.id];
        const isCorrect = userAnswer === q.correctIndex;
        const isAnswered = userAnswer !== undefined;

        return (
          <div
            key={q.id}
            className="mock"
            style={{
              padding: '24px 28px',
              borderLeft: submitted
                ? `4px solid ${isCorrect ? 'var(--mint)' : 'var(--coral)'}`
                : '4px solid transparent'
            }}
          >
            {/* Question header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="mono" style={{ fontSize: '12px', fontWeight: '700', color: 'var(--neon-cyan)', textShadow: '0 0 6px rgba(0, 240, 255, 0.4)' }}>
                  Q{qIdx + 1}
                </span>
                <span className="mono" style={{
                  fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px',
                  background: q.category === 'Aptitude' ? 'var(--violet-soft)' : q.category === 'Technical' ? 'rgba(0, 240, 255, 0.08)' : 'var(--mint-soft)',
                  color: q.category === 'Aptitude' ? 'var(--violet)' : q.category === 'Technical' ? 'var(--neon-cyan)' : 'var(--mint)',
                  border: q.category === 'Technical' ? '1px solid rgba(0, 240, 255, 0.2)' : 'none'
                }}>
                  {getCategoryIcon(q.category)} {q.category.toUpperCase()}
                </span>
              </div>
              {submitted && (
                <span style={{
                  fontSize: '14px', fontWeight: '700',
                  color: isCorrect ? 'var(--mint)' : 'var(--coral)',
                  textShadow: isCorrect ? '0 0 8px rgba(52, 211, 153, 0.5)' : '0 0 8px rgba(255, 122, 107, 0.5)'
                }}>
                  {isCorrect ? '✓ Correct' : '✗ Wrong'}
                </span>
              )}
            </div>

            {/* Question text */}
            <p style={{ fontSize: '14.5px', fontWeight: '600', lineHeight: '1.5', marginBottom: '16px', color: 'var(--ink-strong)' }}>
              {q.question}
            </p>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {q.options.map((opt, optIdx) => {
                let optBg = 'var(--paper)';
                let optBorder = '1px solid var(--line)';
                let optColor = 'var(--ink)';

                if (submitted) {
                  if (optIdx === q.correctIndex) {
                    optBg = 'var(--mint-soft)';
                    optBorder = '1.5px solid var(--mint)';
                    optColor = 'var(--ink-strong)';
                  } else if (optIdx === userAnswer && optIdx !== q.correctIndex) {
                    optBg = 'var(--coral-soft)';
                    optBorder = '1.5px solid var(--coral)';
                  }
                } else if (userAnswer === optIdx) {
                  optBg = 'var(--violet-soft)';
                  optBorder = '1.5px solid var(--violet)';
                  optColor = 'var(--ink-strong)';
                }

                return (
                  <div
                    key={optIdx}
                    onClick={() => handleSelectAnswer(q.id, optIdx)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 16px', borderRadius: '10px',
                      background: optBg, border: optBorder,
                      cursor: submitted ? 'default' : 'pointer',
                      transition: 'all 0.2s', fontSize: '13.5px',
                      color: optColor, fontWeight: '500'
                    }}
                  >
                    <span className="mono" style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: '700', flexShrink: 0,
                      background: userAnswer === optIdx ? (submitted ? (optIdx === q.correctIndex ? 'var(--mint)' : 'var(--coral)') : 'var(--violet)') : 'transparent',
                      border: '2px solid',
                      borderColor: userAnswer === optIdx ? (submitted ? (optIdx === q.correctIndex ? 'var(--mint)' : 'var(--coral)') : 'var(--violet)') : 'var(--line)',
                      color: userAnswer === optIdx ? '#fff' : 'var(--muted)'
                    }}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span style={{ flex: 1 }}>{opt}</span>
                    {submitted && optIdx === q.correctIndex && (
                      <span style={{ fontSize: '12px', color: 'var(--mint)', fontWeight: '700', textShadow: '0 0 6px rgba(52, 211, 153, 0.5)' }}>✓</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Explanation (shown after submission) */}
            {submitted && (
              <div style={{
                marginTop: '14px', padding: '12px 16px', borderRadius: '10px',
                background: 'var(--paper-2)', borderLeft: '3px solid var(--neon-cyan)',
                fontSize: '13px', color: 'var(--ink)', lineHeight: '1.5'
              }}>
                <strong style={{ color: 'var(--neon-cyan)', fontSize: '11px', textShadow: '0 0 6px rgba(0, 240, 255, 0.4)' }}>EXPLANATION:</strong>{' '}
                {q.explanation}
              </div>
            )}
          </div>
        );
      })}

      {/* Submit / Error */}
      {!submitted && (
        <div className="mock" style={{ padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
            {Object.keys(answers).length} of {total} answered
          </span>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {error && <span style={{ fontSize: '12px', color: 'var(--coral)' }}>{error}</span>}
            <button onClick={handleSubmit} className="btn-primary" style={{ padding: '10px 22px', fontSize: '13px' }}>
              Submit Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
