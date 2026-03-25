import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "../auth";
import { useSession } from "../routes";
import { supabase } from "../../lib/supabase";
import type { Dress } from "../types/dress";
import { mapDressRowToUiDress } from "../utils/common/mapDressRowToUiDress";
import type { GalleryDressRow } from "../utils/gallery/galleryDressHelper";

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
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
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
        .select("full_name, dress_size, date_of_birth, profile_image_url, phone, country")
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
      setPhone(profileRow?.phone || "");
      setCountry(profileRow?.country || "");
      setProfileLoading(false);
    };

    loadProfile();
  }, [session]);


  useEffect(() => {
    const loadFavoriteDresses = async () => {
      if (isAdmin) {
        setFavoriteDressIds([]);
        setAllDresses([]);
        return;
      }

      if (!session?.user) {
        const savedFavorites = localStorage.getItem("favoriteDressIds");
        const localFavoriteIds: string[] = savedFavorites
          ? JSON.parse(savedFavorites)
          : [];

        setFavoriteDressIds(localFavoriteIds);

        if (localFavoriteIds.length === 0) {
          setAllDresses([]);
          return;
        }

        const { data, error } = await supabase
          .from("dresses")
          .select(
            `
            id,
            name,
            base_price,
            status,
            dress_images (
              image_url,
              is_primary
            ),
            dress_collections (
              collections (
                name
              )
            ),
            dress_attribute_values (
              attribute_values (
                value_key,
                label,
                attributes (
                  key
                )
              )
            )
            `,
          )
          .in("id", localFavoriteIds)
          .returns<GalleryDressRow[]>();

        if (error) {
          console.error("Failed to load guest favorite dresses:", error);
          setAllDresses([]);
          return;
        }

        setAllDresses((data || []).map(mapDressRowToUiDress));
        return;
      }

      const { data: favoriteRows, error: favoritesError } = await supabase
        .from("favorite_dresses")
        .select("dress_id")
        .eq("user_id", session.user.id);

      if (favoritesError) {
        console.error("Failed to load favorite ids:", favoritesError);
        setFavoriteDressIds([]);
        setAllDresses([]);
        return;
      }

      const ids = (favoriteRows || []).map((row) => row.dress_id);
      setFavoriteDressIds(ids);

      if (ids.length === 0) {
        setAllDresses([]);
        return;
      }

      const { data: dressesData, error: dressesError } = await supabase
        .from("dresses")
        .select(
          `
          id,
          name,
          base_price,
          status,
          dress_images (
            image_url,
            is_primary
          ),
          dress_collections (
            collections (
              name
            )
          ),
          dress_attribute_values (
            attribute_values (
              value_key,
              label,
              attributes (
                key
              )
            )
          )
          `,
        )
        .in("id", ids)
        .returns<GalleryDressRow[]>();

      if (dressesError) {
        console.error("Failed to load favorite dresses:", dressesError);
        setAllDresses([]);
        return;
      }

      setAllDresses((dressesData || []).map(mapDressRowToUiDress));
    };

    loadFavoriteDresses();
  }, [session, isAdmin]);

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
        phone: phone || "",
        country: country || "",
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
        phone: phone || "",
        country: country || "",
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

  const handleRemoveFavorite = async (dressId: string) => {
    if (session?.user) {
      const { error } = await supabase
        .from("favorite_dresses")
        .delete()
        .eq("user_id", session.user.id)
        .eq("dress_id", dressId);
      if (error) { console.error("Failed to remove favorite:", error); return; }
    } else {
      const updated = favoriteDressIds.filter((id) => id !== dressId);
      localStorage.setItem("favoriteDressIds", JSON.stringify(updated));
    }
    setFavoriteDressIds((prev) => prev.filter((id) => id !== dressId));
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
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <ProfilePageHeader onLogout={handleLogout} />

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 dark:border-stone-700/50 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-stone-200 via-pink-100/40 to-stone-200 dark:from-stone-700 dark:via-pink-900/20 dark:to-stone-700" />

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
                  phone={phone}
                  country={country}
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
                  onPhoneChange={(value) => {
                    setPhone(value);
                    setHasChanges(true);
                  }}
                  onCountryChange={(value) => {
                    setCountry(value);
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
                  <ProfileFavoritesSection favoriteDresses={favoriteDresses} onRemoveFavorite={handleRemoveFavorite} />
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
              className="px-6 py-3 bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm border border-stone-300/50 dark:border-stone-600/50 text-stone-700 dark:text-stone-200 hover:bg-stone-100/50 dark:hover:bg-stone-700/50 rounded-xl transition-all flex items-center gap-2 mx-auto"
            >
              Logout from Bride Me Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
