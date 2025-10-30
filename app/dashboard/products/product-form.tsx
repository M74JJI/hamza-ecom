'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, useTransition } from 'react';
import { upsertProductAction } from './server-actions';
import { CldUploadWidget } from 'next-cloudinary';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { 
  Trash2, PlusCircle, ChevronDown, Upload, CheckCircle2, 
  ImagePlus, AlertCircle, Package, Sparkles, Tag, 
  Layers, Star, Zap, X, ArrowRight
} from 'lucide-react';
import RichHtmlEditor from './_components/RichHtmlEditor';
import slugify from 'slugify';



type InputProps = HTMLMotionProps<"input"> & {
  label?: string;
};

export function Input({ label, ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-semibold text-gray-900 dark:text-white">
          {label}
        </label>
      )}
      <motion.input
        whileFocus={{ scale: 1.02 }}
        {...props}
        className={`w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-xl placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 ${props.className ?? ""}`}
      />
    </div>
  );
}

export function ProductForm({ categories, product }: { categories: any[], product?: any }) {
  const [slug, setSlug] = useState(product?.slug || '');
  const [status, setStatus] = useState(product?.status || 'DRAFT');
  const [isFeaturedInHero, setIsFeaturedInHero] = useState<boolean>(!!product?.isFeaturedInHero);
  const [brand, setBrand] = useState<string>(product?.brand ?? '');
  const [categoryIds, setCategoryIds] = useState<string[]>(Array.isArray((product as any)?.categories) ? (product as any).categories.map((c: any) => c.categoryId ?? c.id) : []);
  const [detailList, setDetailList] = useState<any[]>(product?.details || []);
  const [highlightList, setHighlightList] = useState<any[]>(product?.highlights || []);
  const [variants, setVariants] = useState<Array<any>>([]);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | undefined>();
  const [selectedCategoryPath, setSelectedCategoryPath] = useState<string[]>([]);
const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // hydrate variants once
  const hydratedOnce = useRef(false);


  useEffect(() => {
  // If user hasn’t manually edited slug and first variant title exists → auto-generate
  if (!slugManuallyEdited && variants.length > 0 && variants[0].title) {
    const autoSlug = slugify(variants[0].title, { lower: true, strict: true });
    setSlug(autoSlug);
  }
}, [variants, slugManuallyEdited]);

  useEffect(() => {
    if (!hydratedOnce.current && product?.variants && product.variants.length) {
      const mapped = product.variants.map((v: any) => ({
        id: v.id,
        title: v.title,
        name: v.name,
        color: v.color || '',
        variantStyleImg: v.variantStyleImg || '',
        shortDescription: v.shortDescription || '',
        contentHtml: v.contentHtml || '',
        sortOrder: v.sortOrder ?? 0,
        images: (v.images || []).map((img: any) => ({ id: img.id, url: img.url, sortOrder: img.sortOrder ?? 0 })),
        sizes: (v.sizes || []).map((s: any) => ({ id: s.id, size: s.size, sku: s.sku, priceMAD: Number(s.priceMAD), discountPercent: s.discountPercent || 0, stockQty: s.stockQty, isActive: s.isActive })),
      }));
      setVariants(mapped);
      hydratedOnce.current = true;
    }
  }, [product]);

  function toggleCategory(id: string) { setCategoryIds(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id]); }
  function addDetail() { setDetailList(v => [...v, { label: '', value: '' }]); }
  function updateDetail(i: number, key: 'label' | 'value', val: string) { setDetailList(v => v.map((d, idx) => idx === i ? { ...d, [key]: val } : d)); }
  function removeDetail(i: number) { setDetailList(v => v.filter((_, idx) => idx !== i)); }

  function addVariant() { setVariants(v => [...v, { title: '', name: '', color: '', variantStyleImg: '', shortDescription: '', contentHtml: '', sortOrder: v.length, images: [], sizes: [] }]); }
  function removeVariant(i: number) { setVariants(v => v.filter((_, idx) => idx !== i)); }
  function updateVariant(i: number, patch: any) { setVariants(v => v.map((row, idx) => idx === i ? { ...row, ...patch } : row)); }

  function addSize(vi: number) { setVariants(v => v.map((row, idx) => idx === vi ? { ...row, sizes: [...row.sizes, { size: '', sku: '', priceMAD: 0, discountPercent: 0, stockQty: 0, isActive: true }] } : row)); }
  function removeSize(vi: number, si: number) { setVariants(v => v.map((row, idx) => idx === vi ? { ...row, sizes: row.sizes.filter((_: any, j: number) => j !== si) } : row)); }
  function updateSize(vi: number, si: number, patch: any) { setVariants(v => v.map((row, idx) => idx === vi ? { ...row, sizes: row.sizes.map((s: any, j: number) => j === si ? { ...s, ...patch } : s) } : row)); }

  const missingStyleImg = variants.some(v => !v.variantStyleImg);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {product?.id ? 'Edit Product' : 'Create New Product'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {product?.id ? 'Update your product details' : 'Add a new product to your catalog'}
            </p>
          </div>
        </div>

        <AnimatePresence>
          {missingStyleImg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30"
            >
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Every variant needs a Style Image</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <form onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const payload = { id: product?.id, slug, status, categoryIds, isFeaturedInHero, brand, details: detailList, highlights: highlightList, variants };
          console.log(payload);
          const r = await upsertProductAction(payload);
          setMsg(r.error || '✅ Product saved successfully!');
        });
      }} className="space-y-8">

        {/* Basic Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl border border-white/20 dark:border-gray-700/30 p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Tag className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
           <div className="space-y-2">
  <label className="text-sm font-semibold text-gray-900 dark:text-white">
    Slug
  </label>
  <input
    type="text"
    value={slug}
    onChange={(e) => {
      setSlug(e.target.value);
      setSlugManuallyEdited(true);
    }}
    placeholder="Auto-generated from first variant title"
    className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-xl placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
  />
  {!slugManuallyEdited && (
    <p className="text-xs text-gray-500 dark:text-gray-400">
      (Auto-generated — you can edit manually)
    </p>
  )}
</div>

            <Input label="Brand" value={brand} onChange={e => setBrand(e.target.value)} />
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 dark:text-white">Status</label>
              <motion.select
                whileFocus={{ scale: 1.02 }}
                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="DRAFT" className="text-gray-500">DRAFT</option>
                <option value="PUBLISHED" className="text-gray-500">PUBLISHED</option>
              </motion.select>
            </div>
          </div>
        </motion.div>

        {/* Categories Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl border border-white/20 dark:border-gray-700/30 p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Categories</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-4 bg-white/30 dark:bg-gray-700/30 rounded-xl border border-white/20 dark:border-gray-700/30">
            <CategorySelector
  categories={categories}
  selectedPath={selectedCategoryPath}
  onSelect={(path, lastSelected) => {
    setSelectedCategoryPath(path);
    setCategoryIds([lastSelected.id]); // single leaf category id to save
  }}
/>
          </div>
        </motion.div>

        {/* Featured Toggle Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl border border-white/20 dark:border-gray-700/30 p-6 shadow-xl"
        >
          <motion.label
            whileHover={{ scale: 1.02 }}
            className="flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Featured in Hero</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Show this product on the homepage hero section
                </div>
              </div>
            </div>

            <div className="relative">
              <input
                type="checkbox"
                checked={isFeaturedInHero}
                onChange={(e) => setIsFeaturedInHero(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-14 h-8 flex items-center rounded-full p-1 transition-all duration-300 ${
                isFeaturedInHero
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}>
                <motion.div
                  layout
                  className="w-6 h-6 bg-white rounded-full shadow-lg transform transition-all duration-300"
                  animate={{ x: isFeaturedInHero ? 24 : 0 }}
                />
              </div>
            </div>
          </motion.label>
        </motion.div>

        {/* Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl border border-white/20 dark:border-gray-700/30 p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Custom Details</h2>
          </div>

          <div className="space-y-4">
            {detailList.map((d: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid md:grid-cols-[1fr_2fr_auto] gap-4 items-end"
              >
                <Input placeholder="Label" value={d.label} onChange={e => updateDetail(i, 'label', e.target.value)} />
                <Input placeholder="Value" value={d.value} onChange={e => updateDetail(i, 'value', e.target.value)} />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => removeDetail(i)}
                  className="px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-500/20 transition-all duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addDetail}
              className="flex items-center gap-2 px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-white dark:hover:bg-gray-700 transition-all duration-300"
            >
              <PlusCircle className="w-4 h-4" />
              Add Detail
            </motion.button>
          </div>
        </motion.div>

        {/* Highlights Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl border border-white/20 dark:border-gray-700/30 p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Highlights</h2>
          </div>

          <div className="space-y-4">
            {highlightList.map((d: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid md:grid-cols-[1fr_2fr_auto] gap-4 items-end"
              >
                <Input placeholder="Label (e.g., Water resistant)" value={d.label} onChange={e => setHighlightList(prev => prev.map((row: any, idx: number) => idx === i ? { ...row, label: e.target.value } : row))} />
                <Input placeholder="Value (e.g., Premium canvas & leather)" value={d.value} onChange={e => setHighlightList(prev => prev.map((row: any, idx: number) => idx === i ? { ...row, value: e.target.value } : row))} />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setHighlightList(prev => prev.filter((_: any, idx: number) => idx !== i))}
                  className="px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-500/20 transition-all duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setHighlightList(prev => [...prev, { label: '', value: '' }])}
              className="flex items-center gap-2 px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-white dark:hover:bg-gray-700 transition-all duration-300"
            >
              <PlusCircle className="w-4 h-4" />
              Add Highlight
            </motion.button>
          </div>
        </motion.div>

        {/* Variants Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl border border-white/20 dark:border-gray-700/30 p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Variants</h2>
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addVariant}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
            >
              <PlusCircle className="w-4 h-4" />
              Add Variant
            </motion.button>
          </div>

          {variants.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                <Layers className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No variants yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Add variants to create different product options</p>
            </div>
          )}

          <div className="space-y-6">
            {variants.map((v: any, vi: number) => (
              <motion.div
                key={v.id || vi}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/20 dark:border-gray-700/30 p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
              >
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <Input label="Variant Title" value={v.title} onChange={e => updateVariant(vi, { title: e.target.value })} />
                  <Input label="Variant Label (e.g. Red)" value={v.name} onChange={e => updateVariant(vi, { name: e.target.value })} />
        <div className="space-y-2">
  <label className="text-sm font-semibold text-gray-900 dark:text-white">
    Color
  </label>
  <div className="flex items-center gap-3">
    <input
      type="color"
      value={v.color || '#000000'}
      onChange={(e) => updateVariant(vi, { color: e.target.value })}
      className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
      title="Pick a color"
    />
    <input
      type="text"
      value={v.color || ''}
      onChange={(e) => updateVariant(vi, { color: e.target.value })}
      placeholder="Color name or hex"
      className="flex-1 px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
    />
  </div>
</div>

                </div>

                {/* Style Image */}
                <div className="mb-6">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <ImagePlus className="w-4 h-4" />
                    Style Image (required)
                    {!v.variantStyleImg && (
                      <span className="text-amber-500 text-xs">• Required</span>
                    )}
                  </label>
                  <div className="flex items-center gap-4 p-4 bg-white/30 dark:bg-gray-700/30 rounded-xl border border-white/20 dark:border-gray-700/30">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`relative w-24 h-24 rounded-xl border-2 border-dashed overflow-hidden ${
                        !v.variantStyleImg ? 'border-amber-400/50 bg-amber-400/10' : 'border-white/20 dark:border-gray-700/30'
                      }`}
                    >
                      {v.variantStyleImg ? (
                        <>
                          <img src={v.variantStyleImg} className="w-full h-full object-cover" />
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateVariant(vi, { variantStyleImg: '' })}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
                          >
                            <X className="w-3 h-3 text-white" />
                          </motion.button>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImagePlus className="w-8 h-8 text-amber-400" />
                        </div>
                      )}
                    </motion.div>

                    <CldUploadWidget
                      uploadPreset="ufb48euh"
                      onSuccess={(res: any) => {
                        const url = res.info.secure_url || (res.info.url || '').replace(/^http:/, 'https:');
                        updateVariant(vi, { variantStyleImg: url });
                      }}
                    >
                      {({ open }) => (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => open()}
                          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Style Image
                        </motion.button>
                      )}
                    </CldUploadWidget>
                  </div>
                </div>

                {/* Collapsible Sections */}
                <div className="space-y-4">
                  <motion.details className="group">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 select-none list-none">
                      <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                      Short Description
                    </summary>
                    <div className="mt-3">
                      <Input value={v.shortDescription || ''} onChange={e => updateVariant(vi, { shortDescription: e.target.value })} />
                    </div>
                  </motion.details>

                  <motion.details className="group">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 select-none list-none">
                      <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                      Full Description (HTML)
                    </summary>
                    <div className="mt-3 rounded-xl overflow-hidden border border-white/20 dark:border-gray-700/30 bg-white/50 dark:bg-gray-800/50">
 <RichHtmlEditor
          value={v.contentHtml || ''}
          onChange={(val) => updateVariant(vi, { contentHtml: val })}
          height={520}
        />
                    </div>
                  </motion.details>
                </div>

                {/* Variant Images */}
                <div className="mt-6">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 block">
                    Variant Images (max 6)
                  </label>
                  <div className="flex flex-wrap gap-4 p-4 bg-white/30 dark:bg-gray-700/30 rounded-xl border border-white/20 dark:border-gray-700/30">
                    {(v.images || []).map((img: any, ii: number) => (
                      <motion.div
                        key={img.id || img.asset_id || img.url}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group"
                      >
                        <img src={img.url || img.secure_url} className="w-20 h-20 rounded-xl border border-white/20 object-cover" />
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateVariant(vi, { images: v.images.filter((_: any, idx: number) => idx !== ii) })}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </motion.button>
                      </motion.div>
                    ))}
                    {(v.images?.length || 0) < 6 && (
                      <CldUploadWidget
                        uploadPreset="ufb48euh"
                        onSuccess={(res: any) => {
                          const url = res.info.secure_url || (res.info.url || '').replace(/^http:/, 'https:');
                          const publicId = res.info.public_id;
                          setVariants(prev =>
                            prev.map((row, idx) => {
                              if (idx !== vi) return row;
                              const curr = Array.isArray(row.images) ? row.images : [];
                              const appended = [...curr, { id: publicId, url, sortOrder: curr.length }];
                              const capped = appended.slice(0, 6).map((img, i) => ({ ...img, sortOrder: i }));
                              return { ...row, images: capped };
                            })
                          );
                        }}
                      >
                        {({ open }) => (
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => open()}
                            className="w-20 h-20 rounded-xl border-2 border-dashed border-white/20 dark:border-gray-700/30 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center hover:border-blue-500/50 transition-all duration-300"
                          >
                            <Upload className="w-6 h-6 text-gray-400" />
                          </motion.button>
                        )}
                      </CldUploadWidget>
                    )}
                  </div>
                </div>

                {/* Sizes */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-semibold text-gray-900 dark:text-white">Sizes</label>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addSize(vi)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-white dark:hover:bg-gray-700 transition-all duration-300"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Add Size
                    </motion.button>
                  </div>

                  {(v.sizes || []).length === 0 && (
                    <div className="text-center py-6 bg-white/30 dark:bg-gray-700/30 rounded-xl border border-white/20 dark:border-gray-700/30">
                      <p className="text-gray-500 dark:text-gray-400">No sizes added yet</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {(v.sizes || []).map((s: any, si: number) => (
                      <motion.div
                        key={s.id || si}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 items-center p-4 bg-white/30 dark:bg-gray-700/30 rounded-xl border border-white/20 dark:border-gray-700/30"
                      >
                        <Input placeholder="Size (M/L/XL)" value={s.size} onChange={e => updateSize(vi, si, { size: e.target.value })} />
                        <Input placeholder="SKU" value={s.sku} onChange={e => updateSize(vi, si, { sku: e.target.value })} />
                        <Input placeholder="Price (MAD)" type="number" min="0" step="0.01" value={s.priceMAD} onChange={e => updateSize(vi, si, { priceMAD: Number(e.target.value) })} />
                        <Input placeholder="Discount %" type="number" min="0" max="100" step="1" value={s.discountPercent || 0} onChange={e => updateSize(vi, si, { discountPercent: Number(e.target.value) })} />
                        <Input placeholder="Stock" type="number" min="0" step="1" value={s.stockQty} onChange={e => updateSize(vi, si, { stockQty: Number(e.target.value) })} />
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeSize(vi, si)}
                          className="p-2 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-500/20 transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Variant Footer */}
                <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/20 dark:border-gray-700/30">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Sort order: <span className="font-semibold">{v.sortOrder ?? 0}</span>
                  </div>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => removeVariant(vi)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-500/20 transition-all duration-300"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove Variant
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Submit Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex items-center justify-between pt-6 border-t border-white/20 dark:border-gray-700/30"
        >
          <AnimatePresence>
            {msg && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`px-4 py-3 rounded-xl text-sm font-medium ${
                  msg.includes('error')
                    ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                    : 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                }`}
              >
                {msg}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={pending || missingStyleImg}
            whileHover={{ scale: pending || missingStyleImg ? 1 : 1.05 }}
            whileTap={{ scale: pending || missingStyleImg ? 1 : 0.95 }}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
          >
            {pending ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving Product...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                {product?.id ? 'Update Product' : 'Create Product'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </motion.div>
      </form>
    </div>
  );
}

function CategorySelector({
  categories,
  level = 0,
  selectedPath,
  onSelect,
}: {
  categories: any[];
  level?: number;
  selectedPath: string[];
  onSelect: (path: string[], category: any) => void;
}) {
  const selectedId = selectedPath[level] || '';
  const currentCategory = categories.find((c) => c.id === selectedId);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4" />
          {level === 0 ? 'Main Category' : `Subcategory Level ${level + 1}`}
        </label>
        <motion.select
          whileFocus={{ scale: 1.02 }}
          value={selectedId}
          onChange={(e) => {
            const selected = categories.find((c) => c.id === e.target.value);
            const newPath = [...selectedPath.slice(0, level), e.target.value];
            onSelect(newPath, selected);
          }}
          className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
        >
          <option value="" className="text-gray-500 dark:text-gray-400">
            Select {level === 0 ? 'a category' : 'subcategory'}...
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id} className="text-gray-900 dark:text-white">
              {c.name}
            </option>
          ))}
        </motion.select>
      </div>

      {/* If selected category has children, show next level */}
      {currentCategory?.children?.length ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="ml-4 pl-4 border-l-2 border-blue-500/20"
        >
          <CategorySelector
            categories={currentCategory.children}
            level={level + 1}
            selectedPath={selectedPath}
            onSelect={onSelect}
          />
        </motion.div>
      ) : selectedId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Category selected: <strong>{currentCategory?.name}</strong></span>
        </motion.div>
      )}
    </div>
  );
}