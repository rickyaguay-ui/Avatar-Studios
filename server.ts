import express from 'express';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Modality } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json({ limit: '50mb' }));

// Lazy GoogleGenAI initialization
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      console.warn('Warning: GEMINI_API_KEY is not set. API calls will return an error until configured.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// 1. Multi-turn Chat Endpoint with Role System Instructions & Google Search Grounding
app.post('/api/chat', async (req, res) => {
  try {
    const {
      messages,
      model = 'gemini-3.5-flash',
      systemInstruction,
      useSearchGrounding = false,
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const ai = getGenAI();

    // Format history for Gemini API
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    // Supported models per requirements:
    // - gemini-3.1-pro-preview (complex tasks)
    // - gemini-3.5-flash (general tasks & search grounding)
    // - gemini-3.1-flash-lite (fast tasks)
    let validModel = 'gemini-3.5-flash';
    if (model === 'gemini-3.1-pro-preview') validModel = 'gemini-3.1-pro-preview';
    else if (model === 'gemini-3.1-flash-lite') validModel = 'gemini-3.1-flash-lite';
    else if (model === 'gemini-3.5-flash') validModel = 'gemini-3.5-flash';

    // If search grounding is requested, must use gemini-3.5-flash
    if (useSearchGrounding) {
      validModel = 'gemini-3.5-flash';
    }

    const config: any = {
      systemInstruction:
        systemInstruction ||
        'You are an expert Creative Director and Game/App Asset Architect. Provide structured, inspiring, and technically precise advice for visual art, avatars, voices, and intro cinematic sequences.',
    };

    if (useSearchGrounding) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: validModel,
      contents,
      config,
    });

    const replyText = response.text || '';
    const groundingMetadata = (response.candidates?.[0] as any)?.groundingMetadata || null;

    res.json({
      text: replyText,
      model: validModel,
      groundingMetadata,
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate chat response',
      details: error?.status || 'Unknown status',
    });
  }
});

