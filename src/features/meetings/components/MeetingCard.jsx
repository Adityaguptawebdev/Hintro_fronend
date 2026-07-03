import { Link } from 'react-router-dom';
import { Calendar, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/utils/date.utils';
import { formatDuration, capitalize } from '@/utils/format.utils';

const statusBadge = (status) => ({
  scheduled: 'bg-blue-500/15 text-blue-400',
  in_progress: 'bg-purple-500/15 text-purple-400',
  completed: 'bg-emerald-500/15 text-emerald-400',
  cancelled: 'bg-zinc-700 text-[#9f9fa9]',
}[status] ?? 'bg-zinc-700 text-[#9f9fa9]');

const MeetingCard = ({ meeting }) => (
  <Link to={`/meetings/${meeting._id}`}>
    <Card className="bg-zinc-800/50 border-white/10 p-4 gap-3 hover:bg-zinc-800/80 transition-colors cursor-pointer flex flex-col">
      <CardHeader className="p-0 flex-row justify-between items-start gap-2">
        <h3 className="text-sm font-semibold text-neutral-50 line-clamp-2 flex-1">{meeting.title}</h3>
        <Badge className={`text-[10px] border-0 shrink-0 ${statusBadge(meeting.status)}`}>
          {capitalize(meeting.status.replace('_', ' '))}
        </Badge>
      </CardHeader>
      <CardContent className="p-0 flex flex-col gap-1.5">
        <div className="flex flex-col gap-1 text-xs text-[#9f9fa9]">
          <span className="flex items-center gap-1.5"><Calendar className="size-3" />{formatDateTime(meeting.scheduledAt)}</span>
          {meeting.duration && <span className="flex items-center gap-1.5"><Clock className="size-3" />{formatDuration(meeting.duration)}</span>}
          {meeting.participants?.length > 0 && (
            <span className="flex items-center gap-1.5">
              <Users className="size-3" />{meeting.participants.length} participant{meeting.participants.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
          {meeting.hasTranscript && <Badge className="text-[10px] border-0 bg-emerald-500/15 text-emerald-400">Transcript</Badge>}
          {meeting.hasInsights && <Badge className="text-[10px] border-0 bg-primary/15 text-primary">Insights</Badge>}
        </div>
      </CardContent>
    </Card>
  </Link>
);

export default MeetingCard;
