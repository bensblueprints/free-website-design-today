'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, LogOut, FolderOpen, MessageSquare, FileText, CheckCircle2,
  Circle, Clock, Send, ExternalLink, Loader2, ChevronDown, ChevronRight,
  AlertCircle, Milestone, Eye, Download, User
} from 'lucide-react';
import type { PortalProject, PortalMessage, PortalMilestone, PortalFile } from '@/lib/portal-types';

const gold = '#c9a962';
const goldLight = '#d4b978';
const bg = '#0a0a0a';
const cardBg = '#111111';
const borderColor = 'rgba(255,255,255,0.08)';
const textPrimary = '#f5f3ef';
const textMuted = '#8a8880';
const textDim = '#5a5850';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  in_progress: { label: 'In Progress', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  review: { label: 'In Review', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  revision: { label: 'Revision', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  completed: { label: 'Completed', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  on_hold: { label: 'On Hold', color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
      style={{ background: config.bg, color: config.color, border: `1px solid ${config.color}22` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: config.color }} />
      {config.label}
    </span>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${gold}, ${goldLight})` }}
      />
    </div>
  );
}

export default function PortalDashboard() {
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [projects, setProjects] = useState<PortalProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'files'>('overview');
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('portal_token');
    const clientData = localStorage.getItem('portal_client');

    if (!token) {
      router.push('/portal');
      return;
    }

    if (clientData) {
      try {
        setClient(JSON.parse(clientData));
      } catch { /* ignore */ }
    }

    fetchProjects(token);
  }, [router]);

  const fetchProjects = async (token: string) => {
    try {
      const res = await fetch('/api/portal/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem('portal_token');
        localStorage.removeItem('portal_client');
        router.push('/portal');
        return;
      }

      const data = await res.json();
      setProjects(data.projects || []);
      if (data.client) setClient(data.client);
      if (data.projects?.length > 0 && !activeProject) {
        setActiveProject(data.projects[0].id);
      }
    } catch {
      // Network error
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_client');
    router.push('/portal');
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeProject) return;

    const token = localStorage.getItem('portal_token');
    if (!token) return;

    setSendingMessage(true);

    try {
      const res = await fetch('/api/portal/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ project_id: activeProject, message: newMessage.trim() }),
      });

      if (res.ok) {
        setNewMessage('');
        fetchProjects(token);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch {
      // Network error
    } finally {
      setSendingMessage(false);
    }
  };

  const currentProject = projects.find((p) => p.id === activeProject);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: bg }}>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: gold }} />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ background: bg, fontFamily: "'DM Sans', sans-serif" }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: `1px solid ${borderColor}` }}
      >
        <a href="/" className="flex items-center gap-2 no-underline" style={{ color: textPrimary }}>
          <Globe className="w-5 h-5" style={{ color: gold }} />
          <span className="font-semibold text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            FreeWebsiteDesign.today
          </span>
        </a>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: `${gold}22`, color: gold }}
            >
              {client?.full_name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <span className="text-sm hidden sm:block" style={{ color: textMuted }}>
              {client?.full_name || 'Client'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ color: textMuted, background: 'rgba(255,255,255,0.03)', border: `1px solid ${borderColor}` }}
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar - Project List */}
        <aside
          className="w-full lg:w-72 flex-shrink-0 p-4 lg:p-6"
          style={{ borderRight: `1px solid ${borderColor}` }}
        >
          <h2
            className="text-xs font-semibold uppercase tracking-[0.2em] mb-4"
            style={{ color: textMuted }}
          >
            Your Projects
          </h2>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-10 h-10 mx-auto mb-3" style={{ color: textDim }} />
              <p className="text-sm" style={{ color: textMuted }}>
                No projects yet.
              </p>
              <p className="text-xs mt-1" style={{ color: textDim }}>
                Your project will appear here once we start working on your website.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    setActiveProject(project.id);
                    setActiveTab('overview');
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg transition-all duration-200"
                  style={{
                    background: activeProject === project.id ? `${gold}11` : 'transparent',
                    border: `1px solid ${activeProject === project.id ? `${gold}33` : 'transparent'}`,
                    color: textPrimary,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">{project.name}</span>
                    {activeProject === project.id ? (
                      <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: gold }} />
                    ) : (
                      <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: textDim }} />
                    )}
                  </div>
                  <StatusBadge status={project.status} />
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {!currentProject ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ background: `${gold}11` }}
                >
                  <Globe className="w-8 h-8" style={{ color: gold }} />
                </div>
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: textPrimary }}
                >
                  Welcome, {client?.full_name?.split(' ')[0] || 'Client'}
                </h2>
                <p style={{ color: textMuted }}>
                  {projects.length === 0
                    ? "We're getting everything set up. Your project details will appear here shortly."
                    : 'Select a project from the sidebar to view details.'}
                </p>
              </div>
            </div>
          ) : (
            <motion.div
              key={currentProject.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Project Header */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h1
                      className="text-2xl lg:text-3xl font-bold"
                      style={{ fontFamily: "'Cormorant Garamond', serif", color: textPrimary }}
                    >
                      {currentProject.name}
                    </h1>
                    {currentProject.description && (
                      <p className="mt-1 text-sm" style={{ color: textMuted }}>
                        {currentProject.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={currentProject.status} />
                    {currentProject.preview_url && (
                      <a
                        href={currentProject.preview_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        style={{ background: `${gold}22`, color: gold, border: `1px solid ${gold}33` }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </a>
                    )}
                    {currentProject.live_url && (
                      <a
                        href={currentProject.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        style={{ background: `${gold}`, color: bg }}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Live Site
                      </a>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-4">
                  <ProgressBar progress={currentProject.progress} />
                  <span className="text-sm font-semibold whitespace-nowrap" style={{ color: gold }}>
                    {currentProject.progress}%
                  </span>
                </div>

                {currentProject.estimated_completion && (
                  <p className="mt-2 text-xs flex items-center gap-1" style={{ color: textDim }}>
                    <Clock className="w-3 h-3" />
                    Estimated completion: {new Date(currentProject.estimated_completion).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-6 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                {([
                  { key: 'overview' as const, label: 'Overview', icon: Milestone, count: undefined as number | undefined },
                  { key: 'messages' as const, label: 'Messages', icon: MessageSquare, count: currentProject.messages?.length },
                  { key: 'files' as const, label: 'Files', icon: FileText, count: currentProject.files?.length },
                ]).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200"
                    style={{
                      background: activeTab === tab.key ? cardBg : 'transparent',
                      color: activeTab === tab.key ? gold : textMuted,
                      border: activeTab === tab.key ? `1px solid ${borderColor}` : '1px solid transparent',
                    }}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full"
                        style={{ background: `${gold}22`, color: gold }}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Milestones */}
                    <h3
                      className="text-lg font-semibold mb-4"
                      style={{ fontFamily: "'Cormorant Garamond', serif", color: textPrimary }}
                    >
                      Project Timeline
                    </h3>

                    {(!currentProject.milestones || currentProject.milestones.length === 0) ? (
                      <div
                        className="rounded-xl p-8 text-center"
                        style={{ background: cardBg, border: `1px solid ${borderColor}` }}
                      >
                        <Clock className="w-8 h-8 mx-auto mb-3" style={{ color: textDim }} />
                        <p className="text-sm" style={{ color: textMuted }}>
                          Milestones will be added once your project kicks off.
                        </p>
                      </div>
                    ) : (
                      <div className="relative space-y-0">
                        {/* Timeline line */}
                        <div
                          className="absolute left-[18px] top-4 bottom-4 w-px"
                          style={{ background: borderColor }}
                        />

                        {currentProject.milestones.map((milestone, i) => (
                          <div key={milestone.id} className="relative flex gap-4 py-3">
                            <div className="relative z-10 flex-shrink-0 mt-0.5">
                              {milestone.status === 'completed' ? (
                                <CheckCircle2 className="w-[38px] h-[38px]" style={{ color: '#22c55e' }} />
                              ) : milestone.status === 'in_progress' ? (
                                <div
                                  className="w-[38px] h-[38px] rounded-full flex items-center justify-center"
                                  style={{ background: `${gold}22`, border: `2px solid ${gold}` }}
                                >
                                  <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: gold }} />
                                </div>
                              ) : (
                                <Circle className="w-[38px] h-[38px]" style={{ color: textDim }} />
                              )}
                            </div>
                            <div
                              className="flex-1 rounded-lg p-4"
                              style={{
                                background: milestone.status === 'in_progress' ? `${gold}08` : cardBg,
                                border: `1px solid ${milestone.status === 'in_progress' ? `${gold}22` : borderColor}`,
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm" style={{ color: textPrimary }}>
                                  {milestone.title}
                                </h4>
                                {milestone.completed_at && (
                                  <span className="text-xs" style={{ color: textDim }}>
                                    {new Date(milestone.completed_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              {milestone.description && (
                                <p className="text-xs mt-1" style={{ color: textMuted }}>
                                  {milestone.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                      {[
                        { label: 'Status', value: statusConfig[currentProject.status]?.label || currentProject.status },
                        { label: 'Progress', value: `${currentProject.progress}%` },
                        { label: 'Messages', value: String(currentProject.messages?.length || 0) },
                        { label: 'Files', value: String(currentProject.files?.length || 0) },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="rounded-lg p-4"
                          style={{ background: cardBg, border: `1px solid ${borderColor}` }}
                        >
                          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: textDim }}>
                            {stat.label}
                          </p>
                          <p className="text-lg font-bold" style={{ color: gold }}>
                            {stat.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'messages' && (
                  <motion.div
                    key="messages"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col"
                  >
                    {/* Messages List */}
                    <div
                      className="rounded-xl overflow-hidden flex flex-col"
                      style={{
                        background: cardBg,
                        border: `1px solid ${borderColor}`,
                        minHeight: '400px',
                        maxHeight: '500px',
                      }}
                    >
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {(!currentProject.messages || currentProject.messages.length === 0) ? (
                          <div className="text-center py-12">
                            <MessageSquare className="w-8 h-8 mx-auto mb-3" style={{ color: textDim }} />
                            <p className="text-sm" style={{ color: textMuted }}>
                              No messages yet. Send a message to get in touch with our team.
                            </p>
                          </div>
                        ) : (
                          currentProject.messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className="max-w-[80%] rounded-xl px-4 py-3"
                                style={{
                                  background: msg.sender_type === 'client' ? `${gold}15` : 'rgba(255,255,255,0.04)',
                                  border: `1px solid ${msg.sender_type === 'client' ? `${gold}22` : borderColor}`,
                                }}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-semibold" style={{ color: msg.sender_type === 'client' ? gold : '#3b82f6' }}>
                                    {msg.sender_type === 'client' ? 'You' : (msg.sender_name || 'Team')}
                                  </span>
                                  <span className="text-xs" style={{ color: textDim }}>
                                    {new Date(msg.created_at).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm leading-relaxed" style={{ color: textPrimary }}>
                                  {msg.message}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Message Input */}
                      <div className="p-4" style={{ borderTop: `1px solid ${borderColor}` }}>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2.5 rounded-lg text-sm"
                            style={{
                              background: bg,
                              border: `1px solid ${borderColor}`,
                              color: textPrimary,
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          />
                          <button
                            onClick={handleSendMessage}
                            disabled={sendingMessage || !newMessage.trim()}
                            className="px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-200"
                            style={{
                              background: !newMessage.trim() ? textDim : gold,
                              color: bg,
                              cursor: !newMessage.trim() ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {sendingMessage ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'files' && (
                  <motion.div
                    key="files"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {(!currentProject.files || currentProject.files.length === 0) ? (
                      <div
                        className="rounded-xl p-8 text-center"
                        style={{ background: cardBg, border: `1px solid ${borderColor}` }}
                      >
                        <FileText className="w-8 h-8 mx-auto mb-3" style={{ color: textDim }} />
                        <p className="text-sm" style={{ color: textMuted }}>
                          No files yet. Deliverables and design files will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {currentProject.files.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-4 rounded-lg"
                            style={{ background: cardBg, border: `1px solid ${borderColor}` }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ background: `${gold}11` }}
                              >
                                <FileText className="w-5 h-5" style={{ color: gold }} />
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: textPrimary }}>
                                  {file.file_name}
                                </p>
                                <p className="text-xs" style={{ color: textDim }}>
                                  {file.uploaded_by === 'team' ? 'Uploaded by team' : 'Uploaded by you'}
                                  {' • '}
                                  {new Date(file.created_at).toLocaleDateString()}
                                  {file.file_size && ` • ${(file.file_size / 1024).toFixed(0)} KB`}
                                </p>
                              </div>
                            </div>
                            <a
                              href={file.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                              style={{ background: `${gold}11`, color: gold }}
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
