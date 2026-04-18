/**
 * recording の状態遷移:
 *   uploading → processing → completed     (Lambda 最適化成功: 再生可能)
 *   uploading → processing → unoptimized   (Lambda 最適化失敗: 再生不可)
 *   uploading → completed                  (ローカル/SKIP_VIDEO_PROCESSING=true)
 *   uploading → failed                     (アップロード中止)
 *
 * 再生可能なのは "completed" のみ。
 */
export type RecordingStatus =
  | "uploading"
  | "processing"
  | "completed"
  | "unoptimized"
  | "failed";

/** R2 multipart upload の完了済みパート情報 */
export type UploadedPart = {
  partNumber: number;
  etag: string;
};
