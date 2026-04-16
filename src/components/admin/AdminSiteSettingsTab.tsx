import { useRef, useState } from "react";
import {
  Save,
  RefreshCw,
  Eye,
  Image,
  Type,
  AlignLeft,
  SlidersHorizontal,
  Upload,
  X,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useSiteSettings, DEFAULTS } from "../../hooks/useSiteSettings";
import type { SiteSettings } from "../../hooks/useSiteSettings";

// ── Reusable image upload field ──────────────────────────────────────────────
function ImageUploadField({
  value,
  onChange,
  storagePath,
  previewClass,
  hint,
}: {
  value: string;
  onChange: (url: string) => void;
  storagePath: string;
  previewClass: string;
  hint: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);

    const ext = file.name.split(".").pop();
    const fileName = `${storagePath}-${Date.now()}.${ext}`;

    const { data, error: uploadError } = await supabase.storage
      .from("dresses")
      .upload(`site/${fileName}`, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("dresses")
      .getPublicUrl(data.path);

    onChange(urlData.publicUrl);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="preview" className={previewClass} />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 w-6 h-6 bg-stone-800 rounded-full flex items-center justify-center hover:bg-stone-700 transition"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      ) : (
        <div className="w-full h-32 border-2 border-dashed border-stone-300 dark:border-stone-600 rounded-xl flex items-center justify-center text-stone-400 dark:text-stone-500 text-sm">
          No image uploaded
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-4 py-2 border border-stone-200 dark:border-stone-600 rounded-xl text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition disabled:opacity-50"
      >
        <Upload className="w-4 h-4" />
        {uploading ? "Uploading…" : "Upload Image"}
      </button>

      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && (
        <p className="text-xs text-stone-400 dark:text-stone-500">{hint}</p>
      )}
    </div>
  );
}

