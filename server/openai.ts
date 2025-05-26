import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export async function getImmigrationAssistance(message: string, userContext?: {
  immigrationCases?: any[];
  transactions?: any[];
}): Promise<string> {
  try {
    const systemPrompt = `You are Imisi 2.0, an AI assistant specializing in UK immigration services and financial transactions for Nigerian citizens. You help users with:

1. UK immigration processes (student visas, work permits, family visas)
2. Money transfers from Nigeria (NGN) to UK (GBP)
3. Financial planning for immigration
4. Document requirements and application processes
5. Timeline expectations and status updates

Provide helpful, accurate, and professional responses. If you don't know something specific, direct users to contact human support.

Context about the user:
${userContext ? `
- Immigration cases: ${JSON.stringify(userContext.immigrationCases || [])}
- Recent transactions: ${JSON.stringify(userContext.transactions || [])}
` : 'No additional context available.'}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I apologize, but I'm having trouble processing your request right now. Please try again or contact our support team.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "I'm currently experiencing technical difficulties. Please try again later or contact our support team for immediate assistance.";
  }
}

export async function analyzeTransactionRisk(transaction: {
  amount: number;
  recipient: string;
  currency: string;
}): Promise<{
  riskLevel: "low" | "medium" | "high";
  reason: string;
  approved: boolean;
}> {
  try {
    const prompt = `Analyze this financial transaction for risk factors:
    
Amount: ${transaction.amount} ${transaction.currency}
Recipient: ${transaction.recipient}

Provide a risk assessment in JSON format with:
- riskLevel: "low", "medium", or "high"
- reason: brief explanation
- approved: boolean (approve if low or medium risk)

Consider factors like amount size, recipient patterns, and typical transaction behavior.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a financial risk assessment AI. Respond only with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      riskLevel: result.riskLevel || "medium",
      reason: result.reason || "Standard security review required",
      approved: result.approved !== false, // Default to true unless explicitly false
    };
  } catch (error) {
    console.error("Risk analysis error:", error);
    return {
      riskLevel: "medium",
      reason: "Unable to complete automatic risk assessment",
      approved: true, // Default to manual review
    };
  }
}
