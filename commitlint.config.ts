type ParsedCommit = {
  subject?: string | null;
};

type CommitlintConfig = {
  extends: string[];
  plugins: Array<{
    rules: {
      'subject-korean': (parsed: ParsedCommit) => [boolean, string];
    };
  }>;
  rules: Record<string, unknown>;
};

function includesKorean(subject: string | null | undefined) {
  return typeof subject === 'string' && /[가-힣]/.test(subject);
}

const config: CommitlintConfig = {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'subject-korean': (parsed: ParsedCommit) => [
          includesKorean(parsed.subject),
          '커밋 제목(subject)에는 최소 한 글자 이상의 한글이 포함되어야 합니다. 예: "fix: E2E 아티팩트 복원 경로 안정화"',
        ],
      },
    },
  ],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'revert', 'ci'],
    ],
    'subject-case': [0],
    'subject-korean': [2, 'always'],
    'subject-max-length': [2, 'always', 72],
    'body-max-line-length': [1, 'always', 100],
  },
};

export default config;
