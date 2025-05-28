import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useSupabaseWithToken } from "@/lib/useSupabaseClient";

const OnboardUser = () => {
  const { user } = useUser();
  const supabase = useSupabaseWithToken();

  useEffect(() => {
    if (!user) return;

    const syncUser = async () => {
      const { error } = await supabase
        .from("users")
        .upsert({
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
        });

      if (error) {
        console.error("Failed to insert/update user", error);
      }
    };

    syncUser();
  }, [user, supabase]);

  return null;
};

export default OnboardUser;
