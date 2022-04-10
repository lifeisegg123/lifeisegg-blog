---
title: docusaurus로 블로그 만들기
authors: lifeisegg
tags: [docusaurus]
keywords: [docusaurus, blog, 블로그, 개발블로그, 기술블로그, 일기]
description: docusaurus로 블로그들 만드는 과정과 후기를 의식의 흐름으로 나열
---

개발을 시작한지 얼마 되지 않은 시점부터, 기술블로그들을 보며 언젠가는 나도 저런 블로그를 운영해보고 싶다는 생각을 갖고 있었습니다.

하지만 취업을 하게 되고 난 뒤 일이 바쁘다는 핑계로 미루고 미루기를 반복하다, 드디어 블로그를 만들게 되었습니다.

블로그를 만들면서 첫번째 글은 어떤게 좋을까 고민하다, docusaurus를 이용해 블로그를 만들어본 과정과 후기를 작성해 보기로 하였습니다.
<!--truncate-->

## [docusaurus](https://docusaurus.io/)
docusaurus는 문서페이지를 빠르고 쉽게 만드는 것을 도와주는 라이브러리입니다.

다크모드, seo, i18n 등과 관련된 지원이 기본기능으로 들어있고, 블로그 웹을 만들기 위한 플러그인이 제공되고 있습니다.

## 설치
아래 명령어를 실행하는 것으로 기본적인 구조를 가진 docusaurus앱을 만들 수 있습니다.
`npx create-docusaurus@latest my-website classic`

`--typescript` 플래그를 사용해 typescript의 템플릿을 사용할 수 있고, `--package-manager <yarn | npm | pnpm>` 플래그로 선호하는 패키지 매니저를 사용할 수 있습니다.

저는 `npx create-docusaurus@latest lifeisegg-blog classic --typescript --package-manager pnpm`명령어를 실행하여 프로젝트를 시작하였습니다.

## 기본 설정
프로젝트 root에 있는 `docusaurus.config.js`파일을 통해 기본 설정을 진행합니다.

```js
  title: "웹사이트 제목",
  tagline: "웹사이트 설명",
  url: "웹사이트 URL (route path 제외)", // ex) https://lifeisegg123.github.io
  baseUrl: "웹사이트 baseUrl", // ex) "/lifeisegg-blog"
  organizationName: "github username",
  projectName: "github-repo name", 
  i18n: {
    defaultLocale: "ko",
    locales: ["ko"],
  },
  
```

## Header & Footer
docusaurus의 템플릿에서 제공되는 header와 footer는 `themeConfig`의 `navbar`와 `footer`를 통해 변경하여 사용할 수 있습니다.
### Header
프로젝트의 `/` url에 바로 블로그를 노출 시켰는데 이를 위해선 `src/pages/index.<js | tsx>`를 삭제하고 다음 옵션설정이 필요합니다.
```js
// presets.blog
{
  routeBasePath: "/",
}
```

tag별로 모아볼 수 있는 페이지와 전체 포스트 목록을 볼수있는 archive 페이지의 링크을 헤더 좌측에, github와 이력서 링크를 헤더 우측에 배치하였는데, 이를 위한 설정은 다음과 같습니다.
```js
// themeConfig.items
[
  { to: "/tags", label: "Tags", position: "left" },
  { to: "/archive", label: "Archive", position: "left" },
  {
    href: "깃허브 링크",
    label: "GitHub",
    position: "right",
  },
  {
    href: "이력서 링크",
    label: "이력서",
    position: "right",
  },
]
```

### Footer
기본으로 제공된 `links` 필드를 삭제하였고, copyright와 style만 남겨두었습니다.
```js
footer: {
  style: "dark",
  copyright: `Copyright © ${new Date().getFullYear()} lifeisegg, Inc. Built with Docusaurus.`,
}
```

## default color 변경
`src/css/custom.css`파일에 `--ifm-color-primary`로 시작하는 값들을 변경하여 모든 페이지에 적용되는 색상을 변경할 수 있고, dark모드에 사용되는 색상도 설정해줄 수 있습니다.

dark모드의 색상은 시인성문제로 인해 light 모드의 보다 밝은 색상 사용이 권장됩니다.

