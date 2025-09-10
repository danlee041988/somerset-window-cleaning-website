import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const query = url.searchParams.get('q')
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter "q" is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Search knowledge base
    const { data, error } = await supabaseClient
      .from('kb_items')
      .select('kind, slug, title, content')
      .textSearch('content', query)
      .limit(3)

    if (error) throw error

    // Generate simple answer
    const answer = generateAnswer(query, data || [])

    return new Response(
      JSON.stringify({
        query,
        answer,
        sources: data?.map(item => ({
          slug: item.slug,
          title: item.title,
          kind: item.kind
        })) || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

function generateAnswer(query: string, results: any[]): string {
  if (results.length === 0) {
    return "I couldn't find specific information about that. Please contact us at info@somersetwindowcleaning.co.uk or call for more details."
  }
  
  const queryLower = query.toLowerCase()
  
  // Price queries
  if (queryLower.includes('price') || queryLower.includes('cost') || queryLower.includes('how much')) {
    const priceResults = results.filter(r => r.kind === 'pricing')
    if (priceResults.length > 0) {
      return priceResults.map(r => r.content).join('\n\n')
    }
  }
  
  // Area queries
  if (queryLower.includes('area') || queryLower.includes('location') || queryLower.includes('where')) {
    const areaResults = results.filter(r => r.slug === 'service-areas')
    if (areaResults.length > 0) {
      return areaResults[0].content
    }
  }
  
  // FAQ queries
  if (results.some(r => r.kind === 'faq')) {
    const faqResult = results.find(r => r.kind === 'faq')
    return faqResult.content
  }
  
  // Default: return most relevant result
  return results[0].content
}