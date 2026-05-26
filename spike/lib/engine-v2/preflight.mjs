// PromptDolphin Engine v2 — pre-flight self-check
// MIT License — Robic Direct Inc.

const REQUIRED_SPINE_KEYS = ['role', 'task', 'format', 'exclusions', 'critique'];

export function preflight(engineered, { task, userConstraints = [], spine = null } = {}) {
  const issues = [];
  const text = String(engineered);

  const taskHead = String(task).trim().slice(0, 40);
  if (taskHead && !text.includes(taskHead)) {
    issues.push({
      severity: 'high',
      code: 'task_missing',
      message: 'Engineered prompt does not include the user task verbatim.',
    });
  }

  for (const c of userConstraints) {
    if (!text.includes(c)) {
      issues.push({
        severity: 'high',
        code: 'constraint_dropped',
        message: `User constraint not preserved verbatim: "${c.slice(0, 80)}"`,
      });
    }
  }

  if (spine) {
    for (const key of REQUIRED_SPINE_KEYS) {
      if (!spine[key] || String(spine[key]).trim() === '') {
        issues.push({
          severity: 'high',
          code: 'spine_missing',
          message: `Spine component missing or empty: ${key}`,
        });
      }
    }
  }

  if (text.length < 120) {
    issues.push({
      severity: 'medium',
      code: 'too_short',
      message: `Engineered prompt suspiciously short (${text.length} chars).`,
    });
  }
  if (text.length > 25000) {
    issues.push({
      severity: 'medium',
      code: 'too_long',
      message: `Engineered prompt unusually long (${text.length} chars); check for runaway.`,
    });
  }

  return {
    passed: issues.filter((i) => i.severity === 'high').length === 0,
    issues,
  };
}
