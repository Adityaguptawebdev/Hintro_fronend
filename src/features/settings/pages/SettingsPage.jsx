import { useState } from 'react';
import { Bot, CheckCircle2, Circle, ExternalLink, Hash, Mail, Save, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth.store';
import { useUpdatePreferences } from '../hooks/useSettings';

const LEAD_TIME_OPTIONS = [
  { value: '1', label: '1 hour before' },
  { value: '2', label: '2 hours before' },
  { value: '6', label: '6 hours before' },
  { value: '12', label: '12 hours before' },
  { value: '24', label: '24 hours before' },
  { value: '48', label: '48 hours before' },
];

function SectionHeading({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="font-semibold uppercase text-[#9f9fa9] text-xs tracking-widest">{children}</span>
      <div className="flex-1 h-px bg-white/[0.06]" />
    </div>
  );
}

function StatusBadge({ connected }) {
  return connected ? (
    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 rounded-full px-2.5 py-1">
      <CheckCircle2 className="size-3" />
      Connected
    </span>
  ) : (
    <span className="flex items-center gap-1.5 text-xs font-medium text-[#9f9fa9] bg-white/5 rounded-full px-2.5 py-1">
      <Circle className="size-3" />
      Not connected
    </span>
  );
}

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const { mutate: savePreferences, isPending } = useUpdatePreferences();

  const prefs = user?.preferences ?? {};
  const integrations = user?.integrations ?? {};

  const [notifyViaEmail, setNotifyViaEmail] = useState(prefs.notifyViaEmail ?? true);
  const [notifyViaTelegram, setNotifyViaTelegram] = useState(prefs.notifyViaTelegram ?? false);
  const [notifyViaSlack, setNotifyViaSlack] = useState(prefs.notifyViaSlack ?? false);
  const [leadTime, setLeadTime] = useState(String(prefs.reminderLeadTimeHours ?? 24));
  const [telegramChatId, setTelegramChatId] = useState(integrations.telegram?.chatId ?? '');
  const [slackUserId, setSlackUserId] = useState(integrations.slack?.userId ?? '');
  const [slackChannelId, setSlackChannelId] = useState(integrations.slack?.channelId ?? '');

  const telegramConnected = integrations.telegram?.isConnected ?? false;
  const slackConnected = integrations.slack?.isConnected ?? false;

  const handleSave = () => {
    savePreferences({
      preferences: {
        notifyViaEmail,
        notifyViaTelegram,
        notifyViaSlack,
        reminderLeadTimeHours: Number(leadTime),
      },
      integrations: {
        telegram: { chatId: telegramChatId },
        slack: { userId: slackUserId, channelId: slackChannelId },
      },
    });
  };

  return (
    <div className="overflow-y-auto p-4 sm:p-6 md:p-8 flex flex-col gap-10 min-h-screen max-w-2xl">
      {/* Page header */}
      <header>
        <h1 className="font-bold text-2xl sm:text-3xl tracking-tight">Settings</h1>
        <p className="text-[#9f9fa9] text-sm mt-1">Manage your notification preferences and integrations.</p>
      </header>

      {/* Notification Channels */}
      <section>
        <SectionHeading>Notification Channels</SectionHeading>
        <div className="flex flex-col gap-3">

          {/* Email */}
          <Card className={`bg-zinc-900/60 backdrop-blur-md border-white/10 overflow-hidden transition-all ${notifyViaEmail ? 'shadow-[0_0_0_1px_oklch(0.646_0.222_41.116/0.2)]' : ''}`}>
            <div className={`h-0.5 ${notifyViaEmail ? 'bg-gradient-to-r from-amber-400/60 via-orange-500/60 to-transparent' : 'bg-transparent'}`} />
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${notifyViaEmail ? 'bg-orange-500/15' : 'bg-zinc-800'}`}>
                  <Mail className={`size-5 ${notifyViaEmail ? 'text-orange-400' : 'text-[#9f9fa9]'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">Email</span>
                    <StatusBadge connected={notifyViaEmail} />
                  </div>
                  <p className="text-xs text-[#9f9fa9] mt-0.5 truncate">{user?.email}</p>
                </div>
                <Switch checked={notifyViaEmail} onCheckedChange={setNotifyViaEmail} />
              </div>
            </CardContent>
          </Card>

          {/* Telegram */}
          <Card className={`bg-zinc-900/60 backdrop-blur-md border-white/10 overflow-hidden transition-all ${telegramConnected ? 'shadow-[0_0_0_1px_oklch(0.646_0.222_41.116/0.2)]' : ''}`}>
            <div className={`h-0.5 ${telegramConnected ? 'bg-gradient-to-r from-[#3BB3E8]/60 via-[#3BB3E8]/30 to-transparent' : 'bg-transparent'}`} />
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${telegramConnected ? 'bg-[#229ED9]/15' : 'bg-zinc-800'}`}>
                  <Bot className={`size-5 ${telegramConnected ? 'text-[#3BB3E8]' : 'text-[#9f9fa9]'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">Telegram</span>
                    <StatusBadge connected={telegramConnected} />
                  </div>
                  <p className="text-xs text-[#9f9fa9] mt-0.5">
                    {telegramConnected ? `Chat ID: ${integrations.telegram.chatId}` : 'Enter your Chat ID to connect'}
                  </p>
                </div>
                <Switch
                  checked={notifyViaTelegram}
                  onCheckedChange={setNotifyViaTelegram}
                  disabled={!telegramConnected && !telegramChatId}
                />
              </div>

              {/* Config area */}
              <div className="rounded-xl bg-zinc-800/50 border border-white/[0.06] p-4 flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="telegram-chat-id" className="text-xs font-medium text-[#9f9fa9]">
                    Telegram Chat ID
                  </label>
                  <Input
                    id="telegram-chat-id"
                    placeholder="e.g. 123456789"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    className="bg-zinc-900/80 border-white/10 text-sm h-9 focus-visible:ring-primary/40"
                  />
                </div>
                <a
                  href="https://t.me/userinfobot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary flex items-center gap-1.5 hover:text-primary/80 transition-colors w-fit"
                >
                  <ExternalLink className="size-3" />
                  Get your Chat ID from @userinfobot
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Slack */}
          <Card className={`bg-zinc-900/60 backdrop-blur-md border-white/10 overflow-hidden transition-all ${slackConnected ? 'shadow-[0_0_0_1px_oklch(0.646_0.222_41.116/0.2)]' : ''}`}>
            <div className={`h-0.5 ${slackConnected ? 'bg-gradient-to-r from-[#E01E5A]/60 via-[#E01E5A]/30 to-transparent' : 'bg-transparent'}`} />
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${slackConnected ? 'bg-[#E01E5A]/10' : 'bg-zinc-800'}`}>
                  <Hash className={`size-5 ${slackConnected ? 'text-[#E01E5A]' : 'text-[#9f9fa9]'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">Slack</span>
                    <StatusBadge connected={slackConnected} />
                  </div>
                  <p className="text-xs text-[#9f9fa9] mt-0.5">
                    {slackConnected ? `Member: ${integrations.slack.userId}` : 'Enter your Member ID and Channel to connect'}
                  </p>
                </div>
                <Switch
                  checked={notifyViaSlack}
                  onCheckedChange={setNotifyViaSlack}
                  disabled={!slackConnected && !(slackUserId && slackChannelId)}
                />
              </div>

              {/* Config area */}
              <div className="rounded-xl bg-zinc-800/50 border border-white/[0.06] p-4 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="slack-user-id" className="text-xs font-medium text-[#9f9fa9]">
                      Member ID
                    </label>
                    <Input
                      id="slack-user-id"
                      placeholder="U012AB3CD"
                      value={slackUserId}
                      onChange={(e) => setSlackUserId(e.target.value)}
                      className="bg-zinc-900/80 border-white/10 text-sm h-9 focus-visible:ring-primary/40"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="slack-channel-id" className="text-xs font-medium text-[#9f9fa9]">
                      Channel ID
                    </label>
                    <Input
                      id="slack-channel-id"
                      placeholder="C012AB3CD"
                      value={slackChannelId}
                      onChange={(e) => setSlackChannelId(e.target.value)}
                      className="bg-zinc-900/80 border-white/10 text-sm h-9 focus-visible:ring-primary/40"
                    />
                  </div>
                </div>
                <p className="text-xs text-[#9f9fa9] leading-relaxed">
                  Find your Member ID: Slack profile → <span className="text-neutral-400">View full profile</span> → <span className="text-neutral-400">More</span> → Copy member ID.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Reminder Timing */}
      <section>
        <SectionHeading>Reminder Timing</SectionHeading>
        <Card className="bg-zinc-900/60 backdrop-blur-md border-white/10">
          <CardContent className="p-5 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3 sm:gap-6">
              <div className="flex-1">
                <p className="font-semibold text-sm">Meeting reminder lead time</p>
                <p className="text-xs text-[#9f9fa9] mt-1">How far in advance to send a reminder before a meeting starts.</p>
              </div>
              <select
                value={leadTime}
                onChange={(e) => setLeadTime(e.target.value)}
                className="w-full sm:w-auto shrink-0 h-9 rounded-lg bg-zinc-800 border border-white/10 text-sm text-neutral-50 px-3 pr-8 focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239f9fa9' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
              >
                {LEAD_TIME_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-zinc-800">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Security note + Save */}
      <section className="flex flex-col gap-4">
        <div className="flex items-start gap-3 rounded-xl bg-zinc-800/40 border border-white/[0.06] px-4 py-3">
          <Shield className="size-4 text-[#9f9fa9] shrink-0 mt-0.5" />
          <p className="text-xs text-[#9f9fa9] leading-relaxed">
            Your integration credentials are stored securely. Disconnect at any time by clearing the fields and saving.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isPending}
          className="self-start bg-gradient-to-r from-amber-400/80 to-orange-600/80 hover:from-amber-400 hover:to-orange-600 text-white shadow-[0_0_16px_oklch(0.646_0.222_41.116/0.3)] hover:shadow-[0_0_20px_oklch(0.646_0.222_41.116/0.4)] gap-2 transition-all"
        >
          <Save className="size-4" />
          {isPending ? 'Saving…' : 'Save Preferences'}
        </Button>
      </section>
    </div>
  );
}