// 1b. App Architect Blueprint Generator (Transforms high-level app ideas into complete production plans)
app.post('/api/architect/plan', async (req, res) => {
  try {
    const { prompt, appName, avatarCount = 8 } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGenAI();
    const systemPrompt = `You are a Principal Software Architect and Creative Director. 
The user wants to plan and build an entire production web/mobile application from scratch.
You must return a strictly valid, comprehensive JSON object that fulfills the following TypeScript interface:

interface AppArchitectBlueprint {
  id: string;
  appName: string;
  tagline: string;
  targetAudience: string;
  userPromptSummary: string;
  aestheticTheme: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
  };
  styleDirectives: string;
  avatars: Array<{
    id: string;
    name: string;
    role: string;
    personality: string;
    gender: string;
    appearancePrompt: string;
    hairstyle: 'cyber_buzzcut' | 'long_wavy' | 'afro_fade' | 'sleek_bob' | 'braided_locs' | 'spiky_anime' | 'side_part_slick' | 'curly_wild' | 'bald_clean';
    clothingTop: 'executive_blazer' | 'cyber_leather_jacket' | 'techwear_hoodie' | 'nanotech_armor' | 'minimal_tshirt' | 'mystic_robe' | 'flight_bomber';
    voice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
    voicePitch: number; // e.g. 0.88 to 1.15
    voiceSpeed: number; // e.g. 0.90 to 1.10
    speechEmotion: 'cheerful' | 'energetic' | 'calm' | 'heroic' | 'happy' | 'dramatic';
    dialogueIntro: string; // 2-3 sentences greeting
    screenTarget: string;
  }>;
  scenes: Array<{
    id: string;
    name: string;
    screenName: string;
    description: string;
    prompt: string;
    aspectRatio: '16:9' | '9:16' | '1:1';
    stylePreset: string;
  }>;
  uiAssets: Array<{
    id: string;
    name: string;
    category: 'icon' | 'badge' | 'card_frame' | 'banner' | 'logo';
    uiType: 'icon_glyph' | 'badge_achievement' | 'card_frame' | 'banner_hero' | 'brand_mark';
    prompt: string;
    usageDescription: string;
  }>;
  checklist: Array<{
    id: string;
    category: 'architecture' | 'avatar' | 'voice' | 'scene' | 'ui' | 'engineering' | 'github';
    title: string;
    detail: string;
    completed: boolean;
    actionTarget?: string;
  }>;
  edgeCases: Array<{
    id: string;
    title: string;
    severity: 'critical' | 'high' | 'medium';
    impact: string;
    mitigation: string;
    codePattern?: string;
  }>;
  gitHubPlan: {
    repositoryName: string;
    recommendedStructure: string;
    dependencies: string[];
    claudeMdContent: string;
    bashSetupScript: string;
    packageJsonSnippet: string;
  };
}

Return ONLY raw JSON with NO markdown formatting around it, no \`\`\`json fences. Include exactly ${avatarCount} avatars and matching scenes for the user's concept.`;

    let generatedJson: any = null;

    try {
      // Use gemini-3.1-pro-preview for complex reasoning & architectural design
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Create a complete production blueprint for this app request:\n"${prompt}"\nSuggested App Name: ${
                  appName || 'Auto-detect from prompt'
                }`,
              },
            ],
          },
        ],
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '';
      if (responseText.trim()) {
        try {
          generatedJson = JSON.parse(responseText.trim());
        } catch (parseErr) {
          // If markdown fences were accidentally included
          const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
          generatedJson = JSON.parse(cleaned);
        }
      }
    } catch (genErr) {
      console.warn('Gemini Architect Generation fallback:', genErr);
    }

    // Ensure we have a valid blueprint structure
    if (generatedJson && generatedJson.appName && Array.isArray(generatedJson.avatars)) {
      generatedJson.createdAt = Date.now();
      return res.json({ blueprint: generatedJson, source: 'gemini-3.1-pro-preview' });
    }

    // Fallback blueprint generation if offline or parse issue
    const isBridge = prompt.toLowerCase().includes('bridge') || prompt.toLowerCase().includes('spiritual') || prompt.toLowerCase().includes('christian');
    const detectedName = appName || (isBridge ? 'The Bridge' : 'OmniCraft Studio App');

    const fallbackBlueprint = {
      id: `blueprint_${Date.now()}`,
      appName: detectedName,
      tagline: isBridge ? 'Spiritual Christian Sanctuary & Community Companion' : 'Next-Gen Intelligent Interactive Application',
      targetAudience: isBridge ? 'Believers, church fellowships, seekers, and prayer groups worldwide.' : 'Modern mobile and web users seeking rich multimedia immersion.',
      userPromptSummary: prompt,
      aestheticTheme: isBridge ? 'Luminous Sanctuary (Warm Gold, Indigo & Pristine Slate)' : 'Modern Radiant Neo-Glass',
      colorPalette: {
        primary: isBridge ? '#4f46e5' : '#6366f1',
        secondary: isBridge ? '#d97706' : '#ec4899',
        accent: isBridge ? '#0d9488' : '#06b6d4',
        background: '#090d16',
        surface: '#111827',
      },
      styleDirectives: isBridge
        ? 'Luminous golden hour lighting, peaceful sacred modern architecture, high-contrast readable typography, serene botanical gardens.'
        : 'High-contrast typography, balanced dark canvas, crisp vector accents, volumetric studio lighting.',
      avatars: [
        {
          id: 'av_1',
          name: isBridge ? 'David' : 'Mentor Orion',
          role: isBridge ? 'King, Psalmist & Shepherd' : 'Chief Guide',
          personality: 'Courageous, poetic, and deeply human — a man after God\'s own heart',
          gender: 'Mature male',
          appearancePrompt: isBridge
            ? 'Ancient Israelite king and shepherd, dark curly hair, warm olive complexion, humble yet regal bearing, painterly cinematic portrait, illustrated portrait style, earthy terracotta and ochre tones'
            : 'Distinguished compassionate mentor with warm smiling eyes, executive tailored blazer, soft sunlit architectural background',
          hairstyle: 'side_part_slick',
          clothingTop: 'mystic_robe',
          voice: 'Charon',
          voicePitch: 0.92,
          voiceSpeed: 0.95,
          speechEmotion: 'calm',
          dialogueIntro: isBridge ? 'The Lord is my shepherd — and yours. Walk with me.' : 'Welcome to the platform. Let us build your journey together.',
          screenTarget: 'Home & Welcome Hub',
        },
        {
          id: 'av_2',
          name: isBridge ? 'Ruth' : 'Aria Nova',
          role: isBridge ? 'Moabite Daughter-in-Law, Book of Ruth' : 'Community Leader',
          personality: 'Faithful, tenacious, and quietly extraordinary',
          gender: 'Young adult female',
          appearancePrompt: isBridge
            ? 'Ancient Near Eastern young woman, dark hair, warm bronze complexion, humble determined expression, painterly cinematic portrait, illustrated portrait style, earthy warm tones'
            : 'Youthful smiling female guide, curly hair, warm natural sunlight, modern studio background',
          hairstyle: 'long_wavy',
          clothingTop: 'mystic_robe',
          voice: 'Kore',
          voicePitch: 1.05,
          voiceSpeed: 0.98,
          speechEmotion: 'calm',
          dialogueIntro: isBridge ? 'Where you go, I will go. You are not walking this path alone.' : 'Hello! Ready to dive into today\'s exciting challenges?',
          screenTarget: 'Community & Group Chat',
        },
      ],
      scenes: [
        {
          id: 'sc_1',
          name: isBridge ? 'Sanctuary Dawn' : 'Nexus Main Hub',
          screenName: 'Welcome Dashboard',
          description: 'Luminous architectural sanctuary with golden sunbeams filtering through glass.',
          prompt: 'Architectural modern cathedral at sunrise, golden rays, clean slate floor, serene lighting',
          aspectRatio: '16:9',
          stylePreset: 'cinematic',
        },
      ],
      uiAssets: [
        {
          id: 'ui_1',
          name: isBridge ? 'Celtic Bridge Cross Emblem' : 'Core System Emblem',
          category: 'logo',
          uiType: 'icon_glyph',
          prompt: 'Minimalist elegant modern cross emblem with intertwined bridge motif, golden gradient on navy circular badge',
          usageDescription: 'Primary App Icon and Splash Screen Brand Mark',
        },
      ],
      checklist: [
        {
          id: 'chk_1',
          category: 'architecture',
          title: 'Establish Design System & Avatar Voice Mapping',
          detail: 'Assign Gemini TTS models to characters and generate style tokens.',
          completed: true,
          actionTarget: 'avatar',
        },
        {
          id: 'chk_2',
          category: 'github',
          title: 'Generate CLAUDE.md & Repository Push Script',
          detail: 'Provide ready-to-use Claude Code instructions and setup script.',
          completed: true,
          actionTarget: 'export',
        },
      ],
      edgeCases: [
        {
          id: 'edge_1',
          title: 'Low Audio Bandwidth & Offline Latency',
          severity: 'critical',
          impact: 'Mobile users on remote retreats or unstable wifi experience TTS delays.',
          mitigation: 'Pre-cache synthesized speech blobs in IndexedDB and provide Web Speech API fallback.',
          codePattern: 'const cached = await idbKeyval.get(voiceKey); if (cached) return cached;',
        },
      ],
      gitHubPlan: {
        repositoryName: `${detectedName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-app`,
        recommendedStructure: `${detectedName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-app/\n├── CLAUDE.md\n├── /src\n│   ├── /components\n│   ├── /data\n│   └── /assets`,
        dependencies: ['react@^18.3.1', 'lucide-react@^1.16.0', 'tailwindcss@^4.0.0'],
        claudeMdContent: `# ${detectedName}\n\nArchitecture and implementation guide for Claude Code.`,
        bashSetupScript: `git init\ngit add .\ngit commit -m "feat: initial commit for ${detectedName}"`,
        packageJsonSnippet: '{\n  "name": "' + detectedName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '"\n}',
      },
      createdAt: Date.now(),
    };

    res.json({ blueprint: fallbackBlueprint, source: 'fallback_template' });
  } catch (error: any) {
    console.error('App Architect API Error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate blueprint' });
  }
});

