# RHF 프로젝트 출처 레지스트리

이 문서는 **프로젝트에서 실제로 사용한 외부 출처를 정확한 URL 단위로 추적**하기 위한 레지스트리다.

## 사용 규칙

- 블로그나 문서에 어떤 주장을 쓸 때는, 최소 하나 이상의 `Source ID`를 같이 기록한다.
- “어디서 본 것 같다” 수준의 2차 기억은 출처로 인정하지 않는다.
- 가능하면 1차 자료를 우선한다.

## A. 브라우저 / 런타임 / 메모리

| Source ID         | 제목                                | 종류               | 정확한 URL                                                                                          | 확인 날짜  | 사용 용도                                            |
| ----------------- | ----------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------- |
| `SRC-BROWSER-001` | Chromium Multi-process Architecture | 공식 브라우저 문서 | https://www.chromium.org/developers/design-documents/multi-process-architecture/                    | 2026-04-20 | browser process / renderer process 설명              |
| `SRC-BROWSER-002` | MDN - Introduction to the DOM       | 공식 웹 표준 문서  | https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction                 | 2026-04-20 | DOM이 문서를 메모리 안의 객체 구조로 표현한다는 설명 |
| `SRC-BROWSER-003` | MDN - JavaScript Memory Management  | 공식 웹 표준 문서  | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management                           | 2026-04-20 | JS heap, GC, JS 메모리 계층 설명                     |
| `SRC-BROWSER-004` | Edge DevTools - Memory 101          | 브라우저 벤더 문서 | https://learn.microsoft.com/en-us/microsoft-edge/devtools-guide-chromium/memory-problems/memory-101 | 2026-04-20 | JS heap objects vs DOM/native memory 구분 설명       |
| `SRC-BROWSER-005` | V8 - Fast Properties                | JS 엔진 공식 문서  | https://v8.dev/blog/fast-properties                                                                 | 2026-04-20 | JS 객체가 엔진 메모리 위에서 관리된다는 이해 보조    |

## B. React Hook Form 공식 자료 / 소스

| Source ID     | 제목                              | 종류             | 정확한 URL                                                                                    | 확인 날짜  | 사용 용도                                                                                                    |
| ------------- | --------------------------------- | ---------------- | --------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------ |
| `SRC-RHF-001` | RHF 공식 홈페이지                 | 공식 문서        | https://react-hook-form.com/                                                                  | 2026-04-20 | 트랙 기준 문서                                                                                               |
| `SRC-RHF-002` | RHF Get Started                   | 공식 문서        | https://react-hook-form.com/get-started                                                       | 2026-04-20 | 온보딩 섹션 구성, Get Started 기반 리더 작업                                                                 |
| `SRC-RHF-003` | RHF `useForm` docs                | 공식 문서        | https://react-hook-form.com/docs/useform                                                      | 2026-04-20 | `useForm` 개념 설명, 반환 API 기준                                                                           |
| `SRC-RHF-004` | RHF `register` docs               | 공식 문서        | https://react-hook-form.com/docs/useform/register                                             | 2026-04-20 | `register()` 반환값, ref 연결, validation rule 기준                                                          |
| `SRC-RHF-005` | RHF `formState` docs              | 공식 문서        | https://react-hook-form.com/docs/useform/formstate                                            | 2026-04-20 | `formState`, Proxy subscription 설명                                                                         |
| `SRC-RHF-006` | RHF source `createFormControl.ts` | 공식 소스        | https://github.com/react-hook-form/react-hook-form/blob/master/src/logic/createFormControl.ts | 2026-04-20 | `_fields`, `_formValues`, `_defaultValues`, `_formState`, `_subjects`, `_proxyFormState` 등 내부 저장소 설명 |
| `SRC-RHF-007` | RHF GitHub Releases               | 공식 릴리즈      | https://github.com/react-hook-form/react-hook-form/releases                                   | 2026-04-20 | 버전 차이, v8 beta 변화 검토                                                                                 |
| `SRC-RHF-008` | RHF documentation repo            | 공식 문서 저장소 | https://github.com/react-hook-form/documentation                                              | 2026-04-20 | source repo path 추적                                                                                        |

