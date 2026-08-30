/**
 * Agent quality eval — run with: npm run eval-agent
 * Tests menu search + order validation (no LLM calls required).
 */

import { OrderValidationService } from "../src/services/order/order-validation.service";
import { rankMenuItems, findBestMenuMatch, MenuSearchMatch } from "../src/utils/menu-search";
import { IMenuItem } from "../src/models/menu-item.model";

const RESTAURANT_ID = process.env.DEFAULT_RESTAURANT_ID ?? "da-pakhtun-dera";

const MOCK_MENU: IMenuItem[] = [
  { name: "Chicken Nuggets", category: "Starters", price: 480, restaurantId: RESTAURANT_ID, isAvailable: true } as IMenuItem,
  { name: "Muttar Karahi Half", category: "Main Course", price: 1200, restaurantId: RESTAURANT_ID, isAvailable: true } as IMenuItem,
  { name: "Chicken Biryani", category: "Biryani", price: 650, restaurantId: RESTAURANT_ID, isAvailable: true } as IMenuItem,
  { name: "Chicken Tikka", category: "BBQ", price: 950, restaurantId: RESTAURANT_ID, isAvailable: true } as IMenuItem,
  { name: "Garlic Naan", category: "Bread", price: 130, restaurantId: RESTAURANT_ID, isAvailable: true } as IMenuItem,
];

const mockMenuRepo = {
  getAll: async () => MOCK_MENU,
  searchByName: async (_rid: string, query: string, limit = 5): Promise<MenuSearchMatch[]> =>
    rankMenuItems(query, MOCK_MENU, limit),
  findByName: async (_rid: string, query: string, min = 0.5) =>
    findBestMenuMatch(query, MOCK_MENU, min),
};

const validationService = new OrderValidationService(mockMenuRepo as never);

let passed = 0;
let failed = 0;

function pass(msg: string) {
  passed++;
  console.log(`  ✓ ${msg}`);
}

function fail(msg: string) {
  failed++;
  console.error(`  ✗ ${msg}`);
}

async function main() {
  console.log("\n=== Menu Search Eval ===\n");

  const menuCases = [
    { name: "exact dish", query: "Chicken Nuggets", expectMatch: "Chicken Nuggets", minConfidence: 0.9 },
    { name: "typo nuggests", query: "chicken nuggests", expectMatch: "Chicken Nuggets", minConfidence: 0.5 },
    { name: "partial karahi", query: "muttar karahi", expectMatch: "Muttar Karahi Half", minConfidence: 0.5 },
    { name: "urdu roman biryani", query: "chicken biryani chahiye", expectMatch: "Chicken Biryani", minConfidence: 0.5 },
    { name: "bbq item", query: "tikka", expectMatch: "Chicken Tikka", minConfidence: 0.35 },
    { name: "nonexistent item", query: "sushi platter", expectNoMatch: true },
    { name: "random food", query: "pizza margherita", expectNoMatch: true },
    { name: "naan", query: "garlic naan", expectMatch: "Garlic Naan", minConfidence: 0.5 },
    { name: "mixed case", query: "CHICKEN NUGGETS", expectMatch: "Chicken Nuggets", minConfidence: 0.9 },
    { name: "abbreviation", query: "nuggets", expectMatch: "Chicken Nuggets", minConfidence: 0.35 },
  ];

  for (const testCase of menuCases) {
    if ("expectNoMatch" in testCase && testCase.expectNoMatch) {
      const best = findBestMenuMatch(testCase.query, MOCK_MENU, 0.5);
      if (!best) pass(`${testCase.name}: correctly no match for "${testCase.query}"`);
      else fail(`${testCase.name}: expected no match but got "${best.name}"`);
      continue;
    }

    const best = rankMenuItems(testCase.query, MOCK_MENU, 1)[0];
    if (!best) {
      fail(`${testCase.name}: no matches for "${testCase.query}"`);
      continue;
    }

    if (testCase.expectMatch && best.name !== testCase.expectMatch) {
      fail(`${testCase.name}: expected "${testCase.expectMatch}" got "${best.name}"`);
      continue;
    }

    if (testCase.minConfidence && best.confidence < testCase.minConfidence) {
      fail(`${testCase.name}: confidence ${best.confidence.toFixed(2)} < ${testCase.minConfidence}`);
      continue;
    }

    pass(`${testCase.name}: "${testCase.query}" → ${best.name} (${best.confidence.toFixed(2)})`);
  }

  console.log("\n=== Order Validation Eval ===\n");

  const orderCases = [
    { name: "valid order with typo", items: [{ name: "chicken nuggests", quantity: 5 }], expectValid: true, expectPrice: 480 },
    { name: "valid karahi order", items: [{ name: "muttar karahi", quantity: 1 }], expectValid: true, expectPrice: 1200 },
    { name: "invalid item rejected", items: [{ name: "sushi", quantity: 1 }], expectValid: false },
    {
      name: "mixed valid invalid",
      items: [{ name: "Chicken Tikka", quantity: 2 }, { name: "dragon roll", quantity: 1 }],
      expectValid: false,
    },
    {
      name: "multi item order",
      items: [{ name: "Chicken Biryani", quantity: 2 }, { name: "Garlic Naan", quantity: 4 }],
      expectValid: true,
      expectTotal: 650 * 2 + 130 * 4,
    },
  ];

  for (const testCase of orderCases) {
    const result = await validationService.validate(RESTAURANT_ID, testCase.items);

    if (testCase.expectValid && !result.valid) {
      fail(`${testCase.name}: expected valid but got: ${result.errors.join(", ")}`);
      continue;
    }

    if (!testCase.expectValid && result.valid) {
      fail(`${testCase.name}: expected invalid but order was accepted`);
      continue;
    }

    if (testCase.expectValid && "expectPrice" in testCase && testCase.expectPrice) {
      if (result.resolvedItems[0]?.price !== testCase.expectPrice) {
        fail(`${testCase.name}: expected price ${testCase.expectPrice} got ${result.resolvedItems[0]?.price}`);
        continue;
      }
    }

    if (testCase.expectValid && "expectTotal" in testCase && testCase.expectTotal) {
      if (result.totalAmount !== testCase.expectTotal) {
        fail(`${testCase.name}: expected total ${testCase.expectTotal} got ${result.totalAmount}`);
        continue;
      }
    }

    pass(`${testCase.name}: ${testCase.expectValid ? `valid (Rs ${result.totalAmount})` : "rejected"}`);
  }

  console.log("\n=== Utterance Routing Hints ===\n");
  const hints = [
    { utterance: "salam", expectedTool: "agent handles greeting" },
    { utterance: "menu dikhao", expectedTool: "getMenuTool or searchMenuTool" },
    { utterance: "chicken nuggets kitne ka", expectedTool: "searchMenuTool" },
    { utterance: "timing kya hai", expectedTool: "knowledgeBaseTool" },
    { utterance: "mujhe 3 biryani chahiye", expectedTool: "searchMenuTool then proposeOrderTool" },
  ];
  for (const hint of hints) {
    console.log(`  "${hint.utterance}" → ${hint.expectedTool}`);
  }

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
