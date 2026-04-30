# System Design Interview Handoff

이 문서는 새 노트북이나 새 Codex 스레드에서 `대규모 시스템 설계 기초` 스터디를 이어가기 위한 인수인계 문서다. 이전 채팅 전문을 몰라도, 이 문서와 같은 폴더의 트랙 데이터를 읽으면 같은 방식으로 이어갈 수 있어야 한다.

## 빠른 시작

새 환경에서 먼저 아래 순서로 확인한다.

1. `AGENTS.md`를 읽는다.
2. 이 문서 `library/career/system-design-interview/research/handoff.md`를 읽는다.
3. `library/career/system-design-interview/track.json`에서 현재 적재 상태와 페이지 목록을 확인한다.
4. `library/career/system-design-interview/references/study-guide.md`에서 누적된 학습 해설을 훑는다.
5. `library/career/system-design-interview/learner/events.ndjson`에서 사용자가 실제로 막힌 질문 흐름을 확인한다.
6. 새 캡처나 발췌 질문이 오면 아래 "작업 루프"를 따른다.

새 Codex에게 시작 메시지를 준다면 이렇게 주면 된다.

```text
AGENTS.md와 library/career/system-design-interview/research/handoff.md를 먼저 읽고,
대규모 시스템 설계 기초 스터디 트랙의 기존 방식 그대로 이어가줘.
내 질문 원문은 줄바꿈과 목록을 보존하고, 질문 다듬기/왜 막혔나/정리/용어 풀이/근거를 반드시 반영해줘.
작업 후에는 PR로 main에 squash merge하고 로컬도 main으로 돌려줘.
```

## 현재 상태

- 현재 브랜치 기준 최신 원격 `main` 반영 커밋: `8e6351c docs: DB 수평 확장 용어 풀이 보강 (#28)`
- 현재 적재 범위: 1장 p14~44, 2장 p46~51
- 현재 읽기 배치 수: 15개
- 현재 누적 질문 이벤트 수: 39개
- 현재 트랙 phase: `2장 p46~51 적재 완료`

현재 적재된 페이지는 아래와 같다.

1. `ch01-pp14-15-intro-single-server`: 도입과 단일 서버
2. `ch01-p16-request-clients-and-http`: 요청의 출발점과 클라이언트 종류
3. `ch01-p17-database-split-and-database-choice`: 데이터베이스 분리와 선택
4. `ch01-p18-nosql-and-scaling`: NoSQL 선택과 규모 확장 방식
5. `ch01-pp19-21-load-balancer-and-db-replication`: 로드밸런서와 데이터베이스 다중화
6. `ch01-pp24-26-cache-and-cdn`: 캐시와 CDN 도입
7. `ch01-pp27-29-cdn-operation`: CDN 동작과 무효화
8. `ch01-pp30-32-stateless-web-tier`: 무상태 웹 계층
9. `ch01-pp33-35-data-center`: 데이터 센터
10. `ch01-p35-message-queue-intro`: 메시지 큐 도입
11. `ch01-p36-message-queue-worker-scaling`: 메시지 큐 확장 예시
12. `ch01-pp36-38-logs-metrics-automation`: 로그, 메트릭 그리고 자동화
13. `ch01-p38-database-scaling-intro`: 데이터베이스 규모 확장 도입
14. `ch01-pp39-44-database-sharding`: 데이터베이스 샤딩과 1장 마무리
15. `ch02-pp46-51-scale-estimation`: 2장 p46~51 개략적인 규모 추정

## 중요한 파일

- `track.json`: 트랙 메타데이터, phase, 페이지 라우트, 읽기 순서.
- `pages/*/source.md`: OCR 또는 수동 대조로 옮긴 원문 아카이브. 보이는 원문은 임의로 요약하지 않는다.
- `pages/*/structure.json`: 화면에서 학습 카드로 쓸 의미 있는 구간만 선택한다.
- `pages/*/overlay.ko.json`: 쉬운 해설, 사고 교정, 용어 풀이, 프론트엔드 연결, 회상 질문.
- `learner/events.ndjson`: 사용자의 질문 원문, 막힌 이유, 질문 다듬기, 답변 요약. append-only처럼 다룬다.
- `learner/patterns.json`: 반복되는 오해 패턴.
- `review/queue.json`: 복습 질문 큐.
- `glossary/terms.json`: 트랙 전역 용어 풀이. 새 용어가 나오면 반드시 보강한다.
- `references/study-guide.md`: 전체 스터디 가이드와 누적 해설.
- `references/table-of-contents-archive.md`: 목차 OCR 아카이브.
- `research/source-registry.md`: 공식 문서, 논문, 빅테크 글, GitHub, 커뮤니티 근거 목록.

