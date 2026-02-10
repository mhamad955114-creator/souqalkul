import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNavigation from "@/components/BottomNavigation";
import { ArrowLeft, ArrowRight, Send, Mail, Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ContactUs = () => {
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isRtl = dir === "rtl";

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = t.contactForm.nameRequired;
    if (!form.email.trim()) errs.email = t.contactForm.emailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = t.contactForm.emailInvalid;
    if (!form.subject.trim()) errs.subject = t.contactForm.subjectRequired;
    if (!form.message.trim()) errs.message = t.contactForm.messageRequired;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    });

    setSending(false);
    if (error) {
      toast({ title: t.contactForm.error, variant: "destructive" });
    } else {
      toast({ title: t.contactForm.success });
      setForm({ name: "", email: "", subject: "", message: "" });
    }
  };

  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
          <BackArrow className="h-4 w-4" />
          {t.contactForm.back}
        </Button>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{t.contactForm.title}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t.contactForm.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-5 bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name">{t.contactForm.name}</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t.contactForm.namePlaceholder}
                    maxLength={100}
                  />
                  {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t.contactForm.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder={t.contactForm.emailPlaceholder}
                    maxLength={255}
                  />
                  {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">{t.contactForm.subject}</Label>
                <Input
                  id="subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder={t.contactForm.subjectPlaceholder}
                  maxLength={200}
                />
                {errors.subject && <p className="text-destructive text-sm">{errors.subject}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">{t.contactForm.message}</Label>
                <Textarea
                  id="message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={t.contactForm.messagePlaceholder}
                  rows={6}
                  maxLength={2000}
                />
                {errors.message && <p className="text-destructive text-sm">{errors.message}</p>}
              </div>

              <Button type="submit" size="lg" disabled={sending} className="w-full gap-2">
                <Send className="h-4 w-4" />
                {sending ? t.contactForm.sending : t.contactForm.send}
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-2">{t.contactForm.infoTitle}</h3>
              <p className="text-muted-foreground text-sm mb-6">{t.contactForm.infoDesc}</p>

              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{t.contactForm.emailLabel}</p>
                    <p className="text-muted-foreground text-sm">support@opensouq.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{t.contactForm.phoneLabel}</p>
                    <p className="text-muted-foreground text-sm">920000000</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{t.contactForm.addressLabel}</p>
                    <p className="text-muted-foreground text-sm">Damascus, Syria</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default ContactUs;
