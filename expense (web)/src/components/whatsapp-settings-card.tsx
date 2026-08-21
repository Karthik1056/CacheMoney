'use client';

import { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, Loader2, Info, Smartphone, Key, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { sendTestWhatsAppAlert, checkAndSendTomorrowReminders } from '@/app/actions/whatsapp-reminders';

export function WhatsAppSettingsCard() {
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<'meta' | 'callmebot'>('meta');
  
  // CallMeBot fields
  const [phone, setPhone] = useState('');
  const [apiKey, setApiKey] = useState('');

  // Meta Cloud API fields
  const [metaPhoneId, setMetaPhoneId] = useState('');
  const [metaToken, setMetaToken] = useState('');
  const [metaRecipient, setMetaRecipient] = useState('');

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    let result;
    if (provider === 'meta') {
      if (!metaPhoneId || !metaToken || !metaRecipient) {
        setStatusMsg({ type: 'error', text: 'Please fill in Meta Phone Number ID, Access Token, and Recipient Phone.' });
        setLoading(false);
        return;
      }
      result = await sendTestWhatsAppAlert(metaRecipient, metaToken);
    } else {
      if (!phone || !apiKey) {
        setStatusMsg({ type: 'error', text: 'Please enter your WhatsApp Phone Number and CallMeBot API Key.' });
        setLoading(false);
        return;
      }
      result = await sendTestWhatsAppAlert(phone, apiKey);
    }

    setLoading(false);

    if (result.success) {
      setStatusMsg({ type: 'success', text: 'Test message sent to your WhatsApp successfully! Check your phone 📱' });
    } else {
      setStatusMsg({ type: 'error', text: result.error || 'Failed to send test alert.' });
    }
  };

  const handleCheckTomorrow = async () => {
    setLoading(true);
    setStatusMsg(null);
    const result = await checkAndSendTomorrowReminders(
      provider === 'meta' ? metaRecipient : phone || undefined,
      provider === 'meta' ? metaToken : apiKey || undefined
    );
    setLoading(false);

    if (result.success) {
      setStatusMsg({ type: 'success', text: result.message || 'Checked reminders due tomorrow!' });
    } else {
      setStatusMsg({ type: 'error', text: result.error || 'No reminders due tomorrow or credentials missing.' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/30 font-semibold rounded-[16px] transition-all">
          <MessageSquare size={16} /> WhatsApp Bot Settings
        </Button>
      </DialogTrigger>

      <DialogContent className="border-white/10 bg-[#0e1622]/95 backdrop-blur-xl text-white sm:max-w-[520px] p-6 shadow-2xl rounded-[28px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-bold text-white flex items-center gap-2">
            <MessageSquare size={22} className="text-[#25D366]" /> WhatsApp Bot Integration
          </DialogTitle>
          <p className="text-[13px] text-white/50">
            Automated WhatsApp alerts <strong>1 day before</strong> your scheduled reminders.
          </p>
        </DialogHeader>

        <Tabs value={provider} onValueChange={(v) => setProvider(v as any)} className="mt-2">
          <TabsList className="grid grid-cols-2 bg-[#141f2c] border border-white/10 rounded-[16px] p-1">
            <TabsTrigger value="meta" className="rounded-[12px] text-[13px] font-semibold data-[state=active]:bg-[#25D366] data-[state=active]:text-white">
              <ShieldCheck size={14} className="mr-1.5" /> Meta Cloud API (Official)
            </TabsTrigger>
            <TabsTrigger value="callmebot" className="rounded-[12px] text-[13px] font-semibold data-[state=active]:bg-[#2f56ff] data-[state=active]:text-white">
              CallMeBot (Quick)
            </TabsTrigger>
          </TabsList>

          {/* META OFFICIAL CLOUD API TAB */}
          <TabsContent value="meta" className="space-y-4 pt-3">
            <div className="rounded-[16px] border border-emerald-500/20 bg-emerald-500/10 p-3 text-[12px] text-emerald-200 leading-relaxed">
              <div className="font-bold text-[#25D366] flex items-center gap-1.5 mb-1">
                <ShieldCheck size={14} /> Official Meta WhatsApp Cloud API (Recommended)
              </div>
              Direct HTTPS connection to Meta servers. Includes <strong>1,000 free monthly conversations</strong>.
            </div>

            <form onSubmit={handleSendTest} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-[12px] font-medium text-white/70">Phone Number ID</Label>
                <Input
                  placeholder="e.g. 109283746592817"
                  value={metaPhoneId}
                  onChange={(e) => setMetaPhoneId(e.target.value)}
                  className="bg-[#141f2c] border-white/10 text-white rounded-[14px] placeholder:text-white/30"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[12px] font-medium text-white/70">Meta System Access Token</Label>
                <Input
                  type="password"
                  placeholder="EAAG..."
                  value={metaToken}
                  onChange={(e) => setMetaToken(e.target.value)}
                  className="bg-[#141f2c] border-white/10 text-white rounded-[14px] placeholder:text-white/30"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[12px] font-medium text-white/70">Recipient WhatsApp Phone Number</Label>
                <Input
                  placeholder="919876543210 (Country code without +)"
                  value={metaRecipient}
                  onChange={(e) => setMetaRecipient(e.target.value)}
                  className="bg-[#141f2c] border-white/10 text-white rounded-[14px] placeholder:text-white/30"
                />
              </div>

              {statusMsg && (
                <div
                  className={`rounded-[14px] p-3 text-[12px] border ${
                    statusMsg.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}
                >
                  {statusMsg.text}
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white py-2.5 text-[13px] font-bold rounded-[16px] shadow-lg"
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <><Send size={14} /> Test Meta API</>}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={handleCheckTomorrow}
                  className="border-white/15 bg-white/5 text-white rounded-[16px] text-[12px]"
                >
                  Check Tomorrow
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* CALLMEBOT TAB */}
          <TabsContent value="callmebot" className="space-y-4 pt-3">
            <div className="rounded-[16px] border border-blue-500/20 bg-blue-500/10 p-3 text-[12px] text-blue-200 leading-relaxed">
              <div className="font-bold text-[#2f56ff] flex items-center gap-1.5 mb-1">
                <Info size={14} /> Quick Setup via CallMeBot
              </div>
              Send WhatsApp message <code>I allow callmebot to send me messages</code> to <strong>+34 644 44 49 64</strong> to get your API key!
            </div>

            <form onSubmit={handleSendTest} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-[12px] font-medium text-white/70">WhatsApp Phone Number</Label>
                <Input
                  placeholder="+919876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-[#141f2c] border-white/10 text-white rounded-[14px] placeholder:text-white/30"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[12px] font-medium text-white/70">CallMeBot API Key</Label>
                <Input
                  type="password"
                  placeholder="123456"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-[#141f2c] border-white/10 text-white rounded-[14px] placeholder:text-white/30"
                />
              </div>

              {statusMsg && (
                <div
                  className={`rounded-[14px] p-3 text-[12px] border ${
                    statusMsg.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}
                >
                  {statusMsg.text}
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-[#2f56ff] to-[#1e3a8a] text-white py-2.5 text-[13px] font-bold rounded-[16px]"
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <><Send size={14} /> Test CallMeBot</>}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={handleCheckTomorrow}
                  className="border-white/15 bg-white/5 text-white rounded-[16px] text-[12px]"
                >
                  Check Tomorrow
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
