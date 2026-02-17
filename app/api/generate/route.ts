import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { system_prompt } from "@/lib/system-prompt";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    
    if (error || !data?.claims) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const { prompt } = await request.json();
    
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Initialize OpenAI client
    const client = new OpenAI();

    // Call OpenAI Responses API
    const response = await client.responses.create({
      model: "gpt-4o",
      instructions: system_prompt,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: prompt,
            },
          ],
        },
      ],
    });

    return NextResponse.json({ 
      content: response.output_text,
      model: response.model,
      usage: response.usage,
    });

  } catch (error) {
    console.error("Error in generate API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
