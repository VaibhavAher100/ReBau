<div align="center">
<img src="./public/logo.jpeg" alt="ReBau logo" width="380"/>

**AI marketplace for reclaimed construction materials**

Scan it. Price it. Sell it. Half the cost, a fraction of the carbon.

Built by Team Toronto at the AI Hackathon 2026 (Sustainability & Energy track)<br/>
Powered by AI Innovation at FAU Erlangen-Nürnberg

</div>

## What it does

ReBau connects construction sites that have surplus or salvaged material with projects that need it.

- A site manager photographs a pile of leftover material on their phone. A vision LLM identifies what's in it, grades the condition (A/B/C), estimates the quantity, and prices it at roughly half the new price. One tap publishes it to the marketplace.
- Buyers browse the marketplace, or upload a building plan / bill of materials. The tool extracts the required materials, matches them against available used inventory, and shows per line what they save in euros and in kg CO2 compared to buying new.
- Sellers earn resale revenue and avoid disposal costs (EUR 30-80/t). Buyers cut material costs and get auditable scope 3 carbon numbers for ESG reporting. ReBau takes a commission per transaction.

## How it works

The whole thing is a single-page web app: React 19, TypeScript, Vite, Tailwind CSS. There is no backend in the MVP. AI calls go straight from the browser to the xAI API, and state lives in localStorage. One responsive codebase covers both roles: the phone viewport works as the seller's scanning app, the desktop viewport as the buyer's marketplace.

| Piece | What it does |
|---|---|
| `services/grokService.ts` | Talks to Grok's vision model via the OpenAI-compatible endpoint. `analyzeMaterialImage` turns a photo into a JSON array of detected materials with condition, reusability score, quantity, value, and bounding boxes. `analyzeBlueprint` turns a blueprint image or pasted BOM into a structured list of required materials. Both fall back to realistic mock data when no API key is set. |
| `services/sustainability.ts` | Pricing and carbon math. Condition grades map to discounts (New/Good 50% of new price, Fair 35%, Poor 20%, Scrap 10%). CO2 savings use published embodied-carbon factors per category in kg CO2e/kg (steel 1.9, brick 0.24, concrete 0.13; timber stores carbon) plus a weight heuristic parsed from each item's quantity string. |
| `components/Scanner.tsx` | Camera flow: capture, analyze, bounding-box overlays, inline editing, save to inventory. |
| `components/BlueprintMatch.tsx` | Matches extracted requirements against published listings by name or category and renders a proposal table with used price, estimated new price, euros saved, and kg CO2 saved per line. |
| `App.tsx` | Global state, four tabs (Scan, Inventory, Marketplace, Blueprint Match), localStorage persistence, running savings widget. |

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Real AI calls need an xAI key in `.env`:

```
VITE_XAI_API_KEY=your-key-here
VITE_XAI_MODEL=grok-2-vision-1212
```

Without a key the app runs in mock mode: all flows work with canned AI responses, so you can try it immediately.

## Team Toronto

| Member | Contribution |
|---|---|
| _to be added_ | |

## Credits

Built on top of [BauBay](https://github.com/HaarisIqubal/BauBay). Material photos via Unsplash. FAU logo via Wikimedia Commons.

## License

[MIT](./LICENSE)
