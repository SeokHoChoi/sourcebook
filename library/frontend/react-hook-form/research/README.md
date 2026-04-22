# RHF 리서치 번들

이 폴더는 **다른 스레드 핸드오프**, **블로그 초안 작성**, **주장별 출처 추적**을 위해 만든 별도 번들이다.

공식 학습 문서와 역할이 다르다.

- `references/study-guide.md`: 학습용 본문
- `learner/events.ndjson`: 막힌 지점 로그
- `research/`: 대화에서 나온 판단, 출처, 블로그 시드, 새 스레드 핸드오프

## 파일 구성

- `handoff.md`
  - 새 스레드에 넘길 핵심 맥락 요약
  - 지금까지의 대화 흐름, 사용자 선호, 구현 상태, 다음 작업
- `source-registry.md`
  - 외부 출처의 정확한 URL과 사용 목적
  - 블로그나 후속 검토 때 “어디서 확인했는지”를 바로 찾기 위한 레지스트리
- `claim-map.md`
  - 각 주장과 출처를 1:1 또는 1:N으로 연결한 매핑표
  - 프로젝트 내 어느 문서/기능에 반영됐는지도 함께 정리
- `blog-seeds.md`
  - 지금까지의 대화에서 바로 뽑을 수 있는 블로그 주제와 개요

## 다른 스레드로 넘길 때 권장 순서

1. `handoff.md`를 먼저 읽힌다.
2. 새 스레드 시작 메시지에 `handoff.md` 핵심 블록을 붙여 넣는다.
3. 사실 확인이 필요한 주장은 `claim-map.md`와 `source-registry.md`를 같이 넘긴다.
4. 블로그로 전환할 때는 `blog-seeds.md`에서 주제를 고른다.

## 최소 공유 세트

새 스레드에 가장 먼저 공유할 파일:

- `library/frontend/react-hook-form/research/handoff.md`
- `library/frontend/react-hook-form/research/source-registry.md`
- `library/frontend/react-hook-form/research/claim-map.md`

## 왜 이렇게 나눴는가

대화 원문 전체를 그대로 넘기면 길고, 검색도 어렵고, 출처 추적도 안 된다.  
반대로 요약만 넘기면 블로그나 후속 검토 때 “이 말의 근거가 뭐였지?”가 다시 생긴다.

그래서 이 번들은 아래 네 가지를 분리한다.

- **맥락**: `handoff.md`
- **출처**: `source-registry.md`
- **주장-근거 연결**: `claim-map.md`
- **재활용 아이디어**: `blog-seeds.md`
