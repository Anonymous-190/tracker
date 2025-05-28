import { supabase } from "@/lib/supabaseClient";

export default function SignInPage() {
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) {
      console.error("Google sign-in error:", error.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <button
        onClick={handleGoogleSignIn}
        className="btn-modern gradient-primary text-white shadow-glow h-12 px-6 rounded-xl"
      >
        Sign in with Google
      </button>
    </div>
  );
}
