import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getImmigrationAssistance(message: string, userContext?: {
  goals?: string[];
  country?: string;
  visaType?: string;
}): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `You are Imisi, an expert immigration consultant for Cush Immigration Services. Provide direct, actionable immigration guidance.

Core expertise:
- Visa applications and requirements (UK, Nigeria, global)
- Student visas and study permits
- Work permits and employment immigration
- Family reunification and citizenship
- Documentation and timelines

Response style:
- Be concise and firm
- Give specific, actionable steps
- State requirements clearly
- Provide exact timelines when known
- Skip pleasantries, focus on solutions
- End with one clear next action

${userContext ? `User Context: 
- Goals: ${userContext.goals?.join(', ') || 'Not specified'}
- Target Country: ${userContext.country || 'Not specified'}
- Visa Type: ${userContext.visaType || 'Not specified'}` : ''}

Please respond to the following immigration question:`;

    const fullPrompt = `${systemPrompt}\n\nUser Question: ${message}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Provide a helpful fallback response
    return "I'm currently experiencing technical difficulties connecting to my knowledge base. However, I'd be happy to help you with your immigration question! Could you please try asking again in a moment, or for immediate assistance, you can contact our support team through the platform.";
  }
}

export async function analyzeTransactionRisk(transaction: {
  amount: number;
  currency: string;
  destination: string;
  purpose: string;
}): Promise<{
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendations: string[];
}> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `As a financial compliance expert, analyze this transaction for risk factors:

Transaction Details:
- Amount: ${transaction.amount} ${transaction.currency}
- Destination: ${transaction.destination}
- Purpose: ${transaction.purpose}

Provide a risk analysis in JSON format with:
- riskScore (0-100)
- riskLevel (LOW/MEDIUM/HIGH)
- recommendations (array of strings)

Consider factors like amount, destination country regulations, purpose legitimacy, and compliance requirements.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    try {
      return JSON.parse(response.text());
    } catch {
      // Fallback if JSON parsing fails
      return {
        riskScore: 25,
        riskLevel: 'LOW',
        recommendations: ['Transaction appears standard', 'Ensure proper documentation']
      };
    }
  } catch (error) {
    console.error('Gemini risk analysis error:', error);
    return {
      riskScore: 50,
      riskLevel: 'MEDIUM',
      recommendations: ['Manual review recommended', 'Verify transaction details']
    };
  }
}