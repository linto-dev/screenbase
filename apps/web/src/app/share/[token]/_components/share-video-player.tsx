"use client";

import { env } from "@torea/env/web";
import {
  VideoPlayer as SharedVideoPlayer,
  type VideoPlayerHandle as SharedVideoPlayerHandle,
} from "@torea/ui/components/blocks/video-player";
import {
  MediaMuteButton,
  MediaPlayButton,
  MediaSeekBackwardButton,
  MediaSeekForwardButton,
  MediaTimeDisplay,
  MediaTimeRange,
  MediaVolumeRange,
} from "media-chrome/react";
import { type CSSProperties, forwardRef, useRef } from "react";

const mediaVariables = {
  "--media-primary-color": "var(--primary)",
  "--media-secondary-color": "var(--background)",
  "--media-text-color": "var(--foreground)",
  "--media-background-color": "var(--background)",
  "--media-control-hover-background": "var(--accent)",
  "--media-font-family": "var(--font-sans)",
  "--media-range-track-background": "var(--border)",
} as CSSProperties;

export type ShareVideoPlayerHandle = SharedVideoPlayerHandle;

type Props = {
  token: string;
  mimeType: string;
};

export const ShareVideoPlayer = forwardRef<ShareVideoPlayerHandle, Props>(
  function ShareVideoPlayer({ token, mimeType }, ref) {
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
        ref={ref}
        src={videoUrl}
        mimeType={mimeType}
        mediaVariables={mediaVariables}
        className="overflow-hidden rounded-lg border"
        controllerClassName="aspect-video w-full"
        onPlay={handlePlay}
      >
        <MediaPlayButton className="p-2.5" />
        <MediaSeekBackwardButton className="hidden p-2.5 sm:inline-flex" />
        <MediaSeekForwardButton className="hidden p-2.5 sm:inline-flex" />
        <MediaTimeRange className="p-2.5" />
        <MediaTimeDisplay className="p-2.5" showDuration />
        <MediaMuteButton className="p-2.5" />
        <MediaVolumeRange className="hidden p-2.5 sm:inline-flex" />
      </SharedVideoPlayer>
    );
  },
);