// Helper: Extract inline base64 image or fetch URL to image part
async function parseImageToPart(imageUrl: string): Promise<{ inlineData: { mimeType: string; data: string } } | null> {
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) return null;
  try {
    if (imageUrl.startsWith('data:image/')) {
      const match = imageUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (match) {
        return {
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        };
      }
    } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      const fetched = await fetch(imageUrl, {
        headers: { 'User-Agent': 'aistudio-build' },
      });
      if (fetched.ok) {
        const arrayBuf = await fetched.arrayBuffer();
        const headerType = fetched.headers.get('content-type') || 'image/png';
        const mimeType = headerType.split(';')[0].trim();
        return {
          inlineData: {
            mimeType: mimeType || 'image/png',
            data: Buffer.from(arrayBuf).toString('base64'),
          },
        };
      }
    }
  } catch (err) {
    console.warn('Could not parse image:', err);
  }
  return null;
}

// 2. High-Quality Image Generation & Editing using gemini-3.1-flash-image-preview
app.post('/api/generate-image', async (req, res) => {
  try {
    const {
      prompt,
      aspectRatio = '16:9',
      imageSize = '1K',
      requestedModel,
      referenceImageUrl,
      sourceImageUrl, // Provided for image editing
      isEdit = false,
      styleDirectives,
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGenAI();

    // Use gemini-3.1-flash-image-preview per requirement
    const targetModel = requestedModel || 'gemini-3.1-flash-image-preview';

    // Parse source image (if editing) or reference image (if style anchoring)
    const activeImageInput = sourceImageUrl || referenceImageUrl;
    const imagePart = await parseImageToPart(activeImageInput);

    let finalPrompt = prompt;
    if (styleDirectives && typeof styleDirectives === 'string' && styleDirectives.trim()) {
      finalPrompt = `[MANDATORY STYLE PRIMER]: ${styleDirectives.trim()}\n[SUBJECT]: ${finalPrompt}`;
    }

    if (isEdit && imagePart) {
      finalPrompt = `Edit and transform this image according to the instructions:\n${finalPrompt}`;
    } else if (imagePart) {
      finalPrompt = `[STYLE CONSISTENCY ANCHOR]: Match the visual aesthetic, line weights, color harmony, and rendering materials of the provided reference image.\n${finalPrompt}`;
    }

    const requestParts: any[] = [];
    if (imagePart) {
      requestParts.push(imagePart);
    }
    requestParts.push({ text: finalPrompt });

    let response;
    try {
      response = await ai.models.generateContent({
        model: targetModel,
        contents: {
          parts: requestParts,
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
            imageSize: imageSize as any,
          },
        },
      });
    } catch (primaryErr: any) {
      console.warn(`Primary image model ${targetModel} error:`, primaryErr?.message || primaryErr);

      // Fallback to gemini-3.1-flash-image
      const fallbackModel = 'gemini-3.1-flash-image';
      try {
        console.log(`Retrying with ${fallbackModel}...`);
        response = await ai.models.generateContent({
          model: fallbackModel,
          contents: {
            parts: requestParts,
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as any,
              imageSize: (imageSize === '4K' ? '2K' : imageSize) as any,
            },
          },
        });
      } catch (fallbackErr: any) {
        // Last resort: retry without image conditioning if image formatting failed
        if (requestParts.length > 1) {
          response = await ai.models.generateContent({
            model: fallbackModel,
            contents: {
              parts: [{ text: finalPrompt }],
            },
            config: {
              imageConfig: {
                aspectRatio: aspectRatio as any,
                imageSize: '1K',
              },
            },
          });
        } else {
          throw fallbackErr;
        }
      }
    }

    let imageUrl = '';
    const parts = response?.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        const mimeType = part.inlineData.mimeType || 'image/png';
        imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      return res.status(500).json({
        error: 'No image data returned from model',
        text: response?.text || '',
      });
    }

    res.json({
      imageUrl,
      prompt,
      finalPrompt,
      imageSize,
      aspectRatio,
      isEdit: !!(isEdit && imagePart),
      stylePrimed: !!(styleDirectives || imagePart),
    });
  } catch (error: any) {
    console.error('Image Generation API Error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate image',
    });
  }
});

