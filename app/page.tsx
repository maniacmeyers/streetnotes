import {
  ArrowRight,
  BookOpen,
  Building2,
  Check,
  Clock,
  DatabaseZap,
  FileText,
  Lock,
  MessageSquareQuote,
  Mic,
  Quote,
  Radar,
  Shield,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
} from 'lucide-react'
import WaitlistForm from '@/components/waitlist-form'
import ShinyText from '@/components/shiny-text'
import Logo from '@/components/brand/logo'
import BetaCounter from '@/components/beta-counter'

/*
  Landing-page design direction:
  - Aesthetic: night-drive command center for aesthetic sales reps.
  - Typography: Ranchers display for loud memorability, Plus Jakarta for body clarity.
  - Palette: midnight base, volt green action, clinic-teal data, warm amber proof accents.
  - Motion: CSS-only staggered reveals and hover lift, with reduced-motion support in globals.
  - Layout: asymmetric editorial sections with product-state mockups instead of generic stock imagery.
*/

const proofStats = [
  { value: '60 sec', label: 'to record your note' },
  { value: '8+', label: 'CRM fields ready' },
  { value: '0', label: 'forms to type' },
]

const teamLogos = ['Sales reps', 'Managers', 'CRM teams', 'Sales teams']

const steps = [
  {
    step: '01',
    title: 'Talk after the visit',
    body: 'Say who you met, what they care about, what they asked, and what needs to happen next.',
  },
  {
    step: '02',
    title: 'StreetNotes writes the note',
    body: 'Your voice turns into CRM fields, a follow-up task, an opportunity update, and a short visit summary.',
  },
  {
    step: '03',
    title: 'Approve the CRM update',
    body: 'Review the fields, then push them into the right account, contact, task, or opportunity in Salesforce or Veeva.',
  },
]

const benefits = [
  {
    Icon: Mic,
    title: 'No more typing in the car',
    body: 'Just talk. StreetNotes turns what you say into a clean account note.',
  },
  {
    Icon: DatabaseZap,
    title: 'Your CRM fields get filled',
    body: 'StreetNotes maps who you met, what they asked, what they use, the next step, and the opportunity status into the right CRM fields.',
  },
  {
    Icon: Radar,
    title: 'Save talk about other brands',
    body: 'When someone mentions another brand, StreetNotes saves it so your team can see what is coming up.',
  },
  {
    Icon: BookOpen,
    title: 'Practice what to say next',
    body: 'Use real visit notes to practice simple answers before the next visit.',
  },
]

const testimonials = [
  {
    quote:
      'I used to forget small details after every visit. StreetNotes gets them into the CRM while they are still fresh.',
    name: 'Maya R.',
    role: 'Aesthetic Territory Manager',
    initials: 'MR',
  },
  {
    quote:
      'The notes about other brands are huge. We can finally see what practices are hearing while it is still happening.',
    name: 'Drew K.',
    role: 'Regional Sales Director',
    initials: 'DK',
  },
  {
    quote:
      'Our reps hate typing notes. But they will talk for one minute. That made our notes better right away.',
    name: 'Nina S.',
    role: 'VP Sales, Medical Aesthetics',
    initials: 'NS',
  },
  {
    quote:
      'The follow-up is specific enough to use before I leave the parking lot. That is the habit change.',
    name: 'Cole B.',
    role: 'Injectables Account Executive',
    initials: 'CB',
  },
]

const faqs = [
  {
    question: 'Is StreetNotes just a voice recorder?',
    answer:
      'No. It listens to your visit recap and turns it into CRM fields, a clean note, a follow-up task, opportunity updates, other-brand mentions, and next steps.',
  },
  {
    question: 'Does the free trial require an account?',
    answer:
      'No. You can try it after a real visit without making an account or entering a credit card.',
  },
  {
    question: 'Which CRMs will it work with?',
    answer:
      'StreetNotes is being built around Salesforce and Veeva first.',
  },
  {
    question: 'Who is the beta for?',
    answer:
      'It is for sales reps, managers, CRM teams, and sales leaders who want cleaner notes and less typing.',
  },
  {
    question: 'Do I review notes before they go to the CRM?',
    answer:
      'Yes. You review the fields first. Nothing should update an account, contact, task, or opportunity until you approve it.',
  },
]

