// Stub server client for development
export function createServerSupabaseClient() {
  return {
    auth: {
      getUser: async () => ({
        data: { user: null },
        error: null
      })
    }
  }
}

// Fallback mock client for when Supabase is not configured
export function createMockSupabaseClient() {
  return {
    auth: {
      getUser: async () => ({
        data: { user: null },
        error: null
      })
    }
  }
}