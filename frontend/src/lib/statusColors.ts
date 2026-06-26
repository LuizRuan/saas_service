// ServiceRequest status
export const serviceRequestStatusColor: Record<string, string> = {
  open: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  quoted: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
  scheduled: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
  in_progress: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  waiting_approval: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

// Quote status
export const quoteStatusColor: Record<string, string> = {
  sent: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  accepted: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-400 border border-red-500/20',
  expired: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
};

// Order status
export const orderStatusColor: Record<string, string> = {
  created: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  scheduled: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
  in_progress: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  waiting_approval: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

// Payment status
export const paymentStatusColor: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  paid: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  refunded: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  failed: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

// Dispute status
export const disputeStatusColor: Record<string, string> = {
  open: 'bg-red-500/10 text-red-400 border border-red-500/20',
  under_review: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  resolved_client: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  resolved_provider: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
  refunded: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
};

// Urgency
export const urgencyColor: Record<string, string> = {
  low: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  high: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

export function getStatusColor(map: Record<string, string>, status: string): string {
  return map[status] ?? 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
}
