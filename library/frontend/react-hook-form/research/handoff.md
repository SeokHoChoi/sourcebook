# RHF 프로젝트 핸드오프

이 문서는 **다른 스레드가 지금까지의 맥락을 빠르게 이어받기 위한 구조화된 핸드오프**다.  
원문 대화 전체를 그대로 복사하지 않고도 작업을 이어갈 수 있게, 결정과 이유를 압축해 남긴다.

## 1. 이 프로젝트의 현재 목적

이 RHF 트랙의 목적은 단순한 번역이 아니다.

- React Hook Form 공식 문서를 **학습 순서에 맞춰 읽을 수 있는 프로젝트**로 재구성
- 영어 원문, 직독직해, 개발 맥락 설명, 실전 학습 가이드를 한 프로젝트 안에 통합
- 사용자가 **막혔던 지점**을 별도 데이터로 누적하고, 다시 원래 위치로 돌아갈 수 있게 설계
- 이후 이 자료를 기반으로 **블로그 글**까지 쓸 수 있도록, 주장별 출처를 남기는 것

## 2. 사용자 요구 성향

이 프로젝트에서 다음 요구는 반복적으로 매우 강하게 나왔다.

- vague한 설명을 싫어함
- “어디서 확인했는지”를 **정확한 URL 수준으로** 남기길 원함
- mental model이 끊기면 즉시 불편함을 느낌
- 영어 직독직해도 원하지만, **개발 개념 연결**이 빠지면 학습이 안 된다고 느낌
- UI/UX도 중요하게 보며, 단순 정보 덩어리보다 **학습 흐름 설계**를 중시함
- “막힌 지점”은 분산 기록이 아니라 **한 곳에 모아서 다시 볼 수 있어야 한다**고 요구함
- 특히 DOM / RHF / 브라우저 메모리 층위 같은 개념은 **CS 깊이까지 설명**해주길 원함

## 3. 지금까지 대화에서 크게 다룬 흐름

### Phase 1. 공식 문서 intake / 오버레이 구조 정리

- Get Started 문서를 섹션 단위로 정리
- raw source 보존 vs 학습용 구조화 segment 분리를 이해시키는 작업
- 메뉴/광고/푸터 같은 주변부와 본문을 구분하는 구조 정립

### Phase 2. 직독직해 UI와 학습 방식 논의

- 영어 문장을 너무 잘게 쪼개면 학습이 되는지에 대한 의문 제기
- 교육학/인지과학 관점에서:
  - 원문 전체 먼저 보기
  - 필요할 때만 청크 열기
  - 자기 설명 질문, 회상 질문, 비교 기준을 넣는 구조로 개선
- 과하게 긴 카드형 청크 UI는 화면 공간을 너무 먹는다는 피드백 반영

### Phase 3. RHF 실전 학습 가이드 전면 개편

- 기존 문서의 giant API dump 문제를 비판적으로 검토
- `register / handleSubmit / errors` 같은 최소 단위부터 시작하는 구조로 개편
- 비교표, 흔한 실수, 자기 설명 질문, 회상 질문을 각 섹션에 넣음
- Zod, values/reset, Controller, useFieldArray, TanStack Query 등 실전 패턴 문서화

### Phase 4. 프로젝트 내 스터디 섹션 구현

- 기존 공식 문서 리더와 별도로 `/study` 섹션 추가
- RHF 실전 학습 가이드를 프로젝트에서 직접 렌더하도록 구현
- 코드 블록, 표, 앵커, 파트 점프 등 학습용 레이아웃 구현 및 다듬기

### Phase 5. 학습 기록(journal) 시스템 구현

- “막힌 지점 모아보기”라는 별도 페이지 추가
- 질문, 막힌 이유, 정리, 정확한 원래 위치를 한 화면에서 다시 보게 설계
- 질문 카드에서 원래 스터디 문서나 공식 문서 위치로 바로 이동 가능하게 구현
- 같은 질문 패턴을 묶어 보는 confusion pattern UI 추가

### Phase 6. DOM vs RHF 내부 상태 혼동 정리

- 사용자가 특히 크게 막힌 지점:
  - “DOM이 관리한다”는 말이 정확히 무엇인가
  - RHF 내부 메모리/캐시가 있다는 말과 어떻게 양립하는가
- 이를 위해:
  - 스터디 가이드에 해당 설명을 별도 섹션으로 추가
  - learner event로 기록
  - journal과 study 화면에 동일 맥락이 연결되게 반영

### Phase 7. 브라우저 프로세스 / JS heap / DOM / RHF 내부 객체 설명 추가

- 사용자는 OS 프로세스, heap/stack 정도만 아는 상태에서:
  - 브라우저는 프로세스가 무엇인지
  - React/Next 앱은 프로세스인지
  - 웹앱은 어떤 메모리를 쓰는지
  - RHF의 내부 메모리/캐시는 정확히 어디에 있는지
  - DOM 메모리와 JS heap은 어떻게 다른지
  - `_formValues`와 DOM live value가 왜 동시에 존재하는지
    를 깊게 궁금해함
