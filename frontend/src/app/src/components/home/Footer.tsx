type FooterContent = {
  brandDescription: string;
  servicesTitle: string;
  services: string[];
  companyTitle: string;
  company: string[];
  legalTitle: string;
  legal: string[];
  contactTitle: string;
  rights: string;
};

export default function Footer({ content }: { content: FooterContent }) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-slate-950 border-t border-slate-700/50 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-10 sm:mb-12">
          {/* Column 1: Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-linear-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
                CP
              </div>
              <span className="text-lg font-bold bg-linear-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Company Platform
              </span>
            </div>
            <p className="text-slate-400 text-sm">{content.brandDescription}</p>
          </div>

          {/* Column 2: Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              {content.servicesTitle}
            </h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              {content.services.map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-cyan-300 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              {content.companyTitle}
            </h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              {content.company.map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-cyan-300 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal & Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              {content.legalTitle}
            </h3>
            <ul className="space-y-2 text-slate-400 text-sm mb-6">
              {content.legal.map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-cyan-300 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
            <h3 className="text-white font-semibold mb-2">
              {content.contactTitle}
            </h3>
            <p className="text-slate-400 text-sm">
              <a
                href="mailto:hello@company-platform.com"
                className="hover:text-cyan-300 transition-colors"
              >
                hello@company-platform.com
              </a>
            </p>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-slate-700/50 mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm text-center md:text-left">
            © {year} {content.rights}
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a
              href="#"
              aria-label="Twitter"
              className="text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="GitHub"
              className="text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.49.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.547 2.91 1.186.092-.923.35-1.546.636-1.903-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.270.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.934.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.191 22 16.432 22 12.017 22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
