import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  const tCommon = await getTranslations("common");

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">
        404
      </p>
      <h1 className="mt-4 font-display text-4xl font-bold text-slate-900 sm:text-5xl">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-md text-slate-600">{t("description")}</p>
      <div className="mt-8 flex gap-4">
        <Button href="/">{tCommon("goHome")}</Button>
        <Button href="/trips" variant="outline">
          {tCommon("browseTrips")}
        </Button>
      </div>
    </div>
  );
}
