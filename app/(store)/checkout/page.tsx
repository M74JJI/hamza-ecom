import { ensureLoggedInOrRedirectCart, syncCartToDBAndValidate } from './actions';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import CheckoutClient from './ui/CheckoutClient';
import { getCurrentUser } from '@/lib/auth';
export const dynamic = "force-dynamic";



export default async function CheckoutPage(){
  const user = await getCurrentUser();
  await ensureLoggedInOrRedirectCart();
  
  const sync = await syncCartToDBAndValidate();
  if(!sync.ok){
    const reason = encodeURIComponent(JSON.stringify(sync.problems));
    redirect('/cart?revalidated=1&problems=' + reason);
  }

  const companies = await prisma.deliveryCompany.findMany({ 
    where: { active: true }, 
    orderBy: { name: 'asc' } 
  });
  
  const cart = await prisma.cart.findFirst({
    include: { 
      items: { 
        include: { 
          variantSize: { 
            include: { 
              variant: true 
            } 
          } 
        } 
      } 
    }
  });

  if(!cart || cart.items.length === 0) redirect('/cart');

  const addresses = await prisma.address.findMany({
    where: { userId: user.id }
  });

  // Serialize decimals -> numbers
  const safeCart = {
    id: cart.id,
    items: cart.items.map(ci => ({
      id: ci.id,
      quantity: ci.quantity,
      unitPriceMAD: Number(ci.unitPriceMAD),
      variantSize: {
        id: ci.variantSize.id,
        size: ci.variantSize.size,
        sku: ci.variantSize.sku,
        priceMAD: Number(ci.variantSize.priceMAD),
        discountPercent: ci.variantSize.discountPercent,
        stockQty: ci.variantSize.stockQty,
        isActive: ci.variantSize.isActive,
        variant: {
          id: ci.variantSize.variant.id,
          title: ci.variantSize.variant.title,
          name: ci.variantSize.variant.name,
          variantStyleImg: ci.variantSize.variant.variantStyleImg,
          freeDelivery: (ci.variantSize.variant as any).freeDelivery ?? false,
        }
      }
    }))
  };

  const safeCompanies = companies.map(c => ({ 
    id: c.id, 
    name: c.name, 
    priceMAD: Number(c.priceMAD), 
    avgDays: c.avgDays, 
    active: c.active 
  }));

  return (
    <CheckoutClient 
      companies={safeCompanies} 
      dbCart={safeCart} 
      addresses={addresses}
    />
  );
}