## C. 성능 / 접근성 / 웹 UX

| Source ID     | 제목                                | 종류               | 정확한 URL                                | 확인 날짜  | 사용 용도                                |
| ------------- | ----------------------------------- | ------------------ | ----------------------------------------- | ---------- | ---------------------------------------- |
| `SRC-WEB-001` | web.dev - INP                       | 공식 웹 성능 문서  | https://web.dev/articles/inp              | 2026-04-20 | 입력 반응성과 성능 설명                  |
| `SRC-WEB-002` | web.dev - Optimize INP              | 공식 웹 성능 문서  | https://web.dev/articles/optimize-inp     | 2026-04-20 | unnecessary work / render 비용 논의      |
| `SRC-WEB-003` | web.dev - Learn Forms Accessibility | 공식 접근성 문서   | https://web.dev/learn/forms/accessibility | 2026-04-20 | 폼 접근성 설명                           |
| `SRC-WEB-004` | web.dev - Learn Accessibility Forms | 공식 접근성 문서   | https://web.dev/learn/accessibility/forms | 2026-04-20 | label / error / assistive tech 흐름 보강 |
| `SRC-WEB-005` | Vercel Web Interface Guidelines     | 디자인 시스템 문서 | https://vercel.com/design/guidelines      | 2026-04-20 | UI 가독성, 계층 구조 판단 참고           |

## D. 학습 과학 / 교육학 / 인지과학

| Source ID       | 제목                                                                                   | 종류      | 정확한 URL                                                                                                       | 확인 날짜  | 사용 용도                                                              |
| --------------- | -------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| `SRC-LEARN-001` | Dunlosky et al. - Effective learning techniques                                        | 논문/리뷰 | https://www.psychologicalscience.org/publications/journals/pspi/learning-techniques.html                         | 2026-04-20 | retrieval practice, self-explanation, worked examples 기반 설계 정당화 |
| `SRC-LEARN-002` | Karpicke & Blunt - Retrieval Practice Produces More Learning than Elaborative Studying | 논문      | https://europepmc.org/article/med/21252317                                                                       | 2026-04-20 | 회상 질문 설계 근거                                                    |
| `SRC-LEARN-003` | Chi et al. - Self-Explanations                                                         | 논문      | https://experts.azregents.edu/en/publications/self-explanations-how-students-study-and-use-examples-in-learning/ | 2026-04-20 | 자기 설명 질문 설계 근거                                               |
| `SRC-LEARN-004` | Ainsworth & Loizou - Self-explaining with text/diagrams                                | 논문      | https://www.sciencedirect.com/science/article/pii/S0364021303000338                                              | 2026-04-20 | 텍스트 + 구조화된 설명 보강 근거                                       |
| `SRC-LEARN-005` | Joseph et al. - Self-questioning review                                                | 논문/리뷰 | https://www.tandfonline.com/doi/full/10.1080/10573569.2014.891449                                                | 2026-04-20 | 질문 생성과 메타인지 지원 근거                                         |
| `SRC-LEARN-006` | Teng & Reynolds - Metacognitive prompts                                                | 논문      | https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0215902                                      | 2026-04-20 | “왜 막혔나” 프롬프트 설계 근거                                         |
| `SRC-LEARN-007` | Shin et al. - Worked examples + metacognitive scaffolding in programming               | 논문      | https://journals.sagepub.com/doi/10.1177/07356331231174454                                                       | 2026-04-20 | 프로그래밍 학습에서 worked example / scaffolding 적용 근거             |
| `SRC-LEARN-008` | Loksa - Metacognition and self-regulation in programming                               | 학위논문  | https://digital.lib.washington.edu/researchworks/items/2c8e1804-c9fe-4dda-834d-23a1b07f2789                      | 2026-04-20 | 프로그래밍 학습 메타인지 프레임                                        |
| `SRC-LEARN-009` | MIT Open Learning - Worked and faded examples                                          | 교육 자료 | https://openlearning.mit.edu/mit-faculty/research-based-learning-findings/worked-and-faded-examples              | 2026-04-20 | 점진적 학습 설계 참고                                                  |
| `SRC-LEARN-010` | Cambridge ELT - Chunk spotting                                                         | 교육 자료 | https://www.cambridge.org/elt/blog/2019/11/01/chunk-spotting-users-guide/                                        | 2026-04-20 | 청크 기반 읽기 보조 논의                                               |
| `SRC-LEARN-011` | Cambridge ELT - Teaching in chunks                                                     | 교육 자료 | https://www.cambridge.org/elt/blog/2018/09/05/how-teaching-a-language-in-chunks-helps-learners/                  | 2026-04-20 | chunk UI의 장단점 설명 보조                                            |

