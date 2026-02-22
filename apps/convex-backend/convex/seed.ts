import { mutation } from "./_generated/server";

// Seed initial data for MVP
export const seedMVP = mutation({
  handler: async (ctx) => {
    // Create use cases
    const transcriptionId = await ctx.db.insert("useCases", {
      slug: "transcription",
      name: "Audio/Video Transcription",
      description: "Convert speech to text from audio or video files",
      icon: "🎙️",
    });

    const emailSendingId = await ctx.db.insert("useCases", {
      slug: "email-sending",
      name: "Email Sending",
      description: "Send transactional or marketing emails programmatically",
      icon: "📧",
    });

    const imageGenId = await ctx.db.insert("useCases", {
      slug: "image-generation",
      name: "Image Generation",
      description: "Generate images from text prompts using AI",
      icon: "🎨",
    });

    // Create services
    const deepgramId = await ctx.db.insert("services", {
      slug: "deepgram",
      name: "Deepgram",
      website: "https://deepgram.com",
      docsUrl: "https://developers.deepgram.com/docs",
    });

    const whisperOpenAIId = await ctx.db.insert("services", {
      slug: "openai-whisper",
      name: "OpenAI Whisper",
      website: "https://openai.com",
      docsUrl: "https://platform.openai.com/docs/guides/speech-to-text",
    });

    const assemblyAIId = await ctx.db.insert("services", {
      slug: "assemblyai",
      name: "AssemblyAI",
      website: "https://assemblyai.com",
      docsUrl: "https://www.assemblyai.com/docs",
    });

    const resendId = await ctx.db.insert("services", {
      slug: "resend",
      name: "Resend",
      website: "https://resend.com",
      docsUrl: "https://resend.com/docs",
    });

    const sendgridId = await ctx.db.insert("services", {
      slug: "sendgrid",
      name: "SendGrid",
      website: "https://sendgrid.com",
      docsUrl: "https://docs.sendgrid.com",
    });

    const replicateId = await ctx.db.insert("services", {
      slug: "replicate",
      name: "Replicate",
      website: "https://replicate.com",
      docsUrl: "https://replicate.com/docs",
    });

    // Create snippets
    // Transcription - Deepgram
    await ctx.db.insert("snippets", {
      useCaseId: transcriptionId,
      serviceId: deepgramId,
      language: "typescript",
      title: "Transcribe audio file with Deepgram",
      description: "Simple audio transcription using Deepgram's Nova-2 model",
      code: `import { createClient } from "@deepgram/sdk";
import { readFileSync } from "fs";

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

async function transcribe(audioPath: string) {
  const audio = readFileSync(audioPath);
  
  const { result } = await deepgram.listen.prerecorded.transcribeFile(
    audio,
    {
      model: "nova-2",
      smart_format: true,
      language: "en",
    }
  );

  return result.results.channels[0].alternatives[0].transcript;
}

// Usage
const transcript = await transcribe("./audio.mp3");
console.log(transcript);`,
      dependencies: ["@deepgram/sdk@3.0.0"],
      envVars: ["DEEPGRAM_API_KEY"],
      verificationStatus: "passed",
      verifiedAt: Date.now(),
      benchmarkLatencyMs: 850,
      benchmarkCostUsd: 0.0043,
      benchmarkQualityScore: 94,
      version: "1.0.0",
      sourceUrl: "https://developers.deepgram.com/docs/getting-started",
    });

    // Transcription - OpenAI Whisper
    await ctx.db.insert("snippets", {
      useCaseId: transcriptionId,
      serviceId: whisperOpenAIId,
      language: "typescript",
      title: "Transcribe audio with OpenAI Whisper",
      description: "Audio transcription using OpenAI's Whisper model",
      code: `import OpenAI from "openai";
import { createReadStream } from "fs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function transcribe(audioPath: string) {
  const transcription = await openai.audio.transcriptions.create({
    file: createReadStream(audioPath),
    model: "whisper-1",
    language: "en",
  });

  return transcription.text;
}

// Usage
const transcript = await transcribe("./audio.mp3");
console.log(transcript);`,
      dependencies: ["openai@4.0.0"],
      envVars: ["OPENAI_API_KEY"],
      verificationStatus: "passed",
      verifiedAt: Date.now(),
      benchmarkLatencyMs: 1200,
      benchmarkCostUsd: 0.006,
      benchmarkQualityScore: 92,
      version: "1.0.0",
      sourceUrl: "https://platform.openai.com/docs/guides/speech-to-text",
    });

    // Email - Resend
    await ctx.db.insert("snippets", {
      useCaseId: emailSendingId,
      serviceId: resendId,
      language: "typescript",
      title: "Send email with Resend",
      description: "Simple email sending with Resend's modern API",
      code: `import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to,
    subject,
    html,
  });

  if (error) throw error;
  return data;
}

// Usage
await sendEmail({
  to: "user@example.com",
  subject: "Welcome!",
  html: "<h1>Hello World</h1>",
});`,
      dependencies: ["resend@3.0.0"],
      envVars: ["RESEND_API_KEY"],
      verificationStatus: "passed",
      verifiedAt: Date.now(),
      benchmarkLatencyMs: 180,
      benchmarkCostUsd: 0.0001,
      benchmarkQualityScore: 98,
      version: "1.0.0",
      sourceUrl: "https://resend.com/docs/send-with-nodejs",
    });

    // Email - SendGrid
    await ctx.db.insert("snippets", {
      useCaseId: emailSendingId,
      serviceId: sendgridId,
      language: "typescript",
      title: "Send email with SendGrid",
      description: "Email sending with SendGrid's Node.js library",
      code: `import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const msg = {
    to,
    from: "sender@example.com",
    subject,
    html,
  };

  const [response] = await sgMail.send(msg);
  return response;
}

// Usage
await sendEmail({
  to: "user@example.com",
  subject: "Welcome!",
  html: "<h1>Hello World</h1>",
});`,
      dependencies: ["@sendgrid/mail@8.0.0"],
      envVars: ["SENDGRID_API_KEY"],
      verificationStatus: "passed",
      verifiedAt: Date.now(),
      benchmarkLatencyMs: 220,
      benchmarkCostUsd: 0.00015,
      benchmarkQualityScore: 95,
      version: "1.0.0",
      sourceUrl: "https://docs.sendgrid.com/for-developers/sending-email/quickstart-nodejs",
    });

    // Image Gen - Replicate
    await ctx.db.insert("snippets", {
      useCaseId: imageGenId,
      serviceId: replicateId,
      language: "typescript",
      title: "Generate image with Replicate SDXL",
      description: "Text-to-image generation using Stable Diffusion XL on Replicate",
      code: `import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function generateImage(prompt: string) {
  const output = await replicate.run(
    "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    {
      input: {
        prompt,
        width: 1024,
        height: 1024,
        num_outputs: 1,
        scheduler: "K_EULER",
        num_inference_steps: 25,
      },
    }
  );

  return output as string[];
}

// Usage
const images = await generateImage("A futuristic city at sunset");
console.log(images[0]); // URL to generated image`,
      dependencies: ["replicate@0.25.0"],
      envVars: ["REPLICATE_API_TOKEN"],
      verificationStatus: "passed",
      verifiedAt: Date.now(),
      benchmarkLatencyMs: 12000,
      benchmarkCostUsd: 0.0023,
      benchmarkQualityScore: 88,
      version: "1.0.0",
      sourceUrl: "https://replicate.com/stability-ai/sdxl",
    });

    return {
      useCases: 3,
      services: 6,
      snippets: 5,
    };
  },
});
