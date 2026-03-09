import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useContactSettings, buildWhatsAppUrl } from "@/hooks/useContactSettings";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNavigation from "@/components/BottomNavigation";
import { ArrowLeft, ArrowRight, Send, Mail, Phone, MapPin, MessageCircle, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ContactUs = () => {
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isRtl = dir === "rtl";

  const { contact, social } = useContactSettings();

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = t.contactForm.nameRequired;
    else if (form.name.trim().length > 100) errs.name = t.contactForm.nameRequired;
    if (!form.email.trim()) errs.email = t.contactForm.emailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = t.contactForm.emailInvalid;
    else if (form.email.trim().length > 255) errs.email = t.contactForm.emailInvalid;
    if (!form.subject.trim()) errs.subject = t.contactForm.subjectRequired;
    else if (form.subject.trim().length > 200) errs.subject = t.contactForm.subjectRequired;
    if (!form.message.trim()) errs.message = t.contactForm.messageRequired;
    else if (form.message.trim().length > 2000) errs.message = t.contactForm.messageRequired;
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
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-muted-foreground text-sm hover:text-primary transition-colors"
                    >
                      {contact.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{t.contactForm.phoneLabel}</p>
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-muted-foreground text-sm hover:text-primary transition-colors"
                      dir="ltr"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <a
                    href={buildWhatsAppUrl(contact.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0 hover:bg-green-600 transition-colors"
                  >
                    <MessageCircle className="h-5 w-5 text-white" />
                  </a>
                  <div>
                    <p className="font-medium text-foreground text-sm">WhatsApp</p>
                    <a
                      href={buildWhatsAppUrl(contact.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground text-sm hover:text-green-500 transition-colors"
                      dir="ltr"
                    >
                      {contact.whatsapp}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{t.contactForm.addressLabel}</p>
                    <p className="text-muted-foreground text-sm">{contact.location}</p>
                  </div>
                </div>
              </div>
              
              {/* Social Media */}
              <div className="mt-8 pt-6 border-t border-border">
                <h4 className="font-medium text-foreground text-sm mb-4">تابعنا على منصات التواصل</h4>
                <div className="flex flex-wrap gap-3">
                  {social.facebook && (
                    <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors text-primary">
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                  {social.twitter && (
                    <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors text-primary">
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  {social.instagram && (
                    <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors text-primary">
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {social.youtube && (
                    <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors text-primary">
                      <Youtube className="h-5 w-5" />
                    </a>
                  )}
                  {social.tiktok && (
                    <a href={social.tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors text-primary">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-1.04 4.41-2.61 6.01-1.58 1.61-3.9 2.58-6.2 2.45-2.18-.11-4.29-1.2-5.61-2.91-1.3-1.7-1.83-3.95-1.5-6.08.3-2.07 1.48-4 3.12-5.32 1.62-1.28 3.78-1.89 5.86-1.66v4.06c-1.17-.3-2.51-.12-3.48.65-.96.76-1.48 2.01-1.32 3.2.14 1.25.99 2.37 2.12 2.89 1.12.51 2.5.49 3.55-.17 1.05-.66 1.66-1.87 1.69-3.13.06-4.52.02-9.05.03-13.57.01-1.07.01-2.14.01-3.21Z"/></svg>
                    </a>
                  )}
                  {social.snapchat && (
                    <a href={social.snapchat} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-[#FFFC00] hover:text-black transition-colors text-primary">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.922-.246.133-.065.262-.089.397-.089.345 0 .628.211.735.39.089.151.135.39-.074.614-.196.21-.533.39-.838.502-.307.115-.632.193-.903.246-.145.03-.287.045-.374.06l-.006.001c-.052.009-.091.015-.122.024-.09.03-.193.09-.24.21a.67.67 0 0 0-.015.39c.473 1.545 1.47 2.749 2.422 3.315.256.149.48.27.556.39.18.285.03.63-.15.81-.255.24-.616.42-.988.555-.485.18-.965.27-1.455.36-.18.03-.285.15-.33.27-.045.12-.06.27-.09.42-.045.195-.09.39-.225.555-.18.21-.48.315-.795.315-.195 0-.42-.045-.66-.105-.36-.09-.81-.21-1.395-.21-.27 0-.555.03-.84.09-.795.18-1.41.72-2.07 1.305-.42.375-.855.75-1.395 1.02-.255.12-.54.21-.84.21s-.585-.09-.84-.21c-.54-.27-.975-.645-1.395-1.02-.66-.585-1.275-1.125-2.07-1.305a4.14 4.14 0 0 0-.84-.09c-.585 0-1.035.12-1.395.21-.24.06-.465.105-.66.105-.315 0-.615-.105-.795-.315-.135-.165-.18-.36-.225-.555-.03-.15-.045-.3-.09-.42-.045-.12-.15-.24-.33-.27-.49-.09-.97-.18-1.455-.36-.375-.135-.735-.315-.99-.555-.18-.18-.33-.525-.15-.81.075-.12.3-.24.555-.39.955-.565 1.95-1.77 2.425-3.315a.67.67 0 0 0-.015-.39c-.045-.12-.15-.18-.24-.21-.03-.009-.07-.015-.12-.024l-.007-.001c-.087-.015-.229-.03-.374-.06-.27-.053-.596-.131-.903-.246-.305-.113-.642-.292-.838-.503-.209-.224-.163-.463-.074-.614.107-.179.39-.39.735-.39.135 0 .264.024.397.09.265.126.622.233.922.246.197 0 .326-.045.4-.09a43.33 43.33 0 0 1-.032-.57c-.104-1.628-.23-3.654.3-4.847C7.46 1.07 10.816.793 11.806.793h.4z"/></svg>
                    </a>
                  )}
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
