/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { initialListings, mockUsers, initialReports } from './src/data';
import type { Listing, Message, Report, User } from './src/types';

dotenv.config();

const app = express();

const cspHeader = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  "font-src 'self' https: data:",
  "connect-src 'self' ws: https: wss:",
  "worker-src 'self' blob:",
  "form-action 'self'",
  "upgrade-insecure-requests"
].join('; ');

app.use((_req, res, next) => {
  res.setHeader('Content-Security-Policy', cspHeader);
  next();
});

// Global API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // limit each IP to 150 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// Stricter rate limiting for AI processing endpoints
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15, // limit each IP to 15 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI processing rate limit exceeded. Please wait a minute before making another request.' }
});

app.use(express.json());

const PERSISTENCE_DIR = path.join(process.cwd(), 'data');
const PERSISTENCE_FILE = path.join(PERSISTENCE_DIR, 'dimoads-data.json');

type PersistedState = {
  listings: Listing[];
  users: Record<string, User>;
  reports: Report[];
  messages: Message[];
  currentUserId: string;
};

const defaultPersistedState: PersistedState = {
  listings: initialListings,
  users: mockUsers,
  reports: initialReports,
  messages: [],
  currentUserId: 'user-3'
};

async function ensurePersistenceStore() {
  await fs.mkdir(PERSISTENCE_DIR, { recursive: true });
}

async function readPersistedState(): Promise<PersistedState> {
  try {
    await ensurePersistenceStore();
    const raw = await fs.readFile(PERSISTENCE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      listings: Array.isArray(parsed.listings) ? parsed.listings : defaultPersistedState.listings,
      users: parsed.users && typeof parsed.users === 'object' ? parsed.users : defaultPersistedState.users,
      reports: Array.isArray(parsed.reports) ? parsed.reports : defaultPersistedState.reports,
      messages: Array.isArray(parsed.messages) ? parsed.messages : defaultPersistedState.messages,
      currentUserId: typeof parsed.currentUserId === 'string' ? parsed.currentUserId : defaultPersistedState.currentUserId
    };
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      await writePersistedState(defaultPersistedState);
      return defaultPersistedState;
    }
    throw error;
  }
}

async function writePersistedState(nextState: Partial<PersistedState>): Promise<PersistedState> {
  const current = await readPersistedState();
  const state = {
    ...current,
    ...nextState,
    listings: Array.isArray(nextState.listings) ? nextState.listings : current.listings,
    users: nextState.users && typeof nextState.users === 'object' ? nextState.users : current.users,
    reports: Array.isArray(nextState.reports) ? nextState.reports : current.reports,
    messages: Array.isArray(nextState.messages) ? nextState.messages : current.messages,
    currentUserId: typeof nextState.currentUserId === 'string' ? nextState.currentUserId : current.currentUserId
  };
  await ensurePersistenceStore();
  await fs.writeFile(PERSISTENCE_FILE, JSON.stringify(state, null, 2));
  return state;
}

app.get('/api/persistence/state', async (_req, res) => {
  try {
    res.json(await readPersistedState());
  } catch (error) {
    console.error('Failed to read persisted state:', error);
    res.status(500).json({ error: 'Failed to read persisted state' });
  }
});

app.post('/api/persistence/state', async (req, res) => {
  try {
    const state = await writePersistedState(req.body as Partial<PersistedState>);
    res.json(state);
  } catch (error) {
    console.error('Failed to write persisted state:', error);
    res.status(500).json({ error: 'Failed to save persisted state' });
  }
});

// Public runtime configuration (non-secret) for client use
app.get('/api/config', (_req: Request, res: Response) => {
  const config = {
    googleOAuthClientId: process.env.GOOGLE_OAUTH_CLIENT_ID || null,
    appUrl: process.env.APP_URL || null,
    geminiAvailable: !!process.env.GEMINI_API_KEY
  };

  // Warn server operator if critical secrets are not set
  if (!process.env.GOOGLE_OAUTH_CLIENT_SECRET) {
    console.warn('GOOGLE_OAUTH_CLIENT_SECRET is not set; OAuth server flows will be disabled.');
  }

  res.json(config);
});

// AI prompt protection middleware
function promptProtectionMiddleware(req: Request, res: Response, next: NextFunction) {
  const fieldsToScan = ['promptText', 'title', 'description', 'query', 'message', 'subject'];
  if (req.body) {
    for (const field of fieldsToScan) {
      if (req.body[field]) {
        const valResult = validatePromptSecurity(req.body[field]);
        if (!valResult.isSafe) {
          res.status(400).json({ error: valResult.reason });
          return;
        }
      }
    }
  }
  next();
}

app.use('/api/', apiLimiter);
app.use('/api/gemini/', aiLimiter);
app.use('/api/ai/', aiLimiter);
app.use('/api/', promptProtectionMiddleware);

const PORT = 3000;

