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
import { type CSSProperties, forwardRef } from "react";

const mediaVariables = {
  "--media-primary-color": "var(--primary)",
  "--media-secondary-color": "var(--background)",
  "--media-text-color": "var(--foreground)",
  "--media-background-color": "var(--background)",
  "--media-control-hover-background": "var(--accent)",
  "--media-font-family": "var(--font-sans)",
  "--media-live-button-icon-color": "var(--muted-foreground)",
  "--media-live-button-indicator-color": "var(--destructive)",
  "--media-range-track-background": "var(--border)",
} as CSSProperties;

export type VideoPlayerHandle = SharedVideoPlayerHandle;

type Props = {
  recordingId: string;
  mimeType: string;
};

export const VideoPlayer = forwardRef<VideoPlayerHandle, Props>(
  function VideoPlayer({ recordingId, mimeType }, ref) {
    const videoUrl = `${env.NEXT_PUBLIC_SERVER_URL}/api/recordings/${recordingId}/stream`;

    return (
      <SharedVideoPlayer
        ref={ref}
        src={videoUrl}
        mimeType={mimeType}
        mediaVariables={mediaVariables}
        className="overflow-hidden rounded-lg border"
        controllerClassName="aspect-video w-full"
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