// 3. Audio Transcription (gemini-3.5-transcribe)
app.post('/api/transcribe-audio', async (req, res) => {
  try {
    const { audioData, mimeType = 'audio/webm' } = req.body;

    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const ai = getGenAI();

    let cleanBase64 = audioData;
    if (audioData.includes('base64,')) {
      cleanBase64 = audioData.split('base64,')[1];
    }

    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: cleanBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          { text: 'Transcribe this audio precisely. Return only the transcription with correct punctuation.' },
        ],
      },
    });

    const transcript = response.text?.trim() || '';

    res.json({
      transcript,
      success: true,
    });
  } catch (error: any) {
    console.error('Audio Transcription Error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to transcribe audio',
    });
  }
});

// 4. Veo 3 Video Generation (veo-3.1-fast-generate-preview)
// Text-to-Video & Image-to-Video animation
app.post('/api/generate-video', async (req, res) => {
  try {
    const {
      prompt = 'Cinematic camera pan across high-tech futuristic city',
      imageUrl,
      aspectRatio = '16:9',
      resolution = '720p',
    } = req.body;

    const ai = getGenAI();
    const validAspectRatio = aspectRatio === '9:16' ? '9:16' : '16:9';

    const config: any = {
      numberOfVideos: 1,
      resolution: resolution === '1080p' ? '1080p' : '720p',
      aspectRatio: validAspectRatio,
    };

    let operation;
    if (imageUrl) {
      const parsedImage = await parseImageToPart(imageUrl);
      if (parsedImage?.inlineData) {
        operation = await (ai.models as any).generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt: prompt || 'Animate this scene with smooth cinematic camera motion',
          image: {
            imageBytes: parsedImage.inlineData.data,
            mimeType: parsedImage.inlineData.mimeType,
          },
          config,
        });
      }
    }

    if (!operation) {
      operation = await (ai.models as any).generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        config,
      });
    }

    res.json({
      operationName: operation.name,
      aspectRatio: validAspectRatio,
    });
  } catch (error: any) {
    console.error('Veo Video Generation Error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to initiate video generation',
    });
  }
});

// Poll Veo video generation status
app.post('/api/video-status', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const ai = getGenAI();
    const op = { name: operationName };
    const updated = await (ai.operations as any).getVideosOperation({ operation: op as any });

    res.json({
      done: updated.done,
      error: updated.error || null,
      hasVideo: !!updated.response?.generatedVideos?.[0]?.video?.uri,
    });
  } catch (error: any) {
    console.error('Video Status Polling Error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to check video status',
    });
  }
});

// Download finished Veo video using server-side Gemini API key
app.post('/api/video-download', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const ai = getGenAI();
    const apiKey = process.env.GEMINI_API_KEY || '';
    const op = { name: operationName };
    const updated = await (ai.operations as any).getVideosOperation({ operation: op as any });

    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.status(404).json({ error: 'Video URI not available or not yet ready' });
    }

    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey },
    });

    if (!videoRes.ok) {
      return res.status(videoRes.status).json({ error: 'Failed to stream video from Google CDN' });
    }

    res.setHeader('Content-Type', 'video/mp4');
    const arrayBuffer = await videoRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error: any) {
    console.error('Video Download Error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to download video',
    });
  }
});

// Helper: Ensure audio buffer has a valid RIFF/WAVE header
function ensureWavBuffer(
  rawBuffer: Buffer,
  defaultSampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16
): Buffer {
  if (rawBuffer.length >= 12 && rawBuffer.toString('ascii', 0, 4) === 'RIFF') {
    return rawBuffer;
  }

  const byteRate = defaultSampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = rawBuffer.length;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0, 'ascii');
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8, 'ascii');
  header.write('fmt ', 12, 'ascii');
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(defaultSampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36, 'ascii');
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, rawBuffer]);
}

