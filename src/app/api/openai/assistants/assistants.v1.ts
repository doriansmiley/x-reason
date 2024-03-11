"use server";

import OpenAI from "openai";
import { AssistantCreateParams } from "openai/resources/beta/assistants/assistants.mjs";

type Tools = Array<AssistantCreateParams.AssistantToolsCode | AssistantCreateParams.AssistantToolsRetrieval | AssistantCreateParams.AssistantToolsFunction>;

let openai: OpenAI;

function getClient() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

// TODO add support for files
// https://platform.openai.com/docs/assistants/tools/code-interpreter
export async function createThread(name: string, instructions: string, model = "gpt-4-1106-preview", tools?: Tools) {
  console.log(`createThread called`);
  const openai = getClient();

  const thread = await openai.beta.threads.create();

  return { thread };
}

export async function generateImage(claims: string, n: number = 1, size: "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792" = "256x256") {
  const openai = getClient();
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: claims,
    n,
    size,
  });

  return response.data;
}

export async function sendMessage(thread: OpenAI.Beta.Threads.Thread, content: string, instructions?: string, assistantId?: string) {
  console.log(`sendMessage called`);
  const openai = getClient();
  const message = await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content,
  });

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistantId || process.env.CHEMLI_REVERSE_ENGINEER_ASSISTANT!,
    instructions,
  });

  let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

  const maxAttempts = parseInt(process.env.MAX_ATTEMPTS || "100");
  let attempts = 0;

  while (runStatus.status !== "completed" && runStatus.status !== "failed" && attempts <= maxAttempts) {
    console.log(`attempts: ${attempts}`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    console.log(`runStatus.status: ${runStatus.status}`);
    attempts++;
  }

  // Get the last assistant message from the messages array
  const messages = await openai.beta.threads.messages.list(thread.id);
  console.log(`sendMessage messages.length: ${messages.data.length}`);
  // Find the last message for the current run
  const lastMessageForRun = messages.data
    .sort((a, b) => a.created_at - b.created_at)
    .filter((message) => message.thread_id === thread.id && message.role === "assistant")
    .pop();

  if (runStatus.status === "failed") {
    throw new Error(JSON.stringify(runStatus));
  }

  //console.log((lastMessageForRun?.content[0] as MessageContentText).text.value);

  return lastMessageForRun;
}
