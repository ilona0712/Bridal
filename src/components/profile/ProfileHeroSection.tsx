import { Camera, User } from "lucide-react";
import type { ChangeEvent, RefObject } from "react";

type ProfileHeroSectionProps = {
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  isEditing: boolean;
  hasChanges: boolean;
  saveLoading: boolean;
  profileImage: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onEditToggle: () => void;
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
};

export default function ProfileHeroSection({
  firstName,
  lastName,
  email,
  isAdmin,
  isEditing,
  hasChanges,
  saveLoading,
  profileImage,
  fileInputRef,
  onEditToggle,
  onImageUpload,
  onSave,
}: ProfileHeroSectionProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 pb-6 border-b border-stone-200/50 dark:border-stone-700/50">
      <div className="relative">
        <div className="w-32 h-32 rounded-full border-4 border-white dark:border-stone-700 shadow-xl overflow-hidden bg-stone-100 dark:bg-stone-700">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300">
              <User className="w-16 h-16 text-stone-400" />
            </div>
          )}
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-br from-stone-300 via-pink-200/40 to-stone-300 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all"
        >
          <Camera className="w-5 h-5 text-stone-700" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onImageUpload}
          className="hidden"
        />
      </div>

      <div className="flex-1 text-center sm:text-left">
        <h2 className="font-serif text-3xl text-stone-800 dark:text-stone-100">
          {firstName} {lastName}
        </h2>
        <p className="text-stone-500 dark:text-stone-400 mt-1">{email}</p>

        {isAdmin && (
          <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold bg-yellow-200 text-yellow-900 rounded-full">
            Administrator
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {isEditing && hasChanges && (
          <button
            onClick={onSave}
            disabled={saveLoading}
            className="px-6 py-2 bg-gradient-to-r from-pink-300 via-pink-200/60 to-pink-300 text-stone-700 rounded-full text-sm hover:shadow-lg transition-all disabled:opacity-60"
          >
            {saveLoading ? "Saving..." : "Save Changes"}
          </button>
        )}
        <button
          onClick={onEditToggle}
          className="px-6 py-2 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 text-stone-700 rounded-full text-sm hover:shadow-lg transition-all"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>
    </div>
  );
}