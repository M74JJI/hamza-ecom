"use server";

import { prisma } from "@/lib/db";
import { parse } from "json2csv";
import { writeFile } from "fs/promises";
import path from "path";
import { format } from "date-fns";

export async function downloadCSV(from?: string, to?: string) {
  const fromDate = from ? new Date(from) : new Date(0);
  const toDate = to ? new Date(to) : new Date();

  const orders = await prisma.order.findMany({
    where: { placedAt: { gte: fromDate, lte: toDate } },
    include: { shippingAddress: true, items: true },
  });

  const csvData = orders.map((o) => ({
    orderId: o.id,
    date: format(o.placedAt ?? o.createdAt, "yyyy-MM-dd HH:mm"),
    status: o.status,
    totalMAD: o.totalMAD,
    customerEmail: o.userId,
    city: o.shippingAddress?.city ?? "",
    itemCount: o.items.length,
  }));

  const csv = parse(csvData);
  const filePath = path.join("/tmp", `orders-${Date.now()}.csv`);
  await writeFile(filePath, csv);
  return filePath; // optional if you plan to trigger a download link
}
