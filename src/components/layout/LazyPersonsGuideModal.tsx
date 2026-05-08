'use client';

import { useEffect, useState } from 'react';

type GuideLevel = {
  title: string;
  items: string[];
};

const guideLevels: GuideLevel[] = [
  {
    title: 'Level 1: Sofa Superstar',
    items: [
      'Save electricity by turning appliances off completely when not in use, including your computer.',
      'Stop paper bank statements and pay bills online or via mobile.',
      'Share helpful posts about women\'s rights or climate change so more people see them.',
      'Ask local and national authorities to support initiatives that do not harm people or the planet.',
      'Turn off the lights when your TV or computer screen already gives enough light.',
      'Report online bullies or harassment when you see it.',
      'Stay informed through local news and the Global Goals online or on social media.',
      'Share your actions with #globalgoals on social networks.',
      'Offset remaining carbon emissions by calculating your footprint and buying climate credits.',
    ],
  },
  {
    title: 'Level 2: Household Hero',
    items: [
      'Air dry hair and clothes instead of using a machine when possible.',
      'Take short showers and use less water.',
      'Eat less meat, poultry, and fish to reduce resource use.',
      'Freeze fresh produce and leftovers so food is not wasted.',
      'Compost food scraps to recycle nutrients.',
      'Recycle paper, plastic, glass, and aluminium.',
      'Buy minimally packaged goods.',
      'Avoid pre-heating the oven unless you need precise baking temperatures.',
      'Plug air leaks in windows and doors to improve energy efficiency.',
      'Adjust your thermostat lower in winter and higher in summer.',
      'Replace old appliances with energy-efficient models and light bulbs.',
      'Install solar panels if you can.',
      'Use rugs to help keep your home warm.',
      'Do not rinse dishes before loading the dishwasher.',
      'Use cloth diapers or responsible disposable options.',
      'Shovel snow manually instead of using a snow blower.',
      'Use cardboard matches instead of petroleum-based lighters.',
    ],
  },
  {
    title: 'Level 3: Neighbourhood Nice',
    items: [
      'Shop local to support nearby businesses and reduce transport emissions.',
      'Plan meals, use shopping lists, and avoid impulse buys.',
      'Buy unusual-looking fruit and vegetables that are still perfectly good.',
      'Ask restaurants whether they serve sustainable seafood.',
      'Choose sustainable seafood when shopping.',
      'Walk, bike, or take public transport when you can.',
      'Use a refillable water bottle and coffee cup.',
      'Bring your own reusable bag when you shop.',
      'Take only the napkins you need.',
      'Shop vintage or second-hand first.',
      'Maintain your car so it emits fewer fumes.',
      'Donate items you do not use.',
      'Vaccinate yourself and your kids to support public health.',
      'Use your right to vote in local and national elections.',
    ],
  },
  {
    title: 'Level 4: Exceptional Employee',
    items: [
      'Give away fruit or snacks you do not want instead of throwing them out.',
      'Learn what workplace rights you have and speak up against inequality.',
      'Mentor young people and help guide them toward a better future.',
      'Support equal pay for equal work.',
      'Talk about access to sanitation and basic services in communities around the world.',
      'Encourage energy-efficient heating and cooling at work.',
      'Stay informed about workers in other countries and business practices.',
      'Support clean and resilient infrastructure that keeps workers safe.',
      'Speak against discrimination of any kind in the office.',
      'Bike, walk, or use public transport to commute.',
      'Organize a No Impact Week at work.',
      'Encourage company and government action that does not harm people or the planet.',
      'Reduce waste because much of it ends up in oceans.',
      'Review everyday choices at work and question harmful practices.',
      'Know your workplace rights so you can access justice when needed.',
      'Encourage corporate social responsibility that supports local communities.',
    ],
  },
];

export default function LazyPersonsGuideModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full border border-slate-300 bg-white/95 px-4 py-3 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur transition hover:border-emerald-300 hover:text-emerald-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        Lazy Guide
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="presentation"
          onClick={() => setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lazy-guide-title"
            className="w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-800 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                  United Nations inspired guide
                </p>
                <h2 id="lazy-guide-title" className="mt-1 text-2xl font-bold text-slate-900">
                  Lazy Person&apos;s Guide to Sustainable Actions
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Practical actions you can take from the sofa, at home, in your neighbourhood, and at work.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Close
              </button>
            </div>

            <div className="max-h-[calc(85vh-92px)] overflow-y-auto px-6 py-5">
              <div className="space-y-6">
                {guideLevels.map((level) => (
                  <section key={level.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">{level.title}</h3>
                    <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                      {level.items.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}