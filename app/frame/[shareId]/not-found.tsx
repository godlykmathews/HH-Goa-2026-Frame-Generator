import Link from "next/link";

export default function FrameNotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-5 py-12 text-[#fff9dc]">
      <div className="pointer-events-none absolute -left-20 top-16 size-64 rounded-full bg-[#fee101]/12 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 size-72 rounded-full bg-[#ff1684]/12 blur-3xl" />

      <section className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/15 bg-[#003c24]/85 p-7 text-center shadow-2xl backdrop-blur md:p-10">
        <div className="absolute inset-x-0 top-0 h-2 bg-[linear-gradient(90deg,#fee101_0_33%,#ff1684_33%_66%,#b7f43b_66%)]" />
        <p className="font-mono-hh text-xs font-bold uppercase tracking-[0.24em] text-[#fee101]">
          HH Goa 2026 · 404
        </p>
        <h1 className="font-display mt-5 text-5xl leading-none uppercase md:text-6xl">
          This frame sailed away
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-7 text-white/75">
          The share link may be incomplete or no longer available. Your next
          builder identity is only a photo away.
        </p>
        <Link
          href="/#generator"
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#fee101] px-7 py-3 font-extrabold text-[#003c24] transition hover:-translate-y-0.5 hover:bg-[#fff07a]"
        >
          Create your own
        </Link>
        <p className="font-mono-hh mt-7 text-xs tracking-[0.18em] text-white/55">
          #FrameInGoa
        </p>
      </section>
    </main>
  );
}
