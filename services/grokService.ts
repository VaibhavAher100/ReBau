
import { AnalysisResult, Condition, MaterialCategory } from '../types';

const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';

const MOCK_SCAN_RESULTS: AnalysisResult[] = [
  {
    name: 'Stack of Red Bricks',
    category: MaterialCategory.BRICK,
    condition: Condition.GOOD,
    reusabilityScore: 82,
    estimatedValue: 320,
    description: 'Standard clay bricks, minor mortar residue, structurally sound.',
    quantity: '200 Bricks',
    suggestedAction: 'Resell',
    box_2d: [0.1, 0.05, 0.45, 0.5]
  },
  {
    name: 'Steel Rebar Bundle',
    category: MaterialCategory.METAL,
    condition: Condition.FAIR,
    reusabilityScore: 70,
    estimatedValue: 180,
    description: 'Deformed steel rebars, surface rust but dimensionally intact.',
    quantity: '20 Bars (6m)',
    suggestedAction: 'Resell',
    box_2d: [0.5, 0.05, 0.85, 0.45]
  },
  {
    name: 'Timber Beams',
    category: MaterialCategory.WOOD,
    condition: Condition.GOOD,
    reusabilityScore: 88,
    estimatedValue: 450,
    description: 'Structural timber beams, kiln dried, minimal surface weathering.',
    quantity: '8 Units (3m)',
    suggestedAction: 'Resell',
    box_2d: [0.1, 0.55, 0.5, 0.95]
  },
  {
    name: 'Concrete Hollow Blocks',
    category: MaterialCategory.CONCRETE,
    condition: Condition.NEW,
    reusabilityScore: 100,
    estimatedValue: 210,
    description: 'Unused concrete masonry units, standard 390x190x190mm.',
    quantity: '80 Blocks',
    suggestedAction: 'Resell',
    box_2d: [0.55, 0.55, 0.9, 0.95]
  }
];

const MOCK_BLUEPRINT_RESULTS = [
  { name: 'Red Bricks', category: MaterialCategory.BRICK, quantity: '500 units' },
  { name: 'Timber Beams', category: MaterialCategory.WOOD, quantity: '12 units (4m)' },
  { name: 'Copper Pipes', category: MaterialCategory.METAL, quantity: '30 meters' }
];

const ANALYSIS_PROMPT = `
Analyze this image of construction materials.
Detect and list ALL distinct items or groups of materials visible (e.g., "Stack of Plywood", "Copper Pipes", "Bucket of Paint").
For EACH distinct item found:
1. Identify the material name and category.
2. Assess its physical condition.
3. Provide a reusability score (0-100).
4. Estimate resale value (EUR) for the visible quantity.
5. Estimate the quantity (e.g., "10 Bricks", "15m", "3 Bags", "1 Unit").
6. Provide a 2D bounding box [ymin, xmin, ymax, xmax] for the item (0-1 scale).
7. Suggest the best action.

Return ONLY a JSON array with no markdown fences. Each element must have:
name (string), category (one of: Wood, Metal, Concrete, Brick, Glass, Plastic, Electrical, Other),
condition (one of: New, Good, Fair, Poor, Scrap), reusabilityScore (number 0-100),
estimatedValue (number in EUR), description (string), quantity (string),
suggestedAction (string), box_2d (array of 4 numbers [ymin, xmin, ymax, xmax] in 0-1 scale).
`;

function stripFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
}

function validateAnalysisResults(raw: unknown[]): AnalysisResult[] {
  const validCategories = Object.values(MaterialCategory) as string[];
  const validConditions = Object.values(Condition) as string[];

  return raw
    .filter((r): r is Record<string, unknown> => typeof r === 'object' && r !== null)
    .map((r) => ({
      name: String(r.name ?? 'Unknown Material'),
      category: validCategories.includes(String(r.category))
        ? (r.category as MaterialCategory)
        : MaterialCategory.OTHER,
      condition: validConditions.includes(String(r.condition))
        ? (r.condition as Condition)
        : Condition.FAIR,
      reusabilityScore: Number(r.reusabilityScore) || 50,
      estimatedValue: Number(r.estimatedValue) || 0,
      description: String(r.description ?? ''),
      quantity: String(r.quantity ?? '1 Unit'),
      suggestedAction: String(r.suggestedAction ?? 'Assess'),
      box_2d: Array.isArray(r.box_2d) ? (r.box_2d as number[]) : undefined
    }));
}

export const analyzeMaterialImage = async (base64Image: string): Promise<AnalysisResult[]> => {
  const apiKey = import.meta.env.VITE_XAI_API_KEY;

  if (!apiKey) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return MOCK_SCAN_RESULTS;
  }

  const cleanBase64 = base64Image.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

  try {
    const response = await fetch(XAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: import.meta.env.VITE_XAI_MODEL || 'grok-2-vision-1212',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${cleanBase64}` }
              },
              { type: 'text', text: ANALYSIS_PROMPT }
            ]
          }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`xAI API error: ${response.status}`);
    }

    const data = await response.json();
    const text: string = data.choices?.[0]?.message?.content ?? '';
    if (!text) throw new Error('Empty response from xAI');

    const cleaned = stripFences(text);
    const raw = JSON.parse(cleaned) as unknown[];
    return validateAnalysisResults(raw);
  } catch (error) {
    console.error('Grok Analysis Error:', error);
    throw new Error('Failed to analyze material. Please try again.');
  }
};

export const analyzeBlueprint = async (
  imageBase64?: string,
  bomText?: string
): Promise<{ name: string; category: MaterialCategory; quantity: string }[]> => {
  const apiKey = import.meta.env.VITE_XAI_API_KEY;

  if (!apiKey) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return MOCK_BLUEPRINT_RESULTS;
  }

  const prompt = `
Extract all required construction materials from the provided blueprint image or bill of materials text.
Return ONLY a JSON array with no markdown fences. Each element must have:
name (string), category (one of: Wood, Metal, Concrete, Brick, Glass, Plastic, Electrical, Other), quantity (string, e.g. "100 units", "50m").
${bomText ? `\nBOM text:\n${bomText}` : ''}
`;

  const contentParts: unknown[] = [];
  if (imageBase64) {
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
    contentParts.push({
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${cleanBase64}` }
    });
  }
  contentParts.push({ type: 'text', text: prompt });

  try {
    const response = await fetch(XAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: import.meta.env.VITE_XAI_MODEL || 'grok-2-vision-1212',
        messages: [{ role: 'user', content: contentParts }],
        temperature: 0.1
      })
    });

    if (!response.ok) throw new Error(`xAI API error: ${response.status}`);

    const data = await response.json();
    const text: string = data.choices?.[0]?.message?.content ?? '';
    if (!text) throw new Error('Empty response');

    const raw = JSON.parse(stripFences(text)) as unknown[];
    const validCategories = Object.values(MaterialCategory) as string[];
    return raw
      .filter((r): r is Record<string, unknown> => typeof r === 'object' && r !== null)
      .map((r) => ({
        name: String(r.name ?? 'Unknown'),
        category: validCategories.includes(String(r.category))
          ? (r.category as MaterialCategory)
          : MaterialCategory.OTHER,
        quantity: String(r.quantity ?? '1 unit')
      }));
  } catch (error) {
    console.error('Blueprint analysis error:', error);
    throw new Error('Failed to analyze blueprint. Please try again.');
  }
};
