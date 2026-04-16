export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
        <p className="mt-3 text-sm text-slate-400">
          Last updated: April 11, 2026
        </p>

        <div className="mt-10 space-y-8 text-slate-300">
          <section>
            <h2 className="text-xl font-semibold text-white">Introduction</h2>
            <p className="mt-2">
              We respect your privacy and are committed to protecting your
              personal data. This policy explains what data we collect, how we
              use it, and your rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              Data we collect
            </h2>
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li>Account information you provide (name, email).</li>
              <li>Project-related communication and support messages.</li>
              <li>
                Technical usage data (browser, device, pages visited,
                timestamps).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              How we use your data
            </h2>
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li>To provide and improve our services.</li>
              <li>
                To manage authentication, project communication, and progress
                tracking.
              </li>
              <li>To ensure platform security and prevent abuse.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              Legal basis and retention
            </h2>
            <p className="mt-2">
              We process data based on consent, contractual necessity, and
              legitimate interests. Data is retained only as long as necessary
              for service delivery, legal compliance, and operational security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">Your rights</h2>
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li>Access and correction of your personal data.</li>
              <li>Deletion and restriction requests where applicable.</li>
              <li>Objection to certain processing activities.</li>
              <li>Data portability requests where legally supported.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">Contact</h2>
            <p className="mt-2">
              For privacy requests or questions, contact:
              privacy@company-platform.com
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
