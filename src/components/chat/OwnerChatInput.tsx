import { Mic, Send, Smile, Square, Paperclip, X, Camera } from "lucide-react";
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
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSendImage = () => {
    if (!previewFile) return;
    onSendImage(previewFile);
    setPreviewFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCancelPreview = () => {
    setPreviewFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      setPreviewFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      closeCamera();
    }, "image/jpeg");
  };

  return (
    <div className="border-t border-stone-200/50 dark:border-stone-700/50 p-4 sm:p-6 bg-white/40 dark:bg-stone-800/40">

      {/* Camera modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl p-4 space-y-3 w-full max-w-md mx-4">
            <video
              ref={videoRef}
              className="w-full rounded-xl"
              autoPlay
              playsInline
              muted
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={capturePhoto}
                className="flex-1 py-3 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-700 transition-all"
              >
                📸 Capture
              </button>
              <button
                type="button"
                onClick={closeCamera}
                className="flex-1 py-3 bg-stone-100 text-stone-700 rounded-xl text-sm font-medium hover:bg-stone-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image preview */}
      {previewUrl && (
        <div className="mb-3 relative w-24 sm:w-32">
          <img
            src={previewUrl}
            alt="preview"
            className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl border border-stone-200"
          />
          <button
            type="button"
            onClick={handleCancelPreview}
            className="absolute -top-2 -right-2 w-6 h-6 bg-stone-800 rounded-full flex items-center justify-center"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      )}

      <div className="flex gap-1 sm:gap-3 items-end">
        <button
          type="button"
          onClick={onToggleEmoji}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 dark:bg-stone-700/90 border border-stone-200 dark:border-stone-600 rounded-full flex items-center justify-center hover:shadow-lg transition-all flex-shrink-0"
          aria-label="Open emoji picker"
        >
          <Smile className="w-4 h-4 sm:w-5 sm:h-5 text-stone-700" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 dark:bg-stone-700/90 border border-stone-200 dark:border-stone-600 rounded-full flex items-center justify-center hover:shadow-lg transition-all flex-shrink-0"
          aria-label="Attach image"
        >
          <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-stone-700" />
        </button>

        <button
          type="button"
          onClick={openCamera}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 dark:bg-stone-700/90 border border-stone-200 dark:border-stone-600 rounded-full flex items-center justify-center hover:shadow-lg transition-all flex-shrink-0"
          aria-label="Take photo"
        >
          <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-stone-700" />
        </button>

        {!isRecording ? (
          <textarea
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 min-w-0 bg-white/90 dark:bg-stone-700/90 border border-stone-200 dark:border-stone-600 rounded-2xl px-3 sm:px-5 py-3 sm:py-4 text-sm text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-200/50 focus:border-amber-300/50 resize-none"
          />
        ) : (
          <div className="flex-1 min-w-0 h-[48px] sm:h-[56px] bg-white/90 dark:bg-stone-700/90 border border-stone-200 dark:border-stone-600 rounded-2xl px-4 flex items-center gap-3">
            <VoiceRecorderWaveform
              stream={recordingStream}
              isRecording={isRecording}
            />
            <span className="text-sm text-stone-500 dark:text-stone-400">Recording...</span>
          </div>
        )}

        {!isRecording ? (
          <button
            type="button"
            onClick={onStartRecording}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 dark:bg-stone-700/90 border border-stone-200 dark:border-stone-600 rounded-full flex items-center justify-center hover:shadow-lg transition-all flex-shrink-0"
            aria-label="Start recording"
          >
            <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-stone-700" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onStopRecording}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 border border-red-200 rounded-full flex items-center justify-center hover:shadow-lg transition-all flex-shrink-0"
            aria-label="Stop recording"
          >
            <Square className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
          </button>
        )}

        {!isRecording && (
          <button
            type="button"
            onClick={previewFile ? handleSendImage : onSendMessage}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-100/60 via-amber-50/40 to-amber-100/60 border border-amber-200/50 rounded-full flex items-center justify-center hover:shadow-lg transition-all flex-shrink-0"
            aria-label="Send"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5 text-stone-700" />
          </button>
        )}
      </div>

      <p className="text-xs text-stone-500 dark:text-stone-400 mt-3 text-center">
        Press Enter to send • Shift + Enter for new line
      </p>

      {isRecording && (
        <p className="text-xs text-red-500 mt-2 text-center">
          Recording voice message...
        </p>
      )}
    </div>
  );
}