import { useMemo } from "react";
import { useAuth } from "@clerk/clerk-react";
import { createClient } from "@supabase/supabase-js";

export const useSupabaseWithToken = () => {
  const { getToken } = useAuth();

  const supabase = useMemo(() => {
    return createClient(
      import.meta.env.VITE_SUPABASE_URL!,
      import.meta.env.VITE_SUPABASE_ANON_KEY!,
      {
        global: {
          fetch: async (input, init) => {
            const token = await getToken();
            init = init || {};
            init.headers = {
              ...init.headers,
              Authorization: `Bearer ${token}`,
            };
            return fetch(input, init);
          },
        },
      }
    );
  }, [getToken]);

  return supabase;
};
