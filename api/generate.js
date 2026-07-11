// api/generate.js
// Proxies requests to the Anthropic API. Matches the exact response shape
// MARS's frontend (callAI function) expects: { content: [{ text: "..." }] }

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set in your Vercel environment variables.' });
  }

  try {
    const { messages, max_tokens = 2000 } = req.body;

    if (!messages) {
      return res.status(400).json({ error: 'Missing messages in request body.' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens,
        messages,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      console.error('Claude API error:', response.status, errBody);
      return res.status(response.status).json({ error: `Claude API request failed: ${errBody.slice(0, 300)}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: `Server error: ${err.message}` });
  }
}