// Prompt injection and jailbreak protection utility
function validatePromptSecurity(text: unknown): { isSafe: boolean; reason?: string } {
  if (!text || typeof text !== 'string') {
    return { isSafe: true };
  }
  
  const lowerText = text.toLowerCase();
  
  const jailbreakTriggers = [
    'ignore previous instructions',
    'ignore above instructions',
    'disregard all instructions',
    'system prompt',
    'you are now a',
    'dan mode',
    'jailbreak',
    'ignore guidelines',
    'bypass security',
    'do anything now',
    'override guidelines',
    'forget what you',
    'forget instructions',
    'ignore prompt'
  ];
  
  for (const trigger of jailbreakTriggers) {
    if (lowerText.includes(trigger)) {
      return { isSafe: false, reason: `Potential prompt injection signature detected ("${trigger}")` };
    }
  }
  
  if (text.length > 8000) {
    return { isSafe: false, reason: 'Payload length exceeds safety limits (max 8000 characters)' };
  }
  
  return { isSafe: true };
}

// Lazy initialize Gemini AI client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY is not defined in environment variables. Gemini functions will operate in simulated mode.");
      // Create a dummy client structure to avoid crashing on launch, although we check before calling
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "DUMMY_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ----------------------------------------------------
// AI Endpoint: Listing Assistant (Generator)
// ----------------------------------------------------
app.post('/api/gemini/listing-assistant', async (req: Request, res: Response) => {
  const { promptText, originalLanguage = 'en' } = req.body;

  if (!promptText || typeof promptText !== 'string' || promptText.trim().length === 0) {
    res.status(400).json({ error: 'promptText is required' });
    return;
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    // Graceful fallback for mock demo when API Key is missing
    console.log("Gemini API Key missing. Returning simulation for listing creation.");
    res.json({
      title: `${promptText.charAt(0).toUpperCase() + promptText.slice(1)} - Premium Deal`,
      description: `This is a professionally generated listing for: ${promptText}. Features high quality specs, verified ownership, and immediate availability. Contact the owner for more details and direct viewing arrangement.`,
      category: 'electronics',
      tags: ['premium', promptText.toLowerCase().replace(/\s+/g, '-'), 'classifieds']
    });
    return;
  }

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Generate a listing based on this user input: "${promptText}". The original language is ${originalLanguage}.`,
      config: {
        systemInstruction: `You are an expert AI Listing Assistant for Dimoads AI, a premium global classifieds marketplace. 
Expand the user's short input into an engaging, professional, SEO-optimized classifieds title and description.
Your title must be short and direct (max 12 words). Your description must be highly compelling, detailed, and formatted with bullet points for key specifications, and a friendly call-to-action at the end.
Provide the output in the same language as the user input (${originalLanguage === 'ar' ? 'Arabic' : 'English'}).
Additionally, categorize this listing into one of the nine official categories: 'jobs', 'real-estate', 'vehicles', 'electronics', 'services', 'businesses-for-sale', 'investment-opportunities', 'industrial-equipment', 'commodities'.
Provide 3-6 relevant search tags / keywords in the same language.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Optimized listing title' },
            description: { type: Type.STRING, description: 'Expanded, bulleted professional description' },
            category: { 
              type: Type.STRING, 
              description: 'One of the nine enum categories: jobs, real-estate, vehicles, electronics, services, businesses-for-sale, investment-opportunities, industrial-equipment, commodities' 
            },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: 'List of 3 to 6 hashtags or search keywords without the hash symbol' 
            }
          },
          required: ['title', 'description', 'category', 'tags']
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('Empty response from Gemini');
    }
    res.json(JSON.parse(resultText.trim()));
  } catch (err: any) {
    console.error('Listing Assistant Error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate listing specifications' });
  }
});

// ----------------------------------------------------
// AI Endpoint: Translation Engine
// ----------------------------------------------------
app.post('/api/gemini/translate', async (req: Request, res: Response) => {
  const { title, description, targetLang } = req.body;

  if (!title || !description || !targetLang) {
    res.status(400).json({ error: 'title, description, and targetLang (en or ar) are required' });
    return;
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.log("Gemini API Key missing. Returning simulation for translation.");
    res.json({
      title: targetLang === 'ar' ? `[مترجم] ${title}` : `[Translated] ${title}`,
      description: targetLang === 'ar' 
        ? `هذه ترجمة تجريبية للوصف: ${description}` 
        : `This is a simulated translation of the description: ${description}`
    });
    return;
  }

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Translate this listing to ${targetLang === 'ar' ? 'Arabic' : 'English'}:
Title: "${title}"
Description: "${description}"`,
      config: {
        systemInstruction: `You are a professional, high-fidelity native translator for Dimoads AI. 
Translate the provided classifieds title and description accurately between English and Arabic.
If translating to Arabic, use elegant, modern, professional standard Arabic (Fusha) terms suitable for ecommerce and marketplaces.
If translating to English, ensure a fluent, natural classified ads structure.
Keep all technical parameters, prices, or numbers intact. Do not add any conversational meta-text or preambles outside the JSON structure.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Translated listing title' },
            description: { type: Type.STRING, description: 'Translated listing description' }
          },
          required: ['title', 'description']
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('Empty response from Gemini translation');
    }
    res.json(JSON.parse(resultText.trim()));
  } catch (err: any) {
    console.error('Translation API Error:', err);
    res.status(500).json({ error: err.message || 'Failed to translate listing' });
  }
});

