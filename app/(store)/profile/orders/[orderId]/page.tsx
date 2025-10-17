// app/(store)/profile/orders/[orderId]/page.tsx
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import Image from 'next/image';
import { Package, Truck, MapPin, CreditCard, Award, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AnimatedBackground } from '../../_components/AnimatedBackground';
import { OrderTimeline } from '../../_components/OrderTimeline';
import { SectionCard } from '../../_components/SectionCard';
import { InvoiceButton } from '../../_components/InvoiceButton';
import ProfileNav from '../../_components/ProfileNav';

export default async function Page({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  const { user } = await requireUser();

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
    include: {
      items: {
        include: {
          variantSize: {
            include: {
              variant: {
                include: { product: true, images: true },
              },
            },
          },
        },
      },
      shippingAddress: true,
      shippingCompany: true,
      coupon: true,
    },
  });

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8 flex items-center justify-center">
        <AnimatedBackground />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h1>
          <Link href="/profile/orders" className="text-blue-600 hover:underline">
            Return to Orders
          </Link>
        </div>
      </div>
    );
  }

  // ---------------- Timeline steps ----------------
  const steps = [
    {
      label: 'Pending',
      active: order.status === 'PENDING',
      done:
        ['CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.status) ||
        order.status === 'PENDING',
    },
    {
      label: 'Confirmed',
      active: order.status === 'CONFIRMED',
      done:
        ['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.status) ||
        order.status === 'CONFIRMED',
    },
    {
      label: 'Shipped',
      active: order.status === 'SHIPPED',
      done:
        ['DELIVERED', 'CANCELLED'].includes(order.status) ||
        order.status === 'SHIPPED',
    },
    {
      label: 'Delivered',
      active: order.status === 'DELIVERED',
      done: order.status === 'DELIVERED',
    },
  ];

  // ---------------- Financials ----------------
  const subtotal = order.items.reduce(
    (s, it) => s + Number(it.unitPriceMAD) * it.quantity,
    0
  );
  const discount = Number(order.discountMAD ?? 0);
  const shipping = Number(order.shippingFeeMAD ?? 0);
  const total = subtotal - discount + shipping;

  // ---------------- Component ----------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8">
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/profile/orders"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Orders
            </Link>
            <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-800">Order Details</h1>
              <p className="text-gray-600 font-medium">Track your order and view details</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6 lg:gap-8">
          <ProfileNav />

          <div className="space-y-6 lg:space-y-8">
            {/* Order Status & Timeline */}
            <SectionCard 
              title={`Order #${order.id.slice(0, 8).toUpperCase()}`}
              subtitle={`Placed on ${new Date(order.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}`}
              right={<InvoiceButton orderId={order.id} />}
            >
              <div className="mb-6">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm ${
                  order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                  order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'CONFIRMED' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    order.status === 'DELIVERED' ? 'bg-green-500' :
                    order.status === 'SHIPPED' ? 'bg-blue-500' :
                    order.status === 'CONFIRMED' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`}></div>
                  Status: {order.status}
                </div>
              </div>
              
              <OrderTimeline steps={steps} />
            </SectionCard>

            {/* Order Items */}
            <SectionCard 
              title="Order Items" 
              subtitle={`${order.items.length} item${order.items.length !== 1 ? 's' : ''} in this order`}
              right={
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
              }
            >
              <div className="space-y-4">
                {order.items.map((it) => {
                  const v = it.variantSize.variant;
                  const product = v.product;
                  const img =
                    Array.isArray(v.images) && v.images.length > 0
                      ? v.images[0]?.url
                      : v.variantStyleImg || '';

                  return (
                    <div key={it.id} className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-2xl rounded-2xl border-2 border-gray-300 hover:shadow-lg transition-all">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {img ? (
                          <Image
                            src={img}
                            alt={product?.brand ?? 'Item'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full grid place-items-center text-xs text-gray-400">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-lg mb-1">
                          {product?.brand ?? 'Product'} — {v.title}
                        </h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Size: {it.variantSize.size} · Quantity: {it.quantity}</div>
                          <div>SKU: {it.variantSize.sku}</div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-gray-800 text-lg">
                          {(Number(it.unitPriceMAD) * it.quantity).toFixed(2)} MAD
                        </div>
                        <div className="text-sm text-gray-600">
                          {Number(it.unitPriceMAD).toFixed(2)} MAD each
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            {/* Shipping & Delivery */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Shipping Address */}
              <SectionCard 
                title="Shipping Address"
                right={
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                }
              >
                {order.shippingAddress ? (
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl p-4 border border-green-200">
                      <div className="font-semibold text-gray-800 text-lg mb-2">
                        {order.shippingAddress.fullName}
                      </div>
                      <div className="text-gray-600 space-y-1">
                        <div>{order.shippingAddress.fullAddress}</div>
                        <div>{order.shippingAddress.city}</div>
                        <div className="font-medium">Phone: {order.shippingAddress.phone}</div>
                      </div>
                    </div>
                    
                    {order.shippingCompany && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                        <Truck className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-semibold text-gray-800">{order.shippingCompany.name}</div>
                          <div className="text-sm text-gray-600">
                            Shipping fee: {Number(order.shippingFeeMAD ?? 0).toFixed(2)} MAD
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-600 text-center py-4">
                    No shipping address available
                  </div>
                )}
              </SectionCard>

              {/* Order Summary */}
              <SectionCard 
                title="Order Summary"
                right={
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                }
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-800">{subtotal.toFixed(2)} MAD</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-semibold text-green-600">-{discount.toFixed(2)} MAD</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-gray-800">{shipping.toFixed(2)} MAD</span>
                  </div>
                  
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800">Total</span>
                      <span className="text-2xl font-black text-gray-800">{total.toFixed(2)} MAD</span>
                    </div>
                  </div>

                  {order.coupon && (
                    <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-xl border border-yellow-200 mt-3">
                      <Award className="w-4 h-4 text-yellow-600" />
                      <div className="text-sm">
                        <div className="font-semibold text-gray-800">Coupon Applied</div>
                        <div className="text-gray-600">{order.coupon.code}</div>
                      </div>
                    </div>
                  )}
                </div>
              </SectionCard>
            </div>

            {/* Need Help Section */}
            <SectionCard 
              title="Need Help With Your Order?"
              subtitle="We're here to assist you"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Track Your Order</h3>
                      <p className="text-gray-600 text-sm">Get real-time delivery updates</p>
                    </div>
                  </div>
                  <button className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors">
                    Track Package
                  </button>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Return Items</h3>
                      <p className="text-gray-600 text-sm">Start a return if needed</p>
                    </div>
                  </div>
                  <button className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors">
                    Start Return
                  </button>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}