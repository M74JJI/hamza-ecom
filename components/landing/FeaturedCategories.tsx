// components/landing/FeaturedCategories.tsx (Server Component)
import { prisma } from "@/lib/db";
import Link from "next/link";
import { FeaturedCategoriesClient } from "./FeaturedCategoriesClient";

export default async function FeaturedCategories(){
  const categories = await prisma.category.findMany({ where:{
    isActiveInHeader:true
  },take: 6 });
  if(categories.length === 0){
    return null;
  }

  return <FeaturedCategoriesClient categories={categories} />;
}