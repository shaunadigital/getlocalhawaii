import { Byline } from "@/components/Byline";
import { Hero } from "@/components/Hero";
import { Sign } from "@/components/Sign";
import { SiteFooter } from "@/components/SiteFooter";

/** About, Disclosure, Privacy: a charcoal hero and plain sections. */
export interface ProsePageProps {
  title: string;
  sub: string;
  updated: string;
  sections: { heading: string; paragraphs: React.ReactNode[] }[];
  current?: string;
  byline?: boolean;
}

export function ProsePage({ title, sub, updated, sections, current, byline = false }: ProsePageProps) {
  return (
    <>
      <Hero title={title} sub={sub} meta={`Updated ${updated}`} current={current} />
      <main className="mx-auto flex w-full max-w-(--container-page) flex-col gap-10 px-4 pt-8 pb-12 md:gap-14 md:px-8 md:pt-12">
        {sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-4">
            <Sign title={section.heading} />
            <div className="flex max-w-[68ch] flex-col gap-4">
              {section.paragraphs.map((paragraph, index) => (
                <p key={index} className="m-0 text-[16px] leading-[1.7] md:text-[17px]">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
        {byline ? <Byline /> : null}
      </main>
      <SiteFooter />
    </>
  );
}
