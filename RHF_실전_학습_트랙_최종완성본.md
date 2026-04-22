# React Hook Form 실전 학습 트랙

## 개념 → 패턴 → 아키텍처 → 고급 부록

---

> **이 문서의 목표**
> "읽었다"에서 멈추지 않고, "설명할 수 있다 → 판단할 수 있다 → 실전에 적용할 수 있다"까지 이어지는 학습을 설계한다.

---

> **이 문서는 이렇게 읽는다**
>
> 1. PART 1은 처음부터 끝까지 읽는다.
> 2. PART 2는 지금 만들고 있는 폼 문제와 맞는 장만 골라 읽어도 된다.
> 3. PART 3은 조합과 아키텍처 판단용이다.
> 4. PART 4와 PART 5는 필요할 때 찾아보는 참고/근거 부록이다.
>
> 각 핵심 장은 같은 템플릿으로 구성했다.
>
> - 이 섹션의 목적
> - 먼저 결론
> - 예제
> - 이 코드에서 봐야 할 포인트
> - 왜 필요한가
> - 비교/판단 기준
> - 흔한 실수
> - 자기 설명 질문
> - 회상 질문
> - 다음 섹션과 연결

---

<details>
<summary>📦 버전 스냅샷 (클릭해서 열기)</summary>

| 패키지               | 버전            | 확인 날짜  | 출처   |
| -------------------- | --------------- | ---------- | ------ |
| react-hook-form      | 7.72.1 (stable) | 2026-04-20 | npm    |
| react-hook-form v8   | 8.0.0-beta      | 2026-04-20 | GitHub |
| @hookform/resolvers  | 5.1.0+          | 2026-04-20 | GitHub |
| Formik               | 2.4.9           | 2026-04-20 | npm    |
| @tanstack/react-form | 1.29.0          | 2026-04-20 | npm    |

이 문서는 **npm latest dist-tag 기준 stable 7.72.1**을 기준으로 작성됐다.
참고로 GitHub Releases 페이지에는 `v7.73.0` release entry가 보이지만, 작성 시점에 npm registry의 `latest`와 version endpoint 기준으로는 `7.72.1`만 안정 배포본으로 확인됐다.
즉 이 문서의 stable 표기는 **npm 배포 기준**이다. v8 breaking change는 해당 섹션에서 별도 표기한다.

</details>

---

## 이 문서의 근거 사용 원칙

- 시간에 민감한 정보(버전, beta breaking change, deprecation)는 RHF 공식 문서, GitHub Releases, npm registry를 우선한다.
- 실무에서 자주 헷갈리는 지점은 GitHub Discussions, Issues, Stack Overflow, Reddit를 보조 근거로 사용한다.
- 성능/접근성은 web.dev와 Vercel 가이드를 참고한다.
- 학습 설계는 retrieval practice, self-explanation, worked example, faded guidance, self-questioning 관련 연구를 반영한다.
- 커뮤니티 자료는 "많이 헷갈리는 지점"을 보여주는 용도로만 사용하고, 최종 행동 지침은 공식 문서와 실험 가능한 패턴을 우선한다.

---

## 📋 목차

**PART 1. 빠른 진입** — 처음 읽는 사람이 30분 안에 폼을 만들 수 있도록

