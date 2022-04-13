// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Life Is Egg 개발일지",
  tagline: "lifeisegg의 개발과 관련된 다양한 글을 쓰는 일지",
  url: "https://lifeisegg123.github.io",
  baseUrl: "/lifeisegg-blog/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "favicon.ico",
  organizationName: "lifeisegg123", // Usually your GitHub org/user name.
  projectName: "lifeisegg-blog", // Usually your repo name.
  i18n: {
    defaultLocale: "ko",
    locales: ["ko"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: false,
        blog: {
          routeBasePath: "/",
          showReadingTime: true,
          editUrl: "https://github.com/lifeisegg123/lifeisegg-blog/edit/main",
          blogSidebarTitle: "최근 포스트",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        googleAnalytics: {
          trackingID: "G-YK4T99Z94F",
        },
        gtag: {
          trackingID: "G-YK4T99Z94F",
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: "Life Is Egg 블로그",
        logo: {
          alt: "블로그 로고",
          src: "/img/logo.svg",
        },
        items: [
          { to: "/tags", label: "Tags", position: "left" },
          { to: "/archive", label: "Archive", position: "left" },
          {
            href: "https://github.com/lifeisegg123",
            label: "GitHub",
            position: "right",
          },
          {
            href: "https://magic-fennel-2ec.notion.site/3babce8f698b49c680ac60dfaac92a9f",
            label: "이력서",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        copyright: `Copyright © ${new Date().getFullYear()} lifeisegg, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      colorMode: {
        defaultMode: "dark",
        respectPrefersColorScheme: true,
      },
    }),
};

module.exports = config;
