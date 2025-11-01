// app/(store)/profile/reviews/page.tsx
import ProfileNav from '../_components/ProfileNav';
import { SectionCard } from '../_components/SectionCard';
import { ReviewItem } from '../_components/ReviewItem';
import { AnimatedBackground } from '../_components/AnimatedBackground';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import { Star, MessageSquare, Award, TrendingUp } from 'lucide-react';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reviews",
};


export default async function ReviewsPage(){
  const { user } = await requireUser();
  const reviews = await prisma.review.findMany({
    where: { userId: user.id },
    include: { product: { select: { brand: true, slug: true,  } } },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate review stats
  const totalReviews = reviews.length;
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;
  const helpfulReviews =0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8">
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-800">Your Reviews</h1>
            <p className="text-gray-600 font-medium">Share your experience with our products</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6 lg:gap-8">
          <ProfileNav />
          
          <div className="space-y-6 lg:space-y-8">
            {/* Review Stats */}
            <SectionCard 
              title="Review Overview" 
              subtitle="Your feedback contributions"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-2xl p-4 border border-yellow-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-gray-800">{totalReviews}</div>
                      <div className="text-sm text-gray-600 font-medium">Total Reviews</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-gray-800">{averageRating.toFixed(1)}</div>
                      <div className="text-sm text-gray-600 font-medium">Average Rating</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-gray-800">{helpfulReviews}</div>
                      <div className="text-sm text-gray-600 font-medium">Helpful Votes</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Reviews Yet</h3>
                    <p className="text-gray-600 mb-6">Start reviewing products you've purchased</p>
                    <button className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                      Browse Products
                    </button>
                  </div>
                ) : (
                  reviews.map(review => <ReviewItem key={review.id} review={review} />)
                )}
              </div>
            </SectionCard>

            {/* Review Guidelines */}
            <SectionCard 
              title="Review Guidelines" 
              subtitle="Helpful tips for writing great reviews"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Be Specific</h3>
                      <p className="text-gray-600 text-sm">Share detailed experiences</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Mention specific features you liked or didn't like. Your detailed feedback helps other customers make better decisions.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Be Honest</h3>
                      <p className="text-gray-600 text-sm">Share your genuine experience</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your honest reviews build trust in our community. Focus on your personal experience with the product.
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