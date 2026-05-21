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

export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

  try {
    const response = await fetch(`${apiUrl}/products`, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Failed to load products");
    }

    return (await response.json()) as FeaturedProduct[];
  } catch {
    return [];
  }
}
