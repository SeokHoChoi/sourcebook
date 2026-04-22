# RHF 프로젝트 주장-출처 매핑

이 문서는 **프로젝트에서 사용한 핵심 주장**을 **정확한 출처**와 **반영 위치**에 연결한다.  
블로그나 새 스레드에서는 이 문서를 기준으로 “무슨 말이 어느 근거에서 왔는지”를 따라가면 된다.

## A. 브라우저 / 프로세스 / 메모리

| Claim ID            | 주장                                                                                                        | Source ID                                               | 프로젝트 반영 위치                                                        | 메모                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------- |
| `CLAIM-BROWSER-001` | Chromium 계열 브라우저는 browser process와 renderer process를 분리한 multi-process architecture를 사용한다. | `SRC-BROWSER-001`                                       | `references/study-guide.md`의 `브라우저 프로세스부터 RHF 내부 저장소까지` | “브라우저 = 프로세스 하나”로 오해하는 지점 교정 |
| `CLAIM-BROWSER-002` | 브라우저 안의 React 앱은 별도 OS 프로세스가 아니라 renderer process 안에서 도는 JS 프로그램이다.            | `SRC-BROWSER-001`, `SRC-BROWSER-003`                    | `references/study-guide.md`의 `React 앱이나 Next 앱은 프로세스인가`       | 사용자의 CS 혼동 핵심                           |
| `CLAIM-BROWSER-003` | DOM은 문서를 메모리 안의 객체 구조로 표현한 브라우저 쪽 계층으로 이해하는 것이 맞다.                        | `SRC-BROWSER-002`                                       | `references/study-guide.md`의 `DOM 메모리와 JS heap은 왜 다른가`          | DOM의 역할 정리                                 |
| `CLAIM-BROWSER-004` | JavaScript heap objects와 DOM/native memory는 브라우저 메모리 분석에서 구분되는 층이다.                     | `SRC-BROWSER-003`, `SRC-BROWSER-004`                    | `references/study-guide.md`의 `DOM 메모리와 JS heap은 왜 다른가`          | JS heap vs DOM 혼동 교정                        |
| `CLAIM-BROWSER-005` | 클라이언트 웹앱 코드는 현재 탭의 renderer process 주소 공간 안의 메모리를 사용한다.                         | `SRC-BROWSER-001`, `SRC-BROWSER-003`, `SRC-BROWSER-004` | `references/study-guide.md`의 `이 웹앱은 어떤 메모리를 쓰는가`            | “브라우저 메모리를 공유받나?” 질문에 대한 답    |

## B. RHF 내부 구조 / 상태 계층

| Claim ID        | 주장                                                                                                                                             | Source ID                    | 프로젝트 반영 위치                                                                 | 메모                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `CLAIM-RHF-001` | RHF의 기본 경로는 입력창 표시를 React state 리렌더 중심으로 두지 않고, native input / DOM과 ref 기반으로 연결한다.                               | `SRC-RHF-003`, `SRC-RHF-004` | `references/study-guide.md`의 `RHF의 해결 방식`, `DOM이 관리한다는 말의 정확한 뜻` | “RHF은 React 상태를 쓰지 않는다”라는 과격한 표현을 정제 |
| `CLAIM-RHF-002` | `register()`는 `ref`, `name`, 이벤트 핸들러를 돌려주고, 이를 통해 RHF이 DOM 요소와 연결된다.                                                     | `SRC-RHF-004`                | `references/study-guide.md`의 `register`, `어떤 방법으로 DOM에 연결되는가`         | querySelector 오해 교정                                 |
| `CLAIM-RHF-003` | RHF 내부에는 `_fields`, `_defaultValues`, `_formValues`, `_formState`, `_names`, `_proxyFormState`, `_subjects` 같은 JS 객체 기반 저장소가 있다. | `SRC-RHF-006`                | `references/study-guide.md`의 `RHF 내부 메모리/캐시는 구체적으로 어디에 있나`      | “RHF 내부 캐시”의 구체적 실체                           |
| `CLAIM-RHF-004` | RHF은 DOM live value와 별도로 JS 측 현재 값 스냅샷도 유지할 수 있으며, 이것이 제어 컴포넌트와 동일하다는 뜻은 아니다.                            | `SRC-RHF-006`, `SRC-RHF-004` | `references/study-guide.md`의 `현재 값은 DOM과 _formValues가 왜 동시에 참인가`     | 사용자가 가장 크게 막힌 핵심                            |
| `CLAIM-RHF-005` | `formState`는 필요한 속성만 구독하는 모델을 사용한다.                                                                                            | `SRC-RHF-005`, `SRC-RHF-006` | `references/study-guide.md`의 Proxy subscription 관련 설명                         | 성능 설명 근거                                          |

## C. 성능 / 접근성 / 실무 UX

