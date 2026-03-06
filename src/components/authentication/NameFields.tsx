type NameFieldsProps = {
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
};

export default function NameFields({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
}: NameFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm text-stone-700">
          First Name <span className="text-pink-400/60">*</span>
        </label>
        <input
          type="text"
          placeholder="Emma"
          value={firstName}
          onChange={(e) => onFirstNameChange(e.target.value)}
          className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 placeholder:text-stone-400"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-stone-700">
          Last Name <span className="text-pink-400/60">*</span>
        </label>
        <input
          type="text"
          placeholder="Johnson"
          value={lastName}
          onChange={(e) => onLastNameChange(e.target.value)}
          className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 placeholder:text-stone-400"
        />
      </div>
    </div>
  );
}   