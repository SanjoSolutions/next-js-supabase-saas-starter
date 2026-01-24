const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = "http://127.0.0.1:54321"
const supabaseKey = "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugAuth() {
  console.log("Attempting to sign in with test@example.com / password123...")
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "test@example.com",
    password: "password123",
  })

  if (error) {
    console.error("Login failed:", error.message)
    process.exit(1)
  }

  console.log("Login successful! User ID:", data.user.id)
  process.exit(0)
}

debugAuth()
