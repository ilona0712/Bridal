type ProfilePersonalInfoSectionProps = {
  isEditing: boolean;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onDateOfBirthChange: (value: string) => void;
};

export default function ProfilePersonalInfoSection({
  isEditing,
  firstName,
  lastName,
  email,
  dateOfBirth,
  onFirstNameChange,
  onLastNameChange,
  onDateOfBirthChange,
}: ProfilePersonalInfoSectionProps) {
  return (
    <div>
      <h3 className="font-serif text-xl text-stone-800 mb-4">
        Personal Information
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-stone-700">First Name</label>
            {isEditing ? (
              <input
                type="text"
                value={firstName}
                onChange={(e) => onFirstNameChange(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800"
              />
            ) : (
              <p className="px-4 py-3 bg-stone-50/30 border border-stone-200/50 rounded-xl text-stone-800">
                {firstName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-stone-700">Last Name</label>
            {isEditing ? (
              <input
                type="text"
                value={lastName}
                onChange={(e) => onLastNameChange(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800"
              />
            ) : (
              <p className="px-4 py-3 bg-stone-50/30 border border-stone-200/50 rounded-xl text-stone-800">
                {lastName}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-stone-700">Email Address</label>
          <p className="px-4 py-3 bg-stone-50/30 border border-stone-200/50 rounded-xl text-stone-500">
            {email}{" "}
            <span className="text-xs text-stone-400">(Cannot be changed)</span>
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-stone-700">Date of Birth</label>
          {isEditing ? (
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => onDateOfBirthChange(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800"
            />
          ) : (
            <p className="px-4 py-3 bg-stone-50/30 border border-stone-200/50 rounded-xl text-stone-800">
              {dateOfBirth
                ? new Date(dateOfBirth).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Not provided"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
