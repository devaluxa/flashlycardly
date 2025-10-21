import { redirect } from "next/navigation";

export default function SignInPage() {
  // Redirect to home page where sign-in/sign-up buttons are located
  redirect("/");
}

