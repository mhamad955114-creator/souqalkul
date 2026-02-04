import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Available categories in the app (Arabic)
const VALID_CATEGORIES = [
  "سيارات",
  "عقارات", 
  "الكترونيات",
  "أثاث",
  "ملابس",
  "خدمات",
  "وظائف",
  "ألعاب",
  "أخرى"
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Call Lovable AI Gateway to analyze the image
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an image analysis system for a marketplace. Your job is to:

1. Check if the image violates content policies (explicit content, violence, weapons, hate symbols, drugs, etc.)
2. Identify what product/item is in the image and suggest the best category

Available categories (use EXACTLY one of these in Arabic):
- سيارات (cars, vehicles, motorcycles, trucks)
- عقارات (real estate, houses, apartments, buildings, land)
- الكترونيات (electronics, phones, computers, TVs, appliances)
- أثاث (furniture, tables, chairs, beds, sofas)
- ملابس (clothing, shoes, accessories, fashion)
- خدمات (services - not for physical products)
- وظائف (jobs - not for physical products)
- ألعاب (games, toys, gaming consoles, sports equipment)
- أخرى (other - only if nothing else fits)

Respond ONLY with a JSON object in this exact format:
{
  "approved": true/false,
  "reason": "Brief explanation if rejected, or 'محتوى مناسب' if approved",
  "suggestedCategory": "one of the categories above in Arabic"
}

Be strict about policy violations but don't reject legitimate marketplace photos.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image. Check for policy violations and identify the product category. Return JSON only.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 300,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    console.log('AI Response:', content);

    // Parse the AI response
    let result;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
        
        // Validate the suggested category
        if (result.suggestedCategory && !VALID_CATEGORIES.includes(result.suggestedCategory)) {
          // Try to find a close match or default to "أخرى"
          result.suggestedCategory = "أخرى";
        }
      } else {
        // If no JSON found, assume approved with "أخرى" category
        result = { approved: true, reason: 'محتوى مناسب', suggestedCategory: 'أخرى' };
      }
    } catch (parseError) {
      console.error('Parse error:', parseError);
      // Default to approved if parsing fails
      result = { approved: true, reason: 'محتوى مناسب', suggestedCategory: 'أخرى' };
    }

    // Ensure suggestedCategory is always present
    if (!result.suggestedCategory) {
      result.suggestedCategory = 'أخرى';
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in moderate-image function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