## E. 보조 참고 자료

아래는 1차 자료는 아니지만, 실제 혼동 지점과 실전 사례를 확인할 때 보조적으로 참고한 축이다.

| Source ID      | 제목                                                       | 종류     | 정확한 URL                                                                                           | 확인 날짜  | 사용 용도                                 |
| -------------- | ---------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------- |
| `SRC-COMM-001` | Stack Overflow - defaultValues vs values                   | 커뮤니티 | https://stackoverflow.com/questions/76647141/react-hook-form-defaultvalues-v-s-values                | 2026-04-20 | `defaultValues` / `values` 혼동 사례 확인 |
| `SRC-COMM-002` | GitHub Discussion - values and field array ids             | 커뮤니티 | https://github.com/orgs/react-hook-form/discussions/11141                                            | 2026-04-20 | field array / values 상호작용 사례 확인   |
| `SRC-COMM-003` | GitHub Discussion - focus loss / resets around field array | 커뮤니티 | https://github.com/orgs/react-hook-form/discussions/11770                                            | 2026-04-20 | reset / focus loss 사례 확인              |
| `SRC-COMM-004` | Reddit - large form re-renders / subscriptions             | 커뮤니티 | https://www.reddit.com/r/reactjs/comments/1rbmfq4/i_hit_a_wall_with_react_hook_forms_rerenders_so_i/ | 2026-04-20 | 큰 폼에서 re-render 체감 사례 확인        |

## F. 프로젝트 내부 산출물

이 프로젝트 자체가 만든 로컬 산출물도 블로그 근거 문맥으로 중요하다.

| Local ID  | 파일                                                                             | 용도                 |
| --------- | -------------------------------------------------------------------------------- | -------------------- |
| `LOC-001` | `library/frontend/react-hook-form/references/study-guide.md`                     | 학습 본문 최종 설명  |
| `LOC-002` | `library/frontend/react-hook-form/learner/events.ndjson`                         | 실제 막힌 지점 로그  |
| `LOC-003` | `library/frontend/react-hook-form/learner/patterns.json`                         | 반복 혼동 패턴       |
| `LOC-004` | `src/app/categories/[categorySlug]/tracks/[trackSlug]/study/page.tsx`            | 스터디 가이드 렌더링 |
| `LOC-005` | `src/app/categories/[categorySlug]/tracks/[trackSlug]/journal/page.tsx`          | 학습 기록 화면       |
| `LOC-006` | `src/app/categories/[categorySlug]/tracks/[trackSlug]/pages/[pageSlug]/page.tsx` | 공식 문서 리더       |

## 사용 예시

블로그에서 아래 문장을 쓴다면:

> Chromium 계열 브라우저는 browser process와 renderer process를 분리하는 multi-process architecture를 사용한다.

최소 인용은 다음처럼 잡는다.

- `SRC-BROWSER-001`

아래 문장을 쓴다면:

> RHF은 DOM live value를 렌더 source of truth로 두면서도, 내부적으로 `_formValues`, `_fields`, `_formState` 같은 JS 객체를 유지한다.

최소 인용은 다음처럼 잡는다.

- `SRC-RHF-006`
- 필요 시 `SRC-RHF-004`, `SRC-RHF-005`
