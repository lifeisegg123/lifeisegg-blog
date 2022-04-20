---
title: React-Query 어떻게 써야 할까요?
authors: lifeisegg
tags: [react, react-query, 오픈소스]
keywords: [react, react-query, react-query-toolkit, 리액트, 리액트 쿼리, 리액트 쿼리 툴킷]
description: 요즘 프론트엔드 개발 트렌드는 Redux의 세상에서 벗어나 새로운 상태관리 라이브러리들을 많이 도입하고 있는데요, 그 중 많은 선택을 받고 있고, 개인적으로도 선호하는 라이브러리인 React-Query를 직접 사용하며 고민했던 내용들과 그 결과들을 공유하고자 합니다.
---

요즘 프론트엔드 개발 트렌드는 Redux의 세상에서 벗어나 새로운 상태관리 라이브러리들을 많이 도입하고 있는데요, 그 중 많은 선택을 받고 있고, 개인적으로도 선호하는 라이브러리인 [React-Query](https://react-query.tanstack.com/)를 직접 사용하며 고민했던 내용들과 그 결과들을 공유하고자 합니다.

<!--truncate-->

## useQuery는 어떻게 써야 될까요?
우선 가장 많이 사용되는 hook인 useQuery의 간단한 사용 예시를 살펴보겠습니다.

### 기본적인 useQuery
```jsx
const mockQueryFunction = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { name: "삶은", level: 1 },
        { name: "계란", level: 2 },
      ]);
    }, 1000);
  });

function MockComponent1() {
  const { data, isLoading } = useQuery(["mock"], mockQueryFunction, { notifyOnChangeProps: "tracked" });

  return isLoading ? <LoadingComponent /> : <DataComponent data={data} />;
}

function ParentComponent () {
  return (
    <div>
      <MockComponent1 />
    </div>
  );
}
```

가장 기본적인 형태의 `useQuery` 사용 예시입니다.

`isLoading`의 값을 통해 현재 query가 데이터를 받아오고 있는 상태인지 판단하여, 받아오는 중이라면 `LoadingComponent`를, 다 받아왔다면 `DataComponent`를 렌더링 하는 코드입니다.

아직까지는 큰 문제는 없어보이는데요, 만약 같은 query를 다른 컴포넌트에서도 사용해야하는 상황이 온다면 어떻게 해야 할까요?

### 같은 query의 중복

```jsx
function MockComponent1() {
  const { data, isLoading } = useQuery(["mock"], mockQueryFunction, { notifyOnChangeProps: "tracked" });

  return isLoading ? <LoadingComponent /> : <DataComponent data={data} />;
}

function MockComponent2 () {
  const { data } = useQuery(['mock'], mockQueryFunction, { notifyOnChangeProps: "tracked" });

  return data ? <DataComponent2 data={data} /> : null;
}

function ParentComponent () {
  return (
    <div>
      <MockComponent1 />
      <MockComponent2 />
    </div>
  );
}
```

위의 코드가 동작하는데에는 큰 이상이 없겠지만 중복되는 코드가 보이는데요, queryKey와 queryFunction에 대한 관리 문제가 발생할 수 있고, 같은 query를 사용하는 곳이 더욱 많아지게 된다면 중복되는 코드가 더욱 많아져 유지보수하기 꽤나 어려운 코드가 될 것 같습니다.

중복되는 부분을 고쳐보려고 하는데, 우선 `useQuery(["mock"], mockQueryFunction)`부분 개선해 보겠습니다.

리액트 개발을 하며 로직이 중복적으로 사용된다면 함수나 hook으로 분리해서 사용하게 되는데, 이 부분도 동일한 방식으로 개선한다면 재사용성이 늘어나고, 변경에 쉽게 대처할 수 있을 것 같습니다.

```js title="useMockQuery.js"
function mockQueryFunction () {} // 구현 생략

export function useMockQuery(options?) {
  return useQuery(["mock"], mockQueryFunction, { notifyOnChangeProps: "tracked", ...options });
}
```

```jsx
import { useMockQuery } from './useMockQuery'

function MockComponent1() {
  const { data, isLoading } = useMockQuery();

  return isLoading ? <LoadingComponent /> : <DataComponent data={data} />;
}

function MockComponent2 () {
  const { data } = useMockQuery()

  return data ? <DataComponent2 data={data} /> : null;
}

function ParentComponent () {
  return (
    <div>
      <MockComponent1 />
      <MockComponent2 />
    </div>
  );
}
```

`useQuery(["mock"], mockQueryFunction)`를 `useMockQuery`라는 hook으로 분리하였고, options를 파라미터를 통해 전달 받을 수 있도록 개선하였습니다. 앞으로 같은 query를 사용해야 할 컴포넌트가 늘어난다 해도 `useMockQuery`만 사용한다면 쉽게 해결할 수 있게 되었습니다. 또한 api요청에 필요한 값이 있다면, 그것들도 hook 내에서 처리하게 함으로써 재사용성을 더욱 높일 수 있을 것 같습니다.

다음으로는 `isLoading`과 `data`를 통해 분기처리 한 것을 개선해보겠습니다. 이 부분은 react에서 제공하는 `Suspense`라는 컴포넌트를 통해 개선할 수 있을 것 같은데요, react-query에서 suspense를 사용하기 위해선 `useQuery`의 `suspense` 옵션을 `true`로 설정해주어야 합니다.

:::info
`QueryClientProvider`에 주어진 `queryClient`에 옵션을 통해 모든 query의 `suspense`를 한번에 설정하는 것도 가능합니다. [문서링크](https://react-query.tanstack.com/guides/suspense)
:::

```jsx title="useMockQuery.js"
export const useMockQuery = (options) => {
  return useQuery(["mock"], mockQueryFunction, { suspense: true, ...options });
};
```

```jsx
import { useMockQuery } from './useMockQuery'

function MockComponent1() {
  const { data } = useMockQuery();

  return <DataComponent data={data} />;
}

function MockComponent2 () {
  const { data } = useMockQuery()

  return <DataComponent2 data={data} />;
}

function ParentComponent () {
  return (
    <div>
      <Suspense fallback={<LoadingComponent />}>
        <MockComponent1 />
        <MockComponent2 />
      </Suspense>
    </div>
  );
}
```

`Suspense`를 사용하여 로딩상태의 처리는 외부로 위임하였고, 각 컴포넌트들은 데이터가 있을때의 처리에 집중하여 보다 명확한 코드가 되었습니다. 만약 두 컴포넌트가 서로 다른 로딩 표시 컴포넌트를 보여줘야 한다면, 각 컴포넌트를  `Suspense`로 감싸고 다른 `fallback`을 제공하는 방식으로 사용할 수 있습니다.

더 나은 코드로 개선한다면 `DataComponent`내에서 `useMockQuery`를 직접 호출하여, 데이터를 사용하는 로직과, 데이터를 받아오는 로직을 가까이 배치해 볼 수 있을 것 같습니다.
:::note
`React-Query`에 대한 글이므로 `Suspense`와 관련된 설명은 상세히 하지 않았습니다. 추가로 `ErrorBoundary`라는 컴포넌트를 사용해 에러시의 처리 또한 외부로 위임할 수 있는데, 관련된 글들 중 재미있게 읽었던 글 [링크](https://jbee.io/react/error-declarative-handling-0/) 남깁니다.
:::

### 특정한 데이터만 필요한 경우
이번에는 `DataComponent2`라는 컴포넌트가 `mockQueryFunction`의 리턴중 0번 인덱스에 있는 데이터만을 사용하는 컴포넌트라고 가정해보겠습니다.

이런경우라면 어떻게 처리할 수 있을까요?

여러 방법이 있겠지만, `useQuery`의 옵션중 `select`라는 옵션을 사용하면 비교적 간단하게 처리 할 수 있을 것 같습니다.

```jsx
function MockComponent2 () {
  const { data } = useMockQuery({select: (data) => data[0]})

  return <DataComponent2 data={data} />;
}
```

`select`옵션은 함수를 인자로 받는데, 파라미터로 queryFunction의 리턴값을 전달해주고, 함수의 리턴값을 data로 전달합니다.

이외에도 query가 성공 혹은 실패한 경우 callback을 실행하거나, 초기값을 넣어주는 것 등을 옵션을 통해 처리할 수 있는데요, 더 자세한 내용은 [공식문서](https://react-query.tanstack.com/docs/api/useQuery)를 읽어보시는 걸 추천드립니다.

## useQuery말고 다른 기능들은 어떻게 쓸까요?

실제로 개발을 하게되면 `useQuery`이외에 다양한 기능들을 사용하게 되는데, 몇가지 케이스들을 예시와 함께 살펴보겠습니다.

### prefetch
query의 데이터를 원하는 시점에 미리 로드하는 로직이 필요한 경우에는 `queryClient`의 `prefetchQuery`라는 메소드를 사용하게 되는데요, 주로 server side에서 데이터를 미리 받아 오거나, 화면 전환시 컴포넌트 마운트 전에 데이터를 미리 받아오기 위해 사용합니다.

`prefetchQuery`에 대해 살펴보기 전에, 앞서 사용한 예시코드를 조금 변경해 보겠습니다.

```jsx title="MockComponent.jsx"
import { useMockQuery } from './useMockQuery';

function MockComponent() {
  const { data } = useMockQuery();

  return <DataComponent data={data} />;
}
```

```jsx
import { MockComponent } from './MockComponent';

function ParentComponent() {
  const [showComponent, setShowComponent] = useState(false);
  const toggleShowComponent = () => setShowComponent((prev) => !prev);
  return (
    <div>
      {showComponent && (
        <Suspense fallback={<LoadingComponent />}>
          <MockComponent />
        </Suspense>
      )}
      <button onClick={toggleShowComponent}>toggle</button>
    </div>
  );
}
```

`MockComponent`의 렌더여부를 결정해주는 `showComponent`라는 상태를 만들었고, toggle 버튼을 클릭하여 이 값을 변경해주게 됩니다.

동작을 살펴보면 `showComponent`가 `true`가 되었을 때, `useMockQuery`를 통해 데이터를 받아오기 시작하며 `LoadingComponent`가 보일 것이고, 데이터를 받아온 뒤에 `MockComponent`가 렌더됩니다.

만약 유저가 버튼위에 마우스를 올린 시점에 query의 데이터를 미리 받아오고 싶다면 어떻게 처리 할 수 있을까요?

우선 `ParentComponent` 내에 작성해 보겠습니다.

### prefetch도 중복?
```jsx
import { MockComponent } from './MockComponent';
import { queryClient } from './queryClient';

function ParentComponent() {
  const [showComponent, setShowComponent] = useState(false);
  const toggleShowComponent = () => setShowComponent((prev) => !prev);

  const prefetchMockQuery = () =>
    queryClient.prefetchQuery(["mock"], mockQueryFunction);

  return (
    <div>
      {showComponent && (
        <Suspense fallback={<LoadingComponent />}>
          <MockComponent />
        </Suspense>
      )}
      <button onClick={toggleShowComponent} onMouseEnter={prefetchMockQuery}>
        toggle
      </button>
    </div>
  );
}
```

`prefetchMockQuery`라는 함수를 작성하여 query데이터를 prefetch하는 로직을 작성해 주고, 이를 button의 `onMouseEnter`에 넣어주었습니다.

기능은 잘 작동하겠지만 [앞서 살펴보았던 `useQuery`의 경우](#같은-query의-중복)와 동일한 queryKey, queryFunction의 관리 문제와, prefetch 로직이 여러 컴포넌트에서 사용되게 되었을때 중복되는 코드가 생긴다는 문제들이 발생하게 될텐데요, 이를 해결하기 위해서는 어떻게 작성하는 것이 좋을까요?

여러가지 방법이 있을 수 있겠지만, 제가 생각하는 방법은 아래와 같습니다.

```js title="mockQuery.js"
import { queryClient } from './queryClient';

const QUERY_KEY = ['mock'];

function mockQueryFunction () {} // 구현 생략

export function useMockQuery(options) {
  return useQuery(QUERY_KEY, mockQueryFunction, { notifyOnChangeProps: "tracked", ...options });
}

export function prefetchMockQuery (options) {
  return queryClient.prefetchQuery(QUERY_KEY, mockQueryFunction, options);
}
```

```jsx
import { MockComponent } from './MockComponent';
import { prefetchMockQuery } from './mockQuery';

function ParentComponent() {
  const [showComponent, setShowComponent] = useState(false);
  const toggleShowComponent = () => setShowComponent((prev) => !prev);

  const handleMouseEnter = () => {
    prefetchMockQuery(/* 필요한 경우 옵션 전달 */);
  }

  return (
    <div>
      {showComponent && (
        <Suspense fallback={<LoadingComponent />}>
          <MockComponent />
        </Suspense>
      )}
      <button onClick={toggleShowComponent} onMouseEnter={prefetchMockQuery}>
        toggle
      </button>
    </div>
  );
}
```

우선 `prefetchMockQuery`를 `useMockQuery`와 같은 파일에 작성하고 파일의 이름을 `mockQuery`로 변경해 주었습니다. 이를 통해 `mockQuery`와 관련된 로직들은 한 파일내에서 모두 확인이 가능해, 여러 파일을 확인하며 로직을 파악해야 되는 수고를 줄일 수 있습니다.

그리고 queryKey를 상수로 분리하여, `useMockQuery`와 `prefetchMockQuery`에서 함께 사용하였습니다. react-query를 사용하게 되면 queryKey를 어떻게 관리해야 할지에 대한 고민을 하게 되는데, 저의 경우 한 파일에서 같은 queryKey를 사용하는 로직들을 함께 작성해두고, 필요한 부분에선 작성해둔 함수를 import하여 사용하는 방식으로 관리하고 있습니다.

### getQueryData
query의 데이터를 통해 ui를 그리는게 아니라 특정시점에 연산을 위해서만 필요한 경우라면 어떻게 사용할 수 있을까요?

우선 기존에 작성해 둔 `useMockQuery`를 활용해 보겠습니다.

```jsx
import { useMockQuery } from './mockQuery';

function MockComponent2() {
  const [inputValue, setInputValue] = useState(0);
  const { data } = useMockQuery();

  const handleInputChange = (event) => {
    const {
      target: { value },
    } = event;
    setInputValue(Number(value));
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const totalLevel = data.reduce((acc, v) => acc + v, 0);

    callSomeApi(totalLevel + inputValue);
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <input type="number" value={inputValue} onChange={handleInputChange} />
      <button type="submit">submit</button>
    </form>
  );
}

function ParentComponent() {
  return (
    <div>
      <Suspense fallback={<LoadingComponent />}>
        <MockComponent1 />
        <MockComponent2 />
      </Suspense>
    </div>
  );
}
```

이번에도 역시 기능은 잘 작동할텐데요, 어떤문제가 생길 수 있을까요?

만약 `useMockQuery`의 data가 변경이 된다면 `MockComponent2`는 불필요한 리렌더가 발생하게 됩니다.

이러한 문제를 해결하기 위해 `queryClient`의 메소드중 `getQueryData`를 사용해 볼 수 있습니다.

```js title="mockQuery.js"
import { queryClient } from './queryClient';

const QUERY_KEY = ['mock'];

function mockQueryFunction () {} // 구현 생략

export function useMockQuery(options) {
  return useQuery(QUERY_KEY, mockQueryFunction, { notifyOnChangeProps: "tracked", ...options });
}

export function prefetchMockQuery (options) {
  return queryClient.prefetchQuery(QUERY_KEY, mockQueryFunction, options);
}

export function getMockQueryData(filters) {
  return queryClient.getQueryData(QUERY_KEY, filters);
}
```

```jsx
import { getMockQueryData } from './mockQuery';

function MockComponent2() {
  const [inputValue, setInputValue] = useState(0);

  const handleInputChange = (event) => {
    const {
      target: { value },
    } = event;
    setInputValue(Number(value));
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const queryData = getMockQueryData();
    const totalLevel = queryData.reduce((acc, v) => acc + v, 0);
  
    callSomeApi(totalLevel + inputValue);
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <input type="number" value={inputValue} onChange={handleInputChange} />
      <button type="submit">submit</button>
    </form>
  );
}
```

이제 mockQuery의 데이터는 `handleFormSubmit`라는 함수가 실행되는 시점에 받아오게 되어, 불필요한 리렌더를 막을 수 있게 되었습니다.

## [React-Query-Toolkit](https://github.com/lifeisegg123/react-query-toolkit) 홍보...ㅎ
react-query-toolkit은 제가 react-query를 쓰면서 느낀 아쉬운 점들을 개선하기 위해 만들고 있는 라이브러리인데요, react-query의 queryKey관리를 좀 더 편하게 하기 위해 개발하게 되었습니다.

핵심적인 기능은 아래와 같습니다.
- queryToolkit의 파라미터로 queryKey, queryFunction, defaultOptions을 넘김으로써 같은 query에 대한 중복코드 작성 최소화
- queryFunction의 파라미터를 자동으로 queryKey에 넣어주는 기능 제공

이 라이브러리를 사용하여 앞의 예시코드를 수정한다면 아래와 같이 작성 가능합니다. 

```js
import { queryClient } from "./queryClient";
import { createQueryToolkit } from "react-query-toolkit";

// queryToolkit은 queryClient와 같은 파일에 작성하는 것이 여러곳에서 사용하기 용이하기 때문에, 그 방식을 권장드립니다.
const queryToolkit = createQueryToolkit(queryClient);

const QUERY_KEY = ["mock"];

function mockQueryFunction() {} // 구현 생략

const mockQuery = queryToolkit(QUERY_KEY, mockQueryFunction, {
  defaultOptions: {
    notifyOnChangeProps: "tracked",
    suspense: true,
  },
});

// function useMockQuery () {};
mockQuery.useQuery();

// function prefetchMockQuery () {};
mockQuery.prefetchQuery();

// function getMockQueryData () {};
mockQuery.getQueryData();
```

아직 개발을 시작한지 얼마 되지않아 부족한 점이 많지만, 관심있으신 분들은 [레포](https://github.com/lifeisegg123/react-query-toolkit)([npm](https://www.npmjs.com/package/react-query-toolkit))에 한번 방문해서 살펴보시고 star도 눌러주시면 좋을 것 같습니다.

pr이나 issue생성등의 기여는 언제나 환영입니다!

## 끄읕
react-query에 대해 미처 다 소개하지 못한 좋은 기능들이 많은데요, 이러한 부분들은 나중에 기회가 되면 다른 포스팅에서 적어보도록 하겠습니다.

만약 react-query를 사용하고자 하신다면 maintainer인
TkDodo의 [블로그 글들](https://react-query.tanstack.com/community/tkdodos-blog)을 꼭 한번 읽어 보시길 추천드립니다.

긴글 읽어주셔서 감사합니다.🙇🏻‍♂️