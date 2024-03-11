"use server";

import OpenAI from "openai";
import { put } from "@vercel/blob";

import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs";

// https://www.npmjs.com/package/openai

// todo parameterize this open ai key
let openai: OpenAI;

function lazyOpenAIInit() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
}

async function storeImageBlob(key: string, blob: any) {
  const namespace = "image";
  const response = await put(`${namespace}:${key}.png`, blob, {
    access: "public",
    contentType: "image/png",
  });
  console.log("storeImageBlob.ts: Blob stored at: " + response.url);
  return response.url;
}

export async function chatCompletion(params: ChatCompletionCreateParamsBase) {
  lazyOpenAIInit();
  const completion = await openai.chat.completions.create({
    messages: params.messages,
    model: params.model,
  });
  return completion.choices[0].message.content;
}

export async function generateEmbeddings(textArray: string[]) {
  lazyOpenAIInit();
  // Replace newlines with spaces in each text input
  const inputs = textArray.map((text) => text.replace(/\n/g, " "));
  const embeddingData = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: inputs,
  });
  // Extract embeddings from the response
  return embeddingData.data.map((item) => item.embedding);
}

export async function generateEmbedding(raw: string) {
  lazyOpenAIInit();
  const input = raw.replace(/\n/g, " "); // OpenAI recommends replacing newlines with spaces
  const embeddingData = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input,
  });
  const [{ embedding }] = embeddingData.data;
  return embedding;
}

export async function getImage(prompt: string, recursionBackOff?: number) {
  try {
    lazyOpenAIInit();
    const response = await openai.images.generate({
      prompt,
      n: 1,
      size: "512x512",
    });
    console.log(`OpenAIRequests.ts: Requested image from dalle for ${prompt}, got ${response.data[0].url}`);
    const dalleBlobUrl = response.data[0].url;

    if (dalleBlobUrl) {
      const response = await fetch(dalleBlobUrl);
      const blob = await response.blob();
      const imageUrl = await storeImageBlob(prompt, blob);
      return imageUrl;
    }
  } catch (error) {
    console.log(`Error: OpenAiRequests.getImage: Error with prompt ${prompt}`, error);
  }
  if (recursionBackOff === undefined) {
    recursionBackOff = 3;
  }
  if (recursionBackOff > 0) {
    return getImage("Cartoon drawing of a painter drawing an image. The Painter is drawing is 'Image in construction'", recursionBackOff - 1);
  }
}

