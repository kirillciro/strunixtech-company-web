export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
        <p className="mt-3 text-sm text-slate-400">
          Last updated: April 13, 2026
        </p>

        <div className="mt-10 space-y-8 text-slate-300">
          <section>
            <h2 className="text-xl font-semibold text-white">1. Acceptance</h2>
            <p className="mt-2">
              By accessing or using Company Platform, you agree to be bound by
              these Terms. If you disagree with any part, you may not use our
              services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              2. Use of the platform
            </h2>
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li>You must be at least 18 years old to create an account.</li>
              <li>
                You are responsible for maintaining the confidentiality of your
                account credentials.
              </li>
              <li>
                You agree not to misuse the platform or attempt to access it in
                unauthorized ways.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              3. Intellectual property
            </h2>
            <p className="mt-2">
              All content, features, and functionality of the platform are owned
              by Company Platform and are protected by applicable intellectual
              property laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              4. Limitation of liability
            </h2>
            <p className="mt-2">
              Company Platform is provided &quot;as is&quot; without warranties
              of any kind. We are not liable for indirect, incidental, or
              consequential damages arising from use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">5. Termination</h2>
            <p className="mt-2">
              We reserve the right to terminate or suspend access to our
              platform immediately, without prior notice, for conduct that we
              believe violates these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">6. Contact</h2>
            <p className="mt-2">
              For questions about these Terms, contact:
              legal@company-platform.com
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