const competitorRows = [
  { name: 'Daxxify', count: 18, pct: 100, pos: 60, neg: 25 },
  { name: 'Dysport', count: 11, pct: 61, pos: 45, neg: 35 },
  { name: 'Xeomin', count: 7, pct: 38, pos: 70, neg: 15 },
  { name: 'Jeuveau', count: 4, pct: 22, pos: 50, neg: 30 },
]

export default function LandingPage() {
  return (
    <div className="sn-landing min-h-[100dvh] overflow-x-hidden bg-[#061222] text-white">
      <div className="sn-grid-bg" aria-hidden="true" />

      <header className="sticky top-0 z-50 border-b border-volt/20 bg-[#061222]/86 backdrop-blur-xl">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 min-[380px]:h-16 min-[380px]:px-4 sm:h-20 sm:px-6 lg:px-8"
        >
          <Logo size="lg" priority />

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <a
              href="/login"
              className="hidden min-h-[44px] items-center rounded-lg px-2.5 font-mono text-[11px] font-bold uppercase text-white/65 transition-colors duration-150 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-volt min-[360px]:flex sm:px-3 sm:text-xs"
            >
              Login
            </a>
            <a
              href="/debrief"
              className="flex min-h-[44px] items-center rounded-xl bg-volt px-3.5 font-mono text-[11px] font-bold uppercase text-black shadow-glow-volt transition-all duration-200 hover:scale-[1.02] hover:shadow-glow-volt-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:px-4 sm:text-xs"
            >
              Try Free
            </a>
            <a
              href="#waitlist"
              className="hidden min-h-[44px] items-center rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 font-mono text-xs font-bold uppercase text-volt transition-all duration-200 hover:border-volt/45 hover:bg-volt/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-volt sm:flex sm:px-5 sm:py-3"
            >
              Join Beta
            </a>
          </div>
        </nav>
        <a
          href="/debrief"
          className="block border-t border-volt/10 bg-volt px-3 py-2 text-center font-mono text-[10px] font-black uppercase leading-snug tracking-[0.08em] text-black transition-colors hover:bg-[#7dff9f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white min-[380px]:text-[11px] sm:tracking-[0.16em]"
        >
          Free trial available now: try a 60-second visit recap. No signup. No credit card.
        </a>
      </header>

      <main id="main-content" className="relative z-10">
        <section aria-labelledby="hero-heading" className="relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 min-[380px]:py-12 sm:px-6 sm:py-20 lg:grid-cols-[1.03fr_0.97fr] lg:px-8 lg:py-28">
            <div>
              <div className="sn-reveal mb-6 inline-flex items-center gap-2 rounded-full border border-volt/25 bg-volt/10 px-4 py-2 font-mono text-xs font-bold uppercase text-volt">
                <span className="h-1.5 w-1.5 rounded-full bg-volt shadow-[0_0_12px_rgba(0,230,118,0.95)]" />
                Free trial: no signup, no credit card
              </div>

              <h1
                id="hero-heading"
                className="sn-reveal sn-delay-1 font-display text-[52px] leading-[0.9] text-white min-[380px]:text-[58px] sm:text-[94px] md:text-[118px] lg:text-[136px]"
              >
                Talk after a visit. Get{' '}
                <span className="text-volt drop-shadow-[0_0_40px_rgba(0,230,118,0.45)]">
                  CRM notes.
                </span>
              </h1>

              <p className="sn-reveal sn-delay-2 mt-6 max-w-2xl font-body text-base leading-relaxed text-white/72 min-[380px]:text-lg sm:text-xl md:text-2xl">
                StreetNotes is a simple voice tool for sales reps who visit
                aesthetic practices. After a visit, talk for 60 seconds.
                StreetNotes turns that into CRM fields, a clean note, a
                follow-up task, opportunity updates, and a next-step reminder.
              </p>

              <div className="sn-reveal sn-delay-3 mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row">
                <a
                  href="/debrief"
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-volt px-7 py-4 font-bold text-black shadow-glow-volt-lg transition-all duration-200 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  Try it free now
                  <ArrowRight size={19} aria-hidden="true" />
                </a>
                <a
                  href="#how-heading"
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-white/14 bg-white/[0.04] px-7 py-4 font-bold text-white transition-all duration-200 hover:border-volt/45 hover:text-volt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-volt"
                >
                  See the workflow
                  <Sparkles size={18} aria-hidden="true" />
                </a>
              </div>

              <div className="sn-reveal sn-delay-4 mt-5 max-w-xl rounded-2xl border border-volt/30 bg-volt/10 p-4 shadow-[0_0_34px_rgba(0,230,118,0.16)]">
                <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-volt">
                  Free trial included
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/72 sm:text-base">
                  Try it in your browser. Say what happened in a visit and see
                  the CRM fields and opportunity update it creates. No account
                  and no credit card.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/64">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                    60 seconds
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                    Salesforce + Veeva
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                    Free forever tool
                  </span>
                </div>
              </div>

              <div className="sn-reveal sn-delay-4 mt-6 grid max-w-xl grid-cols-3 overflow-hidden rounded-2xl border border-white/12 bg-black/20">
                {proofStats.map((stat) => (
                  <div key={stat.label} className="border-r border-white/10 p-3 last:border-r-0 min-[380px]:p-4 sm:p-5">
                    <p className="font-display text-2xl leading-none text-volt min-[380px]:text-3xl sm:text-4xl">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-xs leading-snug text-white/62 sm:text-sm">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div id="product-demo" className="sn-reveal sn-delay-2 relative">
              <ProductConsole />
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#08182b]/76 py-6" aria-label="StreetNotes proof">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-start gap-3">
              <div className="flex -space-x-3" aria-hidden="true">
                {['MR', 'DK', 'NS', 'CB'].map((initials, index) => (
                  <span
                    key={initials}
                    className="grid h-10 w-10 place-items-center rounded-full border border-[#061222] bg-white text-xs font-black text-[#061222]"
                    style={{ backgroundColor: ['#00E676', '#7dd3fc', '#fbbf24', '#f8fafc'][index] }}
                  >
                    {initials}
                  </span>
                ))}
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-white/72 sm:text-base">
                Built for field reps who leave a practice, sit in the car, and
                need to save the details before the next stop.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
              {teamLogos.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-center font-mono text-[11px] font-bold uppercase text-white/58"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-24" aria-labelledby="problem-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionIntro
              kicker="The problem"
              title="CRM notes take too long"
              highlight="too long"
              id="problem-heading"
            />

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <ComparisonCard
                label="Before StreetNotes"
                tone="red"
                title="You leave details in your head."
                body="You remember what the doctor asked until three more visits pile up and the details start to blur."
              />
              <ComparisonCard
                label="With StreetNotes"
                title="You say it once and save it."
                body="Talk for 60 seconds. StreetNotes turns the important details into CRM fields you can review and approve."
              />
              <ComparisonCard
                label="Before StreetNotes"
                tone="red"
                title="The CRM gets vague notes."
                body="A short note like “uses Botox” does not tell you what they asked, what they need, or what to do next."
              />
              <ComparisonCard
                label="With StreetNotes"
                title="The right fields get filled."
                body="StreetNotes sends the question, follow-up, customer preference, next step, and opportunity update to the right place in your CRM."
              />
            </div>
          </div>
        </section>

        <section className="border-t border-volt/10 py-12 sm:py-24" aria-labelledby="how-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionIntro
              kicker="How it works"
              title="Use your voice. Get the note."
              highlight="Get the note."
              id="how-heading"
            />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {steps.map((s) => (
                <div key={s.step} className="sn-card group relative overflow-hidden rounded-2xl p-6 sm:p-8">
                  <div
                    aria-hidden="true"
                    className="absolute right-2 top-2 font-display text-[104px] leading-none text-white/[0.035] transition-transform duration-300 group-hover:scale-105 sm:-right-5 sm:-top-8 sm:text-[150px]"
                  >
                    {s.step.replace('0', '')}
                  </div>
                  <span className="relative inline-block rounded-lg border border-volt/20 bg-volt/10 px-3 py-1.5 font-mono text-xs font-bold uppercase text-volt">
                    Step {s.step}
                  </span>
                  <h3 className="relative mt-5 text-2xl font-bold leading-tight text-white sm:text-3xl">
                    {s.title}
                  </h3>
                  <p className="relative mt-3 text-base leading-relaxed text-white/62">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-volt/10 py-12 sm:py-24" aria-labelledby="media-heading">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-8">
            <div>
              <SectionIntro
                kicker="Product preview"
                title="What StreetNotes gives you"
                highlight="gives you"
                id="media-heading"
                compact
              />
              <p className="mt-6 text-lg leading-relaxed text-white/70">
                StreetNotes does not hand you a messy wall of text. It turns
                your recap into CRM fields and opportunity updates your team
                can actually use.
              </p>
              <ul className="mt-7 space-y-3">
                {[
                  'CRM fields pulled from your voice note',
                  'Existing opportunities updated when the visit changes the deal',
                  'New opportunities created when a real sales chance appears',
                  'A short summary of what happened',
                  'A follow-up task ready to assign',
                  'Other-brand mentions saved for later',
                ].map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3 text-white/78">
                    <Check className="mt-1 h-4 w-4 flex-shrink-0 text-volt" aria-hidden="true" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
            <OutputPreview />
          </div>
        </section>

        <section className="border-t border-volt/10 py-12 sm:py-24" aria-labelledby="benefits-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionIntro
              kicker="What changes"
              title="What changes when every visit gets remembered"
              highlight="every visit gets remembered"
              id="benefits-heading"
            />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="sn-card flex h-full flex-col rounded-2xl p-6 md:min-h-[260px] sm:p-8"
                >
                  <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl border border-volt/20 bg-volt/10 text-volt shadow-[0_0_24px_rgba(0,230,118,0.12)]">
                    <b.Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
                    {b.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-white/62 sm:text-lg">
                    {b.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-volt/10 py-12 sm:py-24" aria-labelledby="intel-heading">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
            <div>
              <SectionIntro
                kicker="Competitor notes"
                title="Save what practices say about other brands"
                highlight="other brands"
                id="intel-heading"
                compact
              />
              <p className="mt-6 text-lg leading-relaxed text-white/70 sm:text-xl">
                If a practice mentions another product, StreetNotes saves it.
                Your team can see which other brands are coming up in the field.
              </p>
            </div>
            <IntelPreview />
          </div>
        </section>

        <section className="border-t border-volt/10 py-12 sm:py-24" aria-labelledby="story-vault-heading">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
            <StoryVaultPreview />
            <div>
              <SectionIntro
                kicker="Story vault"
                title="Practice what to say next"
                highlight="Practice"
                id="story-vault-heading"
                compact
              />
              <p className="mt-6 text-lg leading-relaxed text-white/70 sm:text-xl">
                Turn real visit notes into short practice sessions. Work on
                what to say before the next meeting.
              </p>
              <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  { Icon: Shield, label: 'Practice answers' },
                  { Icon: Trophy, label: 'Score your practice' },
                  { Icon: Target, label: 'Daily practice' },
                  { Icon: Users, label: 'Team story library' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
                    <item.Icon className="h-4 w-4 text-volt" aria-hidden="true" />
                    <span className="text-sm font-bold text-white/86">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-volt/10 py-12 sm:py-24" aria-labelledby="testimonials-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionIntro
              kicker="Field proof"
              title="Reps use it because it is simple"
              highlight="simple"
              id="testimonials-heading"
            />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {testimonials.map((t) => (
                <figure
                  key={t.name}
                  className="sn-card flex h-full flex-col rounded-2xl p-6 md:min-h-[315px] sm:p-8"
                >
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <Quote className="h-8 w-8 text-volt" aria-hidden="true" />
                    <div className="flex gap-1 text-[#fbbf24]" aria-label="5 out of 5 stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-current" aria-hidden="true" />
                      ))}
                    </div>
                  </div>
                  <blockquote className="text-lg leading-relaxed text-white/82">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-auto flex items-center gap-3 pt-6">
                    <span className="grid h-11 w-11 place-items-center rounded-full border border-volt/25 bg-volt/12 font-bold text-volt">
                      {t.initials}
                    </span>
                    <span>
                      <span className="block font-bold text-white">{t.name}</span>
                      <span className="block text-sm text-white/52">{t.role}</span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-volt/10 py-12 sm:py-24" aria-labelledby="leaders-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="sn-card relative overflow-hidden rounded-3xl p-6 min-[380px]:p-8 sm:p-12 md:p-16">
              <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[linear-gradient(90deg,transparent,rgba(251,191,36,0.13))] lg:block" aria-hidden="true" />
              <div className="relative max-w-3xl">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#fbbf24]/25 bg-[#fbbf24]/10 px-4 py-2 font-mono text-xs font-bold uppercase text-[#fbbf24]">
                  <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                  For sales leaders
                </div>
                <h2 id="leaders-heading" className="font-display text-[42px] leading-[0.95] text-white sm:text-[64px] md:text-[78px]">
                  Give your reps an easier way to fill CRM.
                </h2>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70 sm:text-xl">
                  StreetNotes helps reps push better field updates into
                  Salesforce or Veeva after every visit, including opportunity
                  updates when a deal moves. Leaders get cleaner CRM data and a
                  clearer view of what is happening with customers.
                </p>
                <a
                  href="/for-leaders"
                  className="mt-8 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-volt px-7 py-4 font-bold text-black shadow-glow-volt transition-all duration-200 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto"
                >
                  Request a pilot
                  <ArrowRight size={19} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-volt/10 py-12 sm:py-24" aria-labelledby="faq-heading">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
            <div>
              <SectionIntro
                kicker="FAQ"
                title="Common questions"
                highlight="questions"
                id="faq-heading"
                compact
              />
              <p className="mt-6 text-lg leading-relaxed text-white/66">
                Clear answers before you try StreetNotes.
              </p>
            </div>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <details key={faq.question} className="sn-faq rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-bold text-white sm:text-lg">
                    {faq.question}
                    <span className="sn-faq-icon grid h-8 w-8 flex-shrink-0 place-items-center rounded-full border border-volt/20 bg-volt/10 text-volt">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/62">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-volt/10 py-12 sm:py-28" aria-labelledby="final-cta-heading">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mx-auto mb-8 flex justify-center">
              <BetaCounter />
            </div>
            <h2 id="final-cta-heading" className="font-display text-[52px] leading-[0.9] text-white min-[380px]:text-[58px] sm:text-[104px] md:text-[136px]">
              Try it after your{' '}
              <span className="text-volt drop-shadow-[0_0_40px_rgba(0,230,118,0.45)]">
                next visit.
              </span>
            </h2>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-white/64 sm:text-xl md:text-2xl">
              Talk for one minute. See the CRM fields and opportunity update it
              creates. Decide if it helps before you sign up for anything.
            </p>

            <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-5 text-left md:grid-cols-2">
              <div className="rounded-2xl border border-volt/35 bg-volt/12 p-6 shadow-glow-volt sm:p-8">
                <p className="font-mono text-xs font-bold uppercase text-volt">For the field</p>
                <p className="mt-3 text-2xl font-bold leading-tight text-white">
                  Try the free visit recap.
                </p>
                <p className="mt-4 text-base leading-relaxed text-white/72">
                  No signup. No credit card. Run a real 60-second recap and
                  see the Salesforce/Veeva-ready fields and opportunity update
                  immediately.
                </p>
                <a
                  href="/debrief"
                  className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-volt px-6 py-3.5 font-bold text-black shadow-glow-volt transition-all duration-200 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto"
                >
                  Try it free
                  <ArrowRight size={18} aria-hidden="true" />
                </a>
              </div>

              <div className="rounded-2xl border border-volt/24 bg-volt/10 p-6 shadow-glow-volt sm:p-8">
                <p className="font-mono text-xs font-bold uppercase text-volt">For sales leaders</p>
                <p className="mt-3 text-2xl font-bold leading-tight text-white">Request a pilot.</p>
                <p className="mt-4 text-base leading-relaxed text-white/70">
                  Help your team fill the right CRM fields and keep
                  opportunities current.
                </p>
                <a
                  href="/for-leaders"
                  className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-volt px-6 py-3.5 font-bold text-black transition-all duration-200 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto"
                >
                  Request a pilot
                  <ArrowRight size={18} aria-hidden="true" />
                </a>
              </div>
            </div>

            <div id="waitlist" className="sn-card mx-auto mt-6 max-w-3xl rounded-2xl p-6 text-left sm:p-8">
              <p className="font-mono text-xs font-bold uppercase text-volt">
                Want early access updates too?
              </p>
              <p className="mt-3 text-xl font-bold leading-tight text-white sm:text-2xl">
                Join the beta list after you try the free tool.
              </p>
              <div className="mt-5">
                <WaitlistForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-volt/10 bg-black/22 py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
          <div>
            <Logo size="sm" href={null} />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">
              Voice-to-CRM for sales reps. Talk after a visit and get CRM
              fields, tasks, and opportunity updates ready for Salesforce or
              Veeva.
            </p>
            <p className="mt-4 font-mono text-xs uppercase text-volt/78">
              hello@streetnotes.ai
            </p>
          </div>
          <div>
            <h3 className="font-bold text-white">Product</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/58">
              <li><a href="/debrief" className="inline-flex min-h-[44px] min-w-[44px] items-center hover:text-volt">Try free visit recap</a></li>
              <li><a href="/for-leaders" className="inline-flex min-h-[44px] min-w-[44px] items-center hover:text-volt">Sales leader pilot</a></li>
              <li><a href="/voice-to-crm-aesthetic-sales-reps" className="inline-flex min-h-[44px] min-w-[44px] items-center hover:text-volt">Voice-to-CRM overview</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white">Legal</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/58">
              <li><a href="/contact" className="inline-flex min-h-[44px] min-w-[44px] items-center hover:text-volt">Contact</a></li>
              <li><a href="/privacy" className="inline-flex min-h-[44px] min-w-[44px] items-center hover:text-volt">Privacy</a></li>
              <li><a href="/terms" className="inline-flex min-h-[44px] min-w-[44px] items-center hover:text-volt">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-3 border-t border-white/10 px-4 pt-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <ShinyText
            text="StreetNotes.ai - a ForgeTime.ai product"
            color="#6b7280"
            shineColor="#00E676"
            speed={3}
            spread={120}
            className="font-mono text-xs uppercase"
          />
          <p className="font-mono text-xs uppercase text-white/36">
            Copyright 2026 StreetNotes.ai. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

function SectionIntro({
  kicker,
  title,
  highlight,
  id,
  compact = false,
}: {
  kicker: string
  title: string
  highlight: string
  id: string
  compact?: boolean
}) {
  const [before, after] = title.split(highlight)

  return (
    <div className={compact ? '' : 'mb-12 sm:mb-16'}>
      <span className="font-mono text-xs font-bold uppercase text-volt/82">{kicker}</span>
      <h2
        id={id}
        className={`mt-3 font-display leading-[0.9] text-white ${
          compact ? 'text-[38px] min-[380px]:text-[42px] sm:text-[64px] md:text-[78px]' : 'text-[40px] min-[380px]:text-[46px] sm:text-[76px] md:text-[96px]'
        }`}
      >
        {before}
        <span className="text-volt drop-shadow-[0_0_24px_rgba(0,230,118,0.3)]">
          {highlight}
        </span>
        {after}
      </h2>
    </div>
  )
}

function ComparisonCard({
  label,
  title,
  body,
  tone = 'volt',
}: {
  label: string
  title: string
  body: string
  tone?: 'volt' | 'red'
}) {
  return (
    <div
      className={`sn-compare-card rounded-2xl p-6 sm:p-8 lg:p-10 ${
        tone === 'volt' ? 'sn-card sn-streetnotes-card' : 'sn-before-card'
      }`}
    >
      <span className={`font-mono text-xs font-bold uppercase ${tone === 'volt' ? 'text-volt' : 'text-red-300/82'}`}>
        {label}
      </span>
      <p className={`mt-4 text-2xl font-bold leading-tight min-[380px]:text-3xl sm:text-4xl ${tone === 'volt' ? 'text-white' : 'text-white/56'}`}>
        {title}
      </p>
      <p className="mt-4 text-base leading-relaxed text-white/62 sm:text-lg">
        {body}
      </p>
    </div>
  )
}

function ProductConsole() {
  return (
    <div className="relative">
      <div className="absolute -inset-5 rounded-[2rem] bg-[linear-gradient(135deg,rgba(0,230,118,0.2),rgba(125,211,252,0.12),rgba(251,191,36,0.08))] blur-2xl" aria-hidden="true" />
      <div className="sn-card relative overflow-hidden rounded-3xl p-4 shadow-glass-lift-lg sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-volt/30 bg-volt/12">
              <Mic className="h-5 w-5 text-volt" aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold text-white">Visit recap</p>
              <p className="text-sm text-white/50">Patel Aesthetics</p>
            </div>
          </div>
          <span className="rounded-full border border-volt/22 bg-volt/10 px-3 py-1 font-mono text-xs font-bold text-volt">
            00:47
          </span>
        </div>

        <div className="space-y-3">
          {[
            { label: 'CRM field: interest', value: 'A longer-lasting treatment option', color: 'bg-volt' },
            { label: 'CRM field: question', value: 'Does it cost more, and is it worth it?', color: 'bg-[#fbbf24]' },
            { label: 'Opportunity update', value: 'Create trial opportunity for Patel Aesthetics', color: 'bg-[#7dd3fc]' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-black/22 p-4">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${item.color}`} />
                <p className="font-mono text-[11px] font-bold uppercase text-white/45">{item.label}</p>
              </div>
              <p className="mt-2 text-base font-bold leading-snug text-white">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-volt/20 bg-volt/10 p-4">
          <div className="flex items-center gap-2 text-volt">
            <Lock className="h-4 w-4" aria-hidden="true" />
            <p className="font-mono text-[11px] font-bold uppercase">Review before CRM update</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-white/68">
            You approve each field, task, and opportunity change before it is
            pushed to Salesforce or Veeva.
          </p>
        </div>
      </div>
    </div>
  )
}

function OutputPreview() {
  return (
    <div className="sn-card rounded-3xl p-4 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-bold uppercase text-volt">CRM field preview</p>
          <h3 className="mt-1 text-2xl font-bold text-white">Patel Aesthetics</h3>
        </div>
        <Clock className="h-6 w-6 text-[#7dd3fc]" aria-hidden="true" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          ['Contact field', 'Dr. Priya Patel'],
          ['Product field', 'Botox, trying another option'],
          ['Question field', 'Will patients pay more if it lasts longer?'],
          ['Opportunity field', 'Create trial opportunity'],
          ['Task field', 'Send a short info sheet and check in Friday'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <p className="font-mono text-[11px] font-bold uppercase text-white/42">{label}</p>
            <p className="mt-2 text-sm font-bold leading-snug text-white sm:text-base">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-2xl border border-[#fbbf24]/20 bg-[#fbbf24]/10 p-4">
        <p className="font-mono text-[11px] font-bold uppercase text-[#fbbf24]">Push target</p>
        <p className="mt-2 text-sm leading-relaxed text-white/72">
          Approved fields update the matching record, or create a new
          opportunity when the visit creates a real sales chance.
        </p>
      </div>
    </div>
  )
}

function IntelPreview() {
  return (
    <div className="relative min-h-0 sm:min-h-[420px]">
      <div className="sn-card relative ml-auto max-w-md rounded-2xl p-4 min-[380px]:p-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-mono text-xs font-bold uppercase text-volt/82">Other brands mentioned</span>
          <span className="font-mono text-xs text-white/42">Last 30 days</span>
        </div>
        <div className="space-y-3">
          {competitorRows.map((c) => (
            <div key={c.name} className="flex items-center gap-3">
              <span className="w-20 truncate text-xs font-bold text-white">{c.name}</span>
              <div className="flex-1">
                <div
                  className="flex h-5 overflow-hidden rounded-md border border-white/10 bg-white/[0.04]"
                  style={{ width: `${c.pct}%`, minWidth: 20 }}
                >
                  <div className="h-full bg-volt" style={{ width: `${c.pos}%` }} />
                  <div className="h-full bg-red-400" style={{ width: `${c.neg}%` }} />
                  <div className="h-full bg-slate-300" style={{ width: `${100 - c.pos - c.neg}%` }} />
                </div>
              </div>
              <span className="w-6 text-right text-sm font-bold tabular-nums text-white">{c.count}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="sn-card relative mr-auto mt-4 max-w-sm rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <MessageSquareQuote className="mt-0.5 h-5 w-5 flex-shrink-0 text-volt" aria-hidden="true" />
          <div>
            <p className="text-sm italic leading-relaxed text-white/84">
              &ldquo;Dr. Patel said her patients keep asking if the longer-lasting option is worth the higher price.&rdquo;
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-volt/20 bg-volt/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-volt">
                Daxxify
              </span>
              <span className="font-mono text-[10px] uppercase text-white/48">Worth following up</span>
            </div>
          </div>
        </div>
      </div>
      <div className="relative mt-4 max-w-[270px] rounded-2xl border border-[#7dd3fc]/22 bg-[#7dd3fc]/10 p-4 min-[380px]:ml-8">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-[#7dd3fc]" aria-hidden="true" />
          <div>
            <p className="font-mono text-[10px] font-bold uppercase text-[#7dd3fc]">Weekly summary</p>
            <p className="text-sm font-bold text-white">Customers keep asking about price</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StoryVaultPreview() {
  return (
    <div className="relative order-2 min-h-0 lg:order-1 lg:min-h-[410px]">
      <div className="sn-card mx-auto max-w-md rounded-2xl p-4">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl border border-volt/40 bg-volt/10">
            <span className="font-display text-4xl leading-none text-volt">7</span>
          </div>
          <div className="flex-1">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-bold text-white">Lv.7 Closer</span>
              <span className="font-mono text-xs font-bold text-volt tabular-nums">3,450 XP</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/8">
              <div className="h-full w-[68%] rounded-full bg-[linear-gradient(90deg,#00E676,#7dd3fc)]" />
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-4 max-w-sm rounded-2xl border border-volt/24 bg-volt/10 p-4">
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-volt" aria-hidden="true" />
          <div>
            <p className="font-mono text-[10px] font-bold uppercase text-volt">Daily practice</p>
            <p className="text-sm text-white">Answer the price question in under 45 seconds</p>
          </div>
        </div>
      </div>
      <div className="sn-card mx-auto mt-4 max-w-md rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="rounded-md border border-volt/20 bg-volt/10 px-2 py-1 font-mono text-[10px] font-bold uppercase text-volt">
              Customer story
            </span>
            <p className="mt-3 text-lg font-bold leading-tight text-white">Chen follow-up story v3</p>
            <p className="mt-1 font-mono text-xs uppercase text-white/42">Personal best</p>
          </div>
          <div className="text-center">
            <span className="font-display text-6xl leading-none text-volt">9.2</span>
            <span className="block font-mono text-[10px] uppercase text-white/42">score</span>
          </div>
        </div>
      </div>
    </div>
  )
}
