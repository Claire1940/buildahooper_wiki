"use client";

import { useState, Suspense, lazy } from "react";
import {
  ArrowRight,
  Award,
  BarChart3,
  Dumbbell,
  BookOpen,
  Check,
  ChevronDown,
  ClipboardList,
  ExternalLink,
  GraduationCap,
  MapPin,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  locale: string;
}

// Tools Grid 卡片 → 模块 section ID 一一对应
const TOOLS_SECTION_IDS = [
  "builds",
  "positions",
  "attributes",
  "badges",
  "career",
  "draft",
  "teams",
  "beginner-guide",
];

// 每个模块标题旁的代表性图标（与 Tools Grid 一致）
const MODULE_HEADER_ICONS: Record<string, LucideIcon> = {
  builds: Dumbbell,
  positions: MapPin,
  attributes: BarChart3,
  badges: Award,
  career: Trophy,
  draft: ClipboardList,
  teams: Users,
  "beginner-guide": GraduationCap,
};

// 模块标题（eyebrow + 图标 + 标题 + 简介）统一头部
function ModuleHeader({
  sectionId,
  eyebrow,
  title,
  intro,
}: {
  sectionId: string;
  eyebrow?: string;
  title: string;
  intro?: string;
}) {
  const HeaderIcon = MODULE_HEADER_ICONS[sectionId];
  return (
    <div className="text-center mb-10 md:mb-14 scroll-reveal">
      {eyebrow && (
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4
                        bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
          {HeaderIcon && (
            <HeaderIcon className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
          )}
          <span className="text-xs md:text-sm font-medium tracking-wide uppercase">
            {eyebrow}
          </span>
        </div>
      )}
      <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 leading-tight">
        {title}
      </h2>
      {intro && (
        <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
          {intro}
        </p>
      )}
    </div>
  );
}

// 交替的 section 背景（奇偶模块区分）
function sectionBg(index: number) {
  return index % 2 === 1 ? "bg-white/[0.02]" : "";
}

