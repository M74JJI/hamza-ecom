export type CatalogFilters = {
  q?: string;
  categoryId?: string;
  color?: string;
  size?: string;
};

export function normalizeFilters(sp: Record<string,string | string[] | undefined>): CatalogFilters {
  const takeOne = (k:string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]) as string|undefined;
  return {
    q: takeOne('q')?.trim() || undefined,
    categoryId: takeOne('category') || undefined,
    color: takeOne('color') || undefined,
    size: takeOne('size') || undefined,
  }
}

export function matchesVariant(attrs: any, filters: CatalogFilters){
  if(!attrs) return true;
  if(filters.color){
    const c = attrs.color;
    if(Array.isArray(c)){
      if(!c.map((x:string)=>x.toLowerCase()).includes(filters.color.toLowerCase())) return false;
    }else if(typeof c === 'string'){
      if(c.toLowerCase() !== filters.color.toLowerCase()) return false;
    }
  }
  if(filters.size){
    const s = (attrs.size||'').toString().toLowerCase();
    if(s !== filters.size.toLowerCase()) return false;
  }
  return true;
}
