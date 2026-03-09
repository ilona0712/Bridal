import { Send } from "lucide-react";

type OwnerChatInputProps = {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
};

export default function OwnerChatInput({
  inputValue,
  onInputChange,
  onSendMessage,
  onKeyDown,
}: OwnerChatInputProps) {
  return (
    <div className="border-t border-stone-200/50 p-6 bg-white/40">
      <div className="flex gap-3 items-end">
        <textarea
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type your message here..."
          rows={1}
          className="flex-1 bg-white/90 border border-stone-200 rounded-2xl px-5 py-4 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-200/50 focus:border-amber-300/50 resize-none"
        />
        <button
          type="button"
          onClick={onSendMessage}
          className="w-12 h-12 bg-gradient-to-br from-amber-100/60 via-amber-50/40 to-amber-100/60 border border-amber-200/50 rounded-full flex items-center justify-center hover:shadow-lg transition-all flex-shrink-0"
        >
          <Send className="w-5 h-5 text-stone-700" />
        </button>
      </div>

      <p className="text-xs text-stone-500 mt-3 text-center">
        Press Enter to send • Shift + Enter for new line
      </p>
    </div>
  );
}