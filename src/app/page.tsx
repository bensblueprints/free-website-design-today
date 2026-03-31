'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Globe, Sparkles, CheckCircle, Zap, Palette, Smartphone, Search, Shield, HeartHandshake, ArrowDown, Star } from 'lucide-react';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const features = [
  { icon: Palette, title: 'Custom Design', desc: 'Handcrafted to your brand — zero templates, zero compromises.' },
  { icon: Zap, title: 'Lightning Fast', desc: 'Your design ready by your demo call. We move at startup speed.' },
  { icon: Smartphone, title: 'Mobile First', desc: 'Pixel-perfect on every screen, from phones to ultrawide monitors.' },
  { icon: Search, title: 'SEO Built-In', desc: 'Structured for Google from day one so customers find you.' },
  { icon: Shield, title: 'Secure & Reliable', desc: 'SSL, modern hosting, and enterprise-grade infrastructure included.' },
  { icon: HeartHandshake, title: 'Ongoing Support', desc: "We don't ghost after launch. Continued updates and support." },
];

const testimonials = [
  { name: 'Sarah M.', role: 'Bakery Owner', text: 'I couldn\'t believe they built my entire site for free. It looks better than sites I\'ve paid thousands for.', stars: 5 },
  { name: 'James T.', role: 'Fitness Coach', text: 'From the demo call to launch was 48 hours. My bookings doubled in the first week.', stars: 5 },
  { name: 'Maria L.', role: 'Real Estate Agent', text: 'Professional, fast, and the design is absolutely stunning. My clients are always impressed.', stars: 5 },
];

const stats = [
  { value: '500+', label: 'Websites Launched' },
  { value: '48hr', label: 'Avg. Turnaround' },
  { value: '100%', label: 'Free Design' },
  { value: '5★', label: 'Client Rating' },
];

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <main className="min-h-screen overflow-hidden">
      {/* ── Floating Orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -30, 20, 0], y: [0, 30, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/3 -left-40 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, 20, -10, 0], y: [0, -20, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[100px]"
        />
      </div>

      {/* ══════════════════ HERO ══════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-4 py-24">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full px-5 py-2.5 mb-8 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
            <span className="text-sm font-semibold tracking-wide text-blue-300 uppercase">Limited Time — 100% Free</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-[0.95] mb-8 tracking-tight"
          >
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Your Dream Website
            </span>
            <br />
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent"
            >
              Designed Free.
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="text-lg md:text-2xl text-slate-300/90 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            We design and build premium custom websites — at zero cost to you.
            Book a call, and we&apos;ll have a live demo ready before your appointment.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-wrap justify-center gap-3 mb-14"
          >
            {['Custom Design', 'Mobile Responsive', 'SEO Optimized', 'Fast Delivery'].map((tag, i) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + i * 0.08 }}
                className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2"
              >
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-slate-200 font-medium">{tag}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.a
            href="#book"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(59,130,246,0.4)' }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-lg rounded-2xl shadow-xl shadow-blue-500/25 transition-all"
          >
            <Globe className="w-5 h-5" />
            Book Your Free Design Call
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </motion.a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2"
          >
            <div className="w-1.5 h-1.5 bg-white/50 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════ STATS BAR ══════════════════ */}
      <section className="relative py-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 backdrop-blur-sm border-y border-white/5" />
        <AnimatedSection className="relative max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={scaleIn} className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </AnimatedSection>
      </section>

      {/* ══════════════════ FEATURES ══════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Everything You Need
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 text-lg max-w-xl mx-auto">
              A complete website solution — designed, built, and launched for free.
            </motion.p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <AnimatedSection key={f.title}>
                <motion.div
                  variants={i % 2 === 0 ? slideInLeft : slideInRight}
                  whileHover={{ y: -8, borderColor: 'rgba(59,130,246,0.5)', transition: { duration: 0.25 } }}
                  className="group relative bg-slate-800/40 backdrop-blur-sm border border-white/5 rounded-2xl p-7 h-full overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500" />
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/20 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                      <f.icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ PROCESS ══════════════════ */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                How It Works
              </span>
            </motion.h2>
          </AnimatedSection>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-transparent" />

            {[
              { step: '01', title: 'Book Your Call', desc: 'Pick a time that works — takes 30 seconds.' },
              { step: '02', title: 'We Design Your Site', desc: 'Our team builds a custom design before your call.' },
              { step: '03', title: 'Live Demo', desc: 'We walk you through your new site on a video call.' },
              { step: '04', title: 'Launch!', desc: 'Love it? We push it live the same day.' },
            ].map((item, i) => (
              <AnimatedSection key={item.step} className="relative mb-12 last:mb-0">
                <motion.div
                  variants={i % 2 === 0 ? slideInLeft : slideInRight}
                  className={`flex items-center gap-6 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} md:text-${i % 2 === 0 ? 'right' : 'left'}`}
                >
                  <div className="hidden md:block flex-1" />
                  <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
                    <span className="text-white font-extrabold text-lg">{item.step}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-slate-400">{item.desc}</p>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ TESTIMONIALS ══════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                What Our Clients Say
              </span>
            </motion.h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <AnimatedSection key={t.name}>
                <motion.div
                  variants={fadeUp}
                  whileHover={{ y: -5 }}
                  className="bg-slate-800/40 backdrop-blur-sm border border-white/5 rounded-2xl p-7 h-full"
                >
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 mb-6 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                  <div>
                    <div className="font-semibold text-white">{t.name}</div>
                    <div className="text-sm text-slate-500">{t.role}</div>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ BOOKING WIDGET ══════════════════ */}
      <section id="book" className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection className="text-center mb-10">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Book Your Free Design Call
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 text-lg">
              Pick a time, tell us about your project, and we&apos;ll have a custom design ready for you.
            </motion.p>
          </AnimatedSection>

          <AnimatedSection>
            <motion.div
              variants={scaleIn}
              className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-4 md:p-8 shadow-2xl shadow-blue-500/5"
            >
              <iframe
                src="https://api.loopflo.io/widget/booking/pyBwIV8UeQpRvbGjc4bz"
                style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '700px', borderRadius: '16px' }}
                scrolling="no"
                id="pyBwIV8UeQpRvbGjc4bz_booking"
              />
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer className="py-10 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-white">FreeWebsiteDesign.today</span>
          </div>
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} FreeWebsiteDesign.today. All rights reserved.
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <a href="/portal" className="text-slate-600 hover:text-slate-400 text-xs transition-colors">
              Client Portal
            </a>
            <span className="text-slate-700">·</span>
            <a href="/admin" className="text-slate-600 hover:text-slate-400 text-xs transition-colors">
              Admin
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
