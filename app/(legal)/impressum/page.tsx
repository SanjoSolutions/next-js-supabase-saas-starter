import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum und rechtliche Angaben",
}

export default function ImpressumPage() {
  return (
    <article className="prose prose-sm dark:prose-invert max-w-none">
      <h1 className="text-3xl font-bold mb-8">Impressum</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Angaben gemäß § 5 TMG
        </h2>
        <p>
          [Firmenname]
          <br />
          [Straße und Hausnummer]
          <br />
          [PLZ und Ort]
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Vertreten durch</h2>
        <p>[Name des Vertretungsberechtigten]</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Kontakt</h2>
        <p>
          Telefon: [Telefonnummer]
          <br />
          E-Mail: [E-Mail-Adresse]
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Registereintrag</h2>
        <p>
          Eintragung im Handelsregister.
          <br />
          Registergericht: [Registergericht]
          <br />
          Registernummer: [Registernummer]
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Umsatzsteuer-ID</h2>
        <p>
          Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
          <br />
          [USt-IdNr.]
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
        </h2>
        <p>
          [Name]
          <br />
          [Anschrift]
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Streitschlichtung</h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur
          Online-Streitbeilegung (OS) bereit:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            https://ec.europa.eu/consumers/odr/
          </a>
        </p>
        <p className="mt-2">
          Wir sind nicht bereit oder verpflichtet, an
          Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
          teilzunehmen.
        </p>
      </section>

      <p className="text-sm text-muted-foreground mt-8">Stand: [Datum]</p>
    </article>
  )
}