// Helper: Synthesize rich procedural stereo WAV soundtrack when cloud Lyria API is rate-limited
function synthesizeProceduralSoundtrackWav(prompt: string, durationSec = 10): Buffer {
  const sampleRate = 44100;
  const numChannels = 2;
  const numSamples = Math.floor(sampleRate * durationSec);
  const pcmBuffer = Buffer.alloc(numSamples * numChannels * 2); // 16-bit stereo

  const lowerPrompt = prompt.toLowerCase();
  const isUpbeat = /upbeat|arcade|chiptune|retro|fast|dance|game|playful/i.test(lowerPrompt);
  const isLofi = /lo-fi|lofi|chill|relax|calm|peaceful|soft|cozy/i.test(lowerPrompt);
  const isCyber = /cyber|synth|neon|future|futuristic|techno|dark|sci-fi/i.test(lowerPrompt);

  const bpm = isUpbeat ? 128 : isLofi ? 82 : isCyber ? 116 : 100;
  const beatSec = 60 / bpm;
  const barSec = beatSec * 4;

  const chordSets = isLofi
    ? [
        [220.0, 261.63, 329.63, 392.0], // Am7
        [174.61, 220.0, 261.63, 329.63], // Fmaj7
        [261.63, 329.63, 392.0, 493.88], // Cmaj7
        [196.0, 246.94, 293.66, 349.23], // G7
      ]
    : isCyber
    ? [
        [110.0, 130.81, 164.81, 220.0], // Am
        [98.0, 123.47, 146.83, 196.0], // G
        [87.31, 110.0, 130.81, 174.61], // F
        [82.41, 103.83, 123.47, 164.81], // E
      ]
    : [
        [220.0, 261.63, 329.63, 440.0], // Am
        [174.61, 220.0, 261.63, 349.23], // F
        [261.63, 329.63, 392.0, 523.25], // C
        [196.0, 246.94, 293.66, 392.0], // G
      ];

  let byteOffset = 0;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    let envelope = 1.0;
    if (t < 0.5) envelope = t / 0.5;
    else if (t > durationSec - 1.0) envelope = (durationSec - t) / 1.0;

    const totalBars = chordSets.length;
    const currentBarIndex = Math.floor((t % (barSec * totalBars)) / barSec);
    const chord = chordSets[currentBarIndex % totalBars];
    const barProgress = (t % barSec) / barSec;
    const padGain = (1 - Math.cos(barProgress * 2 * Math.PI)) * 0.5;

    let leftSignal = 0;
    let rightSignal = 0;
    for (let c = 0; c < chord.length; c++) {
      const f = chord[c];
      const sine = Math.sin(2 * Math.PI * f * t);
      const sub = Math.sin(2 * Math.PI * (f * 0.5) * t) * 0.4;
      const overtone = Math.sin(2 * Math.PI * (f * 2.0) * t) * 0.15;
      const note = (sine + sub + overtone) * 0.08 * (0.6 + padGain * 0.4);
      leftSignal += note;
      rightSignal += note * 0.95;
    }

    const arp16 = Math.floor((t % beatSec) / (beatSec / 4));
    const arpFreq = chord[arp16 % chord.length] * 2.0;
    const arpNoteTime = (t % (beatSec / 4)) / (beatSec / 4);
    const arpEnv = Math.exp(-arpNoteTime * 6.0);
    const arpWave = Math.sin(2 * Math.PI * arpFreq * t) + 0.3 * Math.sin(2 * Math.PI * arpFreq * 2 * t);
    const arpValue = arpWave * arpEnv * 0.14;
    const arpPan = (arp16 % 4) / 3;
    leftSignal += arpValue * (1 - arpPan * 0.5);
    rightSignal += arpValue * (0.5 + arpPan * 0.5);

    const rootFreq = chord[0] * 0.5;
    const bassEnv = Math.sin(2 * Math.PI * rootFreq * t);
    const bassSat = Math.tanh(bassEnv * 1.5) * 0.22;
    leftSignal += bassSat;
    rightSignal += bassSat;

    const beatPhase = (t % beatSec) / beatSec;
    const beatIndex = Math.floor((t % barSec) / beatSec);
    if (beatIndex === 0 || beatIndex === 2) {
      const kickFreq = Math.max(45, 120 * Math.exp(-beatPhase * 18));
      const kickEnv = Math.exp(-beatPhase * 12);
      const kick = Math.sin(2 * Math.PI * kickFreq * t) * kickEnv * 0.25;
      leftSignal += kick;
      rightSignal += kick;
    }
    const hatPhase = (t % (beatSec / 2)) / (beatSec / 2);
    if (hatPhase < 0.15) {
      const noise = (Math.random() * 2 - 1) * Math.exp(-hatPhase * 25) * 0.05;
      leftSignal += noise;
      rightSignal += noise;
    }

    leftSignal = Math.max(-0.95, Math.min(0.95, leftSignal * envelope));
    rightSignal = Math.max(-0.95, Math.min(0.95, rightSignal * envelope));

    const sampleL = Math.floor(leftSignal * 32767);
    const sampleR = Math.floor(rightSignal * 32767);

    pcmBuffer.writeInt16LE(sampleL, byteOffset);
    pcmBuffer.writeInt16LE(sampleR, byteOffset + 2);
    byteOffset += 4;
  }

  return ensureWavBuffer(pcmBuffer, sampleRate, numChannels, 16);
}

