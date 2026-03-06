import { Upload, User } from "lucide-react";

export default function ProfilePhotoUpload() {
  return (
    <>
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-24 h-24 bg-stone-100/70 border-2 border-dashed border-stone-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-stone-200/50 transition-colors">
            <div className="text-center">
              <User className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="text-xs text-stone-500 mt-1">Photo</p>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-br from-stone-300 via-pink-200/40 to-stone-300 rounded-full flex items-center justify-center cursor-pointer shadow-lg">
            <Upload className="w-4 h-4 text-stone-700" />
          </div>
        </div>
      </div>

      <p className="text-xs text-center text-stone-500">
        Optional: Upload your photo
      </p>
    </>
  );
}