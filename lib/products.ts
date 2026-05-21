export type FeaturedProduct = {
  id: string;
  name: string;
  description: string;
  brand: string;
  productType: string;
  price: string;
  oldPrice: string;
  discount: string;
  category: string;
  promotion: string;
  rating: number;
  reviewCount: number;
  sold: number;
  colors: string[];
  imageUrls: string[];
};

const API_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api");

async function fetchProducts(): Promise<FeaturedProduct[]> {
  try {
    const response = await fetch(`${API_URL}/products`, { cache: "no-store" });
    if (!response.ok) return [];
    return (await response.json()) as FeaturedProduct[];
  } catch {
    return [];
  }
}

export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  return fetchProducts();
}

export async function getAllProducts(): Promise<FeaturedProduct[]> {
  return fetchProducts();
}

export async function getProductById(
  id: string
): Promise<FeaturedProduct | null> {
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      cache: "no-store"
    });
    if (!response.ok) return null;
    return (await response.json()) as FeaturedProduct;
  } catch {
    return null;
  }
}

export async function getProductsByBrand(
  brand: string
): Promise<FeaturedProduct[]> {
  const all = await fetchProducts();
  return all.filter(
    (p) => p.brand.toLowerCase() === brand.toLowerCase()
  );
}

export async function getProductsByCategory(
  category: string
): Promise<FeaturedProduct[]> {
  const all = await fetchProducts();
  return all.filter(
    (p) => p.category.toLowerCase() === category.toLowerCase()
  );
}

export async function getSaleProducts(): Promise<FeaturedProduct[]> {
  const all = await fetchProducts();
  return all.filter((p) => p.productType === "Flash Sale");
}

export async function searchProducts(
  query: string
): Promise<FeaturedProduct[]> {
  const all = await fetchProducts();
  const q = query.toLowerCase();
  return all.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
  );
}

export function getProductImage(product: FeaturedProduct): string | null {
  return product.imageUrls[0] ?? null;
}

