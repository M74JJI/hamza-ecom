import { describe, expect, test } from "bun:test";
import { expandCategoryIds } from "../lib/catalog/category-tree.ts";

const categories = [
  { id: "root", parentId: null },
  { id: "child-a", parentId: "root" },
  { id: "child-b", parentId: "root" },
  { id: "grandchild", parentId: "child-a" },
  { id: "other-root", parentId: null },
];

describe("expandCategoryIds", () => {
  test("expands a parent through all descendants", () => {
    expect(new Set(expandCategoryIds(categories, ["root"]))).toEqual(
      new Set(["root", "child-a", "child-b", "grandchild"]),
    );
  });

  test("keeps leaf selection scoped to the leaf", () => {
    expect(expandCategoryIds(categories, ["grandchild"])).toEqual(["grandchild"]);
  });

  test("deduplicates overlapping selections", () => {
    const result = expandCategoryIds(categories, ["root", "child-a"]);
    expect(result).toHaveLength(4);
    expect(new Set(result)).toEqual(
      new Set(["root", "child-a", "child-b", "grandchild"]),
    );
  });

  test("ignores unknown category ids", () => {
    expect(expandCategoryIds(categories, ["missing"])).toEqual([]);
  });

  test("does not recurse forever on malformed cycles", () => {
    const cyclic = [
      { id: "a", parentId: "b" },
      { id: "b", parentId: "a" },
    ];

    expect(new Set(expandCategoryIds(cyclic, ["a"]))).toEqual(
      new Set(["a", "b"]),
    );
  });
});
