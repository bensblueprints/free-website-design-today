'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Clock, User, RefreshCw, ExternalLink, Globe, Loader2 } from 'lucide-react';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Appointment {
  id: string;
  scheduled_at: string;
  lead: Lead;
}

interface ActiveMeeting {
  id: string;
  meeting_link: string;
  is_active: boolean;
  appointment: Appointment;
}

export default function MeetingPage() {
  const [meetings, setMeetings] = useState<ActiveMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchMeetings = async () => {
    try {
      const response = await fetch('/api/meeting');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch meetings');
      }

      setMeetings(data.meetings || []);
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
    // Poll every 5 seconds for updates
    const interval = setInterval(fetchMeetings, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleJoinMeeting = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="min-h-screen py-12 px-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              FreeWebsiteDesign.today
            </h1>
          </div>
          <h2 className="text-xl md:text-2xl text-slate-300 mb-4">
            Meeting Room
          </h2>
          <p className="text-slate-400">
            Find your name below and click to join your website demo call
          </p>
        </motion.div>

        {/* Last refresh indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2 text-slate-500 text-sm mb-8"
        >
          <Clock className="w-4 h-4" />
          <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
          <button
            onClick={fetchMeetings}
            className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Loading state */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-slate-400">Loading meetings...</p>
          </motion.div>
        )}

        {/* Error state */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center"
          >
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchMeetings}
              className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* No meetings */}
        {!loading && !error && meetings.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800/60 backdrop-blur-xl border border-slate-700 rounded-3xl p-12 text-center"
          >
            <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Video className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              No Active Meetings
            </h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              There are currently no scheduled meetings. If you have an appointment,
              please wait here and the meeting will appear when it&apos;s time.
            </p>
            <div className="flex items-center justify-center gap-2 text-blue-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Checking for new meetings...</span>
            </div>
          </motion.div>
        )}

        {/* Meeting list */}
        {!loading && !error && meetings.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <AnimatePresence>
              {meetings.map((meeting, index) => (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-800/60 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">
                          {meeting.appointment.lead.first_name} {meeting.appointment.lead.last_name}
                        </h3>
                        <p className="text-slate-400">
                          Website Demo Call
                        </p>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleJoinMeeting(meeting.meeting_link)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-green-500/25"
                    >
                      <Video className="w-5 h-5" />
                      Join Meeting
                      <ExternalLink className="w-4 h-4" />
                    </motion.button>
                  </div>

                  {/* Meeting status indicator */}
                  <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-green-400">Meeting room is active</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Help section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-slate-500 text-sm">
            Don&apos;t see your name? Make sure you&apos;ve submitted your details and scheduled an appointment.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 mt-4 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Globe className="w-4 h-4" />
            Go to signup page
          </a>
        </motion.div>
      </div>
    </main>
  );
}