페이지의 기본 theme을 dark로 설정하고, 사용자가 설정한 theme이 있다면 해당 옵션을 우선하기 위해 다음의 설정을 추가해 주었습니다.
```js
// themeConfig.colorMode
{
  defaultMode: "dark",
  respectPrefersColorScheme: true,
}
```

## 댓글 기능 ([utterances](https://utteranc.es/))
댓글 기능 추가를 위해 utterances를 사용하였고 [이 블로그 포스팅](https://jbl428.github.io/2021/10/19/utterances/)을 참고하여 진행하였습니다.

### Comment Component
blog repo에 utterances 앱을 설치하고, `@docusaurus/theme-common`패키지를 설치한 뒤 다음과 같은 컴포넌트를 작성하였습니다.
```tsx
// src/components/Comment.tsx
import React, { useEffect, useRef } from "react";
import { useColorMode } from "@docusaurus/theme-common";

function Comment() {
  const containerRef = useRef(null);
  const utterancesRef = useRef(null);

  const { colorMode } = useColorMode();
  const utterancesTheme = colorMode === "dark" ? "github-dark" : "github-light";

  useEffect(() => {
    const createUtterancesEl = () => {
      const script = document.createElement("script");
      script.src = "https://utteranc.es/client.js";
      script.setAttribute("repo", "lifeisegg123/lifeisegg-blog");
      script.setAttribute("issue-term", "title");
      script.setAttribute("label", "comment");
      script.setAttribute("theme", utterancesTheme);
      script.crossOrigin = "anonymous";
      script.async = true;
      script.onload = () => {
        utterancesRef.current = document.querySelector(".utterances-frame");
      };

      containerRef.current.appendChild(script);
    };
    createUtterancesEl();
  }, []);

  useEffect(() => {
    if (!utterancesRef.current) return;
    const message = {
      type: "set-theme",
      theme: utterancesTheme,
    };

    utterancesRef.current.contentWindow.postMessage(
      message,
      "https://utteranc.es"
    );
  }, [utterancesTheme]);

  return <div ref={containerRef} />;
}
export default Comment;
```
### BlogPostItem Over-Ride
이후 기본 블로그 포스팅의 레이아웃을 over-ride해서 사용하기 위해 다음과 같은 컴포넌트를 `src/theme/BlogPostItem.tsx`에 작성하였습니다. [(참고)](https://docusaurus.io/ko/docs/swizzling#wrapping)
```tsx
import React from "react";
import BlogPostItem from "@theme-original/BlogPostItem";
import Comment from "../components/Comment";

export default function BlogPostItemWrapper(props) {
  return (
    <>
      <BlogPostItem {...props} />
      <Comment />
    </>
  );
}
```


## CI/CD 설정
github-pages를 통해 배포를 하였고, ci/cd 툴은 github-actions를 사용하였습니다. 전체적인 workflow는 공식문서를 참고하였고, pnpm을 사용하기 위한 부분만 추가해 주었습니다.
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
jobs:
  deploy:
    name: Deploy to GitHub Pages
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: pnpm/action-setup@v2.0.1 # pnpm 사용시 추가
        with:
          version: 7.0.0-rc.2
      - uses: actions/setup-node@v3
        with:
          node-version: 16.x
          cache: pnpm # pnpm으로 cache 설정 변경

      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Build website
        run: pnpm build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build
          user_name: <username>
          user_email: <email>

```


## TODO
아직 구현되지 못한 기능들입니다.
- 검색기능
- index 페이지 추가 => 간단한 자기소개
  
## 후기
간단한 설정으로 보기 좋은 사이트를 만들 수 있다는게 가장 큰 장점인 것 같습니다. 또한 문서의 한글번역이 완벽하지는 않으나 필요했던 부분들은 대부분 한글화가 되어있어서 영어에 부담감을 느낄 필요도 없었습니다.

md만으로 페이지를 만들 수 있고, React로 component를 작성하여 커스텀 하거나 기본 제공되는 템플릿을 over-ride하는 것도 가능하여 추후에 index 페이지를 새로 구성하는 것도 재밌는 작업이 될 것 같습니다.

