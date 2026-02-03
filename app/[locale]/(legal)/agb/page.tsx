import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen",
  description: "Allgemeine Geschäftsbedingungen (AGB) für die Nutzung unserer Dienste",
}

export default function AGBPage() {
  return (
    <article className="prose prose-sm dark:prose-invert max-w-none">
      <h1 className="text-3xl font-bold mb-8">
        Allgemeine Geschäftsbedingungen (AGB)
      </h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">§ 1 Geltungsbereich</h2>
        <p>
          (1) Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB") gelten
          für alle Verträge, die zwischen [Firmenname] (nachfolgend „Anbieter")
          und dem Kunden (nachfolgend „Kunde") über die Website [Website-URL]
          geschlossen werden.
        </p>
        <p className="mt-2">
          (2) Abweichende Bedingungen des Kunden werden nicht anerkannt, es sei
          denn, der Anbieter stimmt ihrer Geltung ausdrücklich schriftlich zu.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">§ 2 Vertragsgegenstand</h2>
        <p>
          (1) Gegenstand des Vertrages ist die Bereitstellung einer
          Software-as-a-Service-Lösung (SaaS) durch den Anbieter.
        </p>
        <p className="mt-2">
          (2) Der genaue Leistungsumfang ergibt sich aus der jeweiligen
          Leistungsbeschreibung zum Zeitpunkt des Vertragsschlusses.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">§ 3 Vertragsschluss</h2>
        <p>
          (1) Die Darstellung der Produkte auf der Website stellt kein
          rechtlich bindendes Angebot, sondern eine Aufforderung zur
          Bestellung dar.
        </p>
        <p className="mt-2">
          (2) Durch das Absenden der Bestellung gibt der Kunde ein bindendes
          Angebot zum Abschluss eines Vertrages ab.
        </p>
        <p className="mt-2">
          (3) Der Anbieter kann das Angebot des Kunden innerhalb von fünf
          Werktagen annehmen durch Versendung einer Auftragsbestätigung per
          E-Mail oder durch Freischaltung des Zugangs.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          § 4 Preise und Zahlungsbedingungen
        </h2>
        <p>
          (1) Die angegebenen Preise verstehen sich inklusive der gesetzlichen
          Mehrwertsteuer, sofern nicht anders angegeben.
        </p>
        <p className="mt-2">
          (2) Die Zahlung erfolgt über die angebotenen Zahlungsmethoden
          (Kreditkarte via Stripe). Der Rechnungsbetrag wird mit
          Vertragsschluss fällig.
        </p>
        <p className="mt-2">
          (3) Bei wiederkehrenden Zahlungen (Abonnements) wird der
          Rechnungsbetrag zum jeweiligen Abrechnungszeitpunkt automatisch
          eingezogen.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          § 5 Vertragslaufzeit und Kündigung
        </h2>
        <p>
          (1) Der Vertrag beginnt mit der Freischaltung des Zugangs und läuft
          auf unbestimmte Zeit, sofern nicht anders vereinbart.
        </p>
        <p className="mt-2">
          (2) Bei monatlicher Abrechnung kann der Vertrag jederzeit zum Ende
          des laufenden Abrechnungszeitraums gekündigt werden.
        </p>
        <p className="mt-2">
          (3) Bei jährlicher Abrechnung kann der Vertrag mit einer Frist von
          einem Monat zum Ende der Vertragslaufzeit gekündigt werden.
        </p>
        <p className="mt-2">
          (4) Das Recht zur außerordentlichen Kündigung aus wichtigem Grund
          bleibt unberührt.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          § 6 Widerrufsrecht für Verbraucher
        </h2>
        <p>
          (1) Verbraucher haben bei Fernabsatzverträgen grundsätzlich ein
          Widerrufsrecht. Näheres regelt die Widerrufsbelehrung.
        </p>
        <p className="mt-2">
          (2) Das Widerrufsrecht besteht nicht bei Verträgen zur Lieferung von
          nicht auf einem körperlichen Datenträger befindlichen digitalen
          Inhalten, wenn der Unternehmer mit der Ausführung des Vertrages
          begonnen hat, nachdem der Verbraucher ausdrücklich zugestimmt hat
          und seine Kenntnis davon bestätigt hat, dass er durch seine
          Zustimmung sein Widerrufsrecht verliert.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">§ 7 Nutzungsrechte</h2>
        <p>
          (1) Der Anbieter räumt dem Kunden für die Dauer des Vertrages ein
          einfaches, nicht übertragbares Recht zur Nutzung der Software gemäß
          diesen AGB ein.
        </p>
        <p className="mt-2">
          (2) Der Kunde darf die Software nicht vervielfältigen, verbreiten,
          öffentlich zugänglich machen oder Dritten zur Nutzung überlassen,
          soweit dies nicht ausdrücklich gestattet ist.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">§ 8 Gewährleistung</h2>
        <p>
          (1) Der Anbieter gewährleistet die vertragsgemäße Beschaffenheit
          der Software während der Vertragslaufzeit.
        </p>
        <p className="mt-2">
          (2) Mängel werden nach Wahl des Anbieters durch Nachbesserung oder
          Ersatzlieferung beseitigt.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          § 9 Haftungsbeschränkung
        </h2>
        <p>
          (1) Der Anbieter haftet unbeschränkt für Vorsatz und grobe
          Fahrlässigkeit.
        </p>
        <p className="mt-2">
          (2) Bei leichter Fahrlässigkeit haftet der Anbieter nur bei
          Verletzung wesentlicher Vertragspflichten (Kardinalpflichten),
          begrenzt auf den vertragstypischen, vorhersehbaren Schaden.
        </p>
        <p className="mt-2">
          (3) Die vorstehenden Haftungsbeschränkungen gelten nicht für Schäden
          aus der Verletzung des Lebens, des Körpers oder der Gesundheit.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">§ 10 Datenschutz</h2>
        <p>
          Der Anbieter verarbeitet personenbezogene Daten des Kunden
          ausschließlich gemäß den geltenden datenschutzrechtlichen
          Bestimmungen. Näheres regelt die{" "}
          <a href="/datenschutz" className="text-primary hover:underline">
            Datenschutzerklärung
          </a>
          .
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          § 11 Schlussbestimmungen
        </h2>
        <p>
          (1) Es gilt das Recht der Bundesrepublik Deutschland unter
          Ausschluss des UN-Kaufrechts.
        </p>
        <p className="mt-2">
          (2) Ist der Kunde Kaufmann, juristische Person des öffentlichen
          Rechts oder öffentlich-rechtliches Sondervermögen, ist
          ausschließlicher Gerichtsstand der Sitz des Anbieters.
        </p>
        <p className="mt-2">
          (3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder
          werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
        </p>
      </section>

      <p className="text-sm text-muted-foreground mt-8">Stand: [Datum]</p>
    </article>
  )
}
