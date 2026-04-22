# RHF 블로그 시드

이 문서는 지금까지의 대화와 구현을 바탕으로 바로 확장 가능한 블로그 주제 초안이다.

## Seed 1. “RHF는 DOM을 쓴다”는 말이 왜 반쪽 설명인가

### 한 줄 주제

RHF의 성능을 설명할 때 흔히 “DOM을 써서 빠르다”고 말하지만, 실제로는 **DOM live value**, **RHF 내부 JS 상태**, **React 렌더 계층**을 함께 봐야 정확하다.

### 핵심 논지

- `input.value` 같은 즉시값은 DOM이 들고 있다.
- RHF도 `_formValues`, `_fields`, `_formState` 같은 내부 JS 객체를 분명히 가진다.
- 그러나 RHF은 입력창 표시를 React controlled rerender 루프로 돌리지 않는다.
- 그래서 “DOM만 쓴다”도 틀리고 “결국 controlled와 같다”도 틀리다.

### 추천 구성

1. 왜 이 문장이 사람을 헷갈리게 하는가
2. controlled vs uncontrolled를 진짜로 다시 나누기
3. browser process / renderer / JS heap / DOM 구조
4. RHF 내부 소스에서 `_formValues`, `_fields` 보기
5. 실무에서 이 차이가 주는 체감

### 쓰기 좋은 문장

- RHF은 DOM을 **대신하는 저장소**를 만드는 게 아니라, DOM과 **협력하는 폼 엔진**에 가깝다.
- 성능 차이는 “값이 어디에 있느냐”보다 “입력 표시를 누가 주도하느냐”에서 갈린다.

### 근거

- `CLAIM-BROWSER-003`
- `CLAIM-BROWSER-004`
- `CLAIM-RHF-001`
- `CLAIM-RHF-003`
- `CLAIM-RHF-004`

## Seed 2. 브라우저 안에서 React 앱은 도대체 뭐가 돌아가는 걸까

### 한 줄 주제

OS 프로세스, browser process, renderer process, JS heap, DOM 계층을 모르면 React나 RHF 설명이 자꾸 뭉개진다.

### 핵심 논지

- 브라우저 탭의 React 앱은 별도 OS 프로세스가 아니다.
- 서버 사이드 Next와 브라우저 클라이언트 Next/React는 같은 “Next”라도 런타임 위치가 다르다.
- RHF의 내부 메모리는 renderer 안의 JS heap에 있는 JS 객체다.

### 추천 구성

1. 많은 프론트엔드 학습자가 헷갈리는 지점
2. 프로세스 모델부터 다시 세우기
3. renderer 안의 JS heap과 DOM 분리
4. React state, DOM state, RHF state를 세 칸으로 분리해서 설명
5. 이 mental model이 왜 실무 디버깅에 중요한가

### 근거

- `CLAIM-BROWSER-001`
- `CLAIM-BROWSER-002`
- `CLAIM-BROWSER-005`
- `CLAIM-RHF-003`

## Seed 3. 공식 문서를 “읽기만” 하면 안 되는 이유

### 한 줄 주제

공식 문서는 정확하지만, 초심자 관점의 사고 마찰까지 해결해주지 않는다. 그래서 학습 설계가 따로 필요하다.

### 핵심 논지

- 문장 번역이 되어도 mental model이 연결되지 않으면 학습이 안 된다.
- giant API dump는 이해보다 압박을 만든다.
- worked example, self-explanation, retrieval prompt를 붙이면 문서가 학습 도구로 바뀐다.

### 추천 구성

1. 공식 문서의 강점과 한계
2. 왜 A라는 거야 B라는 거야?가 반복되는가
3. retrieval / self-explanation / worked example을 어떻게 녹였는가
4. RHF study guide를 어떻게 재설계했는가
5. 일반 기술 문서에도 적용 가능한 원칙

### 근거

- `CLAIM-LEARN-001`
- `CLAIM-LEARN-002`
- `CLAIM-LEARN-003`
- `CLAIM-LEARN-005`

## Seed 4. “막힌 지점 모아보기”를 만든 이유

### 한 줄 주제

학습은 “맞는 설명”을 읽는 것보다 “내가 어디서 왜 막혔는지”를 다시 찾을 수 있어야 빨라진다.

### 핵심 논지

- 질문은 생기는데 흩어지면 복습 가치가 사라진다.
- 인라인 노트만 있으면 다시 찾기 어렵다.
- 질문, 막힌 이유, 정리, 원래 위치를 한 화면에 모아두면 반복 패턴이 보인다.

### 추천 구성

1. 왜 사람은 같은 지점에서 반복해서 막히는가
2. 질문 로그를 단순 메모와 다르게 설계해야 하는 이유
3. learner event + journal + exact return link 구조
4. 패턴 카드가 개별 질문보다 중요한 순간
5. 다른 학습 프로젝트에도 적용 가능한 구조

### 근거

- `CLAIM-LEARN-004`
- `CLAIM-INT-001`
- `CLAIM-INT-002`

## Seed 5. RHF 학습 프로젝트를 만들면서 생긴 가장 큰 오해 3가지

### 한 줄 주제

실제로 가장 크게 막혔던 오해를 중심으로 RHF와 브라우저 런타임을 다시 설명하는 글.

### 추천 오해 3개

1. `useForm()`이 설정 객체를 반환하는지, 동작 메서드 묶음을 반환하는지
2. `register()`가 side effect만 있는지, props를 반환하는지
3. `DOM이 관리한다`와 `RHF 내부 메모리`가 어떻게 동시에 참인지

### 근거

- `LOC-002`
- `CLAIM-RHF-002`
- `CLAIM-RHF-004`

## 블로그 글 작성 팁

- 가능하면 **오해 문장**으로 시작하는 편이 좋다.
  - 예: “RHF는 React state를 안 쓴다?”
  - 예: “웹앱은 브라우저 안에서 별도 프로세스로 도는 걸까?”
- 각 글의 중간에는 반드시 **구조 그림**을 한 번 넣는 편이 좋다.
- 추상 설명 뒤에는 프로젝트 안의 실제 코드/문서/질문 로그 예시를 붙이는 것이 좋다.

## 바로 쓰기 좋은 후속 제목 후보

- RHF는 왜 빠를까: DOM, JS Heap, `_formValues`까지 같이 봐야 보인다
- 브라우저 안에서 React 앱은 무엇인가: process, renderer, DOM, RHF를 한 번에 정리
- 공식 문서를 학습 도구로 바꾸는 법: RHF 스터디 가이드 개편기
- “막힌 지점 모아보기”를 만든 이유: 학습 로그를 메타인지 시스템으로 바꾸기
