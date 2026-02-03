import { Metadata } from "next"
import { Link } from "@/i18n/navigation"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.agbPage")
  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function AGBPage() {
  const t = await getTranslations("legal.agbPage")
  const tLegal = await getTranslations("legal")

  return (
    <article className="prose prose-sm dark:prose-invert max-w-none">
      <h1 className="text-3xl font-bold mb-8">{t("title")}</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("section1.title")}</h2>
        <p>{t("section1.para1")}</p>
        <p className="mt-2">{t("section1.para2")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("section2.title")}</h2>
        <p>{t("section2.para1")}</p>
        <p className="mt-2">{t("section2.para2")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("section3.title")}</h2>
        <p>{t("section3.para1")}</p>
        <p className="mt-2">{t("section3.para2")}</p>
        <p className="mt-2">{t("section3.para3")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("section4.title")}</h2>
        <p>{t("section4.para1")}</p>
        <p className="mt-2">{t("section4.para2")}</p>
        <p className="mt-2">{t("section4.para3")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("section5.title")}</h2>
        <p>{t("section5.para1")}</p>
        <p className="mt-2">{t("section5.para2")}</p>
        <p className="mt-2">{t("section5.para3")}</p>
        <p className="mt-2">{t("section5.para4")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("section6.title")}</h2>
        <p>{t("section6.para1")}</p>
        <p className="mt-2">{t("section6.para2")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("section7.title")}</h2>
        <p>{t("section7.para1")}</p>
        <p className="mt-2">{t("section7.para2")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("section8.title")}</h2>
        <p>{t("section8.para1")}</p>
        <p className="mt-2">{t("section8.para2")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("section9.title")}</h2>
        <p>{t("section9.para1")}</p>
        <p className="mt-2">{t("section9.para2")}</p>
        <p className="mt-2">{t("section9.para3")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("section10.title")}</h2>
        <p>
          {t("section10.text")}{" "}
          <Link href="/privacy-policy" className="text-primary hover:underline">
            {t("section10.privacyPolicy")}
          </Link>
          .
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("section11.title")}</h2>
        <p>{t("section11.para1")}</p>
        <p className="mt-2">{t("section11.para2")}</p>
        <p className="mt-2">{t("section11.para3")}</p>
      </section>

      <p className="text-sm text-muted-foreground mt-8">{tLegal("asOf")}</p>
    </article>
  )
}
