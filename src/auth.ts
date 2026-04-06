import { supabase } from "../lib/supabase"

interface SignUpOptions {
  email:       string
  password:    string
  firstName:   string
  lastName:    string
  dressSize:   string
  dateOfBirth: string
}

export async function signUp({
  email, password, firstName, lastName, dressSize, dateOfBirth,
}: SignUpOptions) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name:     `${firstName} ${lastName}`.trim(),
        first_name:    firstName,
        last_name:     lastName,
        dress_size:    dressSize,
        date_of_birth: dateOfBirth || null,
      },
    },
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function ensureProfile(user: any) {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  if (existing) return

  const meta = user.user_metadata || {}

  const { error } = await supabase.from("profiles").upsert({
    id:            user.id,
    full_name:     meta.full_name     || "",
    phone:         "",
    country:       "",
    role:          "customer",
    dress_size:    meta.dress_size    || null,
    date_of_birth: meta.date_of_birth || null,
  }, { onConflict: "id", ignoreDuplicates: true })

  if (error) console.error("ensureProfile failed:", error.message)
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function signIn(email: string, password: string, rememberMe = false) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (!error) {
    if (!rememberMe) {
      sessionStorage.setItem("rememberMe", "false")
    } else {
      sessionStorage.removeItem("rememberMe")
    }
  }

  return { data, error }
}
