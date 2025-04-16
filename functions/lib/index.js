"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRoutePdf = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const openai_1 = __importDefault(require("openai"));
const pdfParse = require('pdf-parse');
admin.initializeApp();
const db = admin.firestore();
const OPENAI_API_KEY = functions.config().openai.key;
const openai = new openai_1.default({ apiKey: OPENAI_API_KEY });
exports.processRoutePdf = functions.storage.object().onFinalize(async (object) => {
    var _a, _b;
    const filePath = object.name;
    const contentType = object.contentType;
    if (!filePath || !(contentType === null || contentType === void 0 ? void 0 : contentType.includes('pdf'))) {
        functions.logger.log('Skipping non-PDF file or missing path.');
        return;
    }
    const bucket = admin.storage().bucket(object.bucket);
    const [fileBuffer] = await bucket.file(filePath).download();
    functions.logger.log(`Downloaded file: ${filePath}`);
    const pdfData = await pdfParse(fileBuffer);
    const text = pdfData.text;
    // Extract route info
    const routeMatch = text.match(/Route\s*-\s*([A-Z0-9]+)\s*Total number of packages\s*:\s*(\d+)/);
    if (!routeMatch) {
        functions.logger.error('Route info not found in PDF.');
        return;
    }
    const routeCode = routeMatch[1];
    const packageCount = parseInt(routeMatch[2], 10);
    // Prepare prompt for GPT
    const prompt = `
You are a delivery manifest parser. From the following PDF text, extract ONLY delivery entries in JSON format.

Each delivery should include:
- "sequence": number
- "address": string (ending in "CA")

Ignore:
- Headers like "Intelcom Courrier", "Code Tracking ID"
- Any text before or after the list
- Dimensions (like "15.5 IN X 11.5 IN")
- Duplicates are okay

Return JSON array:
[
  { "sequence": 1, "address": "..." },
  ...
]

Text:
"""
${text}
"""
`;
    // Call OpenAI (GPT-3.5 Turbo)
    const gptResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: 'You are a PDF manifest delivery extractor.' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.2,
    });
    const rawGptOutput = ((_b = (_a = gptResponse.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '[]';
    // Remove markdown-style triple backticks and any label like ```json
    const cleanGptOutput = rawGptOutput
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
    let deliveries;
    try {
        deliveries = JSON.parse(cleanGptOutput);
    }
    catch (err) {
        functions.logger.error('Failed to parse GPT response as JSON.', err, {
            raw: rawGptOutput,
            clean: cleanGptOutput
        });
        return;
    }
    functions.logger.log(`Parsed ${deliveries.length} deliveries from GPT for route ${routeCode}`);
    // Save to Firestore
    const routeData = {
        route: routeCode,
        packageCount,
        deliveries
    };
    await db.collection('routes').doc(routeCode).set(routeData);
    functions.logger.log(`Route ${routeCode} saved to Firestore.`);
});
//# sourceMappingURL=index.js.map