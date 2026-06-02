import Link from "next/link";
import { FaStar } from "react-icons/fa6";

type FlashSaleItem = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  oldPrice: string;
  discount: string;
  promotion: string;
  rating: number;
  sold: number;
  imageUrls: string[];
};

function getProductImage(product: { imageUrls: string[] }) {
  return product.imageUrls[0] ?? null;
}

export default function FlashSaleCarousel({ items }: { items: FlashSaleItem[] }) {
  const extendedItems = items.length > 0 ? [...items, ...items] : [];

  return (
    <div className="flash-sale-track py-1">
      {extendedItems.map((item, index) => (
        <Link
          key={`${item.id}-${index}`}
          href={`/products/${item.id}`}
          className="flash-sale-card group overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
        >
          <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#f7f9ff] to-[#dbe7ff]">
            {getProductImage(item) ? (
              <img alt={item.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" src={getProductImage(item) ?? undefined} />
            ) : null}
            <span className="absolute left-4 top-4 rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white">
              {item.discount}
            </span>
            <span className="absolute bottom-4 left-4 rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-[#1b1202]">
              {item.promotion}
            </span>
          </div>
          <div className="p-4">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-500">
              <span>{item.brand}</span>
              <span>{item.category}</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">{item.name}</h3>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-base font-semibold text-rose-600">{item.price}</span>
              <span className="text-xs text-slate-400 line-through">{item.oldPrice}</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <FaStar className="text-amber-400" /> {item.rating.toFixed(1)} | {item.sold} sold
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
