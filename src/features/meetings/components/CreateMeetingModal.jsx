import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateMeeting } from '../hooks/useMeetings';

// datetime-local gives "2024-01-15T09:00" — convert to full ISO for the backend
const toISO = (localDt) => localDt ? new Date(localDt).toISOString() : undefined;

// Default to 1 hour from now, rounded to nearest 30 min
const defaultScheduledAt = () => {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setMinutes(d.getMinutes() >= 30 ? 30 : 0, 0, 0);
  return d.toISOString().slice(0, 16);
};

const minScheduledAt = () => new Date().toISOString().slice(0, 16);

const CreateMeetingModal = ({ open, onClose }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { duration: 60, scheduledAt: defaultScheduledAt() },
  });
  const { mutate, isPending } = useCreateMeeting();

  const onSubmit = (data) => {
    const payload = { ...data, scheduledAt: toISO(data.scheduledAt) };
    mutate(payload, { onSuccess: () => { reset({ duration: 60, scheduledAt: defaultScheduledAt() }); onClose(); } });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-900 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">

        <div className="flex items-center justify-between border-b border-white/10 px-4 sm:px-6 py-4">
          <h2 className="text-base font-semibold text-neutral-50">Schedule a Meeting</h2>
          <button
            onClick={onClose}
            className="size-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-[#9f9fa9] hover:text-neutral-50 transition-colors text-sm shrink-0"
          >
            ✕
          </button>
        </div>

        <form className="px-4 sm:px-6 py-5 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#9f9fa9]">Meeting title <span className="text-primary">*</span></label>
            <Input
              placeholder="Q2 Planning Session"
              className="bg-zinc-800 border-white/10 focus:border-primary/50 text-neutral-50 h-10"
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#9f9fa9]">Scheduled at <span className="text-primary">*</span></label>
            <input
              type="datetime-local"
              min={minScheduledAt()}
              className="flex h-10 w-full rounded-md border border-white/10 bg-zinc-800 px-3 py-1 text-sm text-neutral-50 shadow-sm transition-colors focus:outline-none focus:border-primary/50 focus:ring-0 [color-scheme:dark] disabled:cursor-not-allowed disabled:opacity-50"
              {...register('scheduledAt', { required: 'Date is required' })}
            />
            {errors.scheduledAt && <p className="text-xs text-red-400">{errors.scheduledAt.message}</p>}
          </div>

          {/* Duration + URL side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#9f9fa9]">Duration (min)</label>
              <Input
                type="number"
                placeholder="60"
                min={5}
                max={480}
                className="bg-zinc-800 border-white/10 focus:border-primary/50 text-neutral-50 h-10"
                {...register('duration', { valueAsNumber: true, min: 5 })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#9f9fa9]">Platform</label>
              <select
                className="flex h-10 w-full rounded-md border border-white/10 bg-zinc-800 px-3 py-1 text-sm text-neutral-50 shadow-sm transition-colors focus:outline-none focus:border-primary/50 [color-scheme:dark]"
                {...register('platform')}
              >
                <option value="other">Other</option>
                <option value="google_meet">Google Meet</option>
                <option value="zoom">Zoom</option>
                <option value="teams">Teams</option>
              </select>
            </div>
          </div>

          {/* Meeting URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#9f9fa9]">Meeting URL</label>
            <Input
              type="url"
              placeholder="https://meet.google.com/..."
              className="bg-zinc-800 border-white/10 focus:border-primary/50 text-neutral-50 h-10"
              {...register('meetingUrl')}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <Button variant="ghost" size="sm" type="button" onClick={onClose} className="text-[#9f9fa9] hover:text-neutral-50">
              Cancel
            </Button>
            <Button
              size="sm"
              type="submit"
              disabled={isPending}
              className="bg-gradient-to-r from-primary to-[oklch(0.769_0.188_70.08)] text-orange-50 px-5 shadow-[0_0_12px_oklch(0.646_0.222_41.116/0.35)]"
            >
              {isPending
                ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                : 'Create Meeting'
              }
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateMeetingModal;
