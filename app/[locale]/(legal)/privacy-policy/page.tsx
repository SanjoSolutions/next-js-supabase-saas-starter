import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.datenschutzPage")
  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function DatenschutzPage() {
  const t = await getTranslations("legal.datenschutzPage")
  const tLegal = await getTranslations("legal")

  return (
    <article className="prose prose-sm dark:prose-invert max-w-none">
      <h1 className="text-3xl font-bold mb-8">{t("title")}</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("section1.title")}</h2>
        <h3 className="text-lg font-medium mb-2">{t("section1.generalInfo")}</h3>
        <p>{t("section1.generalInfoText")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("section2.title")}</h2>
        <p>
          {t.raw("section1.generalInfoText").includes("Firmenname")
            ? "[Firmenname]"
            : "[Company Name]"}
          <br />
          {t.raw("section1.generalInfoText").includes("Firmenname")
            ? "[Straße und Hausnummer]"
            : "[Street and Number]"}
          <br />
          {t.raw("section1.generalInfoText").includes("Firmenname")
            ? "[PLZ und Ort]"
            : "[ZIP Code and City]"}
          <br />
          <br />
          {t("section2.phone")}
          <br />
          {t("section2.email")}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("section3.title")}</h2>

        <h3 className="text-lg font-medium mb-2">{t("section3.cookies")}</h3>
        <p>{t("section3.cookiesText")}</p>
        <p className="mt-2">{t("section3.cookiesText2")}</p>

        <h3 className="text-lg font-medium mb-2 mt-4">
          {t("section3.serverLogs")}
        </h3>
        <p>{t("section3.serverLogsText")}</p>
        <ul className="list-disc pl-6 mt-2">
          <li>{t("section3.serverLogsList.browserType")}</li>
          <li>{t("section3.serverLogsList.os")}</li>
          <li>{t("section3.serverLogsList.referrer")}</li>
          <li>{t("section3.serverLogsList.hostname")}</li>
          <li>{t("section3.serverLogsList.time")}</li>
          <li>{t("section3.serverLogsList.ip")}</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("section4.title")}</h2>
        <p>{t("section4.intro")}</p>
        <ul className="list-disc pl-6 mt-2">
          <li>
            <strong>
              {t("section4.rights.access").split(":")[0]}:
            </strong>{" "}
            {t("section4.rights.access").split(":").slice(1).join(":")}
          </li>
          <li>
            <strong>
              {t("section4.rights.rectification").split(":")[0]}:
            </strong>{" "}
            {t("section4.rights.rectification").split(":").slice(1).join(":")}
          </li>
          <li>
            <strong>{t("section4.rights.erasure").split(":")[0]}:</strong>{" "}
            {t("section4.rights.erasure").split(":").slice(1).join(":")}
          </li>
          <li>
            <strong>
              {t("section4.rights.restriction").split(":")[0]}:
            </strong>{" "}
            {t("section4.rights.restriction").split(":").slice(1).join(":")}
          </li>
          <li>
            <strong>
              {t("section4.rights.portability").split(":")[0]}:
            </strong>{" "}
            {t("section4.rights.portability").split(":").slice(1).join(":")}
          </li>
          <li>
            <strong>{t("section4.rights.objection").split(":")[0]}:</strong>{" "}
            {t("section4.rights.objection").split(":").slice(1).join(":")}
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("section5.title")}</h2>
        <p>{t("section5.text")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("section6.title")}</h2>
        <p>{t("section6.text")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("section7.title")}</h2>
        <p>{t("section7.text")}</p>
        <p className="mt-2">{t("section7.legalBasis")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("section8.title")}</h2>
        <p>{t("section8.text")}</p>
        <p className="mt-2">
          {t("section8.moreInfo")}{" "}
          <a
            href="https://stripe.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            https://stripe.com/privacy
          </a>
        </p>
      </section>

      <p className="text-sm text-muted-foreground mt-8">{tLegal("asOf")}</p>
    </article>
  )
}
