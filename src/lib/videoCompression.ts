/**
 * Shrinks a video in the browser before upload (max 720p, ~1.5 Mbps) so large
 * phone videos take far less storage. Falls back to the original file when the
 * browser can't re-encode or the result isn't smaller.
 */
const MAX_DIMENSION = 1280;
const VIDEO_BITRATE = 1_500_000;
const AUDIO_BITRATE = 96_000;
const SKIP_BELOW_BYTES = 4 * 1024 * 1024;

function pickMimeType(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  const candidates = [
    "video/mp4;codecs=avc1,mp4a",
    "video/mp4",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  return candidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? null;
}

export async function compressVideo(file: File, onProgress?: (pct: number) => void): Promise<File> {
  if (file.size < SKIP_BELOW_BYTES) return file;
  const mimeType = pickMimeType();
  if (!mimeType) return file;

  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.src = url;
  video.playsInline = true;
  video.preload = "auto";

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("load failed"));
    });

    const capture = (video as HTMLVideoElement & { captureStream?: () => MediaStream }).captureStream;
    if (!capture || !video.videoWidth) return file;

    const scale = Math.min(1, MAX_DIMENSION / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round((video.videoWidth * scale) / 2) * 2;
    canvas.height = Math.round((video.videoHeight * scale) / 2) * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    const stream = canvas.captureStream(30);
    const source = capture.call(video);
    source.getAudioTracks().forEach((track) => stream.addTrack(track));

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: VIDEO_BITRATE,
      audioBitsPerSecond: AUDIO_BITRATE,
    });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    const stopped = new Promise<void>((resolve) => (recorder.onstop = () => resolve()));

    let raf = 0;
    const draw = () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      if (video.duration) onProgress?.(Math.min(99, Math.round((video.currentTime / video.duration) * 100)));
      raf = requestAnimationFrame(draw);
    };

    recorder.start(1000);
    await video.play();
    draw();
    await new Promise<void>((resolve) => (video.onended = () => resolve()));
    cancelAnimationFrame(raf);
    recorder.stop();
    await stopped;
    stream.getTracks().forEach((t) => t.stop());

    const blob = new Blob(chunks, { type: mimeType.split(";")[0] });
    if (!blob.size || blob.size >= file.size) return file;
    const ext = mimeType.startsWith("video/mp4") ? "mp4" : "webm";
    const name = file.name.replace(/\.[^.]+$/, "") + "." + ext;
    onProgress?.(100);
    return new File([blob], name, { type: blob.type });
  } catch {
    return file;
  } finally {
    video.pause();
    URL.revokeObjectURL(url);
  }
}
