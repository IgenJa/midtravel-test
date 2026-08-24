import { Button } from "@/components/ui/Button";

export default function GlobalNotFound() {
  return (
    <html lang="hu">
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#faebd6] px-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">404</p>
        <h1 className="mt-4 font-display text-4xl font-bold text-slate-900">Page Not Found</h1>
        <p className="mt-4 max-w-md text-slate-600">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <a
          href="/hu"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-teal-600 px-6 py-3 font-semibold text-white"
        >
          Go Home
        </a>
      </body>
    </html>
  );
}
