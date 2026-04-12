import {
  CircleCheckBig,
  CreditCard,
  Gauge,
  LayoutTemplate,
  MessageCircleMore,
  PhoneCall,
  Rocket,
  Smartphone,
  Wrench,
} from "lucide-react";

export default function PricingSection() {
  return (
    <section className="py-14 sm:py-20 reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 reveal reveal-delay-1">
          <span className="bg-linear-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
            Transparent Pricing Model
          </span>
        </h2>
        <p className="text-slate-400 text-center mb-10 sm:mb-16 max-w-2xl mx-auto reveal reveal-delay-2">
          Clear pipeline, clear payments, and full project visibility through
          our mobile app.
        </p>

        {/* Pricing Breakdown */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 sm:p-8 md:p-12 reveal reveal-delay-2">
            {/* Timeline */}
            <div className="space-y-6 sm:space-y-8 mb-10 sm:mb-12">
              {[
                {
                  step: "1",
                  title: "Choose Template",
                  detail:
                    "Select the template that best matches your website, web app, or native app idea.",
                  icon: LayoutTemplate,
                },
                {
                  step: "2",
                  title: "Schedule a Call",
                  detail:
                    "We align scope, features, and delivery plan with you and your goals.",
                  icon: PhoneCall,
                },
                {
                  step: "3",
                  title: "Pay 25% Deposit",
                  detail: "Project kickoff payment.",
                  amount: "25% of Project Cost",
                  icon: CreditCard,
                },
                {
                  step: "4",
                  title: "Download the App",
                  detail:
                    "Install our app from the App Store or Google Play for live communication.",
                  icon: Smartphone,
                },
                {
                  step: "5",
                  title: "Track Progress 0% to 100%",
                  detail:
                    "See progress bars and milestones in real time. Live chat support stays available in the app.",
                  icon: Gauge,
                },
                {
                  step: "6",
                  title: "Project Review Call",
                  detail:
                    "Final walkthrough, approval, and detail refinements before release.",
                  icon: CircleCheckBig,
                },
                {
                  step: "7",
                  title: "Pay Final 75%",
                  detail: "Final payment after approval.",
                  amount: "75% of Project Cost",
                  icon: CreditCard,
                },
                {
                  step: "8",
                  title: "Go Live + Yearly Maintenance",
                  detail:
                    "Project goes live with yearly maintenance and free support included.",
                  icon: Rocket,
                },
              ].map((item, index, list) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="flex gap-3 sm:gap-6 reveal"
                    style={{ transitionDelay: `${120 + index * 70}ms` }}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                        {item.step}
                      </div>
                      {index < list.length - 1 && (
                        <div className="w-1 h-12 sm:h-16 bg-cyan-500/30 mt-2"></div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-5 h-5 text-cyan-300" />
                        <h3 className="text-white font-semibold text-base sm:text-lg">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-slate-400 text-sm">{item.detail}</p>
                      {item.amount && (
                        <p className="text-slate-300 font-semibold mt-2 text-base sm:text-lg">
                          {item.amount}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom line */}
            <div className="border-t border-slate-700 pt-8 text-center">
              <p className="text-slate-400 mb-4">Ready to start?</p>
              <button className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg transition-all animate-gradient-shift inline-flex items-center justify-center gap-2">
                <MessageCircleMore className="w-5 h-5" />
                Chat to Begin Your Project
              </button>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-12 space-y-4">
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6 reveal reveal-delay-2">
              <h4 className="text-white font-semibold mb-2">
                What if I want revisions after launch?
              </h4>
              <p className="text-slate-400 text-sm">
                We include free support in the yearly maintenance package and
                handle post-launch refinements with your team.
              </p>
            </div>
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6 reveal reveal-delay-3">
              <h4 className="text-white font-semibold mb-2">
                Can I change the project scope mid-development?
              </h4>
              <p className="text-slate-400 text-sm">
                Absolutely. Any scope changes are discussed and adjusted
                transparently with you before proceeding.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
