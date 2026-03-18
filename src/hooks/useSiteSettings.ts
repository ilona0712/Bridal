import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export interface SiteSettings {
  logo_text:      string
  logo_tagline:   string
  hero_image_url: string
  hero_title:     string
  hero_subtitle:  string
  hero_cta_text:  string
}

export const DEFAULTS: SiteSettings = {
  logo_text:      "Bride Me Up",
  logo_tagline:   "Your Dream Gown Awaits",
  hero_image_url: "https://images.unsplash.com/photo-1761671613669-3b17b4a71bb9?auto=format&fit=crop&w=1080&q=80",
  hero_title:     "Find Your Perfect Dress",
  hero_subtitle:  "Chat with our intelligent consultant to design and customize your dream wedding dress. Every detail, every wish, brought to life.",
  hero_cta_text:  "Start Consultation",
}

let cache: SiteSettings | null = null

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(cache ?? DEFAULTS)
  const [loading,  setLoading]  = useState(!cache)

  useEffect(() => {
    if (cache) return

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
        if (row.key in mapped) (mapped as any)[row.key] = row.value
      }

      cache = mapped
      setSettings(mapped)
      setLoading(false)
    }

    fetchSettings()
  }, [])

  const invalidateCache = () => { cache = null }
  return { settings, loading, invalidateCache }
}