// 5. Avatar Voice & Speech Generation (gemini-3.1-flash-tts-preview)
app.post('/api/generate-speech', async (req, res) => {
  try {
    const { text, voice = 'Kore', emotion = 'cheerful' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text prompt is required' });
    }

    const ai = getGenAI();

    const emotionPrompt = emotion
      ? `Say with ${emotion} tone and expression: ${text}`
      : text;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: emotionPrompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    const base64Audio = part?.inlineData?.data;
    const rawMime = part?.inlineData?.mimeType || 'audio/wav';

    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio returned from TTS model' });
    }

    const rawBuffer = Buffer.from(base64Audio, 'base64');
    let sampleRate = 24000;
    const rateMatch = rawMime.match(/rate=(\d+)/i);
    if (rateMatch) {
      sampleRate = parseInt(rateMatch[1], 10);
    }

    const wavBuffer = ensureWavBuffer(rawBuffer, sampleRate, 1, 16);
    const audioUrl = `data:audio/wav;base64,${wavBuffer.toString('base64')}`;

    res.json({
      audioUrl,
      voice,
      text,
    });
  } catch (error: any) {
    console.error('TTS Generation Error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to synthesize speech',
    });
  }
});

// 6. Music Generation with Lyria (lyria-3-clip-preview & lyria-3-pro-preview) with adaptive fallback
app.post('/api/generate-music', async (req, res) => {
  const {
    prompt = 'Upbeat futuristic synth soundtrack for mobile app intro',
    modelType = 'clip', // 'clip' (up to 30s) or 'pro' (full tracks)
    imageUrl,
  } = req.body;

  try {
    const ai = getGenAI();
    const model = modelType === 'pro' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview';

    let contents: any = prompt;
    if (imageUrl) {
      const imagePart = await parseImageToPart(imageUrl);
      if (imagePart) {
        contents = {
          parts: [
            { text: prompt },
            imagePart,
          ],
        };
      }
    }

    const response = await ai.models.generateContentStream({
      model,
      contents,
    });

    let audioBase64 = '';
    let mimeType = 'audio/wav';
    let lyrics = '';

    for await (const chunk of response) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
        if (part.text && !lyrics) {
          lyrics = part.text;
        }
      }
    }

    if (audioBase64) {
      const rawBuffer = Buffer.from(audioBase64, 'base64');
      let sampleRate = 44100;
      const rateMatch = mimeType.match(/rate=(\d+)/i);
      if (rateMatch) {
        sampleRate = parseInt(rateMatch[1], 10);
      }

      const wavBuffer = ensureWavBuffer(rawBuffer, sampleRate, 2, 16);
      const audioUrl = `data:audio/wav;base64,${wavBuffer.toString('base64')}`;

      return res.json({
        audioUrl,
        prompt,
        lyrics,
        model,
        isFallback: false,
      });
    }
  } catch (lyriaErr: any) {
    // Quota reached or model unavailable - seamlessly synthesize high-fidelity studio track
    console.log('Lyria model quota/availability notice received. Providing adaptive studio synthesizer track.');
  }

  // Graceful adaptive fallback: generate full procedural stereo soundtrack
  try {
    const duration = modelType === 'pro' ? 14 : 10;
    const wavBuffer = synthesizeProceduralSoundtrackWav(prompt, duration);
    const audioUrl = `data:audio/wav;base64,${wavBuffer.toString('base64')}`;

    return res.json({
      audioUrl,
      prompt,
      lyrics: 'Adaptive Studio Synthesizer Track',
      model: 'studio-synth-adaptive',
      isFallback: true,
      notice: 'Lyria API quota is limited on the free tier. An adaptive high-fidelity studio soundtrack was generated.',
    });
  } catch (synthErr: any) {
    console.warn('Audio synthesis warning:', synthErr?.message);
    return res.status(500).json({
      error: 'Failed to synthesize audio',
      useFallbackSynth: true,
    });
  }
});

// File-backed persistent Project Folders store (server fallback)
const PROJECTS_FILE = path.join(process.cwd(), 'projects_data.json');
let projectsMemoryStore: any[] = [];

try {
  if (fs.existsSync(PROJECTS_FILE)) {
    projectsMemoryStore = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));
  }
} catch (e) {
  projectsMemoryStore = [];
}

app.get('/api/projects', (req, res) => {
  res.json({ projects: projectsMemoryStore });
});

