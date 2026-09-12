/**
 * videoCompressor.ts
 * Utility untuk validasi batasan dan kompresi video di sisi client
 * sebelum diunggah ke backend Home Content Portofolio.
 */

export const MAX_VIDEO_FILE_SIZE_BYTES = 30 * 1024 * 1024; // 30 MB (Batas server Multer)
export const MAX_RAW_UPLOAD_BYTES = 100 * 1024 * 1024; // 100 MB batas awal sebelum dicoba kompresi
export const COMPRESS_THRESHOLD_BYTES = 2 * 1024 * 1024; // 2 MB (Video di atas 2MB dikompresi)

export const ALLOWED_VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov', 'mkv'];
export const ALLOWED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-matroska',
  'video/x-msvideo',
];

export interface VideoValidationResult {
  valid: boolean;
  error?: string;
  extension: string;
  sizeMB: number;
}

export interface CompressResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  ratioPercent: number; // e.g. 65 means 65% reduction
  wasCompressed: boolean;
}

/**
 * Format bytes ke ukuran yang mudah dibaca (KB / MB).
 */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 B';
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Validasi ekstensi dan batas ukuran file video.
 */
export function validateVideoFile(file: File): VideoValidationResult {
  const nameParts = file.name.split('.');
  const ext = (nameParts.length > 1 ? nameParts.pop() || '' : '').toLowerCase();
  const mime = file.type.toLowerCase();

  const isAllowedExt = ALLOWED_VIDEO_EXTENSIONS.includes(ext);
  const isAllowedMime =
    ALLOWED_VIDEO_MIME_TYPES.includes(mime) ||
    mime.startsWith('video/');

  if (!isAllowedExt && !isAllowedMime) {
    return {
      valid: false,
      error: `Format file "${ext || file.type}" tidak didukung. Harap gunakan format MP4, WebM, MOV, atau MKV.`,
      extension: ext,
      sizeMB: file.size / (1024 * 1024),
    };
  }

  if (file.size > MAX_RAW_UPLOAD_BYTES) {
    return {
      valid: false,
      error: `Ukuran file (${formatFileSize(file.size)}) terlalu besar. Maksimal file sebelum kompresi adalah 100 MB.`,
      extension: ext,
      sizeMB: file.size / (1024 * 1024),
    };
  }

  return {
    valid: true,
    extension: ext,
    sizeMB: file.size / (1024 * 1024),
  };
}

/**
 * Deteksi MIME type MediaRecorder terbaik yang didukung browser.
 */
function getSupportedMimeType(): string {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return 'video/webm';
  }

  const types = [
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp8',
    'video/webm',
  ];

  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) {
      return t;
    }
  }

  return 'video/webm';
}

/**
 * Kompresi video menggunakan Canvas dan MediaRecorder di browser:
 * - Downscale resolusi ke maksimal 1280x720 (720p HD)
 * - Re-encode dengan target bitrate 1.2 Mbps
 * - Mengurangi ukuran file video hingga 50% - 85%
 */
