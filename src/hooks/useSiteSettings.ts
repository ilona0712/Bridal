import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export const DEFAULT_LOGO_IMAGE_URL = "/maria_badari_logo.svg"
const SETTINGS_UPDATED = "site-settings-updated"

export interface SiteSettings {
  logo_text:          string
  logo_image_url:     string
  hero_image_url:     string
  hero_title:         string
  hero_subtitle:      string
  hero_cta_text:      string
  price_filter_min:   string
  price_filter_max:   string
  price_filter_step:  string
  signin_image_url:   string
  signup_image_url:   string
}

export const DEFAULTS: SiteSettings = {
  logo_text:          "Maria Badari",
  logo_image_url:     DEFAULT_LOGO_IMAGE_URL,
  hero_image_url:     "https://images.unsplash.com/photo-1761671613669-3b17b4a71bb9?auto=format&fit=crop&w=1080&q=80",
  hero_title:         "Find Your Perfect Dress",
  hero_subtitle:      "Chat with our intelligent consultant to design and customize your dream wedding dress. Every detail, every wish, brought to life.",
  hero_cta_text:      "Start Consultation",
  price_filter_min:   "0",
  price_filter_max:   "2000",
  price_filter_step:  "100",
  signin_image_url:   "",
  signup_image_url:   "",
}

let cache: SiteSettings | null = null

function normalizeSiteSettings(raw: SiteSettings): SiteSettings {
  return {
    ...raw,
    logo_image_url: (raw.logo_image_url ?? "").trim() || DEFAULT_LOGO_IMAGE_URL,
  }
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(cache ?? DEFAULTS)
  const [loading,  setLoading]  = useState(!cache)

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")

    if (error || !data) {
      console.error("Failed to load site settings:", error)
      setLoading(false)
      return
    }

    const mapped = { ...DEFAULTS }
    for (const row of data) {
      if (row.key in mapped) (mapped as any)[row.key] = row.value ?? ""
    }

    const normalized = normalizeSiteSettings(mapped)
    cache = normalized
    setSettings(normalized)
    setLoading(false)
  }

  useEffect(() => {
    if (cache) {
      setSettings(cache)
      setLoading(false)
      return
    }
    fetchSettings()
  }, [])

  // Re-fetch whenever any component calls invalidateCache()
  useEffect(() => {
    const handler = () => fetchSettings()
    window.addEventListener(SETTINGS_UPDATED, handler)
    return () => window.removeEventListener(SETTINGS_UPDATED, handler)
  }, [])

  const invalidateCache = () => {
    cache = null
    window.dispatchEvent(new Event(SETTINGS_UPDATED))
  }

  return { settings, loading, invalidateCache }
}