app.post('/api/projects', (req, res) => {
  try {
    const project = req.body;
    if (!project || !project.id) {
      return res.status(400).json({ error: 'Valid project with id is required' });
    }
    const idx = projectsMemoryStore.findIndex((p) => p.id === project.id);
    if (idx >= 0) {
      projectsMemoryStore[idx] = { ...projectsMemoryStore[idx], ...project, updatedAt: Date.now() };
    } else {
      projectsMemoryStore.unshift({
        ...project,
        createdAt: project.createdAt || Date.now(),
        updatedAt: Date.now(),
      });
    }
    try {
      fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projectsMemoryStore, null, 2));
    } catch (err) {
      console.warn('Could not save projects to file:', err);
    }
    res.json({ success: true, project: projectsMemoryStore.find((p) => p.id === project.id) });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to save project' });
  }
});

app.delete('/api/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    projectsMemoryStore = projectsMemoryStore.filter((p) => p.id !== id);
    try {
      fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projectsMemoryStore, null, 2));
    } catch (err) {}
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to delete project' });
  }
});

// ─── ElevenLabs Character Voice Map for The Bridge ──────────────────────────
// Assign ElevenLabs voice IDs per canonical biblical character.
// Set ELEVENLABS_API_KEY in .env to enable. Falls back to Gemini TTS if not set.
const ELEVENLABS_VOICE_MAP: Record<string, string> = {
  // The Bridge — Canonical Cast
  David:           'pNInz6obpgDQGcFmaJgB', // Adam — warm baritone, gravitas
  Paul:            'VR6AewLTigWG4xSOukaG', // Arnold — authoritative, deliberate
  Peter:           'yoZ06aMxZJJ28mfd3POQ', // Sam — bold, direct
  Moses:           'N2lVS1w4EtoT3dr4eOWO', // Callum — ancient weight
  Mary:            'XB0fDUnXU5powFXDhCwa', // Charlotte — gentle, warm
  Rahab:           'EXAVITQu4vr4xnSDxMaL', // Bella — resilient, grounded
  Ruth:            'jBpfuIE2acCO8z3wKNLl', // Gigi — earnest, faithful
  'Mary Magdalene':'oWAxZDx7w5VEj9dCyTzz', // Grace — expressive, transformed
  // Fallback — generic character
  default:         'EXAVITQu4vr4xnSDxMaL',
};

// 7. ElevenLabs v3 TTS — Premium Character Voice Synthesis
// POST /api/elevenlabs-speech
// Body: { text: string, characterName?: string, voiceId?: string, emotion?: string, modelId?: string }
// Returns: { audioUrl: string (base64 data URI), voiceId: string, characterName: string }
app.post('/api/elevenlabs-speech', async (req, res) => {
  const elevenKey = process.env.ELEVENLABS_API_KEY;
  if (!elevenKey) {
    return res.status(503).json({
      error: 'ElevenLabs API key not configured. Add ELEVENLABS_API_KEY to your .env file.',
      setupUrl: 'https://elevenlabs.io/app/settings/api-keys',
    });
  }

  try {
    const {
      text,
      characterName,
      voiceId,
      emotion,
      modelId = 'eleven_v3',         // ElevenLabs v3 — supports emotional tags
      stability = 0.45,               // Lower = more expressive
      similarityBoost = 0.82,
      style = 0.35,
      useSpeakerBoost = true,
    } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Resolve voice: explicit voiceId > character name lookup > default
    const resolvedVoiceId = voiceId
      || (characterName && ELEVENLABS_VOICE_MAP[characterName])
      || ELEVENLABS_VOICE_MAP.default;

    // Wrap with ElevenLabs v3 emotional dialogue tag if emotion provided
    // Format: <emotion type="calm" intensity="medium">text</emotion>
    let processedText = text;
    if (emotion) {
      processedText = `<emotion type="${emotion}" intensity="medium">${text}</emotion>`;
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': elevenKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: processedText,
          model_id: modelId,
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style,
            use_speaker_boost: useSpeakerBoost,
          },
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error('[ElevenLabs TTS] API Error:', response.status, errBody);
      return res.status(response.status).json({
        error: `ElevenLabs API error: ${response.status}`,
        detail: errBody,
      });
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    const audioUrl = `data:audio/mpeg;base64,${audioBuffer.toString('base64')}`;

    res.json({
      audioUrl,
      voiceId: resolvedVoiceId,
      characterName: characterName || 'unknown',
      provider: 'elevenlabs',
      model: modelId,
    });
  } catch (error: any) {
    console.error('[ElevenLabs TTS] Error:', error);
    res.status(500).json({ error: error?.message || 'ElevenLabs TTS failed' });
  }
});

