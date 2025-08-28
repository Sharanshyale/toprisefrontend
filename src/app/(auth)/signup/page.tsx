import {  UserSignUpForm } from "@/components/login-flow/login-create"

export default function Signup() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <UserSignUpForm/>
      </div>
    </div>
  )
}
