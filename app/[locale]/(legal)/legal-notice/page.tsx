import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.impressumPage")
  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function ImpressumPage() {
  const t = await getTranslations("legal.impressumPage")
  const tLegal = await getTranslations("legal")

  return (
    <article className="prose prose-sm dark:prose-invert max-w-none">
      <h1 className="text-3xl font-bold mb-8">{t("title")}</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("accordingToLaw")}</h2>
        <p>
          {t("companyName")}
          <br />
          {t("streetAddress")}
          <br />
          {t("cityZip")}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("representedBy")}</h2>
        <p>{t("representativeName")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("contact")}</h2>
        <p>
          {t("phone")}
          <br />
          {t("email")}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("registration")}</h2>
        <p>
          {t("registrationInfo")}
          <br />
          {t("registryCourt")}
          <br />
          {t("registryNumber")}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("vatId")}</h2>
        <p>
          {t("vatIdInfo")}
          <br />
          {t("vatIdNumber")}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {t("responsibleForContent")}
        </h2>
        <p>
          {t("responsibleName")}
          <br />
          {t("responsibleAddress")}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("disputeResolution")}</h2>
        <p>
          {t("disputeResolutionText")}{" "}
          <a
            href="https://ec.europa.eu/consumers/odr/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            https://ec.europa.eu/consumers/odr/
          </a>
        </p>
        <p className="mt-2">{t("disputeResolutionNotWilling")}</p>
      </section>

      <p className="text-sm text-muted-foreground mt-8">{tLegal("asOf")}</p>
    </article>
  )
}
