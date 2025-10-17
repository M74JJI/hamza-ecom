'use server';

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/require-user";
import { sendOrderConfirmation } from "@/lib/emails/order";

const applyDiscount = (val:number, pct?:number|null)=> (!pct || pct<=0) ? val : Math.max(0, Number((val * (100 - pct)/100).toFixed(2)));

export async function placeOrderAction({ addressId }: { addressId: string }){
  const { user } = await requireUser();
  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: { items: { include: { variantSize: { include: { variant: { include: { product: true } } } } } } }
  });
  if(!cart || cart.items.length === 0){
    return { error: "Cart is empty" };
  }

  for(const item of cart.items){
    if(item.variantSize.stockQty < item.quantity){
      return { error: `Not enough stock for size ${item.variantSize.size}` };
    }
  }

  const order = await prisma.$transaction(async (db)=>{
    const created = await db.order.create({
      data: {
        userId: user.id,
        status: "PENDING",
        currency: "MAD",
        shippingAddressId: addressId,
        totalMAD: cart.items.reduce((sum, it)=> sum + applyDiscount(Number(it.variantSize.priceMAD), it.variantSize.discountPercent) * it.quantity, 0),
        items: {
          create: cart.items.map((it)=> ({
            variantSizeId: it.variantSizeId,
            quantity: it.quantity,
            unitPriceMAD: applyDiscount(Number(it.variantSize.priceMAD), it.variantSize.discountPercent),
            titleSnapshot: it.variantSize.variant.title,
            skuSnapshot: it.variantSize.sku,
            attributesSnapshot: {
              color: it.variantSize.variant.color ?? it.variantSize.variant.name,
              size: it.variantSize.size
            }
          }))
        }
      }
    });

    for(const item of cart.items){
      await db.variantSize.update({
        where: { id: item.variantSizeId },
        data: { stockQty: { decrement: item.quantity } }
      });
    }

    await db.cartItem.deleteMany({ where: { cartId: cart.id } });

    return created;
  });

  try{
    await sendOrderConfirmation(user.email, order.id);
  }catch(e){ /* ignore */ }

  revalidatePath("/cart");
  revalidatePath("/orders");
  return { ok: true, orderId: order.id };
}