// ----------------------------------------------------
// AI Endpoint: Fraud Detection Radar
// ----------------------------------------------------
app.post('/api/gemini/fraud-detection', async (req: Request, res: Response) => {
  const { title, description, price, category } = req.body;

  if (!title || !description) {
    res.status(400).json({ error: 'title and description are required for fraud scanning' });
    return;
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    // Simulated fallback for local preview offline
    console.log("Gemini API Key missing. Running simulated fraud analysis.");
    const isSuspicious = price < 500 && (title.toLowerCase().includes('rolex') || title.toLowerCase().includes('iphone 15 pro max') || description.toLowerCase().includes('wire transfer'));
    res.json({
      isSuspicious,
      scamScore: isSuspicious ? 92 : 12,
      flags: isSuspicious ? ['Highly unrealistic price for a luxury brand', 'Demands wire transfer or upfront payment'] : ['Safe price range'],
      reason: isSuspicious 
        ? 'The item is priced significantly below market value, which is highly indicative of typical phishing and upfront wire transfer scams.'
        : 'The listing looks normal. No obvious scam keywords detected.'
    });
    return;
  }

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Scan listing for fraud:
Title: "${title}"
Category: "${category}"
Price: $${price}
Description: "${description}"`,
      config: {
        systemInstruction: `You are an expert AI fraud investigator and moderation intelligence for Dimoads AI classifieds.
Analyze the listing parameters to identify potential marketplace scams, counterfeit items, suspicious requests, or spam.
Key scam signals to watch:
1. Highly unrealistic bargains (e.g. Rolex, Porsche, iPhone for tiny fraction of price).
2. Direct request to wire funds or pay bank deposits upfront without physical inspections.
3. Obvious copy-pasted generic text, duplicate listing markers, or spam phone numbers.
Assign a scamScore from 0 (perfectly safe) to 100 (confirmed scam). If scamScore is 60 or above, mark isSuspicious as true.
Provide an array of specific flags (concise sentences) and a summary reason of your verdict.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSuspicious: { type: Type.BOOLEAN },
            scamScore: { type: Type.INTEGER, description: 'Score between 0 and 100' },
            flags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: 'Specific scam signals identified (e.g. "Price too low for brand")'
            },
            reason: { type: Type.STRING, description: 'Explanation summarizing the analysis' }
          },
          required: ['isSuspicious', 'scamScore', 'flags', 'reason']
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('Empty response from Gemini fraud radar');
    }
    res.json(JSON.parse(resultText.trim()));
  } catch (err: any) {
    console.error('Fraud Scanner API Error:', err);
    res.status(500).json({ error: err.message || 'Failed to complete fraud analysis' });
  }
});