// ── Main tab ─────────────────────────────────────────────────────────────────
export default function AdminSiteSettingsTab() {
  const { settings, loading, invalidateCache } = useSiteSettings();
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);

  const current = form ?? settings;

  function handleChange(key: keyof SiteSettings, value: string) {
    setForm((prev) => ({ ...(prev ?? settings), [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);

    const updates = Object.entries(form).map(([key, value]) => ({
      key,
      value,
      label: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("site_settings")
      .upsert(updates, { onConflict: "key" });

    setSaving(false);

    if (error) {
      alert("Failed to save: " + error.message);
      return;
    }

    invalidateCache();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleReset() {
    setForm({ ...DEFAULTS });
    setSaved(false);
  }

  if (loading) {
    return (
      <div className="bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-3xl p-12 text-center border border-stone-200/50 dark:border-stone-700/50">
        <p className="text-stone-500 dark:text-stone-400">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 dark:border-stone-700/50 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif text-2xl text-stone-800 dark:text-stone-100">
              Site Settings
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              Customize your homepage content and branding — changes go live
              immediately.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setPreview(!preview)}
              className="flex items-center gap-2 px-4 py-2 border border-stone-200 dark:border-stone-600 text-stone-600 dark:text-stone-300 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700 transition-all text-sm"
            >
              <Eye className="w-4 h-4" />
              {preview ? "Hide Preview" : "Preview"}
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 border border-stone-200 dark:border-stone-600 text-stone-600 dark:text-stone-300 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700 transition-all text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Defaults
            </button>

            <button
              onClick={handleSave}
              disabled={saving || !form}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 text-stone-700 rounded-xl hover:shadow-lg transition-all text-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Type className="w-5 h-5 text-stone-400" />
              <h3 className="font-medium text-stone-700 dark:text-stone-300">
                Branding
              </h3>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-stone-600 dark:text-stone-300">
                Logo Text
              </label>
              <input
                type="text"
                value={current.logo_text}
                onChange={(e) => handleChange("logo_text", e.target.value)}
                placeholder="Bride Me Up"
                className="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 text-stone-800 dark:text-stone-100"
              />
              <p className="text-xs text-stone-400 dark:text-stone-500">
                Shown in the top-left navigation bar
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-stone-600 dark:text-stone-300">
                Logo Image
              </label>
              <ImageUploadField
                value={current.logo_image_url}
                onChange={(url) => handleChange("logo_image_url", url)}
                storagePath="logo"
                previewClass="w-16 h-16 rounded-full object-cover border border-stone-200 dark:border-stone-600"
                hint="Displayed as a circular avatar in the navigation bar"
              />
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <AlignLeft className="w-5 h-5 text-stone-400" />
              <h3 className="font-medium text-stone-700 dark:text-stone-300">
                Hero Section
              </h3>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-stone-600 dark:text-stone-300">
                Hero Title
              </label>
              <input
                type="text"
                value={current.hero_title}
                onChange={(e) => handleChange("hero_title", e.target.value)}
                placeholder="Find Your Perfect Dress"
                className="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 text-stone-800 dark:text-stone-100"
              />
              <p className="text-xs text-stone-400 dark:text-stone-500">
                Large headline on the homepage
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-stone-600 dark:text-stone-300">
                Hero Subtitle
              </label>
              <textarea
                value={current.hero_subtitle}
                onChange={(e) => handleChange("hero_subtitle", e.target.value)}
                rows={3}
                placeholder="Chat with our intelligent consultant..."
                className="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 text-stone-800 dark:text-stone-100 resize-none"
              />
              <p className="text-xs text-stone-400 dark:text-stone-500">
                Paragraph text under the headline
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-stone-600 dark:text-stone-300">
                CTA Button Text
              </label>
              <input
                type="text"
                value={current.hero_cta_text}
                onChange={(e) => handleChange("hero_cta_text", e.target.value)}
                placeholder="Start Consultation"
                className="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 text-stone-800 dark:text-stone-100"
              />
              <p className="text-xs text-stone-400 dark:text-stone-500">
                Text on the main action button
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-stone-400" />
            <h3 className="font-medium text-stone-700 dark:text-stone-300">
              Hero Image
            </h3>
          </div>

          <ImageUploadField
            value={current.hero_image_url}
            onChange={(url) => handleChange("hero_image_url", url)}
            storagePath="hero"
            previewClass="w-full aspect-[4/3] rounded-xl object-cover border border-stone-200 dark:border-stone-600"
            hint="Large background image shown on the homepage hero section"
          />
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-stone-400" />
            <h3 className="font-medium text-stone-700 dark:text-stone-300">
              Gallery Price Filter
            </h3>
          </div>

          <p className="text-xs text-stone-400 dark:text-stone-500 -mt-2">
            Sets the bounds and step of the price range slider in the gallery.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-stone-600 dark:text-stone-300">
                Min Price ($)
              </label>
              <input
                type="number"
                value={current.price_filter_min}
                onChange={(e) =>
                  handleChange("price_filter_min", e.target.value)
                }
                placeholder="0"
                className="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 text-stone-800 dark:text-stone-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-stone-600 dark:text-stone-300">
                Max Price ($)
              </label>
              <input
                type="number"
                value={current.price_filter_max}
                onChange={(e) =>
                  handleChange("price_filter_max", e.target.value)
                }
                placeholder="2000"
                className="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 text-stone-800 dark:text-stone-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-stone-600 dark:text-stone-300">
                Step ($)
              </label>
              <input
                type="number"
                value={current.price_filter_step}
                onChange={(e) =>
                  handleChange("price_filter_step", e.target.value)
                }
                placeholder="100"
                className="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 text-stone-800 dark:text-stone-100"
              />
            </div>
          </div>
        </div>
      </div>

      {preview && (
        <div className="bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 dark:border-stone-700/50 p-8">
          <h3 className="font-medium text-stone-700 dark:text-stone-300 mb-6 flex items-center gap-2">
            <Eye className="w-4 h-4" /> Live Preview
          </h3>

          <div className="border border-stone-200 dark:border-stone-700 rounded-2xl overflow-hidden">
            <div className="bg-white/80 dark:bg-stone-800/80 border-b border-stone-200/50 dark:border-stone-700/50 px-6 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-full overflow-hidden flex items-center justify-center">
                {current.logo_image_url ? (
                  <img
                    src={current.logo_image_url}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs">✦</span>
                )}
              </div>

              <div>
                <div className="font-serif text-sm text-stone-800 dark:text-stone-100">
                  {current.logo_text}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2">
              <div className="p-8 space-y-3 bg-gradient-to-br from-stone-50 to-stone-100/50 dark:from-stone-800 dark:to-stone-900/50">
                <div className="text-xs text-stone-500 bg-stone-100 inline-block px-3 py-1 rounded-full">
                  ✨ AI-Powered Bridal Consultant
                </div>
                <h2 className="font-serif text-2xl text-stone-800 dark:text-stone-100 leading-tight">
                  {current.hero_title}
                </h2>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {current.hero_subtitle}
                </p>
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 text-stone-700 rounded-xl text-xs">
                  {current.hero_cta_text}
                </div>
              </div>

              <div className="overflow-hidden">
                {current.hero_image_url && (
                  <img
                    src={current.hero_image_url}
                    alt="Hero"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>

          <p className="text-xs text-stone-400 dark:text-stone-500 text-center mt-4">
            Approximate preview — actual homepage may look slightly different.
          </p>
        </div>
      )}
    </div>
  );
}
