import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Storage } from "@google-cloud/storage";
import { readFileSync, unlinkSync } from "fs";
import * as os from "os";
import * as path from "path";
import OpenAI from "openai";

const pdf = require("pdf-parse");
admin.initializeApp();
const firestore = admin.firestore();
const storage = new Storage();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure your key is set in environment variables
});

export const processRoutePdf = functions
  .region("us-central1")
  .runWith({ timeoutSeconds: 300, memory: "1GB" })
  .storage.object()
  .onFinalize(async (object) => {
    const filePath = object.name || "";
    const bucketName = object.bucket;
    const bucket = storage.bucket(bucketName);

    functions.logger.info(`Downloaded file: ${filePath}`);

    // Download the file
    const tempFilePath = path.join(os.tmpdir(), path.basename(filePath));
    await bucket.file(filePath).download({ destination: tempFilePath });

    const dataBuffer = readFileSync(tempFilePath);
    const pdfData = await pdf(dataBuffer);
    const rawText = pdfData.text;

    // Clean the text
    const cleanedText = rawText
      .split("\n")
      .filter((line: string) =>
          !line.includes("Intelcom Courrier Projet Amazon") &&
          !line.toLowerCase().includes("code") &&
          !line.toLowerCase().includes("dimensions")
      )
      .join("\n");

    // Extract route name and package count
    const routeMatch = cleanedText.match(/([A-Z]{4}\d{4})/);
    const packageMatch = cleanedText.match(/Total number of packages\s*:\s*(\d+)/i);
    const routeName = routeMatch ? routeMatch[1] : "UnknownRoute";
    const numPackages = packageMatch ? parseInt(packageMatch[1]) : 0;

    // Use GPT to parse the cleaned delivery entries
    const prompt = `
Extract all delivery entries from this route sheet. For each delivery, return a JSON object with these fields:

- sequence (number)
- address (cleaned full address including unit, city, postal code, etc.)

Do not include barcode, dimensions, or signature. Only return an array of objects.

Text:
\`\`\`
${cleanedText}
\`\`\`
`;

const completion = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: prompt }],
  temperature: 0.2,
});

const responseText = completion.choices[0]?.message?.content || "";

    let deliveries: any[] = [];

    try {
      // Strip markdown wrapper if exists
      const jsonStart = responseText.indexOf("[");
      const jsonEnd = responseText.lastIndexOf("]");
      const jsonString = responseText.slice(jsonStart, jsonEnd + 1);

      deliveries = JSON.parse(jsonString);
    } catch (err) {
      functions.logger.error("Failed to parse GPT response as JSON", {
        raw: responseText,
        error: err,
      });
      unlinkSync(tempFilePath);
      return;
    }
    functions.logger.info("Saving to Firestore...");
    // Save to Firestore
    const routeId = path.basename(filePath, path.extname(filePath));
    const docRef = firestore.collection("routes").doc(routeId);

    await docRef.set({
      routeName,
      numPackages,
      timestamp: admin.firestore.Timestamp.now(),
      deliveries,
    });

    functions.logger.info(
      `Route ${routeName} data saved to Firestore with ${deliveries.length} deliveries.`
    );

    unlinkSync(tempFilePath);
  });