// 8. Hedra Character 3 — Portrait + Audio → Talking Avatar Video
// POST /api/generate-talking-avatar
// Body: { portraitUrl: string, audioUrl: string, aspectRatio?: '1:1'|'16:9'|'9:16', resolution?: '720p'|'1080p' }
// Returns: { generationId: string, status: string, pollUrl: string }
// Then poll: GET /api/talking-avatar-status/:generationId
app.post('/api/generate-talking-avatar', async (req, res) => {
  const hedraKey = process.env.HEDRA_API_KEY;
  if (!hedraKey) {
    return res.status(503).json({
      error: 'Hedra API key not configured. Add HEDRA_API_KEY to your .env file.',
      setupUrl: 'https://www.hedra.com/app/settings',
    });
  }

  try {
    const {
      portraitUrl,   // base64 data URI or public HTTPS URL of the portrait image
      audioUrl,      // base64 data URI or public HTTPS URL of the voice audio
      aspectRatio = '1:1',
      resolution = '720p',
    } = req.body;

    if (!portraitUrl || !audioUrl) {
      return res.status(400).json({ error: 'portraitUrl and audioUrl are both required' });
    }

    const HEDRA_BASE = 'https://api.hedra.com/web-app/public';
    const hedraHeaders = {
      'X-API-Key': hedraKey,
      'Content-Type': 'application/json',
    };

    // Step 1: Upload audio to Hedra
    const audioUploadRes = await fetch(`${HEDRA_BASE}/audio`, {
      method: 'POST',
      headers: hedraHeaders,
      body: JSON.stringify({ url: audioUrl }),
    });
    if (!audioUploadRes.ok) {
      const err = await audioUploadRes.text();
      return res.status(502).json({ error: 'Hedra audio upload failed', detail: err });
    }
    const { id: audio_id } = await audioUploadRes.json() as { id: string };

    // Step 2: Upload portrait image to Hedra
    const portraitUploadRes = await fetch(`${HEDRA_BASE}/portrait`, {
      method: 'POST',
      headers: hedraHeaders,
      body: JSON.stringify({ url: portraitUrl }),
    });
    if (!portraitUploadRes.ok) {
      const err = await portraitUploadRes.text();
      return res.status(502).json({ error: 'Hedra portrait upload failed', detail: err });
    }
    const { id: start_keyframe_id } = await portraitUploadRes.json() as { id: string };

    // Step 3: Create generation
    const genRes = await fetch(`${HEDRA_BASE}/generations`, {
      method: 'POST',
      headers: hedraHeaders,
      body: JSON.stringify({
        model_slug: 'hedra-character-3',
        audio_id,
        start_keyframe_id,
        aspect_ratio: aspectRatio,
        resolution,
      }),
    });
    if (!genRes.ok) {
      const err = await genRes.text();
      return res.status(502).json({ error: 'Hedra generation failed', detail: err });
    }
    const generation = await genRes.json() as { id: string; status: string };

    res.json({
      generationId: generation.id,
      status: generation.status,
      pollUrl: `/api/talking-avatar-status/${generation.id}`,
      provider: 'hedra',
      model: 'hedra-character-3',
    });
  } catch (error: any) {
    console.error('[Hedra] Error:', error);
    res.status(500).json({ error: error?.message || 'Hedra generation failed' });
  }
});

// GET /api/talking-avatar-status/:generationId — Poll Hedra for video completion
app.get('/api/talking-avatar-status/:generationId', async (req, res) => {
  const hedraKey = process.env.HEDRA_API_KEY;
  if (!hedraKey) {
    return res.status(503).json({ error: 'HEDRA_API_KEY not configured' });
  }

  try {
    const { generationId } = req.params;
    const HEDRA_BASE = 'https://api.hedra.com/web-app/public';

    const statusRes = await fetch(`${HEDRA_BASE}/generations/${generationId}`, {
      headers: { 'X-API-Key': hedraKey },
    });

    if (!statusRes.ok) {
      const err = await statusRes.text();
      return res.status(502).json({ error: 'Hedra status check failed', detail: err });
    }

    const data = await statusRes.json() as {
      id: string;
      status: 'queued' | 'processing' | 'complete' | 'error';
      video_url?: string;
      error?: string;
    };

    res.json({
      generationId: data.id,
      status: data.status,
      videoUrl: data.video_url || null,
      error: data.error || null,
      ready: data.status === 'complete',
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Status check failed' });
  }
});

// Setup Server & Live API WebSocket
async function startServer() {
  const server = http.createServer(app);

  // Setup Live API WebSocket on /live
  const wss = new WebSocketServer({ server, path: '/live' });

  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('[Live API] Client connected to /live');
    let session: any = null;

    try {
      const ai = getGenAI();
      session = await (ai as any).live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction:
            'You are an interactive AI Creative Director and Voice Actor. Speak naturally, enthusiastically, and concisely to guide the user in designing app intros, avatars, and visual assets.',
        },
        callbacks: {
          onmessage: (message: any) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ audio }));
            }
            if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
        },
      });

      clientWs.on('message', (data: any) => {
        try {
          const parsed = JSON.parse(data.toString());
          if (parsed.audio && session) {
            session.sendRealtimeInput({
              audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
            });
          }
        } catch (e) {
          console.warn('[Live API] Failed to parse client message:', e);
        }
      });
    } catch (err: any) {
      console.warn('[Live API] Failed to connect to gemini-3.8-live:', err?.message || err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ error: err?.message || 'Live API connection unavailable' }));
      }
    }

    clientWs.on('close', () => {
      console.log('[Live API] Client disconnected');
      if (session && typeof session.close === 'function') {
        try {
          session.close();
        } catch {}
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`Server listening at http://0.0.0.0:${port}`);
  });
}

startServer();
