import Login from "@/src/components/auth/Login";

export const metadata = {
  title: "Login",
  description: "Sign in to your account",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <Login />;
}
