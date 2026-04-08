import { useEffect, useState } from "react";
import { X, Heart, User } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { mapDressRowToUiDress } from "../../utils/common/mapDressRowToUiDress";
import type { BaseDressRow } from "../../utils/common/dressRowTypes";
import type { Dress } from "../../types/dress";

type Profile = {
  full_name: string | null;
  phone: string | null;
  country: string | null;
  profile_image_url: string | null;
  dress_size: string | null;
  date_of_birth: string | null;
};

type CustomerProfilePanelProps = {
  customerId: string;
  onClose: () => void;
};

const DRESS_SELECT = `
  id, name, base_price, status,
  dress_images ( image_url, is_primary ),
  dress_collections ( collections ( name ) ),
  dress_attribute_values (
    attribute_values ( value_key, label, attributes ( key ) )
  )
`;

export default function CustomerProfilePanel({
  customerId,
  onClose,
}: CustomerProfilePanelProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Dress[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: profileData }, { data: emailData }] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "full_name, phone, country, profile_image_url, dress_size, date_of_birth",
          )
          .eq("id", customerId)
          .single(),
        supabase.rpc("get_user_email", { user_id: customerId }),
      ]);

      setProfile(profileData ?? null);
      setEmail(emailData ?? null);

      // Step 1: get dress IDs from favorites
      const { data: favRows } = await supabase
        .from("favorite_dresses")
        .select("dress_id")
        .eq("user_id", customerId);

      const dressIds = (favRows ?? []).map(
        (r: { dress_id: string }) => r.dress_id,
      );

      if (dressIds.length > 0) {
        const { data: dressData, error } = await supabase
          .from("dresses")
          .select(DRESS_SELECT)
          .in("id", dressIds)
          .returns<BaseDressRow[]>();

        if (error) {
          console.error("Failed to fetch favorite dresses:", error);
        } else {
          setFavorites((dressData ?? []).map(mapDressRowToUiDress));
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [customerId]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — full screen on mobile, side drawer on sm+ */}
      <div className="fixed inset-0 sm:inset-auto sm:right-0 sm:top-0 sm:h-full sm:w-80 z-50 bg-white dark:bg-stone-900 shadow-2xl sm:border-l border-stone-200 dark:border-stone-700 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-stone-200 via-pink-100/30 to-stone-200 dark:from-stone-800 dark:via-stone-700 dark:to-stone-800 px-5 py-4 border-b border-stone-200/50 dark:border-stone-700/50 flex items-center justify-between z-10">
          <h2 className="font-serif text-lg text-stone-800 dark:text-stone-100">
            Customer Profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/60 dark:bg-stone-700/60 hover:bg-white dark:hover:bg-stone-600 transition-colors"
          >
            <X className="w-4 h-4 text-stone-600 dark:text-stone-300" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-stone-400 dark:text-stone-500 text-sm">
            Loading...
          </div>
        ) : (
          <div className="p-5 space-y-6">
            {/* Avatar + name */}
            <div className="flex flex-col items-center text-center gap-3 pt-2">
              <div className="w-24 h-24 rounded-full bg-stone-100 dark:bg-stone-700 border-2 border-stone-200 dark:border-stone-600 overflow-hidden flex items-center justify-center">
                {profile?.profile_image_url ? (
                  <img
                    src={profile.profile_image_url}
                    alt={profile.full_name ?? "Customer"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-stone-400 dark:text-stone-500" />
                )}
              </div>
              <div>
                <h3 className="font-serif text-2xl text-stone-800 dark:text-stone-100">
                  {profile?.full_name ?? "Unknown"}
                </h3>
                {email && (
                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                    {email}
                  </p>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="rounded-2xl border border-stone-100 dark:border-stone-800 divide-y divide-stone-100 dark:divide-stone-800">
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                  Email
                </span>
                <span className="text-sm text-stone-700 dark:text-stone-300">
                  {email ?? "—"}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                  Phone
                </span>
                <span className="text-sm text-stone-700 dark:text-stone-300">
                  {profile?.phone ?? "—"}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                  Size
                </span>
                <span className="text-sm text-stone-700 dark:text-stone-300">
                  {profile?.dress_size ?? "—"}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                  Country
                </span>
                <span className="text-sm text-stone-700 dark:text-stone-300">
                  {profile?.country ?? "—"}
                </span>
              </div>
              {profile?.date_of_birth && (
                <div className="flex justify-between items-center px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                    Date of Birth
                  </span>
                  <span className="text-sm text-stone-700 dark:text-stone-300">
                    {profile.date_of_birth}
                  </span>
                </div>
              )}
            </div>

            {/* Favorites */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                <h4 className="font-serif text-base text-stone-800 dark:text-stone-100">
                  Favorite Dresses
                  {favorites.length > 0 && (
                    <span className="ml-2 text-sm text-stone-400 font-sans">
                      ({favorites.length})
                    </span>
                  )}
                </h4>
              </div>

              {favorites.length === 0 ? (
                <p className="text-sm text-stone-400 dark:text-stone-500 px-1">
                  No favorites yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {favorites.map((dress) => {
                    const isExpanded = expandedId === dress.id;
                    return (
                      <div
                        key={dress.id}
                        className="rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 cursor-pointer"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : dress.id)
                        }
                      >
                        <div className="flex gap-2 p-2 sm:gap-3 sm:p-3">
                          <img
                            src={dress.image}
                            alt={dress.name}
                            className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-xl flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0 py-1 space-y-1.5">
                            <p className="font-serif text-base text-stone-800 dark:text-stone-100 leading-tight">
                              {dress.name}
                            </p>
                            {dress.collections.length > 0 && (
                              <span className="inline-block text-[10px] px-2 py-0.5 bg-stone-200/70 dark:bg-stone-700 text-stone-600 dark:text-stone-300 rounded-full">
                                {dress.collections[0]}
                              </span>
                            )}
                            {dress.price !== null &&
                            dress.price !== undefined ? (
                              <p className="text-2xl font-serif">
                                ${dress.price.toLocaleString()}
                              </p>
                            ) : (
                              <p className="text-2xl font-serif">Custom</p>
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="border-t border-stone-200 dark:border-stone-700 px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2">
                            {dress.neckline && (
                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500">
                                  Neckline
                                </p>
                                <p className="text-sm text-stone-700 dark:text-stone-300">
                                  {dress.neckline}
                                </p>
                              </div>
                            )}
                            {dress.silhouette && (
                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500">
                                  Silhouette
                                </p>
                                <p className="text-sm text-stone-700 dark:text-stone-300">
                                  {dress.silhouette}
                                </p>
                              </div>
                            )}
                            {dress.fabric && (
                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500">
                                  Fabric
                                </p>
                                <p className="text-sm text-stone-700 dark:text-stone-300">
                                  {dress.fabric}
                                </p>
                              </div>
                            )}
                            {dress.trainLength && (
                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500">
                                  Train
                                </p>
                                <p className="text-sm text-stone-700 dark:text-stone-300">
                                  {dress.trainLength}
                                </p>
                              </div>
                            )}
                            {dress.sleeveStyle && (
                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500">
                                  Sleeves
                                </p>
                                <p className="text-sm text-stone-700 dark:text-stone-300">
                                  {dress.sleeveStyle}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
