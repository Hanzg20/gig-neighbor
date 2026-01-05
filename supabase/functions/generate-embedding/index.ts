// Supabase Edge Function: generate-embedding
// Deploy: supabase functions deploy generate-embedding

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Environment variables (set in Supabase Dashboard)
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
    // CORS headers
    if (req.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
            },
        });
    }

    try {
        const { text } = await req.json();

        if (!text) {
            return new Response(
                JSON.stringify({ error: "Missing 'text' parameter" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // Option 1: Use OpenAI Embeddings API
        if (OPENAI_API_KEY) {
            const embeddingResponse = await fetch(
                "https://api.openai.com/v1/embeddings",
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${OPENAI_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "text-embedding-3-small", // 384 dimensions
                        input: text,
                    }),
                }
            );

            const embeddingData = await embeddingResponse.json();
            const embedding = embeddingData.data[0].embedding;

            return new Response(
                JSON.stringify({ embedding }),
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                    },
                }
            );
        }

        // Option 2: Use Transformers.js (local model - no API key needed)
        // For MVP: Return zero vector as placeholder
        const placeholderEmbedding = Array(384).fill(0);

        return new Response(
            JSON.stringify({
                embedding: placeholderEmbedding,
                warning: "Using placeholder embedding. Set OPENAI_API_KEY for production.",
            }),
            {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            }
        );
    } catch (error) {
        console.error("Error generating embedding:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
});

// Deploy Instructions:
// 1. Install Supabase CLI: npm install -g supabase
// 2. Login: supabase login
// 3. Link project: supabase link --project-ref your-project-ref
// 4. Deploy: supabase functions deploy generate-embedding
// 5. Set secret: supabase secrets set OPENAI_API_KEY=sk-...
