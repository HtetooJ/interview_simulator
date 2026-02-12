import { NextRequest, NextResponse } from "next/server";

const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION;

export async function POST(request: NextRequest) {
  if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
    return NextResponse.json(
      { error: "Azure Speech API not configured", transcript: "" },
      { status: 500 }
    );
  }

  try {
    const audioBlob = await request.blob();
    const audioBuffer = await audioBlob.arrayBuffer();
    const mimeType = audioBlob.type || "audio/webm";
    const ext = mimeType.includes("ogg") ? "ogg" : "webm";

    const formData = new FormData();
    formData.append(
      "audio",
      new Blob([audioBuffer], { type: mimeType }),
      `recording.${ext}`
    );
    formData.append(
      "definition",
      JSON.stringify({
        locales: ["en-US"],
      })
    );

    const response = await fetch(
      `https://${AZURE_SPEECH_REGION}.api.cognitive.microsoft.com/speechtotext/transcriptions:transcribe?api-version=2025-10-15`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_SPEECH_KEY,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Azure Speech API error:", response.status, errorText);
      return NextResponse.json(
        {
          error: `Azure Speech API failed: ${response.status}`,
          transcript: "",
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    const combinedPhrases = data.combinedPhrases;
    let transcript =
      Array.isArray(combinedPhrases) && combinedPhrases.length > 0
        ? combinedPhrases.map((p: { text?: string }) => p.text || "").join(" ")
        : "";

    if (!transcript && Array.isArray(data.phrases) && data.phrases.length > 0) {
      transcript = data.phrases
        .map((p: { text?: string }) => p.text || "")
        .join(" ");
    }

    return NextResponse.json({ transcript: transcript.trim() });
  } catch (error) {
    console.error("Speech API error:", error);
    return NextResponse.json(
      { error: "Speech recognition failed", transcript: "" },
      { status: 500 }
    );
  }
}
