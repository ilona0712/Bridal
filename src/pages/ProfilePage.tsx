import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "../auth";
import { useSession } from "../routes";
import { supabase } from "../../lib/supabase";
import type { Dress } from "../types/dress";

import ProfilePageHeader from "../components/profile/ProfilePageHeader";
import ProfileHeroSection from "../components/profile/ProfileHeroSection";
import ProfilePersonalInfoSection from "../components/profile/ProfilePersonalInfoSection";
import ProfileDressPreferencesSection from "../components/profile/ProfileDressPreferencesSection";
import ProfileFavoritesSection from "../components/profile/ProfileFavoritesSection";
import ProfileSaveActions from "../components/profile/ProfileSaveActions";

export default function ProfilePage() {
  const navigate = useNavigate();
  const session = useSession();
  const isAdmin = session?.user?.user_metadata?.role === "admin";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dressSize, setDressSize] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [favoriteDressIds, setFavoriteDressIds] = useState<string[]>([]);
  const [allDresses, setAllDresses] = useState<Dress[]>([]);

  const [profileLoading, setProfileLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user) {
        setProfileLoading(false);
        return;
      }

      const meta = session.user.user_metadata || {};

      setEmail(session.user.email || "");

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, dress_size, date_of_birth, profile_image_url")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Failed to load profile:", error);

        const fallbackFirstName = meta.first_name || "";
        const fallbackLastName = meta.last_name || "";

        setFirstName(fallbackFirstName);
        setLastName(fallbackLastName);
        setDressSize(meta.dress_size || "");
        setDateOfBirth(meta.date_of_birth || "");
        setProfileImage(null);
        setProfileLoading(false);
        return;
      }

      const profileRow = data as any;

      const fullName = profileRow?.full_name || meta.full_name || "";
      const nameParts = fullName.trim().split(" ").filter(Boolean);

      setFirstName(meta.first_name || nameParts[0] || "");
      setLastName(
        meta.last_name ||
          (nameParts.length > 1 ? nameParts.slice(1).join(" ") : ""),
      );
      setDressSize(profileRow?.dress_size || meta.dress_size || "");
      setDateOfBirth(profileRow?.date_of_birth || meta.date_of_birth || "");
      setProfileImage(profileRow?.profile_image_url || null);
      setProfileLoading(false);
    };

    loadProfile();
  }, [session]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem("favoriteDressIds");
    if (savedFavorites) {
      setFavoriteDressIds(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    const fetchDresses = async () => {
      const { data, error } = await supabase
        .from("dresses")
        .select(
          `
          id,
          name,
          silhouette,
          base_price,
          collections (
            name
          ),
          dress_images (
            image_url,
            is_primary
          )
        `,
        )
        .eq("status", "published");

      if (error) {
        console.error("Failed to load dresses for favorites:", error);
        return;
      }

      const mappedDresses: Dress[] = (data || []).map((dress: any) => {
        const primaryImage =
          dress.dress_images?.find((img: any) => img.is_primary)?.image_url ||
          dress.dress_images?.[0]?.image_url ||
          "/placeholder.png";

        const collectionName = Array.isArray(dress.collections)
          ? dress.collections[0]?.name
          : dress.collections?.name;

        return {
          id: dress.id,
          name: dress.name,
          collections: collectionName ? [collectionName] : ["Uncategorized"],
          price: Number(dress.base_price ?? 0),
          image: primaryImage,
          sizes: [36, 38, 40, 42],
          neckline: "V-Neck",
          silhouette: dress.silhouette || "A-Line",
          fabric: "Satin",
          trainLength: "Medium",
          sleeveStyle: "Sleeveless",
          isVisible: true,
        };
      });

      setAllDresses(mappedDresses);
    };

    fetchDresses();
  }, []);

  const favoriteDresses = allDresses.filter((dress) =>
    favoriteDressIds.includes(dress.id),
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user) return;

    setSaveError("");

    const fileExt = file.name.split(".").pop();
    const filePath = `${session.user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Failed to upload profile image:", uploadError);
      setSaveError(uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("profile-images")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: session.user.id,
        full_name: `${firstName} ${lastName}`.trim(),
        dress_size: dressSize || null,
        date_of_birth: dateOfBirth || null,
        role: session.user.user_metadata?.role || "customer",
        phone: "",
        country: "",
        profile_image_url: publicUrl,
      },
      { onConflict: "id" },
    );

    if (profileError) {
      console.error("Failed to save profile image url:", profileError);
      setSaveError(profileError.message);
      return;
    }

    setProfileImage(publicUrl);
    setHasChanges(false);
  };

  const handleSave = async () => {
    if (!session?.user) return;

    setSaveLoading(true);
    setSaveError("");

    const fullName = `${firstName} ${lastName}`.trim();

    const { error } = await supabase.from("profiles").upsert(
      {
        id: session.user.id,
        full_name: fullName,
        dress_size: dressSize || null,
        date_of_birth: dateOfBirth || null,
        role: session.user.user_metadata?.role || "customer",
        phone: "",
        country: "",
        profile_image_url: profileImage,
      },
      { onConflict: "id" },
    );
    setSaveLoading(false);

    if (error) {
      console.error("Failed to save profile:", error);
      setSaveError(error.message);
      return;
    }

    setIsEditing(false);
    setHasChanges(false);
    alert("Profile updated successfully!");
  };

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;

    await signOut();
    navigate("/login");
  };

  const handleSizeChange = (newSize: string) => {
    setDressSize(newSize);
    setHasChanges(true);
  };

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-400">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100">
      <ProfilePageHeader onLogout={handleLogout} />

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-stone-200 via-pink-100/40 to-stone-200" />

            <div className="relative px-8 sm:px-12">
              <ProfileHeroSection
                firstName={firstName}
                lastName={lastName}
                email={email}
                isAdmin={isAdmin}
                isEditing={isEditing}
                profileImage={profileImage}
                fileInputRef={fileInputRef}
                onEditToggle={handleEditToggle}
                onImageUpload={handleImageUpload}
              />
            </div>

            <div className="px-8 sm:px-12 py-8">
              <div className="space-y-6">
                <ProfilePersonalInfoSection
                  isEditing={isEditing}
                  firstName={firstName}
                  lastName={lastName}
                  email={email}
                  dateOfBirth={dateOfBirth}
                  onFirstNameChange={(value) => {
                    setFirstName(value);
                    setHasChanges(true);
                  }}
                  onLastNameChange={(value) => {
                    setLastName(value);
                    setHasChanges(true);
                  }}
                  onDateOfBirthChange={(value) => {
                    setDateOfBirth(value);
                    setHasChanges(true);
                  }}
                />

                {!isAdmin && (
                  <ProfileDressPreferencesSection
                    isEditing={isEditing}
                    dressSize={dressSize}
                    onDressSizeChange={handleSizeChange}
                  />
                )}

                {!isAdmin && (
                  <ProfileFavoritesSection favoriteDresses={favoriteDresses} />
                )}
                {saveError && (
                  <p className="text-sm text-red-500">{saveError}</p>
                )}
                {isEditing && hasChanges && (
                  <ProfileSaveActions
                    onSave={handleSave}
                    isLoading={saveLoading}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-white/60 backdrop-blur-sm border border-stone-300/50 text-stone-700 hover:bg-stone-100/50 rounded-xl transition-all flex items-center gap-2 mx-auto"
            >
              Logout from Bride Me Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
