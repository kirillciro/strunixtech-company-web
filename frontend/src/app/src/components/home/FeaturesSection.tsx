import {
  Activity,
  Gem,
  Globe,
  MessageCircleMore,
  Palette,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";

export default function FeaturesSection() {
  return (
    <section className="py-14 sm:py-20 bg-slate-800/30 border-y border-slate-700/50 reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 reveal reveal-delay-1">
          <span className="bg-linear-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
            Why Choose Us?
          </span>
        </h2>
        <p className="text-slate-400 text-center mb-10 sm:mb-16 max-w-2xl mx-auto reveal reveal-delay-2">
          Everything you need to build and launch your website
        </p>

        {/* Features Grid - 2x3 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {[
            {
              icon: MessageCircleMore,
              title: "Live Chat with Developer",
              description:
                "Real-time communication with your dedicated developer. No waiting for emails.",
            },
            {
              icon: Zap,
              title: "Lightning Fast Delivery",
              description:
                "From briefing to launch with a structured workflow and transparent progress at every stage.",
            },
            {
              icon: Palette,
              title: "Custom Design",
              description:
                "Tailored to your brand. Every pixel crafted specifically for your business.",
            },
            {
              icon: Smartphone,
              title: "Mobile Optimized",
              description:
                "Perfect on all devices. Responsive design that works everywhere.",
            },
            {
              icon: Activity,
              title: "Real-Time Updates",
              description:
                "See changes instantly during development. No guessing about the final result.",
            },
            {
              icon: Gem,
              title: "Transparent Pricing",
              description:
                "No hidden fees. 25% upfront, rest after approval. That's it.",
            },
            {
              icon: ShieldCheck,
              title: "Secure & Reliable",
              description:
                "Enterprise-grade security. Your website is in safe hands.",
            },
            {
              icon: Globe,
              title: "Global Performance",
              description:
                "Fast loading times worldwide. Optimized for every region.",
            },
            {
              icon: Sparkles,
              title: "Analytics Ready",
              description:
                "Built-in analytics and insights. Understand your visitors.",
            },
          ].map((feature, index) => (
            <div
              key={feature.title}
              className="bg-slate-900/50 border border-slate-700 rounded-lg p-5 sm:p-8 hover:border-cyan-400/50 hover:bg-slate-800/50 transition-all reveal"
              style={{ transitionDelay: `${100 + index * 55}ms` }}
            >
              <feature.icon className="w-9 h-9 mb-4 text-cyan-300 animate-icon-breathe" />
              <h3 className="text-white font-semibold text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
