import { LoginForm } from "@/components/login-flow/login-form";
import { UserLoginForm } from "@/components/login-flow/User/userLoginForm";

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <UserLoginForm />
      </div>
    </div>
  )
}
