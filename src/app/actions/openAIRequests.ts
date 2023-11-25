"use server"

import OpenAI from "openai";

export async function openAiRequests(messages: {role: 'system' | 'user', content: string | null}[]) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
        messages,
        model: "gpt-4",
    });

    return completion.choices[0].message.content;

}