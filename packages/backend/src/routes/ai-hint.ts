import { Router, type Request, type Response } from 'express';

export const hintRouter = Router();

interface HintRequest {
  userId?: string;
  chapterId: number;
  code: string;
  errorMessage?: string;
  completedExercises?: string[];
}

interface HintResponse {
  hint: string;
  textbookRef: string;
  nextExerciseId: string | null;
}

/** POST /hint — generate an AI-powered hint for a student */
hintRouter.post('/', async (req: Request, res: Response) => {
  const body = req.body as HintRequest;
  const { chapterId, code, errorMessage, completedExercises = [] } = body;

  if (!chapterId || !code) {
    res.status(400).json({ error: 'chapterId and code are required' });
    return;
  }

  const provider = process.env.HINT_PROVIDER ?? 'stub';

  try {
    let hint: HintResponse;

    if (provider === 'openai') {
      hint = await callOpenAI(chapterId, code, errorMessage);
    } else if (provider === 'anthropic') {
      hint = await callAnthropic(chapterId, code, errorMessage);
    } else {
      // Stub response for development
      hint = generateStubHint(chapterId, code, errorMessage, completedExercises);
    }

    res.json(hint);
  } catch (err) {
    console.error('Hint generation error:', err);
    res.status(500).json({ error: 'Failed to generate hint' });
  }
});

async function callOpenAI(
  chapterId: number,
  code: string,
  errorMessage?: string,
): Promise<HintResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const prompt = buildPrompt(chapterId, code, errorMessage);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 256,
    }),
  });

  if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);
  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };
  return parseHintFromLLM(data.choices[0].message.content, chapterId);
}

async function callAnthropic(
  chapterId: number,
  code: string,
  errorMessage?: string,
): Promise<HintResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const prompt = buildPrompt(chapterId, code, errorMessage);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) throw new Error(`Anthropic error: ${response.status}`);
  const data = await response.json() as {
    content: Array<{ text: string }>;
  };
  return parseHintFromLLM(data.content[0].text, chapterId);
}

function buildPrompt(chapterId: number, code: string, errorMessage?: string): string {
  return `You are a RISC-V teaching assistant for chapter ${chapterId} of Patterson & Hennessy Computer Organization.
A student has written this RISC-V assembly code:

\`\`\`
${code}
\`\`\`

${errorMessage ? `Error: ${errorMessage}` : ''}

Provide a SHORT, targeted hint (1-2 sentences). Do NOT give the full answer.
Also mention the relevant textbook section and suggest a next exercise.
Reply in JSON format: { "hint": "...", "textbookRef": "Section X.Y", "nextExerciseId": "ch0X-exYY" or null }`;
}

function parseHintFromLLM(text: string, chapterId: number): HintResponse {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as HintResponse;
    }
  } catch {
    // fall through to default
  }
  return {
    hint: text.slice(0, 200),
    textbookRef: `Chapter ${chapterId}`,
    nextExerciseId: null,
  };
}

function generateStubHint(
  chapterId: number,
  code: string,
  errorMessage?: string,
  _completedExercises?: string[],
): HintResponse {
  const hints: Record<number, string> = {
    1: 'Remember that performance = 1/execution_time. Check your formula.',
    2: 'RISC-V uses x0 (zero) as a hardwired zero register. Check your register usage.',
    3: 'Watch for integer overflow when adding large positive numbers.',
    4: 'Check your control signals — beq requires zero detection.',
    5: 'Cache hit = tag match AND valid bit set. Check both conditions.',
  };

  const errorHint = errorMessage
    ? `Error detected: "${errorMessage}". Check your syntax.`
    : (hints[chapterId] ?? 'Review the relevant section in the textbook.');

  return {
    hint: errorHint,
    textbookRef: `Chapter ${chapterId}, Section ${chapterId}.1`,
    nextExerciseId: `ch${String(chapterId).padStart(2, '0')}-ex01`,
  };
}
