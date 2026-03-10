import { useState, useRef, useEffect } from "react";
import { Sparkles, User, LogOut, Camera, Save } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { isAdmin } from "../auth";
import { supabase } from "../../lib/supabase";
import type { Dress } from "../types/dress";

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("Emma");
  const [lastName, setLastName] = useState("Johnson");
  const [email] = useState("emma@example.com");
  const [dressSize, setDressSize] = useState("8");
  const [dateOfBirth, setDateOfBirth] = useState("1995-06-15");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [favoriteDressIds, setFavoriteDressIds] = useState<string[]>([]);
  const [allDresses, setAllDresses] = useState<Dress[]>([]);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    setHasChanges(false);
    alert("Profile updated successfully!");
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      navigate("/login");
    }
  };

  const handleSizeChange = (newSize: string) => {
    setDressSize(newSize);
    setHasChanges(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100">
      <header className="border-b border-stone-200/50 bg-white/60 backdrop-blur-sm sticky top-0 z-40 w-full">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-stone-600" />
            </div>
            <div>
              <h1 className="font-serif text-xl text-stone-800">Bride Me Up</h1>
              <p className="text-xs text-stone-500">Your Dream Gown Awaits</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm text-stone-600 hover:text-stone-800 hidden sm:block"
            >
              Home
            </Link>
            <Link
              to="/gallery"
              className="text-sm text-stone-600 hover:text-stone-800"
            >
              Gallery
            </Link>
            <Link
              to="/isabella"
              className="text-sm text-stone-600 hover:text-stone-800"
            >
              Consultant
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-stone-200/50 hover:bg-stone-300/50 text-stone-700 rounded-full text-sm transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-stone-200 via-pink-100/40 to-stone-200"></div>

            <div className="relative px-8 sm:px-12">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 pb-6 border-b border-stone-200/50">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-stone-100">
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
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="font-serif text-3xl text-stone-800">
                    {firstName} {lastName}
                  </h2>
                  <p className="text-stone-500 mt-1">{email}</p>
                  {isAdmin && (
                    <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold bg-yellow-200 text-yellow-900 rounded-full">
                      Administrator
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-6 py-2 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 text-stone-700 rounded-full text-sm hover:shadow-lg transition-all"
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </button>
              </div>
            </div>

            <div className="px-8 sm:px-12 py-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-xl text-stone-800 mb-4">
                    Personal Information
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm text-stone-700">
                          First Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => {
                              setFirstName(e.target.value);
                              setHasChanges(true);
                            }}
                            className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800"
                          />
                        ) : (
                          <p className="px-4 py-3 bg-stone-50/30 border border-stone-200/50 rounded-xl text-stone-800">
                            {firstName}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-stone-700">
                          Last Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => {
                              setLastName(e.target.value);
                              setHasChanges(true);
                            }}
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
                      <label className="text-sm text-stone-700">
                        Email Address
                      </label>
                      <p className="px-4 py-3 bg-stone-50/30 border border-stone-200/50 rounded-xl text-stone-500">
                        {email}{" "}
                        <span className="text-xs text-stone-400">
                          (Cannot be changed)
                        </span>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-stone-700">
                        Date of Birth
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => {
                            setDateOfBirth(e.target.value);
                            setHasChanges(true);
                          }}
                          className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800"
                        />
                      ) : (
                        <p className="px-4 py-3 bg-stone-50/30 border border-stone-200/50 rounded-xl text-stone-800">
                          {new Date(dateOfBirth).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {!isAdmin && (
                  <div className="pt-6 border-t border-stone-200/50">
                    <h3 className="font-serif text-xl text-stone-800 mb-4">
                      Dress Preferences
                    </h3>
                    <div className="space-y-2">
                      <label className="text-sm text-stone-700">
                        Current Dress Size{" "}
                        <span className="text-pink-400/60">*</span>
                      </label>

                      {isEditing ? (
                        <select
                          value={dressSize}
                          onChange={(e) => handleSizeChange(e.target.value)}
                          className="w-full px-4 py-3 bg-stone-50/50 border border-pink-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 cursor-pointer"
                        >
                          <option value="0">0</option>
                          <option value="2">2</option>
                          <option value="4">4</option>
                          <option value="6">6</option>
                          <option value="8">8</option>
                          <option value="10">10</option>
                          <option value="12">12</option>
                          <option value="14">14</option>
                          <option value="16">16</option>
                          <option value="18">18</option>
                          <option value="20">20</option>
                          <option value="22">22</option>
                          <option value="24">24</option>
                          <option value="26">26</option>
                        </select>
                      ) : (
                        <div className="px-4 py-3 bg-gradient-to-r from-pink-50/50 via-stone-50/50 to-pink-50/50 border border-pink-200/50 rounded-xl">
                          <p className="text-stone-800">Size {dressSize}</p>
                          <p className="text-xs text-stone-500 mt-1">
                            This size will be used to filter gowns in the
                            gallery
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!isAdmin && (
                  <div className="pt-6 border-t border-stone-200/50">
                    <h3 className="font-serif text-xl text-stone-800 mb-4">
                      My Favorites
                    </h3>

                    {favoriteDresses.length === 0 ? (
                      <div className="px-4 py-6 bg-stone-50/30 border border-stone-200/50 rounded-xl text-stone-500">
                        You have not added any favorite dresses yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {favoriteDresses.map((dress) => (
                          <div
                            key={dress.id}
                            className="bg-white/70 border border-stone-200/50 rounded-2xl overflow-hidden shadow-sm"
                          >
                            <img
                              src={dress.image}
                              alt={dress.name}
                              className="w-full h-56 object-cover"
                            />
                            <div className="p-4">
                              <h4 className="font-serif text-lg text-stone-800">
                                {dress.name}
                              </h4>
                              <p className="text-sm text-stone-500 mt-1">
                                {dress.silhouette} • {dress.fabric}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {isEditing && hasChanges && (
                  <div className="pt-6">
                    <button
                      onClick={handleSave}
                      className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 text-stone-700 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-white/60 backdrop-blur-sm border border-stone-300/50 text-stone-700 hover:bg-stone-100/50 rounded-xl transition-all flex items-center gap-2 mx-auto"
            >
              <LogOut className="w-5 h-5" />
              Logout from Bride Me Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}