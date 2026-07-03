import { useState } from 'react';
import {
  Calendar, CheckCircle2, CheckSquare, ChevronDown, Flag,
  LayoutGrid, Plus, Search, Table, Video,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useActionItems, useUpdateActionItemStatus } from '../hooks/useActionItems';
import { formatDate } from '@/utils/date.utils';

const FILTERS = ['All', 'Open', 'In Progress', 'Done', 'Overdue'];

const filterToStatus = { Open: 'pending', 'In Progress': 'in_progress', Done: 'completed' };

const COLUMN_META = {
  pending:    { label: 'Backlog',     topColor: 'border-t-[#f97316]' },
  in_progress:{ label: 'In Progress', topColor: 'border-t-[oklch(0.488_0.243_264.376)]' },
  completed:  { label: 'Done',        topColor: 'border-t-[oklch(0.696_0.17_162.48)]' },
};

const priorityClass = (p) => ({
  low: 'bg-zinc-800 text-neutral-50',
  medium: 'bg-amber-500/15 text-amber-500',
  high: 'bg-[#ff6467]/15 text-[#ff6467]',
  critical: 'bg-[#ff6467]/20 text-[#ff6467]',
}[p] ?? 'bg-zinc-800 text-neutral-50');

const statusClass = (s) => ({
  pending: 'bg-primary/15 text-primary',
  in_progress: 'bg-[#1447e6]/15 text-[#1447e6]',
  completed: 'bg-[#00bc7d]/15 text-[#00bc7d]',
  cancelled: 'bg-zinc-800 text-[#9f9fa9]',
}[s] ?? 'bg-zinc-800 text-[#9f9fa9]');

const statusLabel = (s) => ({
  pending: 'Open',
  in_progress: 'In Progress',
  completed: 'Done',
  cancelled: 'Cancelled',
}[s] ?? s);

const avatarInitials = (item) => {
  const name = item.assignee?.name ?? item.assignee?.email ?? '?';
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
};

