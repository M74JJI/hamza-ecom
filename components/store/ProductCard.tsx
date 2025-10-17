import Image from 'next/image';
import Link from 'next/link';

export default function ProductCard({ p }: { p: { id:string; title:string; shortDescription?:string|null; images?: { url:string }[] } }){
  const cover = p.images && p.images.length ? p.images[0].url : 'https://source.unsplash.com/800x600/?product,luxury';
  return (
    <Link href={`/products/${p.id}`} className="product-card block card-premium hover-raise p-3">
      <div className="product-cover relative h-56 w-full">
        <Image src={cover} alt={p.title} fill className="object-cover rounded-xl" />
      </div>
      <div className="px-1 py-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{p.title}</h3>
          <div className="h-2 w-2 rounded-full bg-[var(--hz-accent)] shadow-[0_0_12px_2px_rgba(158,255,0,.6)]"></div>
        </div>
        <p className="text-sm text-white/70 line-clamp-2">{p.shortDescription || ' '}</p>
      </div>
    </Link>
  );
}
