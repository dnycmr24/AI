export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY fehlt in Vercel Environment Variables."
      });
    }

    const body = req.body || {};
    const idea = body.idea || "dark black and grey tattoo motive";
    const style = body.style || "BLACK & GREY";
    const placement = body.placement || "forearm";
    const mood = body.mood || "dark cinematic";

    const prompt = `
Create an original professional tattoo motive.
Style: ${style}.
Placement: ${placement}.
Mood: ${mood}.
Concept: ${idea}.

Requirements:
- black and grey tattoo design
- stencil-ready composition
- high contrast but not overexposed
- clean negative space
- suitable for a real tattoo artist
- no copyrighted logos
- no random text
- no fake signatures
- no mockup on skin
- no background scene
- centered tattoo flash artwork
- NEW DAWN aesthetic: dark, raw, meaningful, beneath the surface
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-5.5",
        input: prompt,
        tools: [
          {
            type: "image_generation",
            action: "generate"
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "OpenAI API Fehler",
        raw: data
      });
    }

    const imageCall = data.output?.find((item) => item.type === "image_generation_call");
    const imageBase64 = imageCall?.result;

    if (!imageBase64) {
      return res.status(500).json({
        error: "Kein Bild von der API zurückbekommen.",
        raw: data
      });
    }

    return res.status(200).json({
      image: `data:image/png;base64,${imageBase64}`,
      prompt
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Unbekannter Serverfehler"
    });
  }
}