export default function HomePageClient({
  latestArticles,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.buildahooper.wiki";

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Build a Hooper Wiki",
        description:
          "Build a Hooper Wiki covers player builds, positions, attributes, badges, NBA career guides, draft tips, and Roblox gameplay resources for every basketball player.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Build a Hooper - NBA Career Simulation on Roblox",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Build a Hooper Wiki",
        alternateName: "Build a Hooper",
        url: siteUrl,
        description:
          "Build a Hooper Wiki resource hub for player builds, positions, attributes, badges, and NBA career guides",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Build a Hooper Wiki - NBA Career Simulation on Roblox",
        },
        sameAs: [
          "https://www.roblox.com/",
          "https://www.youtube.com/@danny2ksimulations",
        ],
      },
      {
        "@type": "VideoGame",
        name: "Build a Hooper",
        gamePlatform: ["Roblox"],
        applicationCategory: "Game",
        genre: ["Sports", "Basketball", "Simulation", "Career"],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 1,
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://www.roblox.com/",
        },
      },
      {
        "@type": "VideoObject",
        name: "I Play Build a Hooper Until I Create the Perfect Player",
        description:
          "Build a Hooper gameplay video — Danny2K builds the perfect player in this Roblox basketball career simulation.",
        uploadDate: "2026-07-06",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/Nn2TMYg6SYc",
        url: "https://www.youtube.com/watch?v=Nn2TMYg6SYc",
      },
    ],
  };

  // Beginner Guide accordion state
  const [beginnerExpanded, setBeginnerExpanded] = useState<number | null>(null);
  const mobileBannerAd = getPreferredMobileBannerSelection();

  const builds = t.modules.buildAHooperBuilds;
  const positions = t.modules.buildAHooperPositions;
  const attributes = t.modules.buildAHooperAttributes;
  const badges = t.modules.buildAHooperBadges;
  const career = t.modules.buildAHooperCareer;
  const draft = t.modules.buildAHooperDraft;
  const teams = t.modules.buildAHooperTeams;
  const beginner = t.modules.buildAHooperBeginner;

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 pb-14 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 scroll-reveal">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 md:px-4 md:py-2
                            bg-[hsl(var(--nav-theme)/0.1)]
                            border border-[hsl(var(--nav-theme)/0.3)] mb-4 md:mb-6"
            >
              <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs md:text-sm font-medium">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-[1.05]">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <button
                onClick={() => scrollToSection("beginner-guide")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)]
                           text-white rounded-lg font-semibold text-base md:text-lg transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://www.roblox.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           border border-border hover:bg-white/10 rounded-lg
                           font-semibold text-base md:text-lg transition-colors"
              >
                {t.hero.playOnSteamCTA}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* Video Section */}
      <section className="px-4 py-10 md:py-12">
        <div className="scroll-reveal container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="Nn2TMYg6SYc"
              title="I Play Build a Hooper Until I Create the Perfect Player"
            />
          </div>
        </div>
      </section>

      {/* Tools Grid - 8 Navigation Cards（视频区之后、Latest Updates 之前） */}
      <section className="px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {t.tools.cards.map((card: any, index: number) => {
              const sectionId = TOOLS_SECTION_IDS[index];
              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(sectionId)}
                  className="scroll-reveal group rounded-xl border border-border p-4 md:p-6
                             bg-card hover:border-[hsl(var(--nav-theme)/0.5)]
                             transition-all duration-300 cursor-pointer text-left
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="mb-3 h-10 w-10 rounded-lg md:mb-4 md:h-12 md:w-12
                                  bg-[hsl(var(--nav-theme)/0.1)]
                                  flex items-center justify-center
                                  group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                                  transition-colors"
                  >
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm md:text-base font-semibold leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 广告位 2: 首屏内容之后再加载广告 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端优先使用方形，桌面端保留横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Latest Updates Section（模板1保留，无内容时组件自动返回 null） */}
      <LatestGuidesAccordion
        articles={latestArticles}
        locale={locale}
        max={12}
      />

      {/* Module 1: Builds（tier-grid 三列） */}
      <section id="builds" className={`scroll-mt-24 px-4 py-14 md:py-20 ${sectionBg(1)}`}>
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            sectionId="builds"
            eyebrow={builds.eyebrow}
            title={builds.title}
            intro={builds.intro}
          />
          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {builds.items.map((item: any, index: number) => (
              <div
                key={index}
                className="relative p-6 bg-white/5 border border-border rounded-2xl
                           hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors flex flex-col"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl mb-4
                                bg-[hsl(var(--nav-theme)/0.15)]">
                  <DynamicIcon
                    name={item.icon}
                    className="h-6 w-6 text-[hsl(var(--nav-theme-light))]"
                  />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-1">
                  {item.tier}
                </h3>
                <p className="text-xs md:text-sm font-medium text-[hsl(var(--nav-theme-light))] mb-2">
                  {item.playstyle}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground mb-3">
                  {item.position}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {item.focus.map((f: string, i: number) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]"
                    >
                      {f}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-auto">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 4: 第一模块之后的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 2: Positions（card-list 四宫格） */}
      <section id="positions" className={`scroll-mt-24 px-4 py-14 md:py-20 ${sectionBg(2)}`}>
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            sectionId="positions"
            eyebrow={positions.eyebrow}
            title={positions.title}
            intro={positions.intro}
          />
          <div className="scroll-reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {positions.items.map((item: any, index: number) => (
              <div
                key={index}
                className="p-6 bg-white/5 border border-border rounded-2xl
                           hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors flex flex-col"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl mb-4
                                bg-[hsl(var(--nav-theme)/0.15)]">
                  <DynamicIcon
                    name={item.icon}
                    className="h-6 w-6 text-[hsl(var(--nav-theme-light))]"
                  />
                </div>
                <h3 className="text-lg font-bold mb-1">{item.position}</h3>
                <p className="text-xs font-medium text-[hsl(var(--nav-theme-light))] mb-3">
                  {item.role}
                </p>
                <ul className="space-y-1.5 mb-3">
                  {item.focus.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground mt-auto">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 3: Attributes（table 表格） */}
      <section id="attributes" className={`scroll-mt-24 px-4 py-14 md:py-20 ${sectionBg(3)}`}>
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            sectionId="attributes"
            eyebrow={attributes.eyebrow}
            title={attributes.title}
            intro={attributes.intro}
          />
          <div className="scroll-reveal overflow-hidden rounded-2xl border border-border">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-[hsl(var(--nav-theme)/0.1)] border-b border-border text-xs font-semibold uppercase tracking-wider text-[hsl(var(--nav-theme-light))]">
              <div className="col-span-3">Category</div>
              <div className="col-span-5">Related Skills</div>
              <div className="col-span-4">Build Goal</div>
            </div>
            {attributes.items.map((item: any, index: number) => (
              <div
                key={index}
                className={`grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors ${index !== attributes.items.length - 1 ? "border-b border-border" : ""}`}
              >
                <div className="md:col-span-3 flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[hsl(var(--nav-theme)/0.15)] flex-shrink-0">
                    <DynamicIcon
                      name={item.icon}
                      className="h-5 w-5 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <span className="font-bold text-base">{item.category}</span>
                </div>
                <div className="md:col-span-5 flex flex-wrap items-center gap-1.5">
                  {item.related.map((r: string, i: number) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]"
                    >
                      {r}
                    </span>
                  ))}
                </div>
                <div className="md:col-span-4 text-sm text-muted-foreground md:flex md:items-center">
                  {item.goal}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 5: 移动端横幅 320×50 */}
      {mobileBannerAd && (
        <AdBanner
          type={mobileBannerAd.type}
          adKey={mobileBannerAd.adKey}
          className="md:hidden"
        />
      )}

      {/* Module 4: Badges（card-list 四宫格） */}
      <section id="badges" className={`scroll-mt-24 px-4 py-14 md:py-20 ${sectionBg(4)}`}>
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            sectionId="badges"
            eyebrow={badges.eyebrow}
            title={badges.title}
            intro={badges.intro}
          />
          <div className="scroll-reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {badges.items.map((item: any, index: number) => (
              <div
                key={index}
                className="p-6 bg-white/5 border border-border rounded-2xl
                           hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors flex flex-col"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl mb-4
                                bg-[hsl(var(--nav-theme)/0.15)]">
                  <DynamicIcon
                    name={item.icon}
                    className="h-6 w-6 text-[hsl(var(--nav-theme-light))]"
                  />
                </div>
                <h3 className="text-lg font-bold mb-1">{item.category}</h3>
                <p className="text-xs font-medium text-[hsl(var(--nav-theme-light))] mb-3">
                  {item.supports}
                </p>
                <p className="text-sm text-muted-foreground mt-auto">
                  {item.effect}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 5: Career（step-by-step 步骤 + milestones） */}
      <section id="career" className={`scroll-mt-24 px-4 py-14 md:py-20 ${sectionBg(5)}`}>
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            sectionId="career"
            eyebrow={career.eyebrow}
            title={career.title}
            intro={career.intro}
          />
          <div className="scroll-reveal space-y-3 md:space-y-4 mb-8 md:mb-10">
            {career.steps.map((step: any, index: number) => (
              <div
                key={index}
                className="flex gap-3 md:gap-4 p-4 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)]">
                  <span className="text-base md:text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-1.5 md:mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="scroll-reveal flex flex-wrap gap-3 justify-center">
            {career.milestones.map((m: string, i: number) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-sm"
              >
                <Trophy className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 6: 中段横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 6: Draft（step-by-step 步骤 + milestones） */}
      <section id="draft" className={`scroll-mt-24 px-4 py-14 md:py-20 ${sectionBg(6)}`}>
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            sectionId="draft"
            eyebrow={draft.eyebrow}
            title={draft.title}
            intro={draft.intro}
          />
          <div className="scroll-reveal space-y-3 md:space-y-4 mb-8 md:mb-10">
            {draft.steps.map((step: any, index: number) => (
              <div
                key={index}
                className="flex gap-3 md:gap-4 p-4 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)]">
                  <span className="text-base md:text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-1.5 md:mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="scroll-reveal flex flex-wrap gap-3 justify-center">
            {draft.milestones.map((m: string, i: number) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-sm"
              >
                <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Module 7: Teams（cards 四宫格） */}
      <section id="teams" className={`scroll-mt-24 px-4 py-14 md:py-20 ${sectionBg(7)}`}>
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            sectionId="teams"
            eyebrow={teams.eyebrow}
            title={teams.title}
            intro={teams.intro}
          />
          <div className="scroll-reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teams.items.map((item: any, index: number) => (
              <div
                key={index}
                className="p-6 bg-white/5 border border-border rounded-2xl
                           hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors flex flex-col"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl mb-4
                                bg-[hsl(var(--nav-theme)/0.15)]">
                  <DynamicIcon
                    name={item.icon}
                    className="h-6 w-6 text-[hsl(var(--nav-theme-light))]"
                  />
                </div>
                <h3 className="text-lg font-bold mb-1">{item.name}</h3>
                <p className="text-xs font-medium text-[hsl(var(--nav-theme-light))] mb-3">
                  {item.style}
                </p>
                <p className="text-sm text-muted-foreground mt-auto">
                  {item.fit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 8: Beginner Guide（accordion 手风琴） */}
      <section id="beginner-guide" className={`scroll-mt-24 px-4 py-14 md:py-20 ${sectionBg(8)}`}>
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            sectionId="beginner-guide"
            eyebrow={beginner.eyebrow}
            title={beginner.title}
            intro={beginner.intro}
          />
          <div className="scroll-reveal space-y-3 max-w-3xl mx-auto">
            {beginner.faqs.map((faq: any, index: number) => (
              <div
                key={index}
                className="border border-border rounded-xl overflow-hidden bg-white/[0.02]"
              >
                <button
                  onClick={() =>
                    setBeginnerExpanded(beginnerExpanded === index ? null : index)
                  }
                  className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-white/5 transition-colors"
                  aria-expanded={beginnerExpanded === index}
                >
                  <span className="font-semibold text-sm md:text-base">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 text-[hsl(var(--nav-theme-light))] transition-transform ${beginnerExpanded === index ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    beginnerExpanded === index
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Footer */}
      <footer className="bg-white/[0.02] border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.roblox.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition inline-flex items-center gap-1.5"
                  >
                    {t.footer.roblox}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/@danny2ksimulations"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition inline-flex items-center gap-1.5"
                  >
                    {t.footer.youtube}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
