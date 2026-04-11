const dressSizes = ["32", "34", "36", "38", "40", "42", "44", "46"];

type ProfileDressPreferencesSectionProps = {
  isEditing: boolean;
  dressSize: string;
  onDressSizeChange: (value: string) => void;
};

export default function ProfileDressPreferencesSection({
  isEditing,
  dressSize,
  onDressSizeChange,
}: ProfileDressPreferencesSectionProps) {
  return (
    <div className="pt-6 border-t border-stone-200/50 dark:border-stone-700/50">
      <h3 className="font-serif text-xl text-stone-800 dark:text-stone-100 mb-4">
        Dress Preferences
      </h3>

      <div className="space-y-2">
        <label className="text-sm text-stone-700 dark:text-stone-300">
          Current Dress Size <span className="text-pink-400/60">*</span>
        </label>

        {isEditing ? (
          <select
            value={dressSize}
            onChange={(e) => onDressSizeChange(e.target.value)}
            className="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-700/50 border border-pink-300/50 dark:border-stone-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 dark:text-stone-100 cursor-pointer"
          >
            {dressSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        ) : (
          <div className="px-4 py-3 bg-gradient-to-r from-pink-50/50 via-stone-50/50 to-pink-50/50 dark:from-pink-900/20 dark:via-stone-800/50 dark:to-pink-900/20 border border-pink-200/50 dark:border-stone-600/50 rounded-xl">
            <p className="text-stone-800 dark:text-stone-100">Size {dressSize}</p>
          </div>
        )}
      </div>
    </div>
  );
}