## 사용자 학습 목표

사용자는 단순 요약을 원하지 않는다. 목표는 아래에 가깝다.

- 프론트엔드 개발자로서 시스템 설계 감각을 키운다.
- 장기적으로 풀스택이 되기 위해 백엔드/인프라 개념도 버리지 않는다.
- 개념 암기보다 사고력, 독해력, 문해력, 질문 능력을 키운다.
- 사용자의 사고 과정이 틀리면 냉정하게 바로잡는다.
- 하지만 왜 그렇게 오해했는지도 같이 분석해 다음 독해 전략을 만든다.

답변과 문서 작성 톤은 `냉정한 선생님 + 다정한 페어`다. 무조건 편들지 말고, 틀린 전제는 정확히 교정한다.

## 질문 기록 원칙

사용자가 `""`로 책 문구를 발췌하고 그 아래에 의문, 사고 흐름, 질문을 섞어 남기면 아래 형식으로 반영한다.

1. `question`에는 사용자의 원문을 줄바꿈과 목록까지 보존한다.
2. `questionRevision`에는 더 좋은 질문으로 다듬은 버전을 넣는다.
3. `confusionReason`에는 왜 막혔는지, 어떤 전제가 틀어졌는지 적는다.
4. `answerSummary`에는 개념 설명보다 사고 교정과 실전 판단 기준을 우선한다.
5. `patternLabel`은 반복 가능성이 있는 오해 이름으로 짧게 붙인다.
6. `review/queue.json`에는 나중에 다시 물어볼 회상 질문을 만든다.

화면에서 사용자가 읽기 좋게 보이도록 답변은 `질문 원문`, `질문 다듬기`, `왜 막혔나`, `정리`, `용어 풀이`가 분리되어야 한다.

`읽으면서 생각하기` 질문은 사용자가 먼저 스스로 답을 만들어 볼 수 있도록 기본 닫힘 토글로 보여 준다. 토글 안에는 `모범 답안`을 넣고, 프론트엔드 면접에서 어필할 만한 연결점이 있으면 `프론트 면접 어필`을 함께 둔다. 답안은 정답 암기가 아니라 worked example이므로, 핵심 결론과 trade-off가 보이게 짧고 선명하게 쓴다.

## 용어 풀이 원칙

용어를 그냥 쓰지 않는다. 특히 아래 같은 약어나 인프라 용어는 첫 등장 근처에 쉬운 풀이를 붙인다.

- `TTL`, `origin`, `edge server`, `fallback`, `p95/p99`, `QPS`, `cache key`, `invalidation`, `object versioning`
- `RDBMS`, `NoSQL`, `replica`, `primary`, `standby`, `failover`, `redundancy`
- `CDN`, `S3`, `bucket`, `object`, `Cache-Control`, `stale`

용어 풀이 위치는 둘 중 하나다.

1. 페이지별 `overlay.ko.json`의 `selectiveVocabGlosses`
2. 전역 `glossary/terms.json`와 `study-guide.md`의 `용어 풀이` 섹션

사용자가 "TTL이 뭔지 어떻게 알아"라고 지적한 뒤부터 이 원칙은 필수다.

## OCR과 원문 아카이브 원칙

- 스크린샷 파일 자체는 저장하지 않는다.
- OCR 또는 수동 전사한 텍스트만 저장한다.
- 보이는 원문은 `source.md`에 보존한다.
- 잘린 문장은 임의로 완성하지 않는다. `잘림`, `이어짐`, `이전 페이지에서 시작` 같은 메모로 표시한다.
- 그림은 이미지 저장 대신 레이블과 화살표 의미를 텍스트로 옮긴다.
- 도식 세그먼트는 화면에서 세로 텍스트 목록으로 길게 펼치지 말고, 도식 요약 카드와 접힌 원문 레이블로 보여준다.
- OCR이 애매하면 화면 수동 대조를 우선한다.

## 작업 루프

