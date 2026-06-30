import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import {
  GraduationCap, Stethoscope, Utensils, Home as HomeIcon, Shield, Sparkles,
  HeartHandshake, BookOpen, Users, HandHeart, Briefcase, BadgeCheck, Baby,
} from "lucide-react";

export const Route = createFileRoute("/programs")({
  head: () => ({
    meta: [
      { title: "Programs — The Saints Childcare Foundation Uganda" },
      { name: "description", content: "Explore our holistic programs: education, healthcare, nutrition, shelter, child protection, counseling, skills development, and community outreach." },
    ],
  }),
  component: ProgramsPage,
});

const programs = [
  { Icon: GraduationCap, t: "Education Support", d: "Quality primary, secondary and vocational education for vulnerable children." },
  { Icon: BookOpen, t: "School Fees Assistance", d: "Termly fees and learning materials for sponsored students." },
  { Icon: Stethoscope, t: "Healthcare", d: "Regular check-ups, treatment, immunizations, and emergency care." },
  { Icon: Utensils, t: "Nutrition Programs", d: "Two balanced meals a day to combat malnutrition." },
  { Icon: HandHeart, t: "Emergency Relief", d: "Rapid response for families facing acute crisis." },
  { Icon: HomeIcon, t: "Shelter", d: "Safe homes and family-strengthening for orphans." },
  { Icon: HeartHandshake, t: "Counseling", d: "Trauma-informed psychosocial support for children and caregivers." },
  { Icon: Shield, t: "Child Protection", d: "Safeguarding, advocacy and rights-based response." },
  { Icon: Briefcase, t: "Skills Development", d: "Vocational training and apprenticeships for youth." },
  { Icon: Users, t: "Community Outreach", d: "Mobilizing villages to protect and uplift their own children." },
  { Icon: Sparkles, t: "Girls Empowerment", d: "Gender-specific programs addressing unique vulnerabilities." },
  { Icon: BadgeCheck, t: "Youth Development", d: "Leadership, mentorship and life-skills training." },
  { Icon: Baby, t: "Family Strengthening", d: "Supporting guardians with livelihoods so children stay home." },
];

function ProgramsPage() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="Our Programs" title="Thirteen pillars. One mission." description="We address the root causes of childhood vulnerability through interconnected, evidence-based programs." />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-brand-blue/10 border border-brand-blue/10">
            {programs.map((p) => (
              <div key={p.t} className="bg-white p-8 group hover:bg-surface transition-colors">
                <div className="size-12 bg-brand-blue/10 text-brand-blue flex items-center justify-center mb-6 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                  <p.Icon className="size-6" />
                </div>
                <h3 className="font-display font-extrabold text-xl mb-3">{p.t}</h3>
                <p className="text-ink/60 text-sm leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-brand-orange text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display font-extrabold text-3xl md:text-5xl tracking-tight mb-6">
            Fund a program. Change a community.
          </h2>
          <Link to="/donate" className="inline-block bg-white text-brand-orange px-8 py-4 font-display font-extrabold text-sm uppercase tracking-widest">
            Donate Now
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
