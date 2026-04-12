import { getComPlatImages } from "@/lib/cloudinary";
import Image from "next/image";
import { CheckCircle2, Sparkles } from "lucide-react";

type CoreOfferContent = {
  eyebrow: string;
  title: string;
  description: string;
  briefTitle: string;
  briefItems: string[];
  previewTitle: string;
  previewFallback: string;
  points: Array<{
    title: string;
    description: string;
  }>;
};

export default async function DemoPreviewSection({
  content,
}: {
  content: CoreOfferContent;
}) {
  const images = await getComPlatImages(2);

  return (
    <section className="py-14 sm:py-20 reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 reveal reveal-delay-1">
          <span className="bg-linear-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
            {content.title}
          </span>
        </h2>
        <p className="text-slate-400 text-center mb-10 sm:mb-16 max-w-2xl mx-auto reveal reveal-delay-2">
          {content.description}
        </p>

        {/* Before/After or Preview Section */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-12 items-center mb-10 sm:mb-12 reveal reveal-delay-2">
          {/* Left: Before */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 sm:p-8">
            <h3 className="text-white font-semibold text-lg mb-4">
              {content.briefTitle}
            </h3>
            <div className="bg-slate-900 rounded p-6 text-slate-400 text-sm space-y-2">
              <p className="inline-flex rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                {content.eyebrow}
              </p>
              {content.briefItems.map((item) => (
                <p key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                  {item}
                </p>
              ))}
            </div>
          </div>

          {/* Right: After (Live Preview) */}
          <div className="bg-linear-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-400/30 rounded-lg p-5 sm:p-8">
            <h3 className="text-cyan-300 font-semibold text-lg mb-4">
              {content.previewTitle}
            </h3>
            <div className="bg-slate-900 rounded p-6 border border-cyan-400/30">
              {images.length > 0 ? (
                <div className="relative w-full h-64 rounded overflow-hidden group">
                  <Image
                    src={images[0].secure_url}
                    alt="Demo preview"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="w-full h-64 bg-slate-800 rounded flex items-center justify-center text-slate-400">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-300" />
                    {content.previewFallback}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {content.points.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 sm:p-6 reveal"
              style={{ transitionDelay: `${120 + index * 90}ms` }}
            >
              <h4 className="text-white font-semibold mb-2">{feature.title}</h4>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