- [1-1. RHF가 해결하는 문제](#1-1-rhf가-해결하는-문제)
- [1-2. 최소 실행 예제](#1-2-최소-실행-예제)
- [1-3. 핵심 Mental Model — 비제어 컴포넌트와 DOM](#1-3-핵심-mental-model)
- [1-4. 핵심 3가지: register / handleSubmit / errors](#1-4-핵심-3가지)
- [1-5. PART 1 체크포인트](#1-5-체크포인트)

**PART 2. 핵심 패턴** — 실전에서 가장 자주 마주치는 결정들

- [2-1. 검증 방식 선택 — 내장 vs Resolver vs form-level validate](#2-1-검증-방식-선택)
- [2-2. defaultValues / values / reset / setValue — 폼 상태의 기준점](#2-2-defaultvalues-values-reset-setvalue)
- [2-3. watch / useWatch / getValues / subscribe — 값 읽기와 구독](#2-3-watch-usewatch-getvalues-subscribe)
- [2-4. register vs Controller vs useController — 언제 무엇을 쓰는가](#2-4-register-vs-controller-vs-usecontroller)
- [2-5. useFieldArray — 기본편](#2-5-usefieldarray-기본편)
- [2-6. useFieldArray — 실전편](#2-6-usefieldarray-실전편)
- [2-7. 수정 폼 시나리오 — 서버 데이터와 폼 동기화](#2-7-수정-폼-시나리오)
- [2-8. 서버 에러 처리](#2-8-서버-에러-처리)
- [2-9. 비동기 검증과 UX](#2-9-비동기-검증)
- [2-10. 웹 접근성 A11y](#2-10-웹-접근성)

**PART 3. 실전 아키텍처** — 조합과 확장

- [3-1. RHF + Zod — 스키마 중심 아키텍처](#3-1-rhf--zod)
- [3-2. RHF + TanStack Query — 서버 상태와 폼의 통합](#3-2-rhf--tanstack-query)
- [3-3. RHF + UI 라이브러리](#3-3-rhf--ui-라이브러리)
- [3-4. Multi-step 폼](#3-4-multi-step-폼)
- [3-5. PATCH 전략 — dirtyFields](#3-5-patch-전략)
- [3-6. 성능 최적화](#3-6-성능-최적화)

**PART 4. 고급 부록** — 필요할 때 찾아보는 자료

- [4-1. subscribe](#4-1-subscribe)
- [4-2. getFieldState](#4-2-getfieldstate)
- [4-3. createFormControl](#4-3-createformcontrol)
- [4-4. useLens](#4-4-uselens)
- [4-5. `<Form />` / `<FormStateSubscribe />`](#4-5-form--formstatesubscribe)
- [4-6. ErrorMessage 컴포넌트](#4-6-errormessage)
- [4-7. 검증 라이브러리 비교 — Zod / Yup / Valibot / Standard Schema](#4-7-검증-라이브러리-비교)
- [4-8. RHF vs Formik vs TanStack Form](#4-8-라이브러리-비교)
- [4-9. v8 beta 변경 예고](#4-9-v8-beta-변경-예고)
- [4-10. 용어 사전](#4-10-용어-사전)

**PART 5. 근거 부록** — 이 문서가 무엇을 근거로 어떤 판단을 했는지

- [5-1. 핵심 주장과 출처 매핑](#5-1-핵심-주장과-출처-매핑)
- [5-2. 실무 혼동 지점 지도](#5-2-실무-혼동-지점-지도)
- [5-3. 학습 설계 원칙과 연구 근거](#5-3-학습-설계-원칙과-연구-근거)
- [5-4. 검토한 자료 묶음](#5-4-검토한-자료-묶음)

---

---

# PART 1. 빠른 진입

> **이 파트의 목표**: 처음 읽는 사람이 30분 안에 RHF의 mental model을 잡고, 간단한 폼을 직접 만들 수 있게 한다.

---

## 1-1. RHF가 해결하는 문제

### 먼저 결론

> React에서 폼을 만들 때 가장 흔한 실수는 **입력 필드 하나하나를 React 상태로 관리하는 것**이다. RHF은 이 문제를 구조적으로 해결한다.

### 왜 문제인가

`useState`로 폼을 관리하는 코드를 먼저 보자.

```tsx
// [개념 설명용 의사코드] — 이렇게 하면 안 되는 패턴
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
// ... 필드가 10개, 50개, 100개가 되면?

<input value={name} onChange={(e) => setName(e.target.value)} />;
```

**문제 1 — 리렌더 폭발**: `name`을 하나 타이핑하면 세 상태를 가진 컴포넌트 전체가 다시 렌더된다. 필드가 100개인 신청서라면, 타이핑 한 번에 100개 필드가 모두 리렌더된다. 브라우저는 프레임당 16ms 안에 모든 연산을 마쳐야 한다. 이 예산을 초과하면 타이핑이 버벅인다. 이것이 **Jank**다.

**문제 2 — 검증 로직 분산**: 이메일 형식 검사, 비밀번호 길이 검사, 크로스 필드 검사(비밀번호 확인) 같은 로직이 `useEffect`와 `if문`으로 컴포넌트 전체에 흩어진다.

**문제 3 — 에러 상태 관리**: 에러 메시지를 보여주고 숨기는 로직을 별도 상태로 관리해야 한다.

### RHF의 해결 방식

RHF은 **React 상태를 쓰지 않는다**. 대신 브라우저 DOM이 직접 값을 기억하게 한다.

```
타이핑 → DOM이 값 기억 → React 상태 변경 없음 → 리렌더 없음
제출 시 → ref로 DOM 값 읽기 → 한 번만 처리
```

이것이 **비제어 컴포넌트(uncontrolled component)** 방식이다. RHF은 이 방식을 기본으로 하면서, 검증/에러/상태 관리를 함께 제공한다.

> **자기 설명 질문**: 타이핑할 때 React 상태를 바꾸지 않으면, 에러 메시지는 어떻게 화면에 나타날까? (힌트: 검증이 실패하는 순간에만 에러 상태가 바뀐다)

---

## 1-2. 최소 실행 예제

```tsx
// [최소 실행 예제] — 이것만 이해하면 PART 1의 절반은 끝
import { useForm } from 'react-hook-form';

type LoginForm = {
  email: string;
  password: string;
};

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = (data: LoginForm) => {
    // data = { email: '...', password: '...' }
    // 검증을 통과한 후에만 이 함수가 호출된다
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('email', {
          required: '이메일을 입력하세요',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: '올바른 이메일 형식이 아닙니다',
          },
        })}
        placeholder="이메일"
      />
      {errors.email && <p>{errors.email.message}</p>}

      <input
        {...register('password', { required: '비밀번호를 입력하세요' })}
        type="password"
        placeholder="비밀번호"
      />
      {errors.password && <p>{errors.password.message}</p>}

      <button type="submit">로그인</button>
    </form>
  );
}
```

### 이 코드에서 봐야 할 포인트

**1. `register('email', { ... })`**
`register`는 `{ name, ref, onChange, onBlur }`를 반환하고 `...` 스프레드로 `<input>`에 한 번에 전달된다. RHF은 이 `ref`를 통해 DOM 노드를 직접 참조한다.

**2. `handleSubmit(onSubmit)`**
`handleSubmit`은 제출 전에 모든 검증을 실행한다. 검증이 통과해야만 `onSubmit`이 호출된다. 검증 실패 시 `errors`가 업데이트되고 리렌더된다.

**3. `formState: { errors }`**
`errors`를 구조 분해하는 순간 RHF의 내부 Proxy가 "이 컴포넌트는 errors가 바뀔 때 알려달라"고 구독을 등록한다. 타이핑 중에는 에러가 없으므로 리렌더가 없고, 검증 실패 시에만 리렌더된다.

---

## 1-3. 핵심 Mental Model

### 비제어 컴포넌트란 무엇인가

HTML 폼은 원래 React 없이도 동작했다. `<input>`은 브라우저가 자체적으로 값을 기억한다. `document.querySelector('input').value`로 읽을 수 있다. React가 그 값을 `useState`로 "가로채서" 관리하는 것이 제어 컴포넌트다.

RHF은 이 가로채기를 하지 않는다. `ref`를 통해 DOM에 직접 접근하고, 필요할 때만 값을 읽는다.

```
제어 컴포넌트 (Formik, 일반 useState):
  타이핑 → onChange → setState → 리렌더 → input 값 갱신 → ...
  [React가 모든 입력을 추적]

비제어 컴포넌트 (RHF 기본):
  타이핑 → DOM이 값 기억 → React는 모름
  제출 시 → ref.current.value → 한 번에 읽기
  [React는 검증 결과만 추적]
```

### RHF의 두 가지 렌더 시점

타이핑할 때는 리렌더가 없다. 그러나 다음 두 경우에는 리렌더가 발생한다.

1. **검증 결과가 바뀔 때** — 에러가 추가되거나 사라질 때
2. **구독한 formState 속성이 바뀔 때** — `isSubmitting`, `isDirty` 등

이 두 경우만 React가 개입한다. 나머지는 모두 DOM이 처리한다.

> **자기 설명 질문**: `formState: { errors, isSubmitting }` 두 가지를 구조 분해했을 때, 어떤 경우에 이 컴포넌트가 리렌더될까?

---

## 1-4. 핵심 3가지: register / handleSubmit / errors

### register

`register(name, rules)`는 세 가지를 한다.

- **필드를 등록**: RHF 내부 레지스트리에 이 필드의 존재를 알린다
- **DOM ref 연결**: 반환된 ref를 input에 연결해 DOM 노드를 직접 참조한다
- **검증 규칙 저장**: rules 객체를 내부에 저장해 검증 시 사용한다

```tsx
// [개념 설명용 의사코드] — register가 반환하는 것
const { name, ref, onChange, onBlur } = register('email', {
  required: '필수',
});
// name: "email"
// ref: (el) => { /* DOM 노드를 내부에 등록 */ }
// onChange: (e) => { /* RHF 내부 상태 갱신, mode에 따라 검증 트리거 */ }
// onBlur: (e) => { /* touched 상태, onBlur 모드 검증 */ }
```

**내장 검증 규칙 목록**:

| 규칙                      | 예시                                                                      |
| ------------------------- | ------------------------------------------------------------------------- |
| `required`                | `required: '필수 항목'`                                                   |
| `min` / `max`             | `min: { value: 0, message: '0 이상' }`                                    |
| `minLength` / `maxLength` | `minLength: { value: 3, message: '최소 3자' }`                            |
| `pattern`                 | `pattern: { value: /^[A-Z]/i, message: '패턴 불일치' }`                   |
| `validate`                | `validate: (v) => v !== 'admin' \|\| '사용 불가'` (동기/비동기 모두 가능) |

**중요 제약사항**:

- `resolver`를 쓰면 내장 검증 규칙(`required`, `min` 등)은 **무시된다**. 둘은 동시에 사용할 수 없다.
- bracket syntax는 지원하지 않는다: `register("test[0].name")` ❌ → `register("test.0.name")` ✅

### handleSubmit

```tsx
// [개념 설명용 의사코드]
<form onSubmit={handleSubmit(onValid, onInvalid)}>
// onValid: 검증 통과 시 호출 — (data) => void
// onInvalid: 검증 실패 시 호출 (선택) — (errors) => void
```

`handleSubmit`이 하는 일:

1. 폼 제출 이벤트의 기본 동작 방지 (`preventDefault`)
2. 등록된 모든 필드에 대해 검증 실행
3. 통과하면 `onValid(data)` 호출 — `data`는 모든 필드의 현재 값
4. 실패하면 `errors` 상태 업데이트 + 첫 번째 에러 필드로 포커스 이동

### formState: errors

`errors` 객체의 구조:

```tsx
// [개념 설명용 의사코드]
errors = {
  email: {
    type: 'required', // 실패한 규칙 이름
    message: '이메일을 입력하세요', // 에러 메시지
    ref: inputElement, // 해당 DOM 요소
  },
  // 중첩 필드: errors.address?.city?.message
};
```

에러가 없으면 해당 키 자체가 없다. `errors.email`은 `undefined`이므로 `errors.email && <p>...</p>` 패턴이 안전하다.

---

## 1-5. 체크포인트

PART 1을 다 읽었다면 아래 질문에 답할 수 있어야 한다.

**회상 질문 1**: 타이핑할 때 RHF이 리렌더를 발생시키지 않는 이유는 무엇인가? (React 상태 vs DOM)

**회상 질문 2**: `register('email', { required: '필수' })`를 input에 스프레드하면 어떤 props가 전달되는가? 그 중 가장 중요한 역할을 하는 것은 무엇인가?

**이 파트를 마치고 만들 수 있어야 하는 것**: `register`, `handleSubmit`, `errors`만으로 동작하는 로그인 폼

---

---

# PART 2. 핵심 패턴

> **이 파트의 목표**: 실전에서 가장 자주 마주치는 결정들을 올바른 기준으로 내릴 수 있게 한다.

---

## 2-1. 검증 방식 선택

### 이 섹션의 목적

RHF은 검증 방식이 세 가지다. 언제 어떤 방식을 써야 하는지 판단 기준을 정리한다.

### 먼저 결론

| 방식                    | 언제                                                   | 한 줄 기준               |
| ----------------------- | ------------------------------------------------------ | ------------------------ |
| **내장 검증**           | 폼이 단순하고 의존성을 최소화할 때                     | 필드 5개 이하, 규칙 단순 |
| **Zod resolver**        | TypeScript 프로젝트, 복잡한 스키마, 서버와 스키마 공유 | 기본 선택지              |
| **form-level validate** | resolver 없이 크로스 필드 검증이 필요할 때 (v7.72.0+)  | 가장 최근에 추가된 방식  |

### 세 가지 방식 상세

**방식 1: register 내장 검증**

```tsx
// [최소 실행 예제]
<input
  {...register('email', {
    required: '이메일을 입력하세요',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: '올바른 이메일 형식이 아닙니다',
    },
  })}
/>
```

장점: 외부 패키지 불필요. 코드가 단순하다.
단점: 검증 로직이 JSX에 섞인다. 크로스 필드 검증이 불편하다. TypeScript 타입 안전성이 제한적이다.

**방식 2: Zod resolver**

```tsx
// [실무 패턴 예제]
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z
  .object({
    // Zod v4 권장 스타일 — z.email() 같은 최상위 API
    // (z.string().email() 방식은 v4에서 deprecated)
    email: z.email('올바른 이메일 형식이 아닙니다'),
    password: z.string().min(8, '8자 이상 입력하세요'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>; // 스키마에서 타입 자동 생성

const { register, handleSubmit } = useForm<FormData>({
  resolver: zodResolver(schema),
  // ⚠️ resolver를 쓰면 register의 내장 검증 규칙은 무시된다
});
```

장점: 타입과 검증 규칙이 한 곳에서 관리된다. 서버 코드(Next.js Server Actions, tRPC)와 스키마를 공유할 수 있다. 크로스 필드 검증이 자연스럽다.

**방식 3: form-level validate (v7.72.0+)**

```tsx
// [실무 패턴 예제] — resolver 없이 폼 전체 검증
const { register } = useForm({
  validate: async ({ formValues }) => {
    if (formValues.endDate < formValues.startDate) {
      return { type: 'dateError', message: '종료일은 시작일 이후여야 합니다' };
    }
    return true; // 통과
  },
  // 에러는 formState.errors.root에서 읽는다
});

{
  errors.root && <p role="alert">{errors.root.message}</p>;
}
```

장점: 폼 전체를 바라보는 검증을 resolver 없이 추가할 수 있다.
단점: 필드 단위 검증과 결합하면 어디서 검증을 하는지 흐름이 복잡해질 수 있다.

### 흔한 실수

`resolver`와 내장 검증(`required`, `min` 등)을 동시에 쓰는 것. resolver가 있으면 register의 검증 규칙은 완전히 무시된다. 사일런트(silent) 실패라서 찾기 어렵다.

### 회상 질문

1. Zod resolver를 쓸 때 `register('email', { required: '필수' })`를 추가하면 어떻게 동작하는가?
2. `z.infer<typeof schema>`는 무엇을 반환하는가?

---

## 2-2. defaultValues / values / reset / setValue

### 이 섹션의 목적

폼의 "기준값"을 다루는 네 가지 API는 서로 비슷해 보이지만 역할이 완전히 다르다. 혼용하면 `isDirty` 판단이 깨지거나 예상치 않은 렌더가 발생한다.

### 먼저 결론

> `defaultValues`는 비교 기준점이다. `values`는 외부 데이터에 반응한다. `reset`은 기준점을 다시 세운다. `setValue`는 특정 필드만 조정한다.

### 네 가지 API 비교

| API             | 무엇인가                                              | 언제 쓰는가                                              | 주요 함정                                                |
| --------------- | ----------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- |
| `defaultValues` | 폼의 초기값이자 `isDirty` 비교의 기준점               | 폼 마운트 시 초기값 설정                                 | 없으면 `isDirty`/`dirtyFields`가 불안정해진다            |
| `values`        | 외부 상태 변화에 반응해 폼 전체를 업데이트            | 서버 데이터 로딩 후 폼에 반영                            | 참조가 바뀔 때마다 내부 reset 호출 → `resetOptions` 필요 |
| `reset`         | 폼 전체를 특정 값으로 초기화 + defaultValues 업데이트 | 서버 저장 성공 후 상태 정리                              | 비동기 작업 완료 전에 호출하면 data 손실 위험            |
| `setValue`      | 특정 필드 값만 변경                                   | 외부 이벤트(지도에서 주소 선택 등)로 특정 필드만 바꿀 때 | `shouldDirty: true` 없으면 `dirtyFields`에 반영 안 됨    |

### 수정 폼(Edit Form) 시나리오

실무에서 가장 헷갈리는 케이스다. 서버에서 데이터를 받아 폼에 채우고, 수정 후 저장하는 흐름.

**시나리오: 사용자 프로필 수정 폼**

```tsx
// [실무 패턴 예제]
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';

type UserProfile = { name: string; email: string; bio: string };

function EditProfileForm({ userId }: { userId: string }) {
  // 서버에서 현재 프로필 데이터를 가져온다
  const { data: serverData, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => fetchUserProfile(userId),
  });

  const {
    register,
    handleSubmit,
    formState: { isDirty, dirtyFields },
  } = useForm<UserProfile>({
    // values: 서버 데이터가 로드되면 자동으로 폼을 업데이트한다
    // defaultValues와 달리 나중에 바뀌어도 반응한다
    values: serverData,
    resetOptions: {
      // 사용자가 이미 수정한 필드는 서버 데이터로 덮어쓰지 않는다
      keepDirtyValues: true,
    },
  });

  // 이 코드에서 봐야 할 포인트:
  // 1. values prop이 있으므로 별도 useEffect + reset이 불필요하다
  // 2. isDirty = 사용자가 뭔가를 바꿨는가 (서버값과 비교)
  // 3. dirtyFields = 어떤 필드를 바꿨는가 (PATCH용)

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      <input {...register('email')} />
      <textarea {...register('bio')} />
      <button type="submit" disabled={!isDirty}>
        변경사항 저장
      </button>
    </form>
  );
}
```

### values vs defaultValues — 언제 무엇을 쓰는가

```
데이터가 처음 한 번만 로드된다 → defaultValues: async () => fetchData()
데이터가 나중에 도착하거나 외부에서 바뀔 수 있다 → values prop
```

**`values`의 주의사항**: `values`가 바뀌면 내부적으로 `reset`이 호출된다. `defaultValues`도 업데이트된다. `resetOptions: { keepDefaultValues: true }`를 주면 `defaultValues`는 유지하고 현재값만 업데이트한다.

### reset의 안전한 사용

```tsx
// [실무 패턴 예제]
const onSubmit = handleSubmit(async (data) => {
  // ✅ 비동기 작업이 끝난 후에 reset 호출
  await saveProfile(data);
  reset(); // 이제 저장된 값을 새 defaultValues로 삼아 폼을 초기화

  // ❌ 이렇게 하면 data가 reset에 의해 날아갈 수 있다
  // reset();
  // await saveProfile(data); // data는 이미 초기화된 값을 참조할 수 있음
});
```

### setValue의 올바른 사용

```tsx
// [실무 패턴 예제] — 지도 컴포넌트에서 주소를 선택했을 때
const { register, setValue } = useForm<AddressForm>();

const handleMapSelect = (place: GooglePlace) => {
  setValue('address', place.formatted_address, {
    shouldDirty: true, // dirtyFields에 반영
    shouldValidate: true, // 즉시 검증
    shouldTouch: true, // touched 상태 업데이트
  });
};
```

> 전제: `GooglePlace`는 지도 SDK가 반환하는 장소 객체 타입이라고 가정한다. 여기서 핵심은 타입 이름이 아니라 `setValue`에 `shouldDirty`, `shouldValidate`, `shouldTouch`를 함께 줄 수 있다는 점이다.

### 흔한 실수

**`defaultValues` 없이 시작하기**: `isDirty`와 `dirtyFields`는 현재 값과 `defaultValues`를 비교한다. `defaultValues`가 없으면 비교 기준점이 없어서 두 상태가 불안정하거나 서로 어긋날 수 있다. 모든 필드에 명시적으로 제공하라.

**`reset(data)` 타이밍 착각**: `reset`은 `defaultValues`도 함께 업데이트한다. 제출 직후 `reset()`을 호출하면 이후 사용자가 다시 수정해도 "변경 없음"으로 판단된다. 의도한 동작인지 확인하라.

### 회상 질문

1. 서버에서 받은 데이터로 폼을 채울 때 `values` prop과 `useEffect + reset` 중 어느 것을 선택하겠는가? 그 이유는?
2. `isDirty`가 `true`인데 `dirtyFields`가 비어 있는 상황은 어떻게 발생할 수 있는가?

---

## 2-3. watch / useWatch / getValues / subscribe

### 이 섹션의 목적

값을 "읽는" 방법이 네 가지다. 겉보기에는 비슷하지만 리렌더 비용과 용도가 완전히 다르다. 잘못 고르면 불필요한 리렌더가 생기거나, 반대로 값이 최신 상태가 아닐 수 있다.

### 먼저 결론

> 리렌더가 필요하면 `watch`/`useWatch`, 필요 없으면 `getValues`/`subscribe`.

### 네 가지 API 의사결정 비교

| API                  | 리렌더                        | 언제 쓰는가                             | 장점             | 함정                             |
| -------------------- | ----------------------------- | --------------------------------------- | ---------------- | -------------------------------- |
| `watch('field')`     | 이 API를 호출한 컴포넌트 전체 | 값을 보고 UI를 바꿔야 할 때 (소규모 폼) | 간단             | 컴포넌트가 크면 리렌더 비용 큼   |
| `useWatch({ name })` | 이 훅을 호출한 컴포넌트만     | 리렌더 범위를 잘라내야 할 때            | 구독 범위 격리   | 별도 컴포넌트 분리 필요          |
| `getValues()`        | 없음                          | 이벤트 핸들러 안에서 현재 값 읽기       | 리렌더 없음      | 반응형 아님 — 렌더 중 stale 위험 |
| `subscribe()`        | 없음                          | autosave, 로깅, 분석 이벤트             | 완전 비동기 구독 | 콜백 안에서 setState 금지        |

### 상세 설명과 예제

**`watch` — 단순하지만 리렌더 범위에 주의**

```tsx
// [실무 패턴 예제]
function ShippingForm() {
  const { register, watch } = useForm();

  // ⚠️ 이 컴포넌트 전체가 shippingType이 바뀔 때마다 리렌더된다
  const shippingType = watch('shippingType');

  return (
    <form>
      <select {...register('shippingType')}>
        <option value="standard">일반 배송</option>
        <option value="express">빠른 배송</option>
      </select>

      {/* 이 코드에서 봐야 할 포인트: shippingType에 따라 UI가 조건부로 표시 */}
      {shippingType === 'express' && (
        <input {...register('deliveryTime')} placeholder="희망 배송 시간" />
      )}
    </form>
  );
}
```

**`useWatch` — 리렌더를 격리하고 싶을 때**

```tsx
// [실무 패턴 예제]
// 별도 컴포넌트로 분리해서 리렌더 범위를 잘라낸다
function PricePreview({ control }: { control: Control<OrderForm> }) {
  // 이 컴포넌트만 quantity가 바뀔 때 리렌더된다
  // 부모 폼 컴포넌트는 리렌더되지 않는다
  const quantity = useWatch({ control, name: 'quantity', defaultValue: 0 });
  const unitPrice = useWatch({ control, name: 'unitPrice', defaultValue: 0 });

  return <p>총 금액: {quantity * unitPrice}원</p>;
}

// 이 코드에서 봐야 할 포인트:
// control을 prop으로 내려서 PricePreview가 독립적으로 구독한다
// quantity나 unitPrice가 바뀌어도 OrderForm 전체가 리렌더되지 않는다
```

**`useWatch.compute` (v7.61.0+) — 파생 값으로 변환 후 구독**

```tsx
// [실무 패턴 예제]
// 특정 필드를 구독하되, compute 결과가 바뀔 때만 리렌더
// "username" 값이 바뀌어도 isLong(true/false)이 변경될 때만 리렌더 발생
// → 문자 하나씩 칠 때마다 리렌더되지 않고, 10자 임계점 전후에서만 리렌더
const isLong = useWatch({
  control,
  name: 'username',
  compute: (value: string) => value.length > 10,
});
```

**`getValues` — 이벤트 핸들러의 현재값 스냅샷**

```tsx
// [실무 패턴 예제]
function OrderForm() {
  const { register, getValues } = useForm<OrderForm>();

  const handleAddToCart = () => {
    // 버튼 클릭 시점의 현재 값을 읽는다
    // 리렌더 없음 — 읽기만 한다
    const { productId, quantity } = getValues();
    addToCart({ productId, quantity });
  };

  // ⚠️ getValues를 렌더 중에 쓰면 stale 위험이 있다
  // const values = getValues(); // ❌ 렌더 중 호출
  // return <p>{values.quantity}</p>; // 업데이트를 놓칠 수 있음

  return (
    <form>
      <input {...register('quantity')} type="number" />
      <button type="button" onClick={handleAddToCart}>
        장바구니 추가
      </button>
    </form>
  );
}
```

**`subscribe` — 리렌더 없는 부수 효과**

```tsx
// [실무 패턴 예제] — 자동 저장(autosave)
function AutoSaveDraftForm() {
  const { register, subscribe } = useForm();

  useEffect(() => {
    // subscribe는 () => void cleanup 함수를 직접 반환한다
    // (watch(callback)과 달리 .unsubscribe()가 없다)
    const unsubscribe = subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        // 리렌더 없이 값 변화에 반응
        // ⚠️ 이 콜백 안에서 setValue, reset 등 상태 변경 API를 호출하면 안 된다
        localStorage.setItem('draft', JSON.stringify(values));
      },
    });

    return unsubscribe; // cleanup
  }, [subscribe]);

  // 이 코드에서 봐야 할 포인트:
  // subscribe는 React 렌더 사이클 밖에서 동작한다
  // 그래서 autosave가 타이핑마다 UI를 리렌더하지 않고도 동작한다

  return <form>...</form>;
}
```

### watch(callback) → subscribe 마이그레이션

`watch((value, info) => ...)` 형태의 콜백 API는 stable 7.x에 아직 남아 있지만, **v8 beta에서 제거 예정**이다. 새 코드에서는 `subscribe`를 쓰는 것이 바람직하다.

```tsx
// ❌ watch(callback) — v8에서 제거 예정, .unsubscribe() 필요
const subscription = watch((value, { name }) => console.log(value));
return () => subscription.unsubscribe();

// ✅ subscribe — () => void cleanup 함수 직접 반환
const unsubscribe = subscribe({ formState: { values: true }, callback: ... });
return unsubscribe;
```

### `<Watch />` 컴포넌트 (v7.65.0+)

Hook 규칙 제약 없이 `useWatch`와 동등한 성능을 제공한다. 루프나 조건문 안에서도 사용할 수 있다.

```tsx
import { Watch } from 'react-hook-form';

<Watch control={control} name="email">
  {(email) => <span>미리보기: {email}</span>}
</Watch>;
```

### 회상 질문

1. 큰 폼에서 특정 필드의 값에 따라 다른 섹션을 보여주고 싶다. `watch`와 `useWatch` 중 무엇을 쓰겠는가? 왜?
2. 버튼을 클릭할 때 폼의 현재 값으로 API를 호출하고 싶다. 어떤 API를 쓰는가?

---

## 2-4. register vs Controller vs useController

### 이 섹션의 목적

세 가지 모두 폼 필드를 RHF에 연결하는 방법이다. 선택 기준이 명확하지 않으면 불필요한 복잡도가 생긴다.

### 먼저 결론

> 기본값은 `register`. 외부 UI 컴포넌트를 쓸 때만 `Controller`. 재사용 가능한 controlled 필드 컴포넌트를 만들 때 `useController`.

### 왜 register만으로 안 되는가

`register`의 동작 원리를 먼저 이해해야 한다.

```tsx
// [개념 설명용 의사코드]
const { ref, onChange, onBlur, name } = register('email');
// ref: (el) => { DOM 노드를 내부 레지스트리에 등록 }
```

`register`는 DOM의 `ref`를 통해 동작한다. React의 `ref`는 HTML `input`, `select`, `textarea` 같은 네이티브 DOM 요소에만 자동으로 붙는다.

**문제**: 외부 라이브러리의 컴포넌트(`<CustomSelect />`, `<DatePicker />`, `<MUITextField />` 등)는 내부 input DOM 노드의 `ref`를 외부에 노출하지 않는 경우가 많다. `register`가 반환한 `ref`를 아무리 전달해도 RHF이 DOM에 접근할 수 없다.

이 경우에 `Controller`를 쓴다.

### register vs Controller — 결정 기준 표

|                             | register                       | Controller                | useController          |
| --------------------------- | ------------------------------ | ------------------------- | ---------------------- |
| **방식**                    | 비제어 (ref → DOM)             | 제어 (value → React)      | 제어 (훅 버전)         |
| **쓰는 때**                 | 네이티브 input/select/textarea | 외부 UI 컴포넌트          | 재사용 커스텀 컴포넌트 |
| **리렌더**                  | 거의 없음 (검증 결과만)        | 값이 바뀔 때마다          | 값이 바뀔 때마다       |
| **ref 필요**                | 필요 (자동)                    | 불필요                    | 불필요                 |
| **rules에서 valueAsNumber** | 가능                           | ❌ 불가 (타입에서 제외됨) | ❌ 불가                |

### register 예제

```tsx
// [최소 실행 예제]
<input {...register('email', { required: '필수' })} type="email" />
<select {...register('country')}>
  <option value="kr">대한민국</option>
</select>
<textarea {...register('bio')} />
```

### Controller 예제

```tsx
// [실무 패턴 예제] — 외부 UI 컴포넌트 연결
import { Controller } from 'react-hook-form';
import Select from 'react-select'; // react-select는 내부 input의 ref를 노출하지 않는다

<Controller
  name="category"
  control={control}
  rules={{ required: '카테고리를 선택하세요' }}
  render={({ field, fieldState }) => (
    // field = { onChange, onBlur, value, name, ref }
    // fieldState = { invalid, isDirty, isTouched, error }
    <Select
      {...field}
      options={categoryOptions}
      // 이 코드에서 봐야 할 포인트:
      // field.onChange가 react-select의 onChange를 대체한다
      // react-select는 이벤트 객체가 아니라 선택된 값을 직접 반환하므로
      // field.onChange가 그 값을 RHF 내부로 전달한다
    />
  )}
/>;
```

**Controller 사용 시 필수 주의사항**:

```tsx
// ❌ register와 동시 사용 — 이중 등록이 발생한다
<Controller
  render={({ field }) => (
    <input {...field} {...register('test')} /> // 절대 이렇게 하면 안 된다
  )}
/>
```

**Controller rules에서 제외된 옵션**: `valueAsNumber`, `valueAsDate`, `setValueAs`, `disabled`는 Controller의 `rules` 타입에서 **명시적으로 제외**된다. controlled 컴포넌트는 `field.onChange`에서 직접 변환해야 한다.

```tsx
// [실무 패턴 예제] — Controller에서 숫자 변환
<Controller
  name="price"
  render={({ field }) => (
    <input
      {...field}
      type="number"
      onChange={(e) => field.onChange(Number(e.target.value))} // 직접 변환
    />
  )}
/>
```

### useController — 재사용 컴포넌트 추상화

`Controller`의 훅 버전이다. 기능은 동일하고, 컴포넌트 API 대신 훅 API를 제공한다.

```tsx
// [실무 패턴 예제] — 재사용 가능한 TextField 컴포넌트
import { useController, Control } from 'react-hook-form';

type FieldProps = {
  name: string;
  control: Control<any>;
  label: string;
};

function TextField({ name, control, label }: FieldProps) {
  const {
    field, // { onChange, onBlur, value, name, ref }
    fieldState, // { invalid, isDirty, isTouched, error }
  } = useController({ name, control });

  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input {...field} id={id} aria-invalid={fieldState.invalid} aria-describedby={errorId} />
      <p id={errorId} role={fieldState.invalid ? 'alert' : undefined}>
        {fieldState.error?.message}
      </p>
    </div>
  );
}

// 사용
<TextField name="username" control={control} label="사용자명" />;
```

### 성능에 대한 정확한 이해

Controller/useController는 해당 필드의 값 변화에 따른 리렌더를 그 컴포넌트 내부로 격리한다. 그러나 **부모 컴포넌트가 외부 상태 변화로 리렌더되면 Controller도 함께 리렌더된다**. 이는 React의 기본 동작이며 RHF이 막아주지 않는다. 부모 리렌더를 방지하려면 `React.memo`나 컴포넌트 구조 분리가 별도로 필요하다.

### 흔한 실수

- `Controller` 안에서 `register`를 또 호출하는 이중 등록
- `Controller`의 `rules`에 `valueAsNumber`를 주는 것 (타입 오류 + 무시됨)
- `field.value`가 `undefined`인 상태로 controlled input에 전달해 "uncontrolled → controlled 전환" 경고 발생

```tsx
// ✅ undefined 방지
<Controller render={({ field }) => <input {...field} value={field.value ?? ''} />} />;
// 또는 defaultValues에서 초기값 보장
useForm({ defaultValues: { fieldName: '' } });
```

### 회상 질문

1. MUI의 `<TextField />`를 RHF과 연결할 때 `register`와 `Controller` 중 무엇을 써야 하는가? 왜?
2. `useController`와 `Controller`의 기능적 차이는 무엇인가?

---

## 2-5. useFieldArray - 기본편

### 이 섹션의 목적

배열 형태의 데이터를 폼에서 다루는 방법을 이해한다. 왜 일반 useState 배열 관리보다 까다로운지, RHF이 어떻게 해결하는지 이해한다.

### 왜 일반 배열 관리가 문제인가

```tsx
// [개념 설명용 의사코드] — 이렇게 하면 안 되는 패턴
const [items, setItems] = useState([{ name: '' }]);

const remove = (index: number) => {
  setItems(items.filter((_, i) => i !== index));
  // ❌ 인덱스가 바뀐다
  // 인덱스 2를 삭제하면 기존 인덱스 3이 인덱스 2가 된다
  // React는 key={index}를 쓰면 같은 인덱스의 컴포넌트를 재사용한다
  // → 잘못된 컴포넌트가 잘못된 데이터를 보여주는 버그 발생
};
```

핵심 문제: **인덱스는 식별자가 될 수 없다**. 삭제/재정렬 후 인덱스가 바뀌면 React가 컴포넌트를 잘못 재사용한다.

### useFieldArray — 고유 ID 기반 관리

```tsx
// [최소 실행 예제]
import { useForm, useFieldArray } from 'react-hook-form';

type OrderForm = {
  items: { name: string; quantity: number }[];
};

function OrderForm() {
  const { register, handleSubmit, control } = useForm<OrderForm>({
    defaultValues: { items: [{ name: '', quantity: 1 }] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items', // 배열 필드의 경로
  });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      {fields.map((field, index) => (
        // 이 코드에서 봐야 할 포인트:
        // key={field.id} — RHF이 부여한 UUID 사용
        // key={index} 절대 금지 — 삭제/재정렬 시 버그 발생
        <div key={field.id}>
          <input {...register(`items.${index}.name`)} />
          <input {...register(`items.${index}.quantity`, { valueAsNumber: true })} type="number" />
          <button type="button" onClick={() => remove(index)}>
            삭제
          </button>
        </div>
      ))}
      <button type="button" onClick={() => append({ name: '', quantity: 1 })}>
        항목 추가
      </button>
      <button type="submit">주문</button>
    </form>
  );
}
```

### useFieldArray API

| 메서드                 | 설명                    | 주의사항                              |
| ---------------------- | ----------------------- | ------------------------------------- |
| `append(value)`        | 끝에 추가               |                                       |
| `prepend(value)`       | 앞에 추가               |                                       |
| `insert(index, value)` | 특정 위치에 삽입        |                                       |
| `remove(index?)`       | 제거 (없으면 전체 제거) |                                       |
| `swap(a, b)`           | 두 항목 위치 교환       |                                       |
| `move(from, to)`       | 항목 이동               |                                       |
| `update(index, value)` | 특정 항목 **완전 교체** | ⚠️ unmount/remount 발생 → 포커스 잃음 |
| `replace(values)`      | 전체 배열 교체          | ⚠️ unmount/remount 발생               |

### 배열 레벨 검증 (v7.34.0+)

```tsx
// [실무 패턴 예제] — 배열 자체에 대한 검증
const { fields } = useFieldArray({
  control,
  name: 'items',
  rules: {
    minLength: { value: 1, message: '최소 1개 항목이 필요합니다' },
    maxLength: { value: 10, message: '최대 10개까지 가능합니다' },
    validate: (items) =>
      items.some((item) => item.name) || '이름이 있는 항목이 최소 1개 필요합니다',
  },
});

// ⚠️ 배열 레벨 에러는 errors.items가 아닌 errors.items?.root에서 접근한다
{
  errors.items?.root && <p>{errors.items.root.message}</p>;
}
```

**최신 caveat (v7.x)**:

- `keyName`은 다음 메이저에서 제거 예정. 현재 코드에서 미리 제거해도 된다.
- 한 이벤트 핸들러에서 액션을 연달아 쌓지 말 것 (예: `append` 후 바로 `remove`).
- `setValue`로 전체 FieldArray를 업데이트하는 것은 deprecated → `replace` 사용.

### 자기 설명 질문

왜 배열 필드에서만 `field.id` 같은 별도 식별자가 필요하고, 일반 객체 필드에서는 거의 문제되지 않을까?

### 회상 질문

1. `key={field.id}` 대신 `key={index}`를 쓰면 어떤 버그가 발생하는가?
2. `update(index, value)`가 `replace`와 다른 점은 무엇인가? 왜 주의가 필요한가?

### 다음 섹션과 연결

기본 append/remove를 이해했다면, 이제 서버 데이터 갱신, reset, PATCH까지 얽히는 실전편으로 넘어간다.

---

## 2-6. useFieldArray - 실전편

### 이 섹션의 목적

field array가 edit form, autosave, values 업데이트와 만나면 왜 갑자기 까다로워지는지 이해한다.

### 먼저 결론

> `useFieldArray`의 진짜 난이도는 배열을 추가/삭제하는 데 있지 않고, "외부 데이터 갱신과 배열 식별자 유지"가 충돌하는 순간에 있다.

### replace/update 시 remount 주의

`update`와 `replace`는 대상 아이템을 **언마운트/리마운트**한다. 이 때문에:

- 해당 input의 포커스가 사라진다
- 커서 위치가 초기화된다
- 외부 애니메이션/전환 효과가 끊길 수 있다

**회피책**: 개별 필드 업데이트가 필요하면 `update` 대신 `setValue`로 특정 경로만 바꾸거나, `register`가 있는 필드는 타이핑으로 직접 바꾸게 놔두는 것이 더 자연스럽다.

### values/reset과의 상호작용

```tsx
// [실무 패턴 예제] — 서버에서 배열 데이터를 받아 채우기
useForm({
  values: serverData, // serverData.items 배열이 바뀌면 폼 배열도 업데이트
  resetOptions: { keepDirtyValues: true },
});
```

**주의**: `values`가 바뀌면 내부적으로 `reset`이 호출되면서 useFieldArray의 `fields`도 새 UUID로 재생성된다. 이 때문에 사용자가 배열 아이템을 수정 중에 서버 데이터가 바뀌면 수정 내용이 날아갈 수 있다. `resetOptions: { keepDirtyValues: true }`가 이를 부분적으로 방지한다.

### PATCH 전략 — 배열이 섞일 때

```tsx
// [실무 패턴 예제] — 변경된 값만 추출하는 getDirtyValues (배열 처리 포함)
function getDirtyValues(dirtyFields: any, values: any): any {
  // ⚠️ Array.isArray 체크가 없으면 배열이 숫자 키 객체로 변환되는 버그 발생
  if (Array.isArray(dirtyFields)) {
    return dirtyFields.map((dirty, index) =>
      dirty === true ? values[index] : getDirtyValues(dirty, values[index]),
    );
  }
  if (typeof dirtyFields !== 'object' || dirtyFields === null) {
    return dirtyFields ? values : undefined;
  }
  const result = Object.fromEntries(
    Object.entries(dirtyFields)
      .map(([key, dirty]) => [key, getDirtyValues(dirty, values[key])])
      .filter(([, v]) => v !== undefined),
  );
  return Object.keys(result).length ? result : undefined;
}
```

> **배열 PATCH 주의**: 배열 중간 아이템만 수정됐을 때 `getDirtyValues`는 해당 인덱스만 포함한 배열을 반환한다. 나머지 인덱스는 `undefined` 홀이 된다. 서버가 compact array를 기대하면 문제가 된다. **배열이 포함된 PATCH에서는 부분 교체보다 해당 배열 전체를 교체하는 API 설계가 더 안전한 경우가 많다.**

### 흔한 실수

- autosave 응답이 올 때마다 `values`가 갱신되어 사용 중인 input 포커스가 자꾸 날아가는 것
- 배열의 "렌더용 식별자"와 "도메인 id"를 같은 것으로 취급하는 것
- 배열 PATCH를 객체 PATCH처럼 부분 조각만 보내도 안전하다고 생각하는 것

### 자기 설명 질문

왜 `useFieldArray`는 "필드가 배열이라는 사실" 자체보다, "배열 항목의 정체성과 순서가 계속 바뀐다는 사실" 때문에 어려울까?

### 회상 질문

1. `values` 업데이트가 `useFieldArray`에 특히 민감한 이유는 무엇인가?
2. 배열 필드가 있는 폼에서 PATCH payload 설계는 왜 서버 계약과 같이 논의해야 하는가?

### 다음 섹션과 연결

이제 배열 문제까지 포함한 수정 폼 전체 흐름을 한 번에 보면, 앞에서 배운 기준점과 변경분 관리가 왜 중요한지 더 선명해진다.

---

## 2-7. 수정 폼 시나리오

### 이 섹션의 목적

서버 데이터 로딩, 폼 채우기, PATCH 제출, 서버 에러 표시, dirty 유지까지 한 흐름으로 묶어 이해한다.

### 먼저 결론

> 수정 폼은 "서버 상태를 폼에 넣는 문제"가 아니라, "비교 기준점과 변경분을 어떻게 관리할 것인가"의 문제다.

### 완전한 수정 폼 패턴

```tsx
// [실무 패턴 예제] — 서버 데이터 로딩 → 수정 → PATCH 제출
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';

type UserProfile = { name: string; email: string };

function EditProfileForm({ userId }: { userId: string }) {
  const queryClient = useQueryClient();

  const { data: serverData, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => fetchProfile(userId),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (patch: Partial<UserProfile>) => updateProfile(userId, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
    onError: (err) => {
      // 서버 에러를 폼 에러로 주입
      err.response?.data?.errors?.forEach(({ field, message }: any) => {
        setError(field as keyof UserProfile, { type: 'server', message });
      });
    },
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { dirtyFields },
  } = useForm<UserProfile>({
    resolver: zodResolver(userProfileSchema),
    values: serverData, // 서버 데이터 자동 반영
    resetOptions: { keepDirtyValues: true },
  });

  const onSubmit = handleSubmit((data) => {
    // 변경된 필드만 추출해서 PATCH
    const changes = getDirtyValues(dirtyFields, data);
    if (!changes || Object.keys(changes).length === 0) return;
    mutate(changes);
  });

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <form onSubmit={onSubmit}>
      <input {...register('name')} />
      <input {...register('email')} />
      <button type="submit" disabled={isPending}>
        {isPending ? '저장 중...' : '저장'}
      </button>
    </form>
  );
}
```

> 전제: `fetchProfile`, `updateProfile`, `userProfileSchema`, `getDirtyValues`는 이미 존재한다고 가정한다. 이 예제의 핵심은 유틸 구현이 아니라 `values`, `dirtyFields`, `setError`, mutation 흐름의 연결이다.

### 이 코드에서 봐야 할 포인트

- `values: serverData`가 서버 데이터를 폼으로 주입한다.
- `resetOptions: { keepDirtyValues: true }`가 사용자가 이미 수정한 값을 서버 응답으로 덮어쓰지 않게 돕는다.
- `dirtyFields`는 PATCH payload를 최소화하는 기준이 된다.
- `setError`는 서버 검증 실패를 필드 수준 에러로 되돌려준다.

### 왜 이 패턴이 필요한가

수정 폼은 create 폼보다 어렵다. 사용자는 이미 저장된 데이터를 보고 있고, 서버 데이터는 늦게 도착할 수 있으며, 저장 이후 다시 서버 응답이 도착해 폼을 덮을 수도 있다. 이때 `defaultValues`, `values`, `dirtyFields`, `setError`, `resetOptions`가 각각 어떤 역할을 하는지 머릿속에 분리돼 있어야 한다.

### 무엇과 비교해서 이해해야 하는가

- 단순 create 폼: `defaultValues`만 있으면 끝나는 경우가 많다.
- 수정 폼: 외부 데이터 갱신과 사용자의 편집이 충돌할 수 있다.
- autosave가 있는 수정 폼: `values` 업데이트 빈도와 `useFieldArray` remount 이슈까지 같이 고려해야 한다.

### 흔한 실수

- `values`를 쓰면서 `keepDirtyValues`를 주지 않아 사용자가 입력한 값이 날아가는 것
- 서버 에러를 toast로만 띄우고 필드 에러에 되돌리지 않는 것
- PATCH payload를 만들 때 배열 필드를 부분 배열로 잘라 보내 서버 계약을 깨는 것

### 자기 설명 질문

서버에서 `serverData`가 다시 도착했을 때 사용자가 이미 수정한 값을 보존하려면, 왜 `reset`을 수동으로 매번 호출하기보다 `values + resetOptions` 조합이 더 자연스러울 수 있을까?

### 회상 질문

1. 수정 폼에서 `values`를 쓸 때 `keepDirtyValues`가 필요한 대표 상황은 무엇인가?
2. PATCH 전략에서 `dirtyFields`만 믿고 배열 일부만 보내면 왜 위험할 수 있는가?

### 다음 섹션과 연결

수정 폼을 실제로 완성하려면, 서버가 돌려주는 실패를 폼 에러로 다시 연결해야 한다. 그래서 바로 다음 섹션에서 `setError`와 `errors` prop을 본다.

---

## 2-8. 서버 에러 처리

### 이 섹션의 목적

서버 검증 실패를 사용자가 다시 수정 가능한 형태로 폼 화면에 되돌리는 방법을 정리한다.

### 먼저 결론

> 서버 에러는 알림창으로 끝내지 말고, 가능한 한 다시 "필드 에러"와 "폼 레벨 에러"로 환원해야 한다.

### setError — 서버 에러를 폼 필드에 연결

```tsx
// [실무 패턴 예제]
const onSubmit = async (data: FormData) => {
  try {
    await submitForm(data);
  } catch (err) {
    // 필드별 서버 에러
    err.response.data.errors.forEach(({ field, message }: any) => {
      setError(
        field as keyof FormData,
        {
          type: 'server',
          message,
        },
        { shouldFocus: true },
      ); // 에러 있는 필드로 자동 포커스
    });

    // 폼 레벨 에러 (특정 필드가 아닌 경우)
    setError('root.serverError', {
      type: 'server',
      message: '서버 오류가 발생했습니다.',
    });
  }
};

{
  errors.root?.serverError && <div role="alert">{errors.root.serverError.message}</div>;
}
```

### errors prop — 선언적 서버 에러 주입

```tsx
// [실무 패턴 예제]
const { error: mutationError } = useMutation({ ... });

// ⚠️ 반드시 useMemo로 참조를 안정화해야 한다
// 렌더마다 새 객체가 생기면 리렌더 루프와 예측 불가능한 갱신이 발생할 수 있다
const stableErrors = useMemo(
  () => mutationError ? mapServerErrors(mutationError) : undefined,
  [mutationError]
);

useForm({ errors: stableErrors });
```

> 전제: `mapServerErrors`는 서버 응답을 RHF의 `errors` shape로 바꿔주는 프로젝트 유틸이라고 가정한다.

**에러 객체 계층 구조 주의**:

```tsx
// ❌ flat key — 올바르게 설정/해제되지 않음
{ "participants.1.name": someError }

// ✅ hierarchical key
{ participants: [null, { name: someError }] }
```

### 이 코드에서 봐야 할 포인트

- `setError(field, { type: 'server', message })`는 서버 실패를 사용자 수정 가능 상태로 되돌린다.
- `root.serverError`는 특정 필드가 아닌 전체 폼 수준 실패를 표시할 때 쓰인다.
- `errors` prop을 쓸 때는 객체 참조를 안정화하지 않으면 렌더 루프가 생길 수 있다.

### 왜 필요한가

사용자 입장에서 "제출 실패"는 두 종류다.

- 특정 입력을 고치면 해결되는 실패
- 지금 화면 전체가 다시 시도해야 하는 실패

이 둘을 구분해 주지 않으면 사용자는 어디를 고쳐야 하는지 알 수 없다. 서버 에러 처리의 핵심은 사용자에게 다음 행동을 보여주는 것이다.

### 무엇과 비교해서 이해해야 하는가

- `setError`: 이벤트 기반, imperative, 가장 흔한 패턴
- `errors` prop: 선언적 주입, 외부 상태 관리와 결합할 때 유리
- toast/alert만 사용: 피드백은 보이지만 수정 경로는 약함

### 흔한 실수

- 서버가 돌려준 dot-path 문자열을 그대로 flat key로 넣는 것
- 서버 에러를 전부 `root.serverError`에 몰아넣어 어떤 필드를 고쳐야 하는지 숨기는 것
- 네트워크 실패와 필드 검증 실패를 같은 톤으로 처리하는 것

### 자기 설명 질문

왜 "서버 에러를 보여준다"와 "서버 에러를 사용자가 수정 가능한 입력 위치로 연결한다"는 전혀 다른 UX일까?

### 회상 질문

1. 서버가 `email already used`를 돌려줬을 때 가장 먼저 검토할 RHF API는 무엇인가?
2. `errors` prop을 쓸 때 `useMemo`가 필요한 이유는 무엇인가?

### 다음 섹션과 연결

이제 에러를 보여줄 수 있게 됐으니, 다음은 사용자 입력이 서버를 과도하게 두드리지 않도록 비동기 검증 UX를 정리한다.

---

## 2-9. 비동기 검증

### 이 섹션의 목적

중복 확인, 서버 유효성 확인처럼 응답 시간이 걸리는 검증을 UX를 해치지 않게 설계한다.

### 먼저 결론

> 비동기 검증은 "가능하면 늦게, 필요한 경우에만, 진행 중 상태를 보이면서" 실행해야 한다.

```tsx
// [실무 패턴 예제] — 아이디 중복 확인
import { debounce } from 'lodash';

// 디바운스: API 남용 방지
const debouncedCheck = useCallback(
  debounce(async (value: string, resolve: (r: true | string) => void) => {
    const { isDuplicate } = await checkUsername(value);
    resolve(!isDuplicate || '이미 사용 중인 아이디입니다');
  }, 500),
  [],
);

register('username', {
  validate: {
    minLength: (v) => v.length >= 3 || '3자 이상',
    checkDuplicate: (v) => {
      if (v.length < 3) return true; // 기본 검증 통과 후에만 API 호출
      return new Promise((resolve) => debouncedCheck(v, resolve));
    },
  },
});

// 검증 진행 중 UI 표시
const {
  formState: { isValidating, validatingFields },
} = useForm();
{
  validatingFields.username && <Spinner />;
}
```

> 전제: `checkUsername`은 서버 중복 확인 API, `Spinner`는 진행 중 UI 컴포넌트라고 가정한다. 이 예제의 핵심은 "비동기 validate를 어디서 늦추고 어떻게 상태를 보여줄 것인가"다.

### 이 코드에서 봐야 할 포인트

- 길이 같은 싼 검증은 먼저 로컬에서 걸러 API 호출을 줄인다.
- debounce로 짧은 연속 입력을 하나의 요청으로 합친다.
- `validatingFields.username`으로 사용자가 지금 무엇을 기다리는지 보여준다.

### 왜 필요한가

비동기 검증은 기술적으로 구현보다 UX가 더 중요하다. 매 타이핑마다 서버를 호출하면 느리고 비싸며, 사용자는 "입력이 안 먹는다"는 느낌을 받을 수 있다. 반대로 너무 늦게 검증하면 제출 순간에만 실패가 몰린다. 따라서 로컬 검증, debounce, 진행 중 표시를 같이 설계해야 한다.

### 무엇과 비교해서 이해해야 하는가

- 순수 로컬 검증: 빠르지만 서버 기준 중복 여부는 모른다
- 제출 시점 서버 검증: 구현은 쉽지만 피드백이 늦다
- 입력 중 비동기 검증: 경험은 좋을 수 있으나 남용하면 느리다

### 흔한 실수

- 최소 길이도 확인하지 않고 매 입력마다 API를 호출하는 것
- 검증 중 상태를 보여주지 않아 사용자가 "멈췄다"고 느끼게 하는 것
- 비동기 검증 실패를 local validation과 같은 메시지 층위로 섞는 것

### 자기 설명 질문

왜 "중복 확인"은 단순히 validate에 async 함수를 넣는 것보다, 호출 조건과 타이밍까지 같이 설계해야 할까?

### 회상 질문

1. 비동기 검증에서 debounce를 넣는 가장 현실적인 이유는 무엇인가?
2. `isValidating`과 `validatingFields`는 각각 어떤 종류의 UI에 적합한가?

### 다음 섹션과 연결

검증은 맞아도 접근성이 나쁘면 좋은 폼이 아니다. 다음은 label, error, focus, screen reader 관점에서 폼 접근성을 본다.

---

## 2-10. 웹 접근성

### 이 섹션의 목적

폼이 "보이기만 하는 UI"가 아니라, 키보드와 스크린 리더에서도 일관되게 동작하도록 만드는 기준을 정리한다.

### 먼저 결론

> 폼 접근성의 핵심은 label, error 연결, focus 이동, 상태 전달의 일관성이다.

```tsx
// [실무 패턴 예제] — 재사용 가능한 A11y 완전 지원 필드
function FormField({ name, label, type = 'text' }: { name: string; label: string; type?: string }) {
  const id = useId();
  const errorId = `${id}-error`;
  const { field, fieldState } = useController({ name });

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        {...field}
        id={id}
        type={type}
        aria-invalid={fieldState.invalid} // 스크린 리더에 에러 상태 알림
        aria-describedby={errorId} // 에러 메시지와 연결
        aria-required="true"
      />
      {/* 항상 DOM에 있어야 스크린 리더가 변경을 감지한다 */}
      <p
        id={errorId}
        role={fieldState.invalid ? 'alert' : undefined} // 에러 시 즉시 알림
        aria-live="polite"
      >
        {fieldState.error?.message ?? ' '}
      </p>
    </div>
  );
}
```

### 이 코드에서 봐야 할 포인트

- `label htmlFor`와 input `id`를 연결한다.
- `aria-describedby`로 에러 메시지와 입력을 연결한다.
- `role="alert"`와 `aria-live`로 에러 변경을 스크린 리더에 알린다.
- 에러 메시지 영역을 DOM에 유지해 변경 감지가 끊기지 않게 한다.

### 왜 필요한가

폼은 시각적 피드백만으로 끝나지 않는다. 키보드 사용자는 포커스 이동이 중요하고, 스크린 리더 사용자는 어떤 필드가 어떤 에러와 연결돼 있는지 구조적으로 알아야 한다. RHF은 에러/포커스 제어를 제공하지만, 실제 접근성은 컴포넌트 마크업이 결정한다.

### 무엇과 비교해서 이해해야 하는가

- "빨간색 테두리만" 주는 UI: 시각 사용자에게만 보인다
- label 없는 placeholder 중심 UI: 맥락이 약하고 접근성이 낮다
- DOM에서 에러 노드를 완전히 제거하는 UI: 보조기기에서 상태 변화 추적이 약해질 수 있다

### 흔한 실수

- placeholder를 label 대용으로 쓰는 것
- 에러 메시지와 입력을 연결하지 않는 것
- 제출 실패 후 첫 에러 필드 포커스를 꺼놓고 대체 흐름도 제공하지 않는 것

### 자기 설명 질문

왜 "에러 메시지를 보여주는 것"과 "에러 메시지를 접근 가능하게 연결하는 것"은 별개의 작업일까?

### 회상 질문

1. `aria-describedby`는 무엇을 연결하는가?
2. `shouldFocusError`가 접근성 측면에서 왜 유용한가?

### 다음 섹션과 연결

이제 핵심 패턴을 다 봤다. PART 3에서는 이 패턴들을 Zod, TanStack Query, UI 라이브러리, multi-step, 성능 전략과 어떻게 묶는지 본다.

---

---

# PART 3. 실전 아키텍처

---

## 3-1. RHF + Zod — 스키마 중심 아키텍처

### 이 섹션의 목적

왜 RHF와 Zod가 자주 같이 등장하는지, 그리고 언제 이 조합이 강하고 언제 과해질 수 있는지 이해한다.

### 먼저 결론

> RHF + Zod의 핵심 장점은 "검증" 자체보다, 타입과 검증 규칙과 제출 payload shape를 한곳에 모을 수 있다는 점이다.

### 왜 이 조합이 실무 표준인가

Zod를 쓰면 **타입 선언과 검증 규칙이 한 곳**에서 관리된다.

```tsx
// [실무 패턴 예제]
const schema = z
  .object({
    email: z.email('올바른 이메일'), // v4 스타일
    age: z.number({ error: '숫자를 입력하세요' }).min(14, '14세 이상'),
    password: z.string().min(8),
    confirmPassword: z.string(),
    role: z.enum(['admin', 'user', 'guest']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>; // 타입이 자동 생성

// 서버에서도 같은 스키마 재사용 (Next.js Server Actions)
const body = schema.parse(await request.json());
```

### Zod v4 변경사항

- `z.string().email()` 방식은 deprecated → `z.email()` 권장
- `{ message: '...' }` 방식은 deprecated → `{ error: '...' }` 권장 (하위 호환 유지)
- `@hookform/resolvers 5.1.0+`에서 Zod v4/Zod Mini/Zod v3 모두 지원

### transform이 있을 때 타입 처리

```tsx
const schema = z.object({
  price: z.string().transform(Number), // 입력: string, 출력: number
});

type FormInput = z.input<typeof schema>; // { price: string }
type FormOutput = z.output<typeof schema>; // { price: number }

useForm<FormInput, any, FormOutput>({ resolver: zodResolver(schema) });
```

### 이 코드에서 봐야 할 포인트

- `z.infer`가 타입 선언과 검증 규칙을 한곳에서 파생한다.
- `refine`는 크로스 필드 검증을 스키마 층에서 처리한다.
- `z.input`/`z.output`은 transform 전후 타입을 분리할 때 중요하다.

### 왜 필요한가

폼이 커질수록 "입력 타입", "검증 규칙", "서버 payload"가 서로 어긋나기 쉽다. Zod는 이 셋을 한곳에 두게 만들어 drift를 줄인다. 특히 API 요청/응답, Server Actions, tRPC와 결합할 때 장점이 커진다.

### 무엇과 비교해서 이해해야 하는가

- RHF 내장 검증: 더 가볍고 단순하다
- Zod resolver: 더 구조적이고 재사용성이 높다
- 너무 복잡한 분기형 대형 폼: Zod schema 하나에 모든 걸 몰아넣으면 오히려 거대해질 수 있다

### 흔한 실수

- 모든 폼을 무조건 Zod 하나로 해결하려는 것
- transform이 있는데 `z.infer` 하나만 쓰고 input/output 타입 차이를 무시하는 것
- resolver와 내장 검증을 동시에 써서 흐름을 혼란스럽게 만드는 것

### 자기 설명 질문

왜 RHF + Zod 조합은 "검증 라이브러리 하나 더 붙였다"가 아니라, 아키텍처 계층 분리의 문제로 봐야 할까?

### 회상 질문

1. `z.input`과 `z.output`을 나눠야 하는 대표 상황은 무엇인가?
2. 어떤 경우에는 RHF 내장 검증이 Zod보다 더 좋은 선택일 수 있는가?

### 다음 섹션과 연결

스키마가 준비됐다고 폼이 끝나는 건 아니다. 다음은 서버 상태와 폼 상태가 같이 움직이는 RHF + TanStack Query 조합을 본다.

---

## 3-2. RHF + TanStack Query — 서버 상태와 폼의 통합

### 이 섹션의 목적

서버 상태와 폼 상태를 억지로 하나로 합치지 않고, 각자 잘하는 역할을 분리하는 방법을 정리한다.

### 먼저 결론

> Query는 서버의 진실을, RHF는 사용자의 편집 과정을 담당한다. 둘을 섞지 말고 연결하라.

2-7절의 완전한 수정 폼 패턴 참고.

**핵심 패턴 정리**:

- 서버 데이터 → `values` prop으로 폼에 주입
- 제출 → mutation + `onError`에서 `setError`로 서버 에러 처리
- 성공 → `queryClient.invalidateQueries`로 캐시 갱신

### 흔한 실수

- Query 캐시를 곧바로 input `value`에 꽂아 controlled 폼처럼 만드는 것
- mutation 실패를 toast로만 처리하고 필드 에러를 연결하지 않는 것
- 저장 성공 뒤 `invalidateQueries` 없이 stale 데이터를 계속 보는 것

### 회상 질문

1. RHF + Query 통합에서 `values` prop이 자주 등장하는 이유는 무엇인가?
2. Query가 이미 서버 데이터를 갖고 있는데도 RHF가 따로 필요한 이유는 무엇인가?

### 다음 섹션과 연결

이제 서버 상태와의 통합을 봤으니, 다음은 외부 UI 라이브러리와 폼 제어 모델을 어떻게 맞출지 본다.

---

## 3-3. RHF + UI 라이브러리

### 이 섹션의 목적

외부 컴포넌트 라이브러리가 RHF의 기본 비제어 흐름과 어디서 충돌하는지 파악한다.

### 먼저 결론

> UI 라이브러리 통합의 핵심 질문은 "이 컴포넌트가 native input처럼 ref와 이벤트를 그대로 드러내는가?"이다.

UI 라이브러리(shadcn/ui, MUI, Ant Design 등) 컴포넌트를 RHF과 연결할 때는 `Controller`를 사용한다. 각 라이브러리의 공식 RHF 통합 가이드를 참고하는 것이 가장 안전하다.

- shadcn/ui: https://ui.shadcn.com/docs/forms/react-hook-form

### 실전 판단 기준

- native input wrapper에 가깝다 → `register`부터 시도
- 내부 value/onChange 모델이 다르다 → `Controller`
- 재사용 컴포넌트를 팀에서 공통으로 만든다 → `useController`

### 흔한 실수

- 모든 UI 라이브러리 컴포넌트에 무조건 `Controller`를 쓰는 것
- 반대로 아무 컴포넌트에나 `register`를 밀어 넣는 것
- 디자인 시스템 컴포넌트의 value shape를 RHF field shape와 맞추지 않는 것

### 회상 질문

1. 왜 react-select는 대표적인 `Controller` 사례인가?
2. 디자인 시스템 공용 TextField를 만든다면 `Controller`보다 `useController`가 나을 수 있는 이유는 무엇인가?

### 다음 섹션과 연결

UI 통합이 끝나면 다음으로 자주 등장하는 요구가 multi-step 폼이다. 여기서는 값 보존과 단계 검증이 핵심이 된다.

---

## 3-4. Multi-step 폼

### 이 섹션의 목적

폼을 여러 단계로 나눌 때 데이터 증발, 검증 범위, 스텝별 책임 분리를 어떻게 설계할지 정리한다.

### 먼저 결론

> multi-step 폼의 핵심은 "한 번에 다 검증하지 말고, 지금 단계에 필요한 것만 검증하라"이다.

```tsx
// [실무 패턴 예제] — 스텝별 독립 폼 + 상위 상태 수집 (RHF FAQ 권장 패턴)
const [allData, setAllData] = useState({});

// 각 스텝을 독립적인 useForm으로 관리
function Step1({ onNext }: { onNext: () => void }) {
  const { register, handleSubmit } = useForm();
  return (
    <form
      onSubmit={handleSubmit((data) => {
        setAllData((prev) => ({ ...prev, ...data }));
        onNext();
      })}
    >
      <input {...register('name', { required: true })} />
      <button type="submit">다음</button>
    </form>
  );
}
```

**단일 폼 + `trigger` 방식**: 모든 스텝을 하나의 `useForm`으로 관리하고 스텝 이동 전에 현재 스텝 필드만 검증한다.

```tsx
const handleNext = async () => {
  const isValid = await trigger(['step1.name', 'step1.email']);
  if (isValid) setCurrentStep(2);
};
```

`shouldUnregister: false` (기본값)이어야 다른 스텝으로 이동해도 이전 스텝 값이 유지된다.

### 무엇과 비교해서 이해해야 하는가

- 스텝별 독립 `useForm`: 각 단계 책임이 분명하지만 병합 단계가 필요하다
- 단일 `useForm` + `trigger`: 전체 상태는 한곳에 있지만 단계 검증 설계가 필요하다

### 흔한 실수

- 모든 스텝 필드를 항상 검증해 뒤 단계 에러 때문에 현재 단계 진행이 막히는 것
- 조건부 단계에서 `shouldUnregister` 동작을 이해하지 못해 값이 사라지는 것
- step 전환과 submit을 같은 이벤트로 섞어 흐름을 불명확하게 만드는 것

### 회상 질문

1. multi-step 폼에서 `trigger(['step1.name'])` 패턴이 중요한 이유는 무엇인가?
2. 각 스텝을 별도 `useForm`으로 나누는 장점은 무엇인가?

### 다음 섹션과 연결

multi-step이든 edit form이든 마지막에는 "변경된 것만 어떻게 보낼 것인가"가 남는다. 그래서 다음은 PATCH 전략을 다룬다.

---

## 3-5. PATCH 전략 — dirtyFields

### 이 섹션의 목적

전체 객체를 다시 보내지 않고, 변경된 필드만 안전하게 보내려면 무엇을 주의해야 하는지 정리한다.

### 먼저 결론

> PATCH 최적화의 핵심은 "보낼 양을 줄이는 것"보다 "서버 계약을 깨지 않는 것"이다.

2-6절의 `getDirtyValues` 함수와 2-7절의 수정 폼 패턴 참고.

**핵심**: `dirtyFields`가 정확하게 동작하려면 `defaultValues`에 모든 필드 초기값이 명시돼야 한다.

### 흔한 실수

- 객체 필드와 배열 필드를 같은 방식으로 PATCH하려는 것
- 서버가 전체 배열 교체를 기대하는데 부분 배열을 보내는 것
- `defaultValues` 없이 dirty 계산부터 믿는 것

### 회상 질문

1. 왜 PATCH 전략은 프론트만의 문제가 아니라 서버 API 계약 문제이기도 한가?
2. `dirtyFields`를 쓰기 전에 반드시 확인할 전제는 무엇인가?

### 다음 섹션과 연결

이제 마지막으로, 지금까지 본 패턴들을 실제 렌더 비용과 성능 관점에서 어떻게 다뤄야 하는지 본다.

---

## 3-6. 성능 최적화

### 이 섹션의 목적

RHF의 기본 장점을 유지하면서도, 대형 폼과 복잡한 화면에서 추가로 무엇을 분리해야 하는지 이해한다.

### 먼저 결론

> RHF이 기본적으로 빠르다고 해서, 큰 폼이 자동으로 빨라지는 것은 아니다. 구독 범위와 DOM 수를 별도로 관리해야 한다.

**FormProvider 리렌더**: v7.71.0에서 FormProvider Context 값이 memoize됐다. 불필요한 리렌더가 줄었다. v7.71.0 이상을 사용하라.

**대량 아이템 가상화**: useFieldArray에 수천 개 아이템이 있으면 DOM 노드 자체가 성능 병목이 된다. `@tanstack/react-virtual`로 화면에 보이는 것만 렌더한다.

```tsx
// [실무 패턴 예제] — 가상화 + useFieldArray
import { useVirtualizer } from '@tanstack/react-virtual';

const { fields } = useFieldArray({ control, name: 'items' });
const parentRef = useRef<HTMLDivElement>(null);

const virtualizer = useVirtualizer({
  count: fields.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50,
});

<div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
  <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
    {virtualizer.getVirtualItems().map((virtualRow) => (
      <div
        key={fields[virtualRow.index].id}
        style={{
          position: 'absolute',
          transform: `translateY(${virtualRow.start}px)`,
          width: '100%',
        }}
      >
        <input {...register(`items.${virtualRow.index}.name`)} />
      </div>
    ))}
  </div>
</div>;
```

**useFormState — 지역적 formState 구독**: `useForm`에서 `formState`를 꺼내면 그 컴포넌트에 구독이 생긴다. `useFormState`를 별도 컴포넌트에서 쓰면 구독을 거기에만 격리할 수 있다.

```tsx
function SubmitButton() {
  const { isSubmitting, isValid } = useFormState({ control });
  // isSubmitting/isValid가 바뀔 때 이 컴포넌트만 리렌더
  return <button disabled={isSubmitting || !isValid}>제출</button>;
}
```

### 이 코드에서 봐야 할 포인트

- RHF은 입력 추적 비용을 줄여주지만, DOM 노드 수까지 줄여주지는 않는다.
- `useFormState`와 `useWatch`는 구독 범위를 지역화하는 도구다.
- 수천 개 아이템이면 구독 최적화보다 먼저 virtualization이 필요하다.

### 흔한 실수

- RHF을 썼다는 이유만으로 대형 리스트 폼에서도 추가 설계가 필요 없다고 생각하는 것
- `watch`를 루트 컴포넌트에서 과하게 호출해 다시 리렌더 비용을 키우는 것
- `useFieldArray`와 거대한 DOM 렌더를 동시에 두고 성능 문제를 RHF 탓으로만 돌리는 것

### 자기 설명 질문

왜 "폼 상태 구독 최적화"와 "DOM 가상화"는 같은 성능 문제처럼 보여도 서로 다른 층위의 해결책일까?

### 회상 질문

1. `useFormState`가 성능 최적화에 도움이 되는 이유는 무엇인가?
2. RHF을 써도 virtualization이 필요한 대표 상황은 무엇인가?

### 다음 섹션과 연결

핵심 본문은 여기까지다. 이제 PART 4에서는 자주 쓰지는 않지만 알아두면 좋은 고급 API를 레퍼런스 형태로 정리한다.

---

---

# PART 4. 고급 부록

> **이 파트는 레퍼런스다.** 처음 읽을 때 전부 이해할 필요 없다. 필요한 시점에 찾아보라.

---

## 4-1. subscribe

리렌더 없이 폼 상태 변화에 반응하는 API. autosave, logging, analytics에 적합하다.

```tsx
// subscribe는 () => void cleanup 함수를 직접 반환한다
// watch(callback)의 .unsubscribe()와 혼동하지 말 것
const unsubscribe = subscribe({
  formState: { values: true },
  callback: ({ values }) => {
    // ⚠️ 이 안에서 setValue, reset 호출 금지
    localStorage.setItem('draft', JSON.stringify(values));
  },
});
return unsubscribe;
```

---

## 4-2. getFieldState

개별 필드의 상태를 조회한다.

**반환값**: `{ isDirty, isTouched, invalid, isValidating, error }`

```tsx
// 패턴 1 (권장): formState 전체를 두 번째 인자로 전달
const { getFieldState, formState } = useForm({ mode: 'onChange' });
const { isDirty, isTouched, invalid, isValidating, error } = getFieldState('firstName', formState);

// 패턴 2: 관련 formState 속성을 먼저 구독 후 단일 인자 호출
const {
  getFieldState,
  formState: { dirtyFields, errors, touchedFields },
} = useForm({ mode: 'onChange' });
const fieldState = getFieldState('firstName');
```

**중요**: `isValidating`을 실시간으로 표시하려면 `formState.validatingFields`가 구독돼 있어야 렌더가 트리거된다. 또는 `useController`의 `fieldState.isValidating`이 더 직접적이다.

---

## 4-3. createFormControl (v7.55.0+)

> ⚠️ **고급 도구**: FormProvider/Context를 완전히 피해야 하는 특수한 경우에만 검토. 공식 문서도 "completely optional"이라고 명시한다.

React 컴포넌트 외부에서 폼 상태를 초기화하고 Context API 없이 공유할 수 있다.

```tsx
// createFormControl은 formControl(연결용)과 control(구독용)을 둘 다 반환한다
const { formControl, control, handleSubmit, register } = createFormControl({
  defaultValues: { firstName: 'Bill' },
});

function App() {
  useForm({ formControl }); // formControl로 연결
  return <form>...</form>;
}

function StateDisplay() {
  const { isDirty } = useFormState({ control }); // control로 구독
  return <span>{isDirty ? '변경됨' : '변경 없음'}</span>;
}
```

---

## 4-4. useLens (`@hookform/lenses`)

타입 안전한 중첩 서브폼 컴포넌트를 위한 함수형 렌즈 패턴. 같은 "Person" 입력 컴포넌트를 `user.firstName`, `spouse.firstName`, `children[0].firstName` 등 여러 경로에서 재사용할 때 유용하다.

```bash
npm install @hookform/lenses
```

---

## 4-5. `<Form />` / `<FormStateSubscribe />`

**`<Form />`** (BETA): action URL과 함께 Progressive Enhancement 패턴을 구현할 때 사용. Next.js Server Actions와 연동.

**`<FormStateSubscribe />`**: render prop으로 formState를 구독. Hook 규칙 제약 없이 JSX 안에서 직접 사용 가능.

```tsx
// name prop은 필드 이름 (formState 키가 아님)
<FormStateSubscribe control={control} name="foo" render={({ errors }) => (
  <span>{errors.foo?.message}</span>
)} />

// 폼 레벨 상태 표시 — name prop 없이
<FormStateSubscribe control={control} render={({ isDirty, isValid }) => (
  <button disabled={!isDirty || !isValid}>저장</button>
)} />

// exact prop: 정확한 필드명 일치만 구독
<FormStateSubscribe control={control} name="items.0.name" exact={true}
  render={({ errors }) => <span>{errors.items?.[0]?.name?.message}</span>}
/>
```

---

## 4-6. ErrorMessage (`@hookform/error-message`)

```bash
npm install @hookform/error-message
```

```tsx
// criteriaMode: 'all'과 함께 복수 에러 메시지 표시
const {
  register,
  formState: { errors },
} = useForm({ criteriaMode: 'all' });

<ErrorMessage
  errors={errors}
  name="email"
  render={({ messages }) =>
    messages && Object.entries(messages).map(([type, message]) => <p key={type}>{message}</p>)
  }
/>;
```

---

## 4-7. 검증 라이브러리 비교

|                | Zod                      | Yup                          | Valibot              | Standard Schema        |
| -------------- | ------------------------ | ---------------------------- | -------------------- | ---------------------- |
| **번들 크기**  | ~17.7kB (esbuild)        | ~59KB                        | ~1.37kB              | 라이브러리에 따라 다름 |
| **TypeScript** | z.infer 자동 추론        | InferType (부정확할 수 있음) | 스키마에서 자동 추론 | -                      |
| **v2026 기준** | v4, top-level API 권장   | 안정적                       | 모듈식 tree-shake    | 생태계 표준화 중       |
| **추천 상황**  | TypeScript 신규 프로젝트 | Formik → RHF 마이그레이션    | 번들 크기 극히 중요  | 라이브러리 독립성      |

> 번들 수치 출처: Valibot 공식 비교 페이지, 2026년 4월 기준, esbuild 빌드 기준 로그인 폼 예시.

---

## 4-8. RHF vs Formik vs TanStack Form

|                       | RHF                | Formik                 | TanStack Form               |
| --------------------- | ------------------ | ---------------------- | --------------------------- |
| **기본 방식**         | 비제어 (ref → DOM) | 제어 (useState)        | 필드 단위 반응성            |
| **번들 크기**         | ~12KB              | ~44KB                  | 의존성 0                    |
| **TypeScript**        | 제네릭 수동 선언   | 부분 지원              | defaultValues에서 자동 파생 |
| **npm 주간 다운로드** | ~1,600만           | ~240만                 | ~130만                      |
| **상태**              | 활발. v7.72.1      | 느림. v2.4.9 (2025.11) | 빠른 성장. v1.29.0          |

> 다운로드 수치: npm trends 기준, 2026년 4월. 집계 방식에 따라 다르게 보일 수 있다.

**Formik**: "공식 maintenance mode"를 선언한 사실은 없다. 다만 2023년 이후 신규 기능 개발이 없고 버그 수정 위주다. 기본 패턴의 성능 차이도 구조적이다(매 타이핑마다 리렌더 vs RHF은 기본 최적화).

**TanStack Form**: 기술적으로 앞선 부분이 있지만 공식 비교 페이지가 "아직 완전히 정확하지 않다(under construction)"고 명시한다. TanStack Query를 이미 쓰고 극도로 복잡한 동적 폼이 필요할 때 검토 대상이 된다.

---

## 4-9. v8 beta 변경 예고

v8 beta에서 예고된 주요 breaking change:

| 변경                                                | 내용                                |
| --------------------------------------------------- | ----------------------------------- |
| `watch(callback)` 제거                              | `subscribe()`로 대체                |
| `keyName` 제거                                      | useFieldArray에서 사용 시 제거 필요 |
| `setValue`로 useFieldArray 직접 업데이트 불가       | `replace()` API 사용                |
| `<Watch />` 컴포넌트 `names` prop → `name`으로 변경 | 이미 deprecated                     |

안정적인 마이그레이션을 위해 지금부터 `watch(callback)` → `subscribe()`, `keyName` 제거, FieldArray에서 `setValue` 대신 `replace` 사용을 권장한다.

---

## 4-10. 용어 사전

| 용어                 | 정의                                                                            |
| -------------------- | ------------------------------------------------------------------------------- |
| **Zero-Jank**        | 브라우저 60fps 기준 프레임당 16ms 예산 안에 모든 연산을 마쳐 버벅임이 없는 상태 |
| **Jank**             | 프레임 드롭으로 발생하는 버벅임. 16ms 예산 초과 시 발생                         |
| **비제어 컴포넌트**  | DOM이 직접 값을 기억하는 입력 요소. `ref`로 필요할 때만 읽는다                  |
| **제어 컴포넌트**    | React 상태가 입력값의 source of truth인 컴포넌트                                |
| **Resolver**         | RHF과 외부 검증 라이브러리를 연결하는 어댑터 함수                               |
| **Transformer**      | 폼 제출 시 HTML 입력값(string)을 서버 스펙 타입으로 변환하는 로직               |
| **이벤트 중심 설계** | 사용자 입력을 React 상태가 아닌 브라우저 네이티브 이벤트로 처리하는 아키텍처    |
| **데이터 증발**      | Multi-step 폼에서 컴포넌트 언마운트 시 입력값이 사라지는 현상                   |
| **구독 기반 렌더**   | Proxy로 읽은 formState 속성이 변경될 때만 리렌더하는 방식                       |
| **파생 상태**        | `isDirty`, `isValid` 등 다른 상태에서 계산되는 값                               |
| **Lens**             | 중첩 데이터 구조의 특정 경로에 타입 안전하게 포커스하는 함수형 패턴             |

---

# PART 5. 근거 부록

> 이 파트의 목적: 이 문서가 어떤 자료를 검토했고, 어떤 주장에 어떤 근거를 붙였는지 추적 가능하게 보여준다.

---

## 5-1. 핵심 주장과 출처 매핑

| 핵심 주장                                                                                   | 1차 근거                                                                | 2차 보조 근거                                                                         | 문서 반영 위치 |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------- |
| stable 표기는 npm latest dist-tag 기준으로 잡는 것이 안전하다                               | https://registry.npmjs.org/react-hook-form/latest                       | https://github.com/react-hook-form/react-hook-form/releases                           | 버전 스냅샷    |
| `useForm({ validate })`는 7.72.0에서 추가됐다                                               | https://github.com/react-hook-form/react-hook-form/releases/tag/v7.72.0 | https://github.com/react-hook-form/documentation                                      | 2-1            |
| `watch(callback)`은 v8 beta에서 제거 예정이며 `subscribe()`로 이동해야 한다                 | https://react-hook-form.com/docs/useform/watch                          | https://github.com/react-hook-form/react-hook-form/releases                           | 2-3, 4-1, 4-9  |
| `values`는 외부 값 변화에 반응하고 내부적으로 reset 계열 동작을 유발하므로 주의가 필요하다  | https://react-hook-form.com/docs/useform                                | https://stackoverflow.com/questions/76647141/react-hook-form-defaultvalues-v-s-values | 2-2, 2-7       |
| `errors` prop은 참조를 안정적으로 유지해야 한다                                             | https://react-hook-form.com/docs/useform                                | https://github.com/react-hook-form/react-hook-form/issues/3455                        | 2-8            |
| `useFieldArray`는 `field.id`를 key로 써야 하며 `keyName`은 다음 메이저에서 제거 예정이다    | https://react-hook-form.com/docs/usefieldarray                          | https://react-hook-form.nodejs.cn/docs/usefieldarray                                  | 2-5, 4-9       |
| `update`/`replace`는 remount를 유발할 수 있어 포커스 손실을 낳는다                          | https://react-hook-form.com/docs/usefieldarray                          | https://github.com/orgs/react-hook-form/discussions/11770                             | 2-5, 2-6       |
| `Controller`는 controlled 외부 컴포넌트 통합용이고 부모 리렌더까지 막아주지는 않는다        | https://react-hook-form.com/docs/usecontroller/controller               | React 공식 렌더 모델                                                                  | 2-4            |
| `useWatch`는 구독 범위를 잘라내는 데 유리하고 `compute`/`exact`가 존재한다                  | https://react-hook-form.com/docs/usewatch                               | https://react-hook-form.com/docs/watch                                                | 2-3            |
| FormProvider context value memoization 개선은 7.71.x 이후 버전에서 확인된다                 | https://github.com/react-hook-form/react-hook-form/releases             | https://github.com/react-hook-form/documentation                                      | 3-6            |
| RHF 자체가 빠르더라도 대량 DOM은 virtualization이 필요하다                                  | https://react-hook-form.com/advanced-usage                              | https://web.dev/articles/inp                                                          | 3-6            |
| Zod v4와 resolvers 5.1.0+ 조합은 명시적으로 지원된다                                        | https://github.com/react-hook-form/resolvers                            | https://github.com/react-hook-form/resolvers/releases                                 | 3-1            |
| TanStack Form 비교 페이지는 아직 under construction이라 비교 문구를 과하게 단정하면 안 된다 | https://tanstack.com/form/latest/docs/comparison                        | -                                                                                     | 4-8            |

---

## 5-2. 실무 혼동 지점 지도

이 표는 "공식 문서만 읽어도 이해가 되지만, 실제 현업과 학습 과정에서 반복적으로 헷갈리는 부분"을 커뮤니티 자료로 보강한 것이다.

| 혼동 지점                                          | 자주 나오는 질문                                    | 보조 근거                                                                                            |
| -------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `defaultValues` vs `values`                        | 서버 데이터가 늦게 오면 무엇을 써야 하는가          | https://stackoverflow.com/questions/76647141/react-hook-form-defaultvalues-v-s-values                |
| `values`와 `useFieldArray`                         | 외부 데이터 갱신 시 fields id가 재생성되는가        | https://github.com/orgs/react-hook-form/discussions/11141                                            |
| `useFieldArray` remove/update 후 이상 동작         | remove했는데 값이 되살아난다, 포커스가 날아간다     | https://github.com/orgs/react-hook-form/discussions/11770                                            |
| `useFieldArray`와 수동 등록/복잡한 컴포넌트        | register 방식이 배열 안에서 꼬인다                  | https://github.com/orgs/react-hook-form/discussions/3218                                             |
| `useFieldArray` 데이터와 `fields`/submit 결과 차이 | fields는 안 바뀌는데 제출 값은 바뀐다               | https://stackoverflow.com/questions/76178838/react-hook-form-usefieldarray-not-updating-fields       |
| `id` 충돌                                          | 내 도메인 id가 field.id와 겹친다                    | https://stackoverflow.com/questions/77289582/react-hook-form-usefieldarray-overwriting-my-own-id     |
| `errors` 참조 안정성                               | 에러 객체를 외부 상태에서 주입할 때 리렌더가 꼬인다 | https://github.com/react-hook-form/react-hook-form/issues/3455                                       |
| 대형 폼 성능                                       | `watch`/`useWatch`를 어디까지 써야 하는가           | https://www.reddit.com/r/reactjs/comments/1rbmfq4/i_hit_a_wall_with_react_hook_forms_rerenders_so_i/ |
| multi-step + field array                           | 배열 루트 에러와 단계 검증이 충돌한다               | https://www.reddit.com/r/reactjs/comments/1ijqd6n                                                    |
| `setValue`만 하고 미등록 필드를 `useWatch`로 본다  | undefined/stale가 나온다                            | https://www.reddit.com/r/reactjs/comments/1lnkuor                                                    |

> 주의: Reddit와 Stack Overflow는 규범 문서가 아니다. 여기서는 "사람들이 실제로 어디서 막히는가"를 파악하는 보조 자료로만 사용한다.

---

## 5-3. 학습 설계 원칙과 연구 근거

이 문서의 서술 방식은 아래 원칙을 의도적으로 반영했다.

| 설계 원칙                           | 문서에서의 구현 방식                                | 근거                                                     |
| ----------------------------------- | --------------------------------------------------- | -------------------------------------------------------- |
| worked example 먼저                 | PART 1에서 최소 실행 예제를 먼저 제시               | Dunlosky et al.; MIT Open Learning worked/faded examples |
| guidance를 앞에서 높게, 뒤에서 낮게 | PART 1~2는 설명 밀도 높게, PART 4는 참조형으로 전환 | MIT Open Learning; Shin et al.                           |
| self-explanation                    | 각 핵심 장에 자기 설명 질문 삽입                    | Chi et al.                                               |
| retrieval practice                  | 각 핵심 장에 회상 질문 2개 삽입                     | Karpicke & Blunt                                         |
| self-questioning                    | "왜 필요한가", "무엇과 비교" 절을 반복              | Joseph et al.; Teng & Reynolds                           |
| cognitive load 외재화               | A vs B 비교표, 결정 기준표, 예제 라벨링             | Dunlosky et al.; Ainsworth & Loizou                      |
| expertise reversal 방지             | 고급 API를 PART 4로 격리                            | Shin et al.; Loksa                                       |
| chunking은 절단이 아니라 재구성     | 원리 설명 후 예제, 그리고 다시 판단 기준으로 묶음   | Cambridge ELT chunking 자료; Ainsworth & Loizou          |

### 문서 설계에 실제로 반영한 규칙

1. 처음 읽는 사람은 PART 1에서 `register`, `handleSubmit`, `errors`만 붙잡게 한다.
2. 비교가 필요한 개념은 산발적으로 흩뿌리지 않고 표로 묶는다.
3. 예제는 "실행 가능", "실무 패턴", "의사코드"를 구분해 불필요한 혼란을 줄인다.
4. 각 장은 "사실 - 인과 - 비교 - 전이" 순서로 이해되도록 구성한다.
5. 후반부는 모든 세부 사항을 외우게 하기보다, 필요할 때 다시 찾을 수 있는 reference structure를 제공한다.

---

## 5-4. 검토한 자료 묶음

### RHF 공식 문서와 공식 저장소

- RHF Docs: https://react-hook-form.com/docs
- `useForm`: https://react-hook-form.com/docs/useform
- `watch`: https://react-hook-form.com/docs/useform/watch
- `subscribe`: https://react-hook-form.com/docs/useform/subscribe
- `useWatch`: https://react-hook-form.com/docs/usewatch
- `useFieldArray`: https://react-hook-form.com/docs/usefieldarray
- `Controller`: https://react-hook-form.com/docs/usecontroller/controller
- `useController`: https://react-hook-form.com/docs/usecontroller
- `useFormState`: https://react-hook-form.com/docs/useformstate
- Advanced Usage: https://react-hook-form.com/advanced-usage
- FAQs: https://react-hook-form.com/faqs
- RHF GitHub Releases: https://github.com/react-hook-form/react-hook-form/releases
- RHF Documentation Repo: https://github.com/react-hook-form/documentation

### npm / package registry / ecosystem

- npm registry latest endpoint: https://registry.npmjs.org/react-hook-form/latest
- Resolvers repo: https://github.com/react-hook-form/resolvers
- Resolvers releases: https://github.com/react-hook-form/resolvers/releases
- Zod docs: https://zod.dev/
- TanStack Form comparison: https://tanstack.com/form/latest/docs/comparison
- Valibot comparison: https://valibot.dev/guides/comparison/

### 실무 혼동 지점 보강 자료

- Stack Overflow - defaultValues vs values: https://stackoverflow.com/questions/76647141/react-hook-form-defaultvalues-v-s-values
- Stack Overflow - useFieldArray updating confusion: https://stackoverflow.com/questions/76178838/react-hook-form-usefieldarray-not-updating-fields
- Stack Overflow - useFieldArray id overwriting: https://stackoverflow.com/questions/77289582/react-hook-form-usefieldarray-overwriting-my-own-id
- GitHub Discussion - values and field array ids: https://github.com/orgs/react-hook-form/discussions/11141
- GitHub Discussion - focus loss / resets around field array: https://github.com/orgs/react-hook-form/discussions/11770
- GitHub Discussion - complex registration with field array: https://github.com/orgs/react-hook-form/discussions/3218
- GitHub Issue - errors reference behavior: https://github.com/react-hook-form/react-hook-form/issues/3455
- Reddit - large form re-renders / subscriptions: https://www.reddit.com/r/reactjs/comments/1rbmfq4/i_hit_a_wall_with_react_hook_forms_rerenders_so_i/
- Reddit - multi-step + useFieldArray confusion: https://www.reddit.com/r/reactjs/comments/1ijqd6n
- Reddit - useWatch on unregistered fields: https://www.reddit.com/r/reactjs/comments/1lnkuor

### 성능 / 접근성 / 빅테크/기관 자료

- web.dev INP: https://web.dev/articles/inp
- web.dev Optimize INP: https://web.dev/articles/optimize-inp
- web.dev Learn Forms Accessibility: https://web.dev/learn/forms/accessibility
- web.dev Learn Accessibility Forms: https://web.dev/learn/accessibility/forms
- Vercel Web Interface Guidelines: https://vercel.com/design/guidelines

### 학습 과학 / 교육학 / 인지과학

- Dunlosky et al. - Effective learning techniques: https://www.psychologicalscience.org/publications/journals/pspi/learning-techniques.html
- Karpicke & Blunt - Retrieval practice: https://europepmc.org/article/med/21252317
- Chi et al. - Self-explanation: https://experts.azregents.edu/en/publications/self-explanations-how-students-study-and-use-examples-in-learning/
- Ainsworth & Loizou - Self-explaining with text/diagrams: https://www.sciencedirect.com/science/article/pii/S0364021303000338
- Joseph et al. - Self-questioning review: https://www.tandfonline.com/doi/full/10.1080/10573569.2014.891449
- Teng & Reynolds - Metacognitive prompts: https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0215902
- Shin et al. - Worked examples + metacognitive scaffolding in programming: https://journals.sagepub.com/doi/10.1177/07356331231174454
- Loksa - Metacognition and self-regulation in programming: https://digital.lib.washington.edu/researchworks/items/2c8e1804-c9fe-4dda-834d-23a1b07f2789
- MIT Open Learning - Worked and faded examples: https://openlearning.mit.edu/mit-faculty/research-based-learning-findings/worked-and-faded-examples
- Cambridge ELT - Chunk spotting: https://www.cambridge.org/elt/blog/2019/11/01/chunk-spotting-users-guide/
- Cambridge ELT - Teaching in chunks: https://www.cambridge.org/elt/blog/2018/09/05/how-teaching-a-language-in-chunks-helps-learners/

---

_작성 기준: 2026-04-20 / npm latest dist-tag 기준 react-hook-form 7.72.1 stable_