- 이 요구를 반영해:
  - 스터디 가이드에 `브라우저 프로세스부터 RHF 내부 저장소까지` 섹션 추가
  - learner event `rhf-event-009` 추가
  - confusion pattern `브라우저 런타임 메모리 층위 혼동` 추가

## 4. 현재 프로젝트에서 중요한 파일

### 학습 본문

- `library/frontend/react-hook-form/references/study-guide.md`

특히 확인할 섹션:

- `DOM이 관리한다는 말의 정확한 뜻`
- `브라우저 프로세스부터 RHF 내부 저장소까지`

### 막힌 지점 데이터

- `library/frontend/react-hook-form/learner/events.ndjson`
- `library/frontend/react-hook-form/learner/patterns.json`

특히 관련 이벤트:

- `rhf-event-008`
- `rhf-event-009`

### 렌더링 / 연결 로직

- `src/app/categories/[categorySlug]/tracks/[trackSlug]/study/page.tsx`
- `src/app/categories/[categorySlug]/tracks/[trackSlug]/journal/page.tsx`
- `src/app/categories/[categorySlug]/tracks/[trackSlug]/pages/[pageSlug]/page.tsx`
- `src/components/sourcebook/inline-learner-event-notice.tsx`
- `src/components/sourcebook/learner-event-card.tsx`
- `src/lib/sourcebook.ts`

## 5. 다른 스레드가 반드시 알아야 할 설계 원칙

### 원칙 A. vague citation 금지

아래 같은 표현만 남기는 것은 부족하다고 사용자가 명확히 지적했다.

- “Chromium 문서에서 확인”
- “MDN에서 봤다”
- “논문을 참고했다”

앞으로는 최소한 아래까지 남겨야 한다.

- 문서명
- 정확한 URL
- 그 출처를 어떤 주장에 사용했는지

### 원칙 B. 막힌 지점은 중앙 집중형으로 누적

사용자가 혼란스러워했던 점:

- 인라인 설명은 늘었는데
- 중앙 학습 기록 화면에서 바로 찾기 어려웠음

따라서 앞으로도 새로운 confusion은:

1. 관련 본문 섹션에 설명 추가
2. `learner/events.ndjson`에 append
3. journal에서 바로 찾을 수 있게 연결

이 세 단계가 항상 같이 가야 한다.

### 원칙 C. mental model이 끊기는 문장은 즉시 보강

특히 다음 형태를 싫어한다.

- “DOM이 관리한다”
- “내부 캐시를 쓴다”
- “Proxy로 구독한다”

이런 표현은 한 줄 정의로 끝내지 말고:

- 무엇이 어디에 저장되는지
- 어떤 계층의 상태인지
- 반례나 흔한 오해는 무엇인지

까지 풀어줘야 한다.

## 6. 새 스레드에 붙여 넣기 좋은 시작 프롬프트

아래 블록은 다른 스레드 시작 메시지로 바로 재사용할 수 있다.

```md
이 프로젝트는 React Hook Form 학습용 sourcebook이다.

먼저 아래 파일을 읽고 현재 맥락을 이어받아라.

필수:

- library/frontend/react-hook-form/research/handoff.md
- library/frontend/react-hook-form/research/source-registry.md
- library/frontend/react-hook-form/research/claim-map.md

학습 본문:

- library/frontend/react-hook-form/references/study-guide.md

막힌 지점 데이터:

- library/frontend/react-hook-form/learner/events.ndjson
- library/frontend/react-hook-form/learner/patterns.json

중요 사용자 성향:

- vague한 설명을 싫어한다.
- 출처는 반드시 정확한 URL로 남겨야 한다.
- mental model이 끊기는 지점을 매우 민감하게 느낀다.
- 새로 막힌 지점은 본문 설명 + learner event + journal 연결이 함께 반영돼야 한다.

이번 스레드에서 할 일:

- [여기에 실제 요청]

응답할 때:

- 주장별 근거를 source-registry / claim-map에 연결해라.
- 이미 프로젝트에 있는 설명과 충돌하는 표현은 그대로 두지 말고 정리해라.
```

## 7. 블로그용으로 특히 가치 있는 축

- RHF는 왜 빠르게 느껴지는가: DOM live value vs RHF JS state
- 브라우저 탭 안에서 React 앱은 실제로 무엇인가: process / renderer / JS heap / DOM
- 학습 프로젝트에서 “막힌 지점 로그”를 별도 시스템으로 만든 이유
- 공식 문서 번역이 아니라 학습 설계가 필요한 이유

자세한 초안 후보는 `blog-seeds.md`에 정리했다.

## 8. 아직 남아 있는 운영 원칙

- 새 설명을 추가할 때는 블로그 재사용성을 고려해 **근거 URL을 함께 남길 것**
- 가능하면 출처는 1차 자료 우선:
  - 공식 문서
  - 공식 소스
  - 브라우저 벤더 문서
  - 원 논문
- Reddit / Stack Overflow / GitHub Discussion은 보조 참고로만 쓸 것
