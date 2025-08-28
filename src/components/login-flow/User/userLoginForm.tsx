"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/service/auth-service";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginSuccess } from "@/store/slice/auth/authSlice";
import { useToast } from "@/components/ui/toast";

const sidebarVisibilityConfig = {
  'Fulfillment-Admin': {
    hide: [""],
    show: [""],
  },
  'Fullfillment-staff': {
    hide: [""],
    show: [],
  },
  // Add more roles here as needed
};

export function UserLoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const auth = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  /**
   * Handles the form submission for the login form.
   * @param e The React FormEvent
   * @returns A Promise that resolves if the login is successful, rejects if not
   */
 const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
): Promise<void> => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  try {
    const response = await loginUser({ email, password });
    if (response.data) {
      const { token, user } = response.data;
      const { role, last_login, _id } = user;

      // Convert role to lowercase for case-insensitive comparison
      const userRole = typeof role === 'string' ? role.toLowerCase() : role;
      const adminRoles = ["fulfillment-admin", "fullfillment-staff", "admin", "super-admin"];

      // Check if role is in adminRoles array
      if (adminRoles.includes(userRole)) {
        showToast("Access denied. This login is for users only. Please use the admin login portal.", "error");
        return;
      }

      // For regular users, proceed with login
      Cookies.set("role", role, {
        expires: 1,
        path: "/",
      });
      Cookies.set("token", token, { expires: 1, path: "/" });
      Cookies.set("lastlogin", last_login, {
        expires: 1,
        path: "/",
      });
      dispatch(loginSuccess({ token, role, last_login, _id }));

      // Handle regular user login
      if (role === "User") {
        router.replace("/shop");
        showToast("Successfully Login", "success");
      } else {
        // Handle other non-admin roles if needed
        showToast("Your account type is not allowed to log in here.", "error");
      }
    } else {
      showToast("Login failed", "error");
    }
  } catch (err: any) {
    const message =
      err?.response?.data?.message || err.message || "Login failed";
    showToast(`${message}`, "error");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">
                  Welcome <span className="text-primary-red">back</span>
                </h1>
                <p className="text-muted-foreground text-balance text-sm">
                  User Login - Sign In to your Account
                </p>
         
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <a
                  href="#"
                  className="ml-auto text-sm underline-offset-2 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      ></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </Button>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or
                </span>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a
                  href="/signup"
                  className="underline underline-offset-4 text-primary-red hover:text-primary-red/80 transition-colors"
                >
                  Sign up
                </a>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/login/login.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
