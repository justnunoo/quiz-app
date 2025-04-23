export async function generateQuestionsFromText(text) {
    const prompt = `
  You are an AI that creates exam-style multiple choice questions.
  
  Instructions:
  - Generate a maximum of 21 questions based strictly on the input text.
  - Each question should have 4 options.
  - Return ONLY a JSON array like the example below. No explanation. No markdown. No extra text.
  
  Example:
  [
    {
      "question": "What is the capital of France?",
      "options": ["London", "Berlin", "Paris", "Madrid"],
      "answer": "Paris"
    },
    ...
  ]
  
  TEXT:
  ${text}
  `;
  
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192', // or 'mixtral-8x7b-32768'
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });
  
    const data = await res.json();
  
    // Optional: console log to debug response
    console.log('Groq AI raw response:', JSON.stringify(data, null, 2));
  
    if (!data.choices || !data.choices[0]?.message?.content) {
      return [{ error: 'AI response is missing or malformed.' }];
    }
  
    const reply = data.choices[0].message.content.trim();
  
    // Try to extract JSON block from AI reply
    const firstBracket = reply.indexOf('[');
    const lastBracket = reply.lastIndexOf(']') + 1;
    const maybeJson = reply.slice(firstBracket, lastBracket);
  
    try {
      return JSON.parse(maybeJson);
    } catch (err) {
      console.error('Failed to parse JSON from AI:', err, '\nRaw reply:', reply);
      return [{ error: 'Could not parse AI response.' }];
    }
  }
  