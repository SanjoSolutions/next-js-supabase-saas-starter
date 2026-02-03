import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: "Datenschutzerklärung und Informationen zur Datenverarbeitung",
}

export default function DatenschutzPage() {
  return (
    <article className="prose prose-sm dark:prose-invert max-w-none">
      <h1 className="text-3xl font-bold mb-8">Datenschutzerklärung</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          1. Datenschutz auf einen Blick
        </h2>
        <h3 className="text-lg font-medium mb-2">Allgemeine Hinweise</h3>
        <p>
          Die folgenden Hinweise geben einen einfachen Überblick darüber, was
          mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website
          besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie
          persönlich identifiziert werden können.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          2. Verantwortliche Stelle
        </h2>
        <p>
          [Firmenname]
          <br />
          [Straße und Hausnummer]
          <br />
          [PLZ und Ort]
          <br />
          <br />
          Telefon: [Telefonnummer]
          <br />
          E-Mail: [E-Mail-Adresse]
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          3. Datenerfassung auf dieser Website
        </h2>

        <h3 className="text-lg font-medium mb-2">Cookies</h3>
        <p>
          Unsere Website verwendet Cookies. Das sind kleine Textdateien, die Ihr
          Webbrowser auf Ihrem Endgerät speichert. Cookies helfen uns dabei,
          unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen.
        </p>
        <p className="mt-2">
          Einige Cookies sind „Session-Cookies." Solche Cookies werden nach Ende
          Ihrer Browser-Sitzung von selbst gelöscht. Hingegen bleiben andere
          Cookies auf Ihrem Endgerät bestehen, bis Sie diese selbst löschen.
          Solche Cookies helfen uns, Sie bei Rückkehr auf unserer Website
          wiederzuerkennen.
        </p>

        <h3 className="text-lg font-medium mb-2 mt-4">Server-Log-Dateien</h3>
        <p>
          Der Provider der Seiten erhebt und speichert automatisch Informationen
          in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns
          übermittelt. Dies sind:
        </p>
        <ul className="list-disc pl-6 mt-2">
          <li>Browsertyp und Browserversion</li>
          <li>verwendetes Betriebssystem</li>
          <li>Referrer URL</li>
          <li>Hostname des zugreifenden Rechners</li>
          <li>Uhrzeit der Serveranfrage</li>
          <li>IP-Adresse</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          4. Ihre Rechte als betroffene Person
        </h2>
        <p>Sie haben folgende Rechte:</p>
        <ul className="list-disc pl-6 mt-2">
          <li>
            <strong>Auskunftsrecht (Art. 15 DSGVO):</strong> Sie haben das Recht,
            eine Bestätigung darüber zu verlangen, ob Sie betreffende
            personenbezogene Daten verarbeitet werden.
          </li>
          <li>
            <strong>Recht auf Berichtigung (Art. 16 DSGVO):</strong> Sie haben
            das Recht, die Berichtigung Sie betreffender unrichtiger
            personenbezogener Daten zu verlangen.
          </li>
          <li>
            <strong>Recht auf Löschung (Art. 17 DSGVO):</strong> Sie haben das
            Recht, die Löschung Ihrer personenbezogenen Daten zu verlangen.
          </li>
          <li>
            <strong>Recht auf Einschränkung (Art. 18 DSGVO):</strong> Sie haben
            das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen
            Daten zu verlangen.
          </li>
          <li>
            <strong>Recht auf Datenübertragbarkeit (Art. 20 DSGVO):</strong> Sie
            haben das Recht, Ihre personenbezogenen Daten in einem strukturierten,
            gängigen und maschinenlesbaren Format zu erhalten.
          </li>
          <li>
            <strong>Widerspruchsrecht (Art. 21 DSGVO):</strong> Sie haben das
            Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben,
            jederzeit gegen die Verarbeitung Widerspruch einzulegen.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          5. Beschwerderecht bei einer Aufsichtsbehörde
        </h2>
        <p>
          Unbeschadet eines anderweitigen verwaltungsrechtlichen oder
          gerichtlichen Rechtsbehelfs steht Ihnen das Recht auf Beschwerde bei
          einer Aufsichtsbehörde zu, wenn Sie der Ansicht sind, dass die
          Verarbeitung der Sie betreffenden personenbezogenen Daten gegen die
          DSGVO verstößt.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">6. Hosting</h2>
        <p>
          Diese Website wird extern gehostet. Die personenbezogenen Daten, die
          auf dieser Website erfasst werden, werden auf den Servern des Hosters
          gespeichert. Hierbei kann es sich v.a. um IP-Adressen,
          Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten,
          Kontaktdaten, Namen, Webseitenzugriffe und sonstige Daten, die über
          eine Website generiert werden, handeln.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          7. Registrierung und Benutzerkonto
        </h2>
        <p>
          Wenn Sie sich auf unserer Website registrieren, speichern wir Ihre
          E-Mail-Adresse und ggf. Ihren Namen. Diese Daten werden zur Verwaltung
          Ihres Benutzerkontos und zur Kommunikation mit Ihnen verwendet.
        </p>
        <p className="mt-2">
          Rechtsgrundlage für die Verarbeitung ist Art. 6 Abs. 1 lit. b DSGVO
          (Vertragserfüllung) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
          Interesse an der sicheren Bereitstellung unserer Dienste).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">8. Zahlungsabwicklung</h2>
        <p>
          Für die Zahlungsabwicklung nutzen wir den Dienst Stripe. Dabei werden
          Ihre Zahlungsdaten direkt an Stripe übermittelt. Stripe ist nach dem
          Payment Card Industry Data Security Standard (PCI-DSS) zertifiziert.
        </p>
        <p className="mt-2">
          Weitere Informationen finden Sie in der Datenschutzerklärung von
          Stripe:{" "}
          <a
            href="https://stripe.com/de/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            https://stripe.com/de/privacy
          </a>
        </p>
      </section>

      <p className="text-sm text-muted-foreground mt-8">Stand: [Datum]</p>
    </article>
  )
}