const AVATAR_COLORS = ['bg-[#1447e6]', 'bg-[#00bc7d]', 'bg-amber-500', 'bg-primary', 'bg-[#ff2056]'];
const avatarColor = (id) => AVATAR_COLORS[(id?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

export default function ActionItemsPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [viewMode, setViewMode] = useState('kanban');

  const statusFilter = filterToStatus[activeFilter];
  const isOverdueFilter = activeFilter === 'Overdue';

  const { data, isLoading } = useActionItems({ limit: 100 });
  const { mutate: updateStatus } = useUpdateActionItemStatus();

  const allItems = data?.items ?? [];

  const filtered = allItems.filter((item) => {
    if (isOverdueFilter) return item.isOverdue;
    if (statusFilter) return item.status === statusFilter;
    return true;
  });

  const grouped = {
    pending: allItems.filter((i) => i.status === 'pending'),
    in_progress: allItems.filter((i) => i.status === 'in_progress'),
    completed: allItems.filter((i) => i.status === 'completed'),
  };

  const kanbanItems = isOverdueFilter
    ? { pending: allItems.filter((i) => i.isOverdue && i.status === 'pending'), in_progress: allItems.filter((i) => i.isOverdue && i.status === 'in_progress'), completed: [] }
    : statusFilter
      ? { [statusFilter]: grouped[statusFilter] ?? [], ...Object.fromEntries(Object.keys(grouped).filter((k) => k !== statusFilter).map((k) => [k, []])) }
      : grouped;

  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-6 min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-start gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-2xl sm:text-3xl tracking-tight">Action Items</h1>
          <p className="text-[#9f9fa9] text-sm">Track, assign, and close tasks extracted from your meetings.</p>
        </div>
        <Badge className="bg-primary/15 text-primary text-sm px-3 py-1">{allItems.length} total</Badge>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="size-4 top-1/2 -translate-y-1/2 text-[#9f9fa9] absolute left-3" />
          <Input className="bg-zinc-900 border-white/10 pl-9" placeholder="Search tasks..." />
        </div>
        <div className="rounded-lg bg-zinc-900 border border-white/10 flex p-1 items-center gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`rounded-md text-xs px-3 py-1 transition-colors ${
                activeFilter === f
                  ? f === 'Overdue'
                    ? 'shadow-[0_0_12px_oklch(0.704_0.191_22.216/.4)] font-medium bg-[#ff6467]/15 text-[#ff6467]'
                    : 'font-medium bg-zinc-800 text-neutral-50'
                  : 'text-[#9f9fa9] hover:text-neutral-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="rounded-lg bg-zinc-900 text-[#9f9fa9] text-xs border border-white/10 flex px-3 py-2 items-center gap-2">
          <Flag className="size-3.5" />Priority <ChevronDown className="size-3" />
        </button>
        <div className="rounded-lg bg-zinc-900 border border-white/10 flex ml-auto p-1 items-center gap-1">
          <button
            onClick={() => setViewMode('kanban')}
            className={`size-7 rounded-md flex justify-center items-center ${viewMode === 'kanban' ? 'bg-zinc-800 text-neutral-50' : 'text-[#9f9fa9]'}`}
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`size-7 rounded-md flex justify-center items-center ${viewMode === 'table' ? 'bg-zinc-800 text-neutral-50' : 'text-[#9f9fa9]'}`}
          >
            <Table className="size-4" />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-xl bg-zinc-800" />)}
        </div>
      )}

      {/* Kanban */}
      {!isLoading && viewMode === 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(COLUMN_META).map(([status, { label, topColor }]) => {
            const cards = kanbanItems[status] ?? [];
            return (
              <div key={status} className={`${topColor} rounded-xl bg-zinc-900/40 border-t-2 border-r-0 border-b-0 border-l-0 flex p-3 flex-col gap-3`} style={{ minHeight: 300 }}>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">{label}</span>
                  <Badge className="bg-primary/15 text-primary text-xs">{cards.length}</Badge>
                </div>
                <div className="flex flex-col gap-2">
                  {cards.length === 0 && (
                    <div className="text-center py-6 text-[#9f9fa9] text-xs">No items</div>
                  )}
                  {cards.map((item) => (
                    <div
                      key={item._id}
                      className={`rounded-lg bg-zinc-900 border flex p-3 flex-col gap-2 ${item.isOverdue ? 'border-l-2 border-l-destructive border-r border-t border-b border-white/10 shadow-[0_0_14px_oklch(0.704_0.191_22.216/.3)]' : 'border-white/10'} ${item.status === 'completed' ? 'opacity-80' : ''}`}
                    >
                      {item.isOverdue ? (
                        <div className="flex justify-between items-center gap-1">
                          <p className="font-medium text-sm leading-snug">{item.title}</p>
                          <Badge className="bg-[#ff6467]/20 text-[#ff6467] text-[9px] border-0 shrink-0">Overdue</Badge>
                        </div>
                      ) : (
                        <p className={`font-medium text-sm leading-snug ${item.status === 'completed' ? 'line-through text-[#9f9fa9]' : ''}`}>{item.title}</p>
                      )}
                      <div className="flex justify-between items-center">
                        <div className={`size-6 font-semibold rounded-full ${avatarColor(item._id)} text-[10px] flex justify-center items-center text-white`}>
                          {avatarInitials(item)}
                        </div>
                        {item.status === 'completed'
                          ? <CheckCircle2 className="size-4 text-[#00bc7d]" />
                          : <Badge className={`${priorityClass(item.priority)} text-[10px] border-0`}>{item.priority}</Badge>
                        }
                      </div>
                      {item.dueDate && (
                        <span className="text-[#9f9fa9] text-[10px] flex items-center gap-1">
                          <Calendar className="size-2.5" />{formatDate(item.dueDate, 'MMM d')}
                        </span>
                      )}
                      {/* Quick status cycle */}
                      {item.status !== 'completed' && (
                        <button
                          onClick={() => updateStatus({ id: item._id, status: item.status === 'pending' ? 'in_progress' : 'completed' })}
                          className="text-[9px] text-primary/70 hover:text-primary transition-colors text-left"
                        >
                          → Mark {item.status === 'pending' ? 'In Progress' : 'Done'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table */}
      {!isLoading && viewMode === 'table' && (
        <div className="rounded-xl bg-zinc-900 border border-white/10 flex flex-col overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-[2fr_1fr_1fr_0.8fr_1.2fr_1fr] font-medium text-[#9f9fa9] text-xs border-b border-white/10 px-4 py-3 gap-4">
              <span>Task</span><span>Assignee</span><span>Priority</span><span>Due Date</span><span>Status</span><span>Action</span>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-10 text-[#9f9fa9] text-sm">No action items match this filter.</div>
            )}
            {filtered.map((item, i) => (
              <div key={item._id} className={`grid grid-cols-[2fr_1fr_1fr_0.8fr_1.2fr_1fr] text-sm px-4 py-3 items-center gap-4 ${i % 2 === 0 ? 'bg-zinc-950/40' : ''} hover:bg-zinc-800/30 transition-colors`}>
                <span className={`font-medium truncate ${item.status === 'completed' ? 'line-through text-[#9f9fa9]' : ''}`}>{item.title}</span>
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`size-6 font-semibold rounded-full ${avatarColor(item._id)} text-[10px] flex justify-center items-center text-white shrink-0`}>
                    {avatarInitials(item)}
                  </div>
                  <span className="text-[#9f9fa9] text-xs truncate">{item.assignee?.name ?? item.assignee?.email ?? '—'}</span>
                </div>
                <Badge className={`${priorityClass(item.priority)} text-[10px] w-fit border-0`}>{item.priority}</Badge>
                <span className={`text-xs ${item.isOverdue ? 'text-[#ff6467]' : 'text-[#9f9fa9]'}`}>
                  {item.dueDate ? formatDate(item.dueDate, 'MMM d') : '—'}
                </span>
                <Badge className={`${statusClass(item.status)} text-[10px] w-fit border-0`}>{statusLabel(item.status)}</Badge>
                {item.status !== 'completed' ? (
                  <button
                    onClick={() => updateStatus({ id: item._id, status: item.status === 'pending' ? 'in_progress' : 'completed' })}
                    className="text-xs text-primary hover:underline text-left"
                  >
                    {item.status === 'pending' ? 'Start →' : 'Complete ✓'}
                  </button>
                ) : (
                  <CheckCircle2 className="size-4 text-[#00bc7d]" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
