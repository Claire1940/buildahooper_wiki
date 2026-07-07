"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Play } from "lucide-react";

interface VideoFeatureProps {
  videoId: string;
  title: string;
}

/**
 * VideoFeature
 *
 * 自动播放策略：
 * 1. IntersectionObserver 监测视频区域进入视口时自动加载并播放
 *    （autoplay=1&mute=1&loop=1，静音以满足浏览器自动播放策略）
 * 2. 保留点击播放按钮作为后备：用户点击 poster 也会触发播放
 *
 * 进入视口前只渲染缩略图 + 播放按钮，减轻首屏负担。
 */
export function VideoFeature({ videoId, title }: VideoFeatureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldPlay, setShouldPlay] = useState(false);

  const watchUrl = useMemo(
    () => `https://www.youtube.com/watch?v=${videoId}`,
    [videoId],
  );

  // loop=1 对单视频需要附带 playlist=<videoId>
  const embedUrl = useMemo(
    () =>
      `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1&rel=0`,
    [videoId],
  );

  const thumbnailUrl = useMemo(
    () => `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    [videoId],
  );

  // IntersectionObserver：进入视口自动播放
  useEffect(() => {
    if (shouldPlay) return;
    const node = containerRef.current;
    if (!node) return;

    // 不支持 IntersectionObserver 时直接不自动触发，保留点击后备
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShouldPlay(true);
            observer.disconnect();
            break;
          }
        }
      },
      // 区域进入视口前约 200px 提前触发，过渡更自然
      { rootMargin: "200px", threshold: 0.25 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldPlay]);

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg bg-black/40"
        style={{ paddingBottom: "56.25%" }}
      >
        {shouldPlay ? (
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setShouldPlay(true)}
            className="group absolute inset-0 w-full h-full"
            aria-label={`Play video: ${title}`}
          >
            {/* 缩略图 */}
            <img
              src={thumbnailUrl}
              alt={title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                // maxres 不可用时回退到 hqdefault
                const img = e.currentTarget;
                if (!img.src.includes("hqdefault.jpg")) {
                  img.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                }
              }}
            />
            {/* 渐变遮罩 */}
            <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
            {/* 播放按钮 */}
            <span className="absolute inset-0 flex items-center justify-center">
              <span
                className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full
                           bg-[hsl(var(--nav-theme))] text-white shadow-lg shadow-[hsl(var(--nav-theme)/0.4)]
                           group-hover:scale-110 group-hover:bg-[hsl(var(--nav-theme)/0.9)]
                           transition-transform duration-300"
              >
                <Play className="w-7 h-7 md:w-9 md:h-9 ml-1" fill="currentColor" />
              </span>
            </span>
            {/* 标题 */}
            <span className="absolute bottom-0 left-0 right-0 p-4 md:p-5 text-left">
              <span className="text-white font-semibold text-sm md:text-base line-clamp-2 drop-shadow">
                {title}
              </span>
            </span>
          </button>
        )}
      </div>

      <div className="flex justify-center">
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
        >
          Watch on YouTube
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
