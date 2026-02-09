import { getTranslations } from "next-intl/server"

export default async function MarketplaceTermsPage() {
  const t = await getTranslations("legal.marketplaceTerms")

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">{t("title")}</h1>

      <div className="prose prose-sm dark:prose-invert">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">{t("scope.title")}</h2>
          <p>{t("scope.text")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">{t("services.title")}</h2>
          <p>{t("services.text")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">{t("matching.title")}</h2>
          <p>{t("matching.text")}</p>
          <p className="mt-2">{t("matching.criteria")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">{t("fees.title")}</h2>
          <p>{t("fees.text")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">{t("payments.title")}</h2>
          <p>{t("payments.text")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">{t("disputes.title")}</h2>
          <p>{t("disputes.text")}</p>
          <p className="mt-2">
            {t("disputes.odr")}{" "}
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">{t("content.title")}</h2>
          <p>{t("content.text")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">{t("dac7.title")}</h2>
          <p>{t("dac7.text")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">{t("p2b.title")}</h2>
          <p>{t("p2b.text")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">{t("liability.title")}</h2>
          <p>{t("liability.text")}</p>
        </section>
      </div>
    </div>
  )
}
