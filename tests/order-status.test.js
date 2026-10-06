import { describe, expect, test } from "bun:test";
import {
  getAllowedOrderTransitions,
  isOrderStatus,
} from "../lib/orders/status.ts";

describe("order status policy", () => {
  test("accepts only known statuses", () => {
    for (const status of ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]) {
      expect(isOrderStatus(status)).toBe(true);
    }

    expect(isOrderStatus("REFUNDED")).toBe(false);
    expect(isOrderStatus("pending")).toBe(false);
  });

  test("allows only forward business transitions", () => {
    expect(getAllowedOrderTransitions("PENDING")).toEqual([
      "CONFIRMED",
      "CANCELLED",
    ]);
    expect(getAllowedOrderTransitions("CONFIRMED")).toEqual([
      "SHIPPED",
      "CANCELLED",
    ]);
    expect(getAllowedOrderTransitions("SHIPPED")).toEqual(["DELIVERED"]);
  });

  test("keeps delivered and cancelled terminal", () => {
    expect(getAllowedOrderTransitions("DELIVERED")).toEqual([]);
    expect(getAllowedOrderTransitions("CANCELLED")).toEqual([]);
  });
});
