// Role catalogue + helpers used by the Resume page.

export const ROLE_SKILLS = {
  'Frontend Developer': ['javascript', 'typescript', 'react', 'redux', 'next.js', 'html', 'css', 'tailwind', 'webpack', 'git', 'testing'],
  'Backend Developer': ['node.js', 'express', 'python', 'django', 'java', 'spring', 'go', 'postgresql', 'mongodb', 'redis', 'docker', 'system design', 'sql', 'microservices'],
  'Fullstack Developer': ['react', 'node.js', 'typescript', 'express', 'postgresql', 'mongodb', 'docker', 'system design', 'javascript', 'html', 'css', 'git'],
  'Data Scientist': ['python', 'r', 'sql', 'machine learning', 'deep learning', 'pandas', 'numpy', 'scikit-learn', 'pytorch', 'tensorflow', 'tableau', 'spark'],
  'DevOps Engineer': ['docker', 'kubernetes', 'aws', 'terraform', 'jenkins', 'gitlab', 'linux', 'bash', 'prometheus', 'grafana', 'nginx', 'cicd']
};

export const BUILT_IN_ROLES = Object.keys(ROLE_SKILLS);

// Used only when a custom role has no skills typed in by the user.
const KEYWORD_TO_ROLE = [
  [['front', 'ui', 'web designer'], 'Frontend Developer'],
  [['back', 'api', 'server'], 'Backend Developer'],
  [['full'], 'Fullstack Developer'],
  [['data', 'ml', 'machine', 'ai ', 'analyst'], 'Data Scientist'],
  [['devops', 'cloud', 'sre', 'infra'], 'DevOps Engineer']
];

const GENERIC_SKILLS = ['git', 'sql', 'python', 'java', 'javascript', 'data structures', 'algorithms', 'problem solving'];

export function inferSkillsForRole(roleName) {
  const lower = `${roleName.toLowerCase()} `;
  for (const [keywords, builtIn] of KEYWORD_TO_ROLE) {
    if (keywords.some((k) => lower.includes(k))) return ROLE_SKILLS[builtIn];
  }
  return GENERIC_SKILLS;
}

// customRoles = [{ name: 'Game Developer', skills: ['unity', 'c#'] }]
export function resolveRoleSkills(role, customRoles = []) {
  if (ROLE_SKILLS[role]) return ROLE_SKILLS[role];
  const custom = customRoles.find((r) => r.name === role);
  if (custom && custom.skills && custom.skills.length > 0) return custom.skills;
  return role ? inferSkillsForRole(role) : [];
}

export function parseSkillList(raw) {
  return [...new Set(
    raw
      .split(/[,\n]/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  )].slice(0, 25);
}

// Field-level validation for the custom role input. Returns '' when valid.
export function validateRoleName(name) {
  const trimmed = name.trim();
  if (trimmed.length < 2) return 'Role name must be at least 2 characters.';
  if (trimmed.length > 40) return 'Role name must be 40 characters or fewer.';
  if (!/^[A-Za-z0-9][A-Za-z0-9 +#.&/()-]*$/.test(trimmed)) {
    return 'Use only letters, numbers and + # . & / ( ) - in the role name.';
  }
  return '';
}

export function normalizeRoleName(name) {
  return name.trim().replace(/\s+/g, ' ');
}