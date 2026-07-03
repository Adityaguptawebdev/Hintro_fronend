import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useMeetings } from '../hooks/useMeetings';
import MeetingCard from '../components/MeetingCard';
import CreateMeetingModal from '../components/CreateMeetingModal';
import { Button } from '@/components/ui/button';
import { fadeInUp } from '../../../animations/variants';

const MeetingsPage = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [filters] = useState({ page: 1, limit: 20 });
  const { data, isLoading } = useMeetings(filters);

  return (
    <div className="p-8 flex flex-col gap-6 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-50">Meetings</h1>
          <p className="text-sm text-[#9f9fa9]">{data?.pagination?.total ?? 0} total meetings</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-primary text-orange-50 gap-2">
          <Plus className="size-4" />New Meeting
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-zinc-800" />
          ))}
        </div>
      )}

      {!isLoading && data?.items?.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-4xl">📅</span>
          <p className="text-sm font-semibold text-neutral-50">No meetings yet</p>
          <p className="text-xs text-[#9f9fa9]">Schedule your first meeting to get started</p>
          <Button size="sm" variant="secondary" onClick={() => setShowCreate(true)}>Create Meeting</Button>
        </div>
      )}

      {!isLoading && data?.items?.length > 0 && (
        <motion.div
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        >
          {data.items.map((meeting) => (
            <motion.div key={meeting._id} variants={fadeInUp}>
              <MeetingCard meeting={meeting} />
            </motion.div>
          ))}
        </motion.div>
      )}

      <CreateMeetingModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
};

export default MeetingsPage;