export async function compressVideo(
  file: File,
  onProgress?: (percent: number, statusText: string) => void
): Promise<CompressResult> {
  // Jika file sudah kecil (< 2MB), lewati kompresi
  if (file.size <= COMPRESS_THRESHOLD_BYTES) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      ratioPercent: 0,
      wasCompressed: false,
    };
  }

  // Jika browser tidak mendukung MediaRecorder / Canvas captureStream, fallback ke original
  if (
    typeof window === 'undefined' ||
    typeof MediaRecorder === 'undefined' ||
    typeof HTMLCanvasElement.prototype.captureStream === 'undefined'
  ) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      ratioPercent: 0,
      wasCompressed: false,
    };
  }

  return new Promise<CompressResult>((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    (video as any).crossOrigin = 'anonymous';

    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    const cleanup = () => {
      try {
        video.pause();
        video.removeAttribute('src');
        video.load();
        URL.revokeObjectURL(objectUrl);
      } catch (e) {
        // ignore
      }
    };

    video.onerror = () => {
      cleanup();
      // Fallback ke file asli jika video gagal diputar
      resolve({
        file,
        originalSize: file.size,
        compressedSize: file.size,
        ratioPercent: 0,
        wasCompressed: false,
      });
    };

    video.onloadedmetadata = () => {
      try {
        const origWidth = video.videoWidth || 1280;
        const origHeight = video.videoHeight || 720;
        const duration = video.duration || 10;

        // Tentukan resolusi target (maksimal 1280px pada sisi terpanjang)
        const maxDim = 1280;
        let targetWidth = origWidth;
        let targetHeight = origHeight;

        if (origWidth >= origHeight && origWidth > maxDim) {
          targetWidth = maxDim;
          targetHeight = Math.round((origHeight * maxDim) / origWidth);
        } else if (origHeight > origWidth && origHeight > maxDim) {
          targetHeight = maxDim;
          targetWidth = Math.round((origWidth * maxDim) / origHeight);
        }

        // Pastikan dimensi genap (dibutuhkan encoder video)
        targetWidth = targetWidth - (targetWidth % 2);
        targetHeight = targetHeight - (targetHeight % 2);

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d', { alpha: false });

        if (!ctx) {
          cleanup();
          resolve({
            file,
            originalSize: file.size,
            compressedSize: file.size,
            ratioPercent: 0,
            wasCompressed: false,
          });
          return;
        }

        const fps = 24;
        const canvasStream = canvas.captureStream(fps);

        // Sambungkan audio dari video jika ada
        try {
          const videoStream = (video as any).captureStream
            ? (video as any).captureStream()
            : (video as any).mozCaptureStream
            ? (video as any).mozCaptureStream()
            : null;

          if (videoStream) {
            const audioTracks = videoStream.getAudioTracks();
            if (audioTracks && audioTracks.length > 0) {
              canvasStream.addTrack(audioTracks[0]);
            }
          }
        } catch (e) {
          // Abaikan jika captureStream audio dibatasi
        }

        const mimeType = getSupportedMimeType();
        const targetBitrate = 1_200_000; // 1.2 Mbps (kualitas 720p sangat jernih dan hemat)

        let mediaRecorder: MediaRecorder;
        try {
          mediaRecorder = new MediaRecorder(canvasStream, {
            mimeType,
            videoBitsPerSecond: targetBitrate,
          });
        } catch (err) {
          mediaRecorder = new MediaRecorder(canvasStream);
        }

        const chunks: Blob[] = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          cleanup();
          const outputMime = mimeType.split(';')[0] || 'video/webm';
          const ext = outputMime.includes('mp4') ? 'mp4' : 'webm';
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const compressedBlob = new Blob(chunks, { type: outputMime });

          // Jika hasil kompresi ternyata lebih besar dari file asli, gunakan file asli
          if (compressedBlob.size >= file.size || compressedBlob.size === 0) {
            resolve({
              file,
              originalSize: file.size,
              compressedSize: file.size,
              ratioPercent: 0,
              wasCompressed: false,
            });
            return;
          }

          const compressedFile = new File(
            [compressedBlob],
            `${baseName}-compressed.${ext}`,
            { type: outputMime, lastModified: Date.now() }
          );

          const savedPercent = Math.round(
            ((file.size - compressedFile.size) / file.size) * 100
          );

          resolve({
            file: compressedFile,
            originalSize: file.size,
            compressedSize: compressedFile.size,
            ratioPercent: savedPercent,
            wasCompressed: true,
          });
        };

        // Mulai perekaman
        mediaRecorder.start(250);

        // Jalankan playback video dengan kecepatan 2.5x untuk mempercepat kompresi
        video.playbackRate = 2.5;

        let animationFrameId: number;
        const renderLoop = () => {
          if (!video.paused && !video.ended) {
            ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
            if (onProgress && duration > 0) {
              const pct = Math.min(
                95,
                Math.round((video.currentTime / duration) * 100)
              );
              onProgress(pct, `Mengompresi video: ${pct}%...`);
            }
            animationFrameId = requestAnimationFrame(renderLoop);
          }
        };

        video.onended = () => {
          cancelAnimationFrame(animationFrameId);
          // Gambar frame terakhir
          ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
          setTimeout(() => {
            if (mediaRecorder.state !== 'inactive') {
              mediaRecorder.stop();
            }
          }, 300);
        };

        video.play().then(() => {
          animationFrameId = requestAnimationFrame(renderLoop);
        }).catch(() => {
          // Jika autoplay diblokir, fallback
          cleanup();
          resolve({
            file,
            originalSize: file.size,
            compressedSize: file.size,
            ratioPercent: 0,
            wasCompressed: false,
          });
        });
      } catch (err) {
        cleanup();
        resolve({
          file,
          originalSize: file.size,
          compressedSize: file.size,
          ratioPercent: 0,
          wasCompressed: false,
        });
      }
    };
  });
}
