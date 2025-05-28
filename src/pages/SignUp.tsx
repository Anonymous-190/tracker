import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const OnboardUser = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
        return;
      }
      setUser(data.user);
    };

    getUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    const syncUser = async () => {
      const { error } = await supabase.from("users").upsert({
        id: user.id,
        email: user.email,
      });

      if (error) {
        console.error("Failed to insert/update user", error.message);
      }
    };

    syncUser();
  }, [user]);

  return null;
};

export default OnboardUser;
