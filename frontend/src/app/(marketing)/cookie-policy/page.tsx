export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold text-white">Cookie Policy (EU)</h1>
        <p className="mt-3 text-sm text-slate-400">
          Last updated: April 11, 2026
        </p>

        <div className="mt-10 space-y-8 text-slate-300">
          <section>
            <h2 className="text-xl font-semibold text-white">
              1. Introduction
            </h2>
            <p className="mt-2">
              This website uses cookies and related technologies to provide core
              functionality, measure performance, and improve your experience.
              Some cookies are set by third-party services integrated into our
              platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              2. What are cookies?
            </h2>
            <p className="mt-2">
              Cookies are small text files stored on your device when you visit
              a website. They help remember your preferences and can be used for
              analytics and marketing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              3. Cookie categories we use
            </h2>
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li>
                <strong>Functional:</strong> Required for security, session
                handling, and core website behavior. Always active.
              </li>
              <li>
                <strong>Preferences:</strong> Remember your settings and
                personalization choices.
              </li>
              <li>
                <strong>Statistics:</strong> Help us understand usage patterns
                to improve the platform.
              </li>
              <li>
                <strong>Marketing:</strong> Used to measure campaigns and
                deliver relevant promotional content.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">4. Consent</h2>
            <p className="mt-2">
              On your first visit, we display a consent popup where you can
              Accept, Deny, or set Preferences. You can change your decision at
              any time by clearing browser storage and revisiting the site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              5. Managing cookies in your browser
            </h2>
            <p className="mt-2">
              You can delete or block cookies through your browser settings.
              Blocking all cookies may impact site functionality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">6. Contact</h2>
            <p className="mt-2">
              For questions about this Cookie Policy, contact:
              privacy@company-platform.com
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