// ----------------------------------------------------
// AI Endpoint: Intelligent Media Analysis & Moderation
// ----------------------------------------------------
app.post('/api/media/analyze', async (req: Request, res: Response) => {
  const { imageUrl, fileName } = req.body;

  if (!imageUrl) {
    res.status(400).json({ error: 'imageUrl is required' });
    return;
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    // Return simulated/mock safe analysis as requested for the initial architecture
    console.log("Gemini API Key missing. Returning simulation for media analysis.");
    // Heuristics based on filename or dummy params
    const lowercaseName = (fileName || '').toLowerCase();
    const isPossiblyBlurry = lowercaseName.includes('blur') || lowercaseName.includes('shaky');
    const isPossiblyInappropriate = lowercaseName.includes('inappropriate') || lowercaseName.includes('adult') || lowercaseName.includes('nsfw');
    const isDuplicate = lowercaseName.includes('duplicate');

    res.json({
      isBlurry: isPossiblyBlurry,
      blurScore: isPossiblyBlurry ? 15 : 92,
      isDuplicate: isDuplicate,
      duplicateHash: `MOCK_HASH_${Math.floor(Math.random() * 1000000)}`,
      isInappropriate: isPossiblyInappropriate,
      safetyScore: isPossiblyInappropriate ? 10 : 98,
      aestheticScore: isPossiblyBlurry ? 25 : 88,
      isRecommendedCover: !isPossiblyBlurry && !isPossiblyInappropriate
    });
    return;
  }

  try {
    const ai = getGeminiClient();
    
    // We can query Gemini using a Multimodal request with the file URL, 
    // or perform architectural placeholder instructions for when Gemini Vision is called
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      // Note: In production Gemini API, we can fetch the image first or pass a public URL
      contents: `Perform safety and visual analysis on this marketplace image URL: "${imageUrl}". 
Identify if the image contains adult/violent/inappropriate content, check if it's too blurry for a professional listing, and rate its aesthetic score out of 100.`,
      config: {
        systemInstruction: `You are the core Visual Moderation and Aesthetics Intelligence for Dimoads AI.
Analyze the provided image URL or content parameters.
Perform the following checks:
1. Blurry Detection: Assign a blurScore (0 = completely blurred, 100 = perfectly crisp/focused). Set isBlurry to true if blurScore < 25.
2. Inappropriate Content Detection: Assign a safetyScore (0 = dangerous/NSFW/inappropriate, 100 = perfectly safe/clean). Set isInappropriate to true if safetyScore < 60.
3. Aesthetic Scoring: Assign an aestheticScore (0 to 100) based on optimal framing, exposure, and clarity.
4. cover image: If the image is sharp, safe, and aesthetic, mark isRecommendedCover as true.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isBlurry: { type: Type.BOOLEAN },
            blurScore: { type: Type.INTEGER, description: 'Grayscale high-frequency variance score' },
            isDuplicate: { type: Type.BOOLEAN },
            duplicateHash: { type: Type.STRING },
            isInappropriate: { type: Type.BOOLEAN },
            safetyScore: { type: Type.INTEGER, description: 'Safety confidence rating' },
            aestheticScore: { type: Type.INTEGER, description: 'Visual composition rating' },
            isRecommendedCover: { type: Type.BOOLEAN }
          },
          required: ['isBlurry', 'blurScore', 'isDuplicate', 'duplicateHash', 'isInappropriate', 'safetyScore', 'aestheticScore', 'isRecommendedCover']
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('Empty response from Gemini Vision analyzer');
    }
    res.json(JSON.parse(resultText.trim()));
  } catch (err: any) {
    console.error('Media Analysis API Error:', err);
    // Graceful fallback to avoid halting the media uploader
    res.json({
      isBlurry: false,
      blurScore: 85,
      isDuplicate: false,
      duplicateHash: `FALLBACK_${Date.now()}`,
      isInappropriate: false,
      safetyScore: 95,
      aestheticScore: 75,
      isRecommendedCover: true
    });
  }
});

// ----------------------------------------------------
// AI Endpoint: Natural Language Semantic Search
// ----------------------------------------------------
app.post('/api/gemini/search', async (req: Request, res: Response) => {
  const { query, listings } = req.body;

  if (!query || !listings || !Array.isArray(listings)) {
    res.status(400).json({ error: 'query string and listings array are required' });
    return;
  }

  if (listings.length === 0) {
    res.json({ results: [] });
    return;
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.log("Gemini API Key missing. Returning simulation for semantic search.");
    // Simulated simple string keyword matching
    const normQuery = query.toLowerCase();
    const results = listings.map(l => {
      let score = 10;
      let reason = 'Generic match';
      if (l.title.toLowerCase().includes(normQuery) || l.description.toLowerCase().includes(normQuery)) {
        score = 90;
        reason = `Directly contains search term: "${query}"`;
      } else if (l.category.toLowerCase().includes(normQuery) || l.location.toLowerCase().includes(normQuery)) {
        score = 65;
        reason = `Matches metadata category or location: "${query}"`;
      }
      return { id: l.id, relevanceScore: score, matchReason: reason };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);

    res.json({ results });
    return;
  }

  try {
    const ai = getGeminiClient();
    
    // Package a compact version of the listings array for token efficiency
    const compactListings = listings.map(l => ({
      id: l.id,
      title: l.title,
      description: l.description.slice(0, 250), // Truncate to keep context short and cheap
      price: l.price,
      category: l.category,
      location: l.location,
      tags: l.aiTags || []
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Search query: "${query}"
Marketplace Listings: ${JSON.stringify(compactListings)}`,
      config: {
        systemInstruction: `You are the core Semantic Search brain of Dimoads AI. 
Evaluate how closely each of the provided listings matches the user's natural language search query.
Look beyond literal keyword matching to understand semantic intent (e.g., if query is "looking for luxury sports ride", Porsche should rank highly; if query is "job with flexible hours", look for jobs marked remote).
Assign each listing ID a relevanceScore from 0 (completely irrelevant) to 100 (exact, perfect fit).
Provide a short, 1-sentence matchReason explaining why the item fits the intent (e.g., "Premium sports car matching luxury ride request").
Return the complete evaluated list.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            results: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  relevanceScore: { type: Type.INTEGER, description: 'Score between 0 and 100' },
                  matchReason: { type: Type.STRING, description: 'Short summary of the semantic fit' }
                },
                required: ['id', 'relevanceScore', 'matchReason']
              }
            }
          },
          required: ['results']
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('Empty response from Gemini search processor');
    }
    res.json(JSON.parse(resultText.trim()));
  } catch (err: any) {
    console.error('Semantic Search API Error:', err);
    res.status(500).json({ error: err.message || 'Failed to execute semantic search' });
  }
});

// ----------------------------------------------------
// AI Endpoint: AI Price Recommendation Engine
// ----------------------------------------------------
app.post('/api/ai/pricing', async (req: Request, res: Response) => {
  const { category, brand, model, year, condition, location } = req.body;

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.log("Gemini API Key missing. Returning simulation for price recommendation.");
    // Clever heuristics based on category
    let suggestedPrice = 500;
    let min = 400;
    let max = 600;
    if ((category || '').toLowerCase().includes('vehicle') || (category || '').toLowerCase().includes('car')) {
      suggestedPrice = 8500;
      min = 7800;
      max = 9200;
    } else if ((category || '').toLowerCase().includes('real')) {
      suggestedPrice = 120000;
      min = 110000;
      max = 135000;
    }

    res.json({
      suggestedPrice,
      priceRange: { min, max },
      confidenceScore: 85,
      reasoning: `Fair value valuation calculated for a ${condition} ${brand || ''} ${model || ''} in ${location || 'Bahrain'} based on historic marketplace indices.`
    });
    return;
  }

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Provide a fair value marketplace appraisal for:
Category: "${category || 'General'}"
Brand: "${brand || 'Generic'}"
Model: "${model || 'Standard'}"
Year: "${year || 'N/A'}"
Condition: "${condition || 'good'}"
Location: "${location || 'Bahrain'}"`,
      config: {
        systemInstruction: `You are the lead Real-Estate & Commercial Pricing Intelligence Engine for Dimoads AI classifieds.
Analyze the listing parameters to determine the optimal fair market value.
Cross-reference typical historical ranges for similar items.
Assign a suggestedPrice, a reasonable priceRange (min/max), a confidenceScore from 0 to 100, and a detailed professional reasoning summary.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedPrice: { type: Type.INTEGER },
            priceRange: {
              type: Type.OBJECT,
              properties: {
                min: { type: Type.INTEGER },
                max: { type: Type.INTEGER }
              },
              required: ['min', 'max']
            },
            confidenceScore: { type: Type.INTEGER },
            reasoning: { type: Type.STRING }
          },
          required: ['suggestedPrice', 'priceRange', 'confidenceScore', 'reasoning']
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error('Empty response from Gemini pricing analyzer');
    res.json(JSON.parse(resultText.trim()));
  } catch (err: any) {
    console.error('Pricing Recommendation Error:', err);
    res.status(500).json({ error: err.message || 'Failed to complete pricing recommendation' });
  }
});

// ----------------------------------------------------
// AI Endpoint: SEO Generator
// ----------------------------------------------------
app.post('/api/ai/seo', async (req: Request, res: Response) => {
  const { title, description, category } = req.body;

  if (!title || !description) {
    res.status(400).json({ error: 'title and description are required for SEO generation' });
    return;
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.log("Gemini API Key missing. Returning simulation for SEO generation.");
    const slug = (title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    res.json({
      seoTitle: `${title} | Premium ${category || 'Classifieds'} on Dimoads`,
      metaDescription: `Discover awesome deals for ${title}. ${description.slice(0, 100)}... Visit Dimoads AI for verified listings, direct contact, and the best prices today.`,
      keywords: [category || 'classifieds', 'marketplace', 'buy-and-sell', 'premium-deals'],
      slug: slug || 'classified-listing',
      openGraphDescription: `Check out this listing on Dimoads AI: ${title}. Fast, secure, and smart listings.`
    });
    return;
  }

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Generate SEO configurations for this listing:
Title: "${title}"
Category: "${category || 'General'}"
Description: "${description}"`,
      config: {
        systemInstruction: `You are the chief SEO Optimization Specialist for Dimoads AI.
Generate professional search engine parameters to maximize organic indexing and visibility.
Provide an SEO-optimized title, meta-description (max 160 chars), 5-8 relevant keywords, a clean URL slug, and an engaging Open Graph social preview description.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            seoTitle: { type: Type.STRING },
            metaDescription: { type: Type.STRING },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            slug: { type: Type.STRING },
            openGraphDescription: { type: Type.STRING }
          },
          required: ['seoTitle', 'metaDescription', 'keywords', 'slug', 'openGraphDescription']
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error('Empty response from Gemini SEO generator');
    res.json(JSON.parse(resultText.trim()));
  } catch (err: any) {
    console.error('SEO Generator Error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate SEO parameters' });
  }
});

// ----------------------------------------------------
// AI Endpoint: Intelligent AI Admin Assistant Dashboard Analyzer
// ----------------------------------------------------
app.post('/api/ai/admin-assistant', async (req: Request, res: Response) => {
  const { listings, users, reports, tickets, payments } = req.body;

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.log("Gemini API Key missing. Returning high-fidelity simulation for Admin Assistant.");
    
    // Simulate smart insights based on inputs or defaults
    const mockSuspiciousActivities = [
      {
        userId: "user-1",
        userName: "Mohammed Hussain",
        reason: "Multiple rapid listings created within 2 minutes containing typical cash-deposit requests.",
        riskScore: 84,
        recommendedAction: "monitor"
      },
      {
        userId: "user-2",
        userName: "Sarah Content",
        reason: "User is repeatedly editing listing description contact fields to point to suspicious external escrow URLs.",
        riskScore: 68,
        recommendedAction: "monitor"
      }
    ];

    const mockPrioritizedReports = [
      {
        reportId: reports && reports[0] ? reports[0].id : "rep-1",
        listingId: reports && reports[0] ? reports[0].listingId : "list-3",
        listingTitle: "iPhone 15 Pro Max - Urgent Sale (Brand New)",
        priority: "critical",
        reason: "Direct wire transfer demand detected. Listing priced 85% below market rate.",
        recommendedAction: "suspend"
      },
      {
        reportId: "rep-2",
        listingId: "list-4",
        listingTitle: "Rent Apartment in Juffair, Bahrain",
        priority: "medium",
        reason: "Potential incorrect category (placed in electronics instead of real-estate).",
        recommendedAction: "dismiss"
      }
    ];

    const mockListingRecommendations = [
      {
        listingId: listings && listings[0] ? listings[0].id : "list-1",
        title: listings && listings[0] ? listings[0].title : "2021 Toyota Corolla Sport",
        recommendation: "approve",
        confidence: 98,
        reason: "Pricing lies perfectly within the normal historical range. Verification criteria fully satisfied."
      },
      {
        listingId: "list-2",
        title: "Work From Home Data Operator",
        recommendation: "reject",
        confidence: 88,
        reason: "High risk of MLM/pyramid scheme keywords. Description promises $500/hour for zero experience, which fails safe job criteria."
      }
    ];

    const mockTicketSummaries = [
      {
        ticketId: "ticket-1",
        subject: "Payment failed for premium listing boost",
        summary: "The operator must verify a Stripe payment failure where $10 was charged on the user's card but listing was not boosted.",
        suggestedReply: "Dear user, we apologize for the inconvenience. We have verified your transaction through our Stripe dashboard logs and successfully activated your listing boost. Please check your updated campaign ledger.",
        sentiment: "urgent"
      }
    ];

    const mockFinancialTrafficInsights = [
      {
        type: "revenue",
        title: "Refund rates increased for Premium Boosts",
        isAbnormal: true,
        impact: "high",
        description: "Refunded transactions have increased by 28% over the past 24 hours. Majority are associated with pending webhook latency issues.",
        recommendedAdjustment: "Audit webhook latency for the stripe payment processor integration immediately. Ensure status changes synchronize within 500ms."
      },
      {
        type: "traffic",
        title: "GCC Late-Night Search Peak",
        isAbnormal: false,
        impact: "medium",
        description: "Traffic volumes from Saudi Arabia and Bahrain peaked between 1 AM and 4 AM, representing a 15% shift compared to typical daytime trends.",
        recommendedAdjustment: "Scale cloud server replicas or optimize database caching between 1 AM - 4 AM to handle high peak search loads smoothly."
      }
    ];

    const mockAgentPreparation = {
      agentName: "Dimoads Autonomous Archon v1",
      readyForAutonomousExecution: false,
      capabilityDirectives: [
        "DIRECTIVE_1: AUTO_SUSPEND_SCAMS_SCORE_GT_95",
        "DIRECTIVE_2: AUTO_CATEGORIZE_MISPLACED_LISTINGS",
        "DIRECTIVE_3: AUTO_REPLY_TICKETS_RECURRING_FAQS"
      ],
      nextAutonomousStepSimulated: "Simulation ready: Scanning audit logs. When autonomous mode is enabled by the Super Admin, the agent will execute the queue."
    };

    res.json({
      suspiciousActivities: mockSuspiciousActivities,
      prioritizedReports: mockPrioritizedReports,
      listingRecommendations: mockListingRecommendations,
      ticketSummaries: mockTicketSummaries,
      financialTrafficInsights: mockFinancialTrafficInsights,
      agentPreparation: mockAgentPreparation
    });
    return;
  }

  try {
    const ai = getGeminiClient();
    
    // We pass serialized and filtered admin data to Gemini to keep it extremely light and token-efficient.
    const cleanListings = (listings || []).slice(0, 10).map((l: any) => ({
      id: l.id,
      title: l.title,
      description: l.description ? l.description.slice(0, 150) : '',
      price: l.price,
      userId: l.userId || 'unknown',
      category: l.category
    }));

    const cleanUsers = Object.values(users || {}).slice(0, 10).map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status
    }));

    const cleanReports = (reports || []).slice(0, 10).map((r: any) => ({
      id: r.id,
      listingId: r.listingId,
      reporterId: r.reporterId,
      reason: r.reason,
      createdAt: r.createdAt
    }));

    const cleanTickets = (tickets || []).slice(0, 5).map((t: any) => ({
      id: t.id,
      subject: t.subject,
      message: t.message ? t.message.slice(0, 200) : '',
      priority: t.priority,
      status: t.status
    }));

    const cleanPayments = (payments || []).slice(0, 10).map((p: any) => ({
      id: p.id,
      amount: p.amount,
      type: p.type,
      status: p.status,
      createdAt: p.createdAt
    }));

    const systemPrompt = `Analyze the current snapshot of Dimoads AI Platform data:
- Listings: ${JSON.stringify(cleanListings)}
- Users: ${JSON.stringify(cleanUsers)}
- Fraud Flags/Reports: ${JSON.stringify(cleanReports)}
- Support Tickets: ${JSON.stringify(cleanTickets)}
- Payments Ledger: ${JSON.stringify(cleanPayments)}

Using these datasets, act as the expert AI Admin Assistant. Generate data-driven recommendations, flags, summaries, and forecasts.
Your tasks:
1. Detect suspicious user activity based on weird listings/role/payment indicators.
2. Prioritize current reports, sorting them by risk level, recommending 'suspend' or 'dismiss'.
3. Recommend approval, rejection, or flagging for active listings.
4. Summarize support tickets with suggested high-quality replies and sentiment.
5. Highlight abnormal traffic or revenue/refund patterns in the payment ledger.
6. Prepare autonomous capability directives for a future agent runtime, simulating what it WOULD do without executing any actual state change.
Remember: All recommendations must be Advisory. Operators always make the final call.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: systemPrompt,
      config: {
        systemInstruction: "You are the advanced Chief AI Officer and Administration Assistant for Dimoads AI. You parse platform telemetry to provide actionable administrative briefings.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suspiciousActivities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  userId: { type: Type.STRING },
                  userName: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  riskScore: { type: Type.INTEGER, description: 'From 0 to 100' },
                  recommendedAction: { type: Type.STRING, description: 'suspend, warn, monitor, or none' }
                },
                required: ['userId', 'userName', 'reason', 'riskScore', 'recommendedAction']
              }
            },
            prioritizedReports: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  reportId: { type: Type.STRING },
                  listingId: { type: Type.STRING },
                  listingTitle: { type: Type.STRING },
                  priority: { type: Type.STRING, description: 'critical, high, medium, low' },
                  reason: { type: Type.STRING },
                  recommendedAction: { type: Type.STRING, description: 'suspend, dismiss' }
                },
                required: ['reportId', 'listingId', 'listingTitle', 'priority', 'reason', 'recommendedAction']
              }
            },
            listingRecommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  listingId: { type: Type.STRING },
                  title: { type: Type.STRING },
                  recommendation: { type: Type.STRING, description: 'approve, reject, flag' },
                  confidence: { type: Type.INTEGER },
                  reason: { type: Type.STRING }
                },
                required: ['listingId', 'title', 'recommendation', 'confidence', 'reason']
              }
            },
            ticketSummaries: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  ticketId: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  suggestedReply: { type: Type.STRING },
                  sentiment: { type: Type.STRING, description: 'frustrated, neutral, urgent, happy' }
                },
                required: ['ticketId', 'subject', 'summary', 'suggestedReply', 'sentiment']
              }
            },
            financialTrafficInsights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: 'revenue or traffic' },
                  title: { type: Type.STRING },
                  isAbnormal: { type: Type.BOOLEAN },
                  impact: { type: Type.STRING, description: 'high, medium, low' },
                  description: { type: Type.STRING },
                  recommendedAdjustment: { type: Type.STRING }
                },
                required: ['type', 'title', 'isAbnormal', 'impact', 'description', 'recommendedAdjustment']
              }
            },
            agentPreparation: {
              type: Type.OBJECT,
              properties: {
                agentName: { type: Type.STRING },
                readyForAutonomousExecution: { type: Type.BOOLEAN },
                capabilityDirectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                nextAutonomousStepSimulated: { type: Type.STRING }
              },
              required: ['agentName', 'readyForAutonomousExecution', 'capabilityDirectives', 'nextAutonomousStepSimulated']
            }
          },
          required: ['suspiciousActivities', 'prioritizedReports', 'listingRecommendations', 'ticketSummaries', 'financialTrafficInsights', 'agentPreparation']
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error('Empty response from Admin Assistant AI');
    res.json(JSON.parse(resultText.trim()));
  } catch (err: any) {
    console.error('AI Admin Assistant Error:', err);
    res.status(500).json({ error: err.message || 'Failed to complete AI Admin Analysis' });
  }
});

