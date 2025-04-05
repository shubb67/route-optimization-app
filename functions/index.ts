import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

const pdfParse = require('pdf-parse');

admin.initializeApp(); // ✅ outside is okay
const db = admin.firestore(); // ✅ safe

export const extractRoutesFromPDF = functions
  .region('us-central1')
  .storage.object()
  .onFinalize(async (object) => {
    const bucket = admin.storage().bucket(object.bucket);
    const filePath = object.name!;
    const fileName = path.basename(filePath);
    const tempFilePath = path.join(os.tmpdir(), fileName);

    if (!filePath.endsWith('.pdf')) {
      console.log('❌ Not a PDF, skipping:', filePath);
      return null;
    }

    console.log(`📥 Downloading PDF: ${filePath}`);
    await bucket.file(filePath).download({ destination: tempFilePath });
    const buffer = fs.readFileSync(tempFilePath);
    const data = await pdfParse(buffer);
    const text = data.text;

    console.log('📄 PDF text extracted');

    const routeSections = text.split(/(?=LETH\d{4}Route\s+-\s+LETH\d{4}\s+Total number of packages\s*:\s*\d+)/g);


    console.log(`🔍 Found ${routeSections.length} route section(s)`);

    const routeMap: {
      [routeId: string]: { totalPackages: number; content: string[] };
    } = {};

    for (const section of routeSections) {
      console.log('🧩 Processing chunk:', section.slice(0, 200).replace(/\n/g, ' '));

      const headerMatch = section.match(/(LETH\d{4})Route\s+-\s+\1\s+Total number of packages\s*:\s*(\d+)/);

      if (!headerMatch) {
        console.log('⚠️ Still no match in chunk:\n', section.slice(0, 500).replace(/\n/g, ' '));
        continue;
      }

      const routeId = headerMatch[1];
      const totalPackages = parseInt(headerMatch[2]);
      const body = section.replace(headerMatch[0], '').trim();

      console.log(`✅ Matched routeId: ${routeId}, packages: ${totalPackages}`);
      console.log('🧩 Processing route:', routeId, '📦', totalPackages, 'stops');

      if (!routeMap[routeId]) {
        routeMap[routeId] = { totalPackages, content: [] };
      }

      routeMap[routeId].content.push(body);
    }

    for (const [routeId, { totalPackages, content }] of Object.entries(routeMap)) {
      const fullText = content.join('\n');

      const addressBlocks = fullText.split(/\n(?=\d+\s)/).map((block) => {
        const lines = block.trim().split('\n');
        return {
          sequence: parseInt(lines[0]) || 0,
          address: lines[1] || '',
          dimension: lines.find((l) => l.includes('CM') || l.includes('IN')) || '',
          barcode: lines.find((l) => l.startsWith('D')) || '',
          orderNumber: lines.find((l) => /^[A-Z0-9]{5,}/.test(l) && !l.startsWith('D')) || '',
        };
      });

      console.log(`🔥 Writing route ${routeId} with ${addressBlocks.length} addresses to Firestore`);

      await db.collection('extractedRoutes').add({
        routeId,
        totalPackages,
        addresses: addressBlocks,
        uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    console.log('✅ All routes saved successfully!');
    return null;
  });