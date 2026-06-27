import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini SDK
// Note: Requires GEMINI_API_KEY environment variable to be set
const ai = new GoogleGenAI({});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, title, url, tags, problemDescription, solutionCode, questionPrompt, solutionPrompt } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ error: 'Missing title' }, { status: 400 });
    }

    let questionSummary = '';
    let solutionSummary = '';

    // If solution code or problem description is provided, generate Hinglish summaries
    if (solutionCode || problemDescription) {
      const prompt = `
        You are an expert programmer and teacher. I will provide you with a competitive programming or data structures problem description and my solution code.
        
        Your task is to generate TWO distinct summaries. Follow these instructions carefully:
        
        1. "questionSummary": ${questionPrompt || 'A concise summary of the problem statement itself.'}
        
        2. "solutionSummary": ${solutionPrompt || 'A detailed summary of the solution logic/algorithm.'}
        IMPORTANT for solutionSummary: You MUST base your explanation strictly on the provided Solution Code. Use the EXACT variable names, function names, and logic structure that is present in the code below (e.g., if the code uses 'i', 'buy', and 'trans', do NOT rename them to 'day', 'buy_state', etc. in your explanation).
        
        Problem Title: ${title}
        Problem Description: ${problemDescription || 'Not provided'}
        Solution Code:
        ${solutionCode || 'Not provided'}
        
        Return the response strictly as a JSON object with exactly two keys: "questionSummary" and "solutionSummary". Do not output markdown code blocks.
      `;

      let retries = 3;
      let aiSuccess = false;
      
      while (retries > 0 && !aiSuccess) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });
          
          const text = response.text || '';
          // Clean markdown blocks if the AI accidentally adds them
          const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const parsed = JSON.parse(cleanedText);
          
          questionSummary = parsed.questionSummary || '';
          solutionSummary = parsed.solutionSummary || '';
          aiSuccess = true;
        } catch (aiError: any) {
          console.error(`AI Generation Error (Retries left: ${retries - 1}):`, aiError.message || aiError);
          retries--;
          if (retries > 0) {
            // Wait 2 seconds before retrying
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            questionSummary = "AI summary unavailable due to high server demand. Please edit to add your own summary.";
            solutionSummary = "AI solution summary unavailable due to high server demand.";
          }
        }
      }

    // Clean up topics (tags)
    const topics = Array.isArray(tags) 
      ? tags.filter(Boolean) 
      : tags 
        ? tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : [];

    // Save to database
    const question = await prisma.question.create({
      data: {
        userId,
        title: title.trim(),
        url: url?.trim() || '',
        summary: questionSummary.trim(),
        solution: solutionSummary.trim(),
        code: solutionCode ? solutionCode.trim() : '',
        topics,
        status: 'Red',
        lastRevisedTimestamp: new Date(),
      },
    });

    return NextResponse.json({ success: true, question });
  } catch (error: any) {
    console.error('Extension sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