새 캡처나 질문이 오면 아래 순서로 작업한다.

1. 현재 branch와 clean 상태를 확인한다.
2. 필요한 경우 새 `codex/*` 브랜치를 만든다.
3. 캡처 위치가 기존 페이지의 연장인지 새 배치인지 판단한다.
4. `source.md`를 만들거나 갱신한다.
5. `structure.json`에서 학습 가치 있는 segment를 고른다.
6. `overlay.ko.json`에 해설, 사고 교정, 프론트엔드 연결, 용어 풀이를 넣는다.
7. 사용자 질문은 `learner/events.ndjson`에 보존한다.
8. 반복 오해는 `learner/patterns.json`에 추가한다.
9. 복습 질문은 `review/queue.json`에 추가한다.
10. 새 용어는 `glossary/terms.json`에 넣는다.
11. 공식 문서나 논문 등 근거는 `research/source-registry.md`에 추가한다.
12. `references/study-guide.md`에 누적 해설과 용어 풀이를 넣는다.
13. 테스트 기대값을 갱신한다.
14. 완료 전 검증을 실행한다.
15. PR을 만들고 GitHub Checks를 확인한다.
16. 통과하면 squash merge한다.
17. 로컬을 `main`으로 전환하고 `origin/main`과 맞춘다.

## 검증 명령

완료 보고 전 최소 아래를 실행한다.

```bash
pnpm lint:strict
pnpm format:check
pnpm type-check
pnpm test
pnpm test:coverage
pnpm build
pnpm test:e2e
```

push 전에는 husky가 `pnpm verify:push`를 실행한다. 그래도 완료 보고에는 위 전체 검증을 기준으로 삼는다.

## Git/PR 운영 원칙

- 직접 `main`에 push하지 않는다. repo rule 때문에 PR이 필요하다.
- 브랜치는 기본적으로 `codex/*`를 쓴다.
- 커밋 메시지는 Conventional Commits와 한국어 요약을 쓴다.
- PR 생성 후 GitHub Checks가 모두 통과해야 merge한다.
- 사용자가 `main에 반영됐어?`라고 물으면 원격 PR merge 여부를 확인해서 답한다.
- merge 후 반드시 로컬도 `main`으로 돌아오고 `origin/main`과 맞춘다.
- Codex 앱의 "다른 브랜치에서 계속할까요?" 팝업은 대화가 예전 브랜치에서 시작됐다는 메타데이터 경고일 수 있다. Git 상태를 확인하고 `main...origin/main`이 깨끗하면 repo 상태는 정상이라고 설명한다.

## 새 스레드가 함부로 바꾸면 안 되는 것

- 사용자의 질문 원문을 한 줄로 뭉개지 않는다.
- 질문을 단순 Q&A로만 처리하지 않는다.
- 용어를 설명 없이 쓰지 않는다.
- 책 원문을 통짜 `pre`로 길게 던지지 않는다.
- 목차/장/절 구조를 무시하고 일자로 길게 나열하지 않는다.
- 프론트엔드와 연결되는 실무 의미를 생략하지 않는다.
- 공식 문서 확인이 필요한 최신 정보나 클라우드 서비스 동작을 기억만으로 단정하지 않는다.
- PR 없이 작업 완료라고 말하지 않는다.

## 다음 예상 작업

현재 1장은 p44 참고문헌 화면까지 들어갔고, `데이터베이스의 규모 확장` 절은 `ch01-p38-database-scaling-intro`와 `ch01-pp39-44-database-sharding` 두 페이지로 나뉘어 있다. 2장은 p46~51 `개략적인 규모 추정` 첫 배치가 들어갔고, `사고 실험`, `응답지연 값 시각화`, `SLA`, `Peak QPS`, `미디어 저장소 요구량`, `QPS/캐시/서버 수 추정 공식` 질문이 발췌문별 이벤트로 분리되어 있다. 다음 캡처가 오면 3장으로 넘어가거나, 2장 후속 질문이 오면 기존 `ch02-pp46-51-scale-estimation` 페이지에 연결할지 새 페이지로 분리할지 먼저 판단한다. 사용자가 중간 질문만 보낼 수도 있으므로, 새 배치가 아니더라도 `learner/events.ndjson`과 `study-guide.md`에 먼저 기록하고 나중에 원문 페이지와 연결할 수 있게 한다.
