// app/(store)/profile/addresses/page.tsx
import ProfileNav from '../_components/ProfileNav';
import { SectionCard } from '../_components/SectionCard';
import { AddressForm } from '../_components/AddressForm';
import { AddressList } from '../_components/AddressList';
import { AnimatedBackground } from '../_components/AnimatedBackground';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import { MapPin, Plus, Home, Truck } from 'lucide-react';

export default async function AddressesPage(){
  const { user } = await requireUser();
  const addresses = await prisma.address.findMany({ 
    where: { userId: user.id }, 
    orderBy: { createdAt: 'desc' } 
  });

  const defaultAddress = addresses.find(addr => addr.isDefault);
  const totalAddresses = addresses.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8">
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-800">Address Book</h1>
            <p className="text-gray-600 font-medium">Manage your delivery addresses</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6 lg:gap-8">
          <ProfileNav />
          
          <div className="space-y-6 lg:space-y-8">
            {/* Address Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/80 backdrop-blur-2xl rounded-2xl p-4 border-2 border-gray-300 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-gray-800">{totalAddresses}</div>
                    <div className="text-sm text-gray-600 font-medium">Total Addresses</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-2xl rounded-2xl p-4 border-2 border-gray-300 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-gray-800">
                      {defaultAddress ? '1' : '0'}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Default Set</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-2xl rounded-2xl p-4 border-2 border-gray-300 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-gray-800">Free</div>
                    <div className="text-sm text-gray-600 font-medium">Delivery</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Add New Address */}
            <SectionCard 
              title="Add New Address" 
              subtitle="Create a new delivery location"
              right={
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
              }
            >
              <AddressForm />
            </SectionCard>

            {/* Address List */}
            <SectionCard 
              title="Your Addresses" 
              subtitle={`${totalAddresses} saved location${totalAddresses !== 1 ? 's' : ''}`}
            >
              <AddressList items={addresses} />
            </SectionCard>

            {/* Delivery Info */}
            <SectionCard 
              title="Delivery Information" 
              subtitle="Important notes about shipping"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Free Shipping</h3>
                      <p className="text-gray-600 text-sm">On orders over 500 MAD</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Enjoy free delivery when your order total exceeds 500 MAD. Standard delivery times apply.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Multiple Locations</h3>
                      <p className="text-gray-600 text-sm">Save up to 5 addresses</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    You can save multiple delivery addresses for different locations like home, work, or family.
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}