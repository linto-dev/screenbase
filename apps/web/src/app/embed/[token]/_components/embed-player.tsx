"use client";

import { env } from "@torea/env/web";
import { VideoPlayer as SharedVideoPlayer } from "@torea/ui/components/blocks/video-player";
import { LoaderCircleIcon } from "lucide-react";
import {
  MediaMuteButton,
  MediaPlayButton,
  MediaTimeDisplay,
  MediaTimeRange,
  MediaVolumeRange,
} from "media-chrome/react";
import { type CSSProperties, useRef } from "react";

const embedMediaVariables = {
  "--media-primary-color": "#fff",
  "--media-secondary-color": "#000",
  "--media-text-color": "#fff",
  "--media-background-color": "#000",
  "--media-control-hover-background": "rgba(255, 255, 255, 0.1)",
  "--media-font-family": "system-ui, sans-serif",
  "--media-range-track-background": "rgba(255, 255, 255, 0.3)",
} as CSSProperties;

const embedLoadingOverlay = (
  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
    <LoaderCircleIcon className="size-8 animate-spin text-white/40" />
  </div>
);

type Props = {
  token: string;
  mimeType: string;
  /** ストリームの認証失敗時（動画読み込みエラー時）に呼ばれるコールバック */
  onAccessDenied?: () => void;
};

export function EmbedPlayer({ token, mimeType, onAccessDenied }: Props) {
  const videoUrl = `${env.NEXT_PUBLIC_SERVER_URL}/api/share/${encodeURIComponent(token)}/stream`;
  const hasTrackedRef = useRef(false);

  /**
   * 動画再生開始時に視聴イベントを記録する。
   *
   * - 1 ページロードあたり 1 回のみ呼び出す（useRef で制御）
   * - API 呼び出しの成否に関わらず動画再生は継続する（fire-and-forget）
   * - credentials: "include" で sb_vid Cookie と share_access Cookie を送信
   */
  function handlePlay() {
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;

    fetch(
      `${env.NEXT_PUBLIC_SERVER_URL}/api/share/${encodeURIComponent(token)}/views`,
      {
        method: "POST",
        credentials: "include",
      },
    ).catch(() => {
      // 視聴トラッキングの失敗は無視（動画再生に影響させない）
    });
  }

  return (
    <SharedVideoPlayer
      src={videoUrl}
      mimeType={mimeType}
      mediaVariables={embedMediaVariables}
      className="h-full w-full"
      controllerClassName="h-full w-full"
      loadingOverlay={embedLoadingOverlay}
      onPlay={handlePlay}
      onError={onAccessDenied}
    >
      <MediaPlayButton className="p-2.5" />
      <MediaTimeRange className="p-2.5" />
      <MediaTimeDisplay className="p-2.5" showDuration />
      <MediaMuteButton className="p-2.5" />
      <MediaVolumeRange className="hidden p-2.5 sm:inline-flex" />
    </SharedVideoPlayer>
  );
}
