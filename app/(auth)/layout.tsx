import { Logo } from "@/components/logo";
import { AuthProvider } from "@/components/dashboard/auth-context";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="relative mx-auto flex w-full max-w-md flex-col px-5 py-10">
          <div className="flex justify-center"><Logo /></div>
          {children}
        </div>
      </div>
    </AuthProvider>
  );
}
