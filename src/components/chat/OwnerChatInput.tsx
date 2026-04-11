import { Mic, Send, Smile, Square, Paperclip, X, Camera, Plus } from "lucide-react";
import VoiceRecorderWaveform from "./VoiceRecorderWaveform";
import { useRef, useState } from "react";

type OwnerChatInputProps = {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onToggleEmoji: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSendImage: (file: File) => void;
  isRecording: boolean;
  recordingStream: MediaStream | null;
};

export default function OwnerChatInput({
  inputValue,
  onInputChange,
  onSendMessage,
  onKeyDown,
  onToggleEmoji,
  onStartRecording,
  onStopRecording,
  onSendImage,
  isRecording,
  recordingStream,
}: OwnerChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setPreviewFiles((prev) => [...prev, ...files]);
    setPreviewUrls((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendImages = () => {
    previewFiles.forEach((f) => onSendImage(f));
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewFiles([]);
    setPreviewUrls([]);
  };

  const handleRemovePreview = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      alert("Unable to access camera.");
    }
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });
      const url = URL.createObjectURL(file);
      setPreviewFiles((prev) => [...prev, file]);
      setPreviewUrls((prev) => [...prev, url]);
      closeCamera();
    }, "image/jpeg");
  };

  return (
    <div className="border-t border-stone-200/50 dark:border-stone-700/50 p-4 sm:p-6 bg-white/40 dark:bg-stone-800/40">

      {/* Camera modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl p-4 space-y-3 w-full max-w-md mx-4">
            <video ref={videoRef} className="w-full rounded-xl" autoPlay playsInline muted />
            <div className="flex gap-3">
              <button type="button" onClick={capturePhoto}
                className="flex-1 py-3 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-700 transition-all">
                📸 Capture
              </button>
              <button type="button" onClick={closeCamera}
                className="flex-1 py-3 bg-stone-100 text-stone-700 rounded-xl text-sm font-medium hover:bg-stone-200 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image previews */}
      {previewUrls.length > 0 && (
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {previewUrls.map((url, i) => (
            <div key={i} className="relative flex-shrink-0">
              <img src={url} alt={`preview ${i + 1}`}
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-stone-200 dark:border-stone-600" />
              <button type="button" onClick={() => handleRemovePreview(i)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-stone-800 rounded-full flex items-center justify-center">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1 sm:gap-3 items-end">

        {/* Mobile: single + button with popup */}
        <div className="relative sm:hidden flex-shrink-0">
          <button type="button" onClick={() => setShowAttachMenu((v) => !v)}
            className="w-10 h-10 bg-white/90 dark:bg-stone-700/90 border border-stone-200 dark:border-stone-600 rounded-full flex items-center justify-center hover:shadow-lg transition-all"
            aria-label="More options">
            <Plus className="w-4 h-4 text-stone-700 dark:text-stone-300" />
          </button>

          {showAttachMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowAttachMenu(false)} />
              <div className="absolute bottom-full left-0 mb-2 z-20 flex gap-2 bg-white/95 dark:bg-stone-800/95 border border-stone-200 dark:border-stone-700 rounded-2xl p-2 shadow-xl">
                <button type="button" onClick={() => { onToggleEmoji(); setShowAttachMenu(false); }}
                  className="w-10 h-10 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-full flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-600 transition-all"
                  aria-label="Open emoji picker">
                  <Smile className="w-4 h-4 text-stone-700 dark:text-stone-300" />
                </button>
                <button type="button" onClick={() => { fileInputRef.current?.click(); setShowAttachMenu(false); }}
                  className="w-10 h-10 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-full flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-600 transition-all"
                  aria-label="Attach images">
                  <Paperclip className="w-4 h-4 text-stone-700 dark:text-stone-300" />
                </button>
                <button type="button" onClick={() => { openCamera(); setShowAttachMenu(false); }}
                  className="w-10 h-10 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-full flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-600 transition-all"
                  aria-label="Take photo">
                  <Camera className="w-4 h-4 text-stone-700 dark:text-stone-300" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Desktop: individual buttons */}
        <button type="button" onClick={onToggleEmoji}
          className="hidden sm:flex w-12 h-12 bg-white/90 dark:bg-stone-700/90 border border-stone-200 dark:border-stone-600 rounded-full items-center justify-center hover:shadow-lg transition-all flex-shrink-0"
          aria-label="Open emoji picker">
          <Smile className="w-5 h-5 text-stone-700 dark:text-stone-300" />
        </button>

        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />

        <button type="button" onClick={() => fileInputRef.current?.click()}
          className="hidden sm:flex w-12 h-12 bg-white/90 dark:bg-stone-700/90 border border-stone-200 dark:border-stone-600 rounded-full items-center justify-center hover:shadow-lg transition-all flex-shrink-0"
          aria-label="Attach images">
          <Paperclip className="w-5 h-5 text-stone-700 dark:text-stone-300" />
        </button>

        <button type="button" onClick={openCamera}
          className="hidden sm:flex w-12 h-12 bg-white/90 dark:bg-stone-700/90 border border-stone-200 dark:border-stone-600 rounded-full items-center justify-center hover:shadow-lg transition-all flex-shrink-0"
          aria-label="Take photo">
          <Camera className="w-5 h-5 text-stone-700 dark:text-stone-300" />
        </button>

        {!isRecording ? (
          <textarea value={inputValue} onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown} placeholder="Type your message..." rows={1}
            className="flex-1 min-w-0 bg-white/90 dark:bg-stone-700/90 border border-stone-200 dark:border-stone-600 rounded-2xl px-3 sm:px-5 py-3 sm:py-4 text-sm text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-200/50 focus:border-amber-300/50 resize-none" />
        ) : (
          <div className="flex-1 min-w-0 h-[48px] sm:h-[56px] bg-white/90 dark:bg-stone-700/90 border border-stone-200 dark:border-stone-600 rounded-2xl px-4 flex items-center gap-3">
            <VoiceRecorderWaveform stream={recordingStream} isRecording={isRecording} />
            <span className="text-sm text-stone-500 dark:text-stone-400">Recording...</span>
          </div>
        )}

        {!isRecording ? (
          <button type="button" onClick={onStartRecording}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 dark:bg-stone-700/90 border border-stone-200 dark:border-stone-600 rounded-full flex items-center justify-center hover:shadow-lg transition-all flex-shrink-0"
            aria-label="Start recording">
            <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-stone-700 dark:text-stone-300" />
          </button>
        ) : (
          <button type="button" onClick={onStopRecording}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 border border-red-200 rounded-full flex items-center justify-center hover:shadow-lg transition-all flex-shrink-0"
            aria-label="Stop recording">
            <Square className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
          </button>
        )}

        {!isRecording && (
          <button type="button"
            onClick={previewFiles.length > 0 ? handleSendImages : onSendMessage}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-100/60 via-amber-50/40 to-amber-100/60 border border-amber-200/50 rounded-full flex items-center justify-center hover:shadow-lg transition-all flex-shrink-0"
            aria-label="Send">
            <Send className="w-4 h-4 sm:w-5 sm:h-5 text-stone-700 dark:text-stone-300" />
          </button>
        )}
      </div>

      <p className="text-xs text-stone-500 dark:text-stone-400 mt-3 text-center">
        Press Enter to send • Shift + Enter for new line
      </p>

      {isRecording && (
        <p className="text-xs text-red-500 mt-2 text-center">Recording voice message...</p>
      )}
    </div>
  );
}
