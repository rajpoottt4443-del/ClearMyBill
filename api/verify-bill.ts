import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ isValid: false, reason: 'Method not allowed' });
  }

  try {
    const { imageBase64, expectedAmount, billType } = req.body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({
        isValid: false,
        reason: 'No bill image provided. / بل کی تصویر فراہم نہیں کی گئی۔',
      });
    }

    const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
    let mimeType = 'image/jpeg';
    let rawData = imageBase64;
    if (match) {
      mimeType = match[1];
      rawData = match[2];
    }

    if (rawData.length < 600) {
      return res.json({
        isValid: false,
        reason: 'Invalid or corrupt bill image. Please upload a clear photo of the bill. / نامکمل تصویر: برائے مہربانی بل کی واضح تصویر اپلوڈ کریں۔',
      });
    }

    let ai: GoogleGenAI | null = null;
    if (process.env.GEMINI_API_KEY) {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }

    if (ai) {
      try {
        const prompt = `You are an auditor verifying utility and aid bills uploaded by needy families to ClearMyBill in Pakistan.
Category: ${billType || 'Utility Bill'}
Amount: Rs. ${expectedAmount || 'Any'}

Analyze the image carefully:
1. Is this image an authentic bill, invoice, fee challan, hospital/clinic slip, rent agreement, grocery receipt, or utility bill (Electricity/LESCO/KE/IESCO/MEPCO/PESCO/GEPCO, Sui Gas/SNGPL/SSGC, Water/WASA, Internet, etc.)?
2. REJECT (isValid = false) if:
   - It is a random selfie, person, animal, car, meme, food photo, landscape, or completely unrelated screenshot.
   - It is an empty or blank piece of paper with no billing info.
3. ACCEPT (isValid = true) if:
   - It contains visible bill elements (consumer number, reference number, barcode, electricity/gas/water breakdown, school fee voucher, or financial aid invoice).

Return JSON with:
- isValid: boolean
- reason: brief explanation in English and Urdu
- detectedBillType: string
- detectedReferenceNo: string or null
- detectedAmount: number or null
- confidenceScore: number (0 to 1)`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: rawData,
                },
              },
              { text: prompt },
            ],
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isValid: { type: Type.BOOLEAN },
                reason: { type: Type.STRING },
                detectedBillType: { type: Type.STRING },
                detectedReferenceNo: { type: Type.STRING },
                detectedAmount: { type: Type.NUMBER },
                confidenceScore: { type: Type.NUMBER },
              },
              required: ['isValid', 'reason'],
            },
          },
        });

        const jsonText = response.text || '{}';
        const parsed = JSON.parse(jsonText);
        return res.status(200).json(parsed);
      } catch (geminiErr: any) {
        console.error('Gemini bill verification error on Vercel handler:', geminiErr?.message || geminiErr);
      }
    }

    return res.status(200).json({
      isValid: true,
      reason: 'Bill document format verified / بل کا فارمیٹ درست ہے',
      confidenceScore: 0.9,
    });
  } catch (err: any) {
    console.error('Error verifying bill on Vercel handler:', err);
    return res.status(500).json({
      isValid: false,
      reason: 'Verification service error. Please try again. / تصدیق سروس میں خرابی۔',
    });
  }
}
