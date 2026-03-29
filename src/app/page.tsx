'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Sparkles, ArrowRight, CheckCircle, Loader2, AlertCircle, Calendar, Rocket } from 'lucide-react';
import type { LeadFormData } from '@/lib/types';

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void;
    };
  }
}

export default function Home() {
  const [formData, setFormData] = useState<LeadFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    existing_website: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showCalendly, setShowCalendly] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit');
      }

      setLeadId(data.id);
      setSubmitStatus('success');
      setShowCalendly(true);

      // Open Calendly popup after a brief delay
      setTimeout(() => {
        if (window.Calendly) {
          window.Calendly.initPopupWidget({
            url: 'https://calendly.com/freewebsitedesigntoday/website-demo?hide_gdpr_banner=1&primary_color=3b82f6'
          });
        }
      }, 500);

    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full px-4 py-2 mb-6"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-blue-300">Limited Time Offer</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Get Your Dream Website
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                Designed FREE
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-8">
              Professional custom web design and redesign services.
              We build stunning websites that convert visitors into customers.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {['Custom Design', 'Mobile Responsive', 'SEO Optimized', 'Fast Delivery'].map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full px-4 py-2"
                >
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-slate-200">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Form Section */}
          <AnimatePresence mode="wait">
            {!showCalendly ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 md:p-10 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Start Your Free Design</h2>
                      <p className="text-slate-400">Fill in your details to get started</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="first_name" className="block text-sm font-medium text-slate-300 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          id="first_name"
                          name="first_name"
                          required
                          value={formData.first_name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-blue-500"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label htmlFor="last_name" className="block text-sm font-medium text-slate-300 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          id="last_name"
                          name="last_name"
                          required
                          value={formData.last_name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-blue-500"
                          placeholder="Smith"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-blue-500"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-blue-500"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="existing_website" className="block text-sm font-medium text-slate-300 mb-2">
                        Existing Website URL (if any)
                      </label>
                      <input
                        type="url"
                        id="existing_website"
                        name="existing_website"
                        value={formData.existing_website}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-blue-500"
                        placeholder="https://www.yourwebsite.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-slate-300 mb-2">
                        Notes about your new website
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        rows={4}
                        value={formData.notes}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 resize-none"
                        placeholder="Tell us about your business, what features you need, design preferences, etc."
                      />
                    </div>

                    {submitStatus === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
                      >
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <span className="text-red-300">{errorMessage}</span>
                      </motion.div>
                    )}

                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-glow"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Get My Free Design
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </motion.button>
                  </form>

                  <p className="text-center text-slate-500 text-sm mt-4">
                    By submitting, you agree to be contacted about your website project
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 md:p-10 shadow-2xl text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <AlertCircle className="w-10 h-10 text-white" />
                  </motion.div>

                  <h2 className="text-3xl font-bold text-white mb-4">
                    Wait! You&apos;re Not Done Yet!
                  </h2>

                  <p className="text-xl text-slate-300 mb-6">
                    Your information has been saved. Now schedule your <strong>Website Demo Call</strong> to see your new design!
                  </p>

                  <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <Calendar className="w-6 h-6 text-blue-400" />
                      <span className="text-lg font-semibold text-white">Schedule Your Demo</span>
                    </div>
                    <p className="text-slate-400 mb-4">
                      We&apos;ll have your website design ready by your appointment time!
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (window.Calendly) {
                          window.Calendly.initPopupWidget({
                            url: 'https://calendly.com/freewebsitedesigntoday/website-demo?hide_gdpr_banner=1&primary_color=3b82f6'
                          });
                        }
                      }}
                      className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                      <Calendar className="w-5 h-5" />
                      Open Calendar & Book Now
                    </motion.button>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-green-400">
                    <Rocket className="w-5 h-5" />
                    <span>We start building immediately after you book!</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12"
          >
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Why Choose Free Website Design Today?
            </span>
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎨',
                title: 'Custom Designs',
                description: 'Every website is uniquely crafted to match your brand and vision. No templates, no shortcuts.'
              },
              {
                icon: '⚡',
                title: 'Fast Turnaround',
                description: 'Your website design will be ready by your scheduled demo call. We work fast!'
              },
              {
                icon: '📱',
                title: 'Mobile First',
                description: 'Every design is fully responsive and looks amazing on all devices.'
              },
              {
                icon: '🔍',
                title: 'SEO Ready',
                description: 'Built with search engines in mind so your customers can find you easily.'
              },
              {
                icon: '🛡️',
                title: 'Secure & Fast',
                description: 'Modern hosting with SSL, fast load times, and enterprise-grade security.'
              },
              {
                icon: '🤝',
                title: 'Ongoing Support',
                description: 'We don\'t disappear after launch. Get continued support and updates.'
              }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-slate-800/40 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto text-center text-slate-500">
          <p>&copy; {new Date().getFullYear()} FreeWebsiteDesign.today. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
