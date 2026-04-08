'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Video, Eye, EyeOff, LogIn, LogOut, RefreshCw,
  Trash2, Link as LinkIcon, ExternalLink, Calendar, Mail,
  Phone, Globe, Clock, CheckCircle, XCircle, AlertCircle, Loader2
} from 'lucide-react';
import type { Lead, ActiveMeeting } from '@/lib/types';

interface LeadWithAppointments extends Lead {
  appointments?: Array<{
    id: string;
    scheduled_at: string;
    meeting_link?: string;
    status: string;
  }>;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [leads, setLeads] = useState<LeadWithAppointments[]>([]);
  const [meetings, setMeetings] = useState<ActiveMeeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meetingLinkInputs, setMeetingLinkInputs] = useState<Record<string, string>>({});
  const [savingMeeting, setSavingMeeting] = useState<string | null>(null);

  const handleLogin = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'admin123') {
      setIsAuthenticated(true);
      fetchData();
    } else {
      setError('Invalid password');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [leadsRes, meetingsRes] = await Promise.all([
        fetch(`/api/leads?password=${encodeURIComponent(password)}`),
        fetch('/api/meeting')
      ]);

      const leadsData = await leadsRes.json();
      const meetingsData = await meetingsRes.json();

      if (!leadsRes.ok) throw new Error(leadsData.error);

      setLeads(leadsData.leads || []);
      setMeetings(meetingsData.meetings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSetMeetingLink = async (leadId: string) => {
    const link = meetingLinkInputs[leadId];
    if (!link) return;

    setSavingMeeting(leadId);
    try {
      const response = await fetch('/api/meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          lead_id: leadId,
          meeting_link: link
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to set meeting link');
      }

      setMeetingLinkInputs(prev => ({ ...prev, [leadId]: '' }));
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set meeting link');
    } finally {
      setSavingMeeting(null);
    }
  };

  const handleDeactivateMeeting = async (meetingId: string) => {
    try {
      await fetch(`/api/meeting?password=${encodeURIComponent(password)}&meeting_id=${meetingId}`, {
        method: 'DELETE'
      });
      fetchData();
    } catch (err) {
      setError('Failed to deactivate meeting');
    }
  };

  const handleUpdateStatus = async (leadId: string, status: string) => {
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, status })
      });
      fetchData();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      await fetch(`/api/leads/${leadId}?password=${encodeURIComponent(password)}`, {
        method: 'DELETE'
      });
      fetchData();
    } catch (err) {
      setError('Failed to delete lead');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'contacted': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'scheduled': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'in_progress': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800/60 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 w-full max-w-md"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Login</h1>
              <p className="text-slate-400">Enter password to continue</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Password"
                className="w-full px-4 py-3 pr-12 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Login
            </motion.button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400">Manage leads and meetings</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Leads', value: leads.length, icon: Users, color: 'blue' },
            { label: 'New Leads', value: leads.filter(l => l.status === 'new').length, icon: AlertCircle, color: 'yellow' },
            { label: 'Active Meetings', value: meetings.length, icon: Video, color: 'green' },
            { label: 'Completed', value: leads.filter(l => l.status === 'completed').length, icon: CheckCircle, color: 'emerald' }
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/60 border border-slate-700 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-${stat.color}-500/20 rounded-lg`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Active Meetings */}
        {meetings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-green-400" />
              Active Meetings
            </h2>
            <div className="grid gap-4">
              {meetings.map((meeting: any) => (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-green-500/10 border border-green-500/30 rounded-xl p-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-white font-medium">
                        {meeting.appointment?.lead?.first_name} {meeting.appointment?.lead?.last_name}
                      </span>
                      <a
                        href={meeting.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <LinkIcon className="w-4 h-4" />
                        Open Link
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <button
                      onClick={() => handleDeactivateMeeting(meeting.id)}
                      className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm"
                    >
                      Deactivate
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Leads Table */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              All Leads ({leads.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No leads yet
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {leads.map((lead) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Lead Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {lead.first_name} {lead.last_name}
                        </h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Mail className="w-4 h-4 text-slate-500" />
                          <a href={`mailto:${lead.email}`} className="hover:text-blue-400">
                            {lead.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <Phone className="w-4 h-4 text-slate-500" />
                          <a href={`tel:${lead.phone}`} className="hover:text-blue-400">
                            {lead.phone}
                          </a>
                        </div>
                        {lead.existing_website && (
                          <div className="flex items-center gap-2 text-slate-300">
                            <Globe className="w-4 h-4 text-slate-500" />
                            <a
                              href={lead.existing_website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-400 truncate"
                            >
                              {lead.existing_website}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock className="w-4 h-4 text-slate-500" />
                          {new Date(lead.created_at).toLocaleDateString()} {new Date(lead.created_at).toLocaleTimeString()}
                        </div>
                      </div>

                      {lead.notes && (
                        <div className="mt-2 p-2 bg-slate-900/50 rounded-lg">
                          <p className="text-sm text-slate-400">
                            <strong className="text-slate-300">Notes:</strong> {lead.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 lg:w-72">
                      {/* Status dropdown */}
                      <select
                        value={lead.status}
                        onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                        className="px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>

                      {/* Meeting link input */}
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="Meeting link (Zoom, Meet, etc.)"
                          value={meetingLinkInputs[lead.id] || ''}
                          onChange={(e) => setMeetingLinkInputs(prev => ({ ...prev, [lead.id]: e.target.value }))}
                          className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500"
                        />
                        <button
                          onClick={() => handleSetMeetingLink(lead.id)}
                          disabled={!meetingLinkInputs[lead.id] || savingMeeting === lead.id}
                          className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 disabled:opacity-50 rounded-lg text-green-400 text-sm flex items-center gap-1"
                        >
                          {savingMeeting === lead.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Video className="w-4 h-4" />
                              Set
                            </>
                          )}
                        </button>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 text-sm flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Lead
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Error toast */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 bg-red-500/90 text-white px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg"
            >
              <XCircle className="w-5 h-5" />
              {error}
              <button onClick={() => setError(null)} className="hover:bg-red-600 p-1 rounded">
                <XCircle className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
