"use client";

import { cn } from "@torea/ui/lib/utils";
import { LoaderCircleIcon } from "lucide-react";
import {
  MediaControlBar,
  MediaController,
  MediaFullscreenButton,
} from "media-chrome/react";
import {
  type CSSProperties,
  type ComponentRef,
  forwardRef,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export type VideoPlayerHandle = {
  seekTo: (ms: number) => void;
  getCurrentTimeMs: () => number;
};

type Props = {
  src: string;
  mimeType: string;
  mediaVariables?: CSSProperties;
  className?: string;
  controllerClassName?: string;
  loadingOverlay?: ReactNode;
  onPlay?: () => void;
  onError?: () => void;
  children?: ReactNode;
};

const DefaultLoadingOverlay = (
  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-muted/80">
    <LoaderCircleIcon className="size-8 animate-spin text-muted-foreground" />
    <p className="text-muted-foreground text-sm">
      動画を読み込んでいます...
    </p>
  </div>
);

export const VideoPlayer = forwardRef<VideoPlayerHandle, Props>(
  function VideoPlayer(
    {
      src,
      mimeType,
      mediaVariables,
      className,
      controllerClassName,
      loadingOverlay,
      onPlay,
      onError,
      children,
    },
    ref,
  ) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const controllerRef = useRef<ComponentRef<typeof MediaController>>(null);
    const [isLoading, setIsLoading] = useState(false);
    const controllerId = useId();

    useImperativeHandle(ref, () => ({
      seekTo: (ms: number) => {
        const video = videoRef.current;
        if (video) {
          video.currentTime = ms / 1000;
        }
      },
      getCurrentTimeMs: () => {
        const video = videoRef.current;
        return video ? Math.floor(video.currentTime * 1000) : 0;
      },
    }));

    // コントロールバーを MediaController の外に配置しているため、
    // フルスクリーン時に映像 + コントロールバー両方が表示されるよう
    // ラッパー要素を MediaController.fullscreenElement に指定する。
    // 参考: https://www.media-chrome.org/docs/en/components/media-controller
    useEffect(() => {
      const controller = controllerRef.current;
      const wrapper = wrapperRef.current;
      if (!controller || !wrapper) return;
      controller.fullscreenElement = wrapper;
    }, []);

    // クライアントマウント後に動画ソースを設定する。
    // SSR 時に <source src> を出力すると、ページロード時に即座にリクエストが始まり
    // 大きなファイル（1GB+）ではタブのローディング状態が長時間続く。
    // useEffect 内で src を設定することでページロードと動画読み込みを分離する。
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;
      setIsLoading(true);

      // <source> 要素を動的に追加して type ヒントを渡す。
      // type を指定することでブラウザが非対応フォーマットを即座にスキップできる。
      const source = document.createElement("source");
      source.src = src;
      source.type = mimeType;
      video.appendChild(source);
      video.load();

      return () => {
        video.removeChild(source);
      };
    }, [src, mimeType]);

    const handleLoadedMetadata = useCallback(() => {
      setIsLoading(false);
    }, []);

    const handleError = useCallback(() => {
      setIsLoading(false);
      onError?.();
    }, [onError]);

    return (
      <div
        ref={wrapperRef}
        className={cn("flex flex-col", className)}
        style={mediaVariables}
      >
        <div className="relative min-h-0 flex-1">
          {isLoading && (loadingOverlay ?? DefaultLoadingOverlay)}
          <MediaController
            id={controllerId}
            ref={controllerRef}
            className={controllerClassName}
          >
            {/* biome-ignore lint/a11y/useMediaCaption: screen recordings don't have captions */}
            <video
              ref={videoRef}
              slot="media"
              preload="metadata"
              crossOrigin="use-credentials"
              playsInline
              className="mt-0 mb-0"
              tabIndex={-1}
              onLoadedMetadata={handleLoadedMetadata}
              onError={handleError}
              onPlay={onPlay}
            />
          </MediaController>
        </div>
        {/* mediacontroller は MediaControlBar の HTML 属性だが */}
        {/* media-chrome/react の props 型には含まれていないため、*/}
        {/* スプレッドで属性として渡す。 */}
        <MediaControlBar {...({ mediacontroller: controllerId } as object)}>
          {children}
          <MediaFullscreenButton className="p-2.5" />
        </MediaControlBar>
      </div>
    );
  },
);
