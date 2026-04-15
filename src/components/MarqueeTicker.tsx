import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_TEXT = "سوق الكل - إعلانك مجاناً معنا! 🎉";

const MarqueeTicker = () => {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("listing_settings")
        .select("setting_value")
        .eq("setting_key", "marquee_ticker")
        .limit(1)
        .maybeSingle();

      if (data?.setting_value) {
        const val = data.setting_value as any;
        if (val.text) setText(val.text);
        if (val.enabled === false) setEnabled(false);
      }
    };
    fetch();
  }, []);

  if (!enabled) return null;

  return (
    <div className="bg-primary text-primary-foreground overflow-hidden whitespace-nowrap py-1.5">
      <div className="animate-marquee inline-block">
        <span className="mx-8 text-sm font-bold">{text}</span>
        <span className="mx-8 text-sm font-bold">{text}</span>
        <span className="mx-8 text-sm font-bold">{text}</span>
        <span className="mx-8 text-sm font-bold">{text}</span>
        <span className="mx-8 text-sm font-bold">{text}</span>
        <span className="mx-8 text-sm font-bold">{text}</span>
      </div>
    </div>
  );
};

export default MarqueeTicker;