| Claim ID        | 주장                                                                    | Source ID                    | 프로젝트 반영 위치                                 | 메모                                   |
| --------------- | ----------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------- | -------------------------------------- |
| `CLAIM-WEB-001` | 입력 반응성을 해치는 unnecessary work를 줄이는 것은 웹 UX에서 중요하다. | `SRC-WEB-001`, `SRC-WEB-002` | `references/study-guide.md`의 Jank / INP 관련 설명 | RHF 성능 설명의 실무 맥락              |
| `CLAIM-WEB-002` | 폼 문서와 예제는 접근성 기준과 함께 설계돼야 한다.                      | `SRC-WEB-003`, `SRC-WEB-004` | `references/study-guide.md`의 A11y 섹션            | label, error, assistive tech 흐름 근거 |

## D. 학습 설계 / 인지과학

| Claim ID          | 주장                                                                                 | Source ID                                         | 프로젝트 반영 위치                                      | 메모                                          |
| ----------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------- |
| `CLAIM-LEARN-001` | 단순 재읽기보다 retrieval practice가 학습 정착에 유리하다.                           | `SRC-LEARN-001`, `SRC-LEARN-002`                  | `references/study-guide.md`의 회상 질문 구조            | 각 섹션 말미 recall question 설계 근거        |
| `CLAIM-LEARN-002` | self-explanation prompt는 개념 연결과 오개념 수정에 유리하다.                        | `SRC-LEARN-001`, `SRC-LEARN-003`, `SRC-LEARN-005` | `references/study-guide.md`의 자기 설명 질문 구조       | “왜 막혔나”를 같이 적는 이유                  |
| `CLAIM-LEARN-003` | worked example + scaffolding은 프로그래밍 학습에서 특히 효과적이다.                  | `SRC-LEARN-007`, `SRC-LEARN-009`                  | 스터디 가이드의 최소 예제 → 실무 패턴 구조              | giant API dump를 분해한 이유                  |
| `CLAIM-LEARN-004` | metacognitive prompt는 자신의 막힘을 인식하고 복습 패턴을 추적하는 데 도움이 된다.   | `SRC-LEARN-006`, `SRC-LEARN-008`                  | `learner/events.ndjson`, `journal/page.tsx`의 기록 구조 | 질문/이유/정리 분리 설계 근거                 |
| `CLAIM-LEARN-005` | chunking은 불안감을 줄이는 데 도움이 될 수 있지만, 지나친 분절은 맥락 손실을 만든다. | `SRC-LEARN-010`, `SRC-LEARN-011`                  | 직독직해 UI 개편 판단                                   | 전체 문장 먼저, 필요 시 청크 열기 전략의 근거 |

## E. 프로젝트 자체에서 나온 관찰

이 아래는 외부 출처가 아니라, 프로젝트 진행 중 축적된 내부 관찰이다.

| Claim ID        | 주장                                                                                | 근거                               | 프로젝트 반영 위치                | 메모                         |
| --------------- | ----------------------------------------------------------------------------------- | ---------------------------------- | --------------------------------- | ---------------------------- |
| `CLAIM-INT-001` | 사용자는 “막힌 지점”이 문서 곳곳에 흩어져 있으면 다시 찾기 어려워한다.              | `LOC-002`, `LOC-005`               | journal 화면 설계                 | 중앙 집중형 학습 기록 필요성 |
| `CLAIM-INT-002` | 인라인 설명만 추가하면 충분하지 않고, 중앙 기록 화면에서도 같은 질문을 찾아야 한다. | `LOC-002`, `LOC-004`, `LOC-005`    | inline notice + journal 양쪽 구현 | 분산 기록 문제 해결          |
| `CLAIM-INT-003` | “출처를 URL 없이 서술만 남기는 방식”은 블로그 재사용에 부적합하다.                  | 사용자 피드백 + 이 research bundle | `research/source-registry.md`     | 이번 번들 생성의 직접 이유   |

## 블로그 작성 시 사용 예시

### 예시 1

문장:

> RHF의 빠름은 “DOM을 쓴다”는 한 문장으로 끝나지 않는다. 실제로는 DOM live value와 JS heap 위의 내부 상태 계층이 분리돼 있기 때문이다.

사용할 출처:

- `CLAIM-BROWSER-003`
- `CLAIM-BROWSER-004`
- `CLAIM-RHF-003`
- `CLAIM-RHF-004`

### 예시 2

문장:

> 학습 도구에서 막힌 질문을 별도 데이터로 남기는 이유는 단순 메모보다 메타인지 복습 구조를 만들기 위해서다.

사용할 출처:

- `CLAIM-LEARN-002`
- `CLAIM-LEARN-004`
- `CLAIM-INT-001`
- `CLAIM-INT-002`
