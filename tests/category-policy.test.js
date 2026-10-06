import { describe, expect, test } from "bun:test";
import { wouldCreateCategoryCycle } from "../lib/catalog/category-policy.ts";

const categories = [
  { id: "root", parentId: null },
  { id: "child", parentId: "root" },
  { id: "grandchild", parentId: "child" },
  { id: "other", parentId: null },
];

describe("wouldCreateCategoryCycle", () => {
  test("allows a root category or unrelated parent", () => {
    expect(wouldCreateCategoryCycle(categories, "child", null)).toBe(false);
    expect(wouldCreateCategoryCycle(categories, "child", "other")).toBe(false);
  });

  test("rejects self-parenting", () => {
    expect(wouldCreateCategoryCycle(categories, "child", "child")).toBe(true);
  });

  test("rejects moving a category under one of its descendants", () => {
    expect(wouldCreateCategoryCycle(categories, "root", "child")).toBe(true);
    expect(wouldCreateCategoryCycle(categories, "root", "grandchild")).toBe(true);
    expect(wouldCreateCategoryCycle(categories, "child", "grandchild")).toBe(true);
  });

  test("allows moving a descendant higher in the tree", () => {
    expect(wouldCreateCategoryCycle(categories, "grandchild", "root")).toBe(false);
  });

  test("rejects attaching into an already malformed cycle", () => {
    const malformed = [
      { id: "a", parentId: "b" },
      { id: "b", parentId: "a" },
      { id: "c", parentId: null },
    ];

    expect(wouldCreateCategoryCycle(malformed, "c", "a")).toBe(true);
  });
});