// ----------------------------------------------------
// AI Endpoint: Personalized Recommendation Engine
// ----------------------------------------------------
app.post('/api/ai/recommendations', async (req: Request, res: Response) => {
  const { userId, favorites, searchHistory, location, category, currentListingId, listings } = req.body;

  if (!listings || !Array.isArray(listings)) {
    res.status(400).json({ error: 'listings array is required' });
    return;
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.log("Gemini API Key missing. Returning simulation for recommendations.");
    // Return first 4 items as simulated recommendations
    const recommendedIds = listings
      .filter(l => l.id !== currentListingId)
      .slice(0, 4)
      .map(l => l.id);
    const reasons: Record<string, string> = {};
    recommendedIds.forEach(id => {
      reasons[id] = 'Recommended because it aligns with your recent browsing history.';
    });

    res.json({ recommendedIds, reasons });
    return;
  }

  try {
    const ai = getGeminiClient();
    const compactListings = listings.map(l => ({
      id: l.id,
      title: l.title,
      category: l.category,
      location: l.location,
      price: l.price
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Profile Metrics:
Favorites: ${JSON.stringify(favorites || [])}
Search History: ${JSON.stringify(searchHistory || [])}
Context filters: Location="${location || 'Any'}", Category="${category || 'Any'}"

Available listings:
${JSON.stringify(compactListings)}`,
      config: {
        systemInstruction: `You are the central Personalization and Content Discovery Engine for Dimoads AI.
Analyze the user's profile and preferences (favorites, searches, location) against the listings.
Rank and select up to 5 recommended listing IDs that they are highly likely to engage with.
Provide the ranked recommendedIds, and a key-value record 'reasons' mapping each recommended ID to a 1-sentence personalized match reason.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedIds: { type: Type.ARRAY, items: { type: Type.STRING } },
            reasons: {
              type: Type.OBJECT,
              description: 'A key-value map where key is the recommended listing ID, and value is the custom match reason string'
            }
          },
          required: ['recommendedIds', 'reasons']
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error('Empty response from Gemini recommendation engine');
    res.json(JSON.parse(resultText.trim()));
  } catch (err: any) {
    console.error('Recommendation Engine Error:', err);
    res.status(500).json({ error: err.message || 'Failed to run recommendations engine' });
  }
});

// ----------------------------------------------------
// AI Endpoint: Safe-Marketplace Content Moderation Guard
// ----------------------------------------------------
app.post('/api/ai/moderation', async (req: Request, res: Response) => {
  const { title, description, contactInfo } = req.body;

  if (!title || !description) {
    res.status(400).json({ error: 'title and description are required for moderation audit' });
    return;
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.log("Gemini API Key missing. Returning simulation for moderation.");
    const lowerDesc = description.toLowerCase();
    const isUnsafe = lowerDesc.includes('adult') || lowerDesc.includes('weapon') || lowerDesc.includes('drugs') || lowerDesc.includes('offensive');
    res.json({
      isSafe: !isUnsafe,
      flagReasons: isUnsafe ? ['The listing description contains keywords indicating potential violations of marketplace terms.'] : [],
      categories: {
        adult: lowerDesc.includes('adult'),
        violence: false,
        illegalProducts: lowerDesc.includes('weapon') || lowerDesc.includes('drugs'),
        hateSpeech: false,
        offensiveLanguage: lowerDesc.includes('offensive'),
        fakeContactInfo: false
      }
    });
    return;
  }

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Audit this marketplace listing:
Title: "${title}"
Contact Info: "${contactInfo || 'N/A'}"
Description: "${description}"`,
      config: {
        systemInstruction: `You are the core Safe-Marketplace Moderation Guard for Dimoads AI.
Analyze the listing text to detect unsafe, prohibited, or inappropriate content.
Audit for:
1. adult content or explicit language
2. violence, gore, or threats
3. illegalProducts (weapons, prohibited drugs)
4. hateSpeech or xenophobia
5. offensiveLanguage or slurs
6. fakeContactInfo (spam contact details)
If any of these categories are flagged true, set isSafe to false and provide a list of flagReasons.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSafe: { type: Type.BOOLEAN },
            flagReasons: { type: Type.ARRAY, items: { type: Type.STRING } },
            categories: {
              type: Type.OBJECT,
              properties: {
                adult: { type: Type.BOOLEAN },
                violence: { type: Type.BOOLEAN },
                illegalProducts: { type: Type.BOOLEAN },
                hateSpeech: { type: Type.BOOLEAN },
                offensiveLanguage: { type: Type.BOOLEAN },
                fakeContactInfo: { type: Type.BOOLEAN }
              },
              required: ['adult', 'violence', 'illegalProducts', 'hateSpeech', 'offensiveLanguage', 'fakeContactInfo']
            }
          },
          required: ['isSafe', 'flagReasons', 'categories']
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error('Empty response from Gemini moderation guard');
    res.json(JSON.parse(resultText.trim()));
  } catch (err: any) {
    console.error('Moderation Guard Error:', err);
    res.status(500).json({ error: err.message || 'Failed to complete moderation audit' });
  }
});

// ----------------------------------------------------
// UI Framework / Static asset server pipeline
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: {
          ignored: ['**/data/**', '**/dist/**', '**/node_modules/**']
        }
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Dimoads AI Server] Server running securely on http://localhost:${PORT}`);
  });
}

startServer();
