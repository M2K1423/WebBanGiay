import { getFeaturedProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

const highlights = [
  {
    value: "120+",
    label: "Mau giay hot"
  },
  {
    value: "24h",
    label: "Giao nhanh noi thanh"
  },
  {
    value: "4.9/5",
    label: "Danh gia trung binh"
  }
];

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <main className="page-shell">
      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Solelane Shoes</p>
          <h1>Kho giay chay nhat cho phong cach hang ngay</h1>
          <p className="hero-text">
            Trang web ban giay voi giao dien sang, toi uu cho san pham the thao,
            lifestyle va running. Frontend Next.js noi voi API NestJS.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#products">
              Xem san pham
            </a>
            <a className="secondary-action" href="#about">
              Ve thuong hieu
            </a>
          </div>
          <div className="stats-row">
            {highlights.map((item) => (
              <article key={item.label} className="stat-card">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="glow glow-one" />
          <div className="glow glow-two" />
          <div className="shoe-card">
            <span className="shoe-tag">New Drop</span>
            <div className="shoe-illustration">
              <div className="shoe-sole" />
              <div className="shoe-upper" />
              <div className="shoe-laces" />
            </div>
            <div className="shoe-meta">
              <div>
                <p>Velocity Runner</p>
                <span>Performance series</span>
              </div>
              <strong>1.890.000đ</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="products-section" id="products">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Featured picks</p>
            <h2>San pham noi bat</h2>
          </div>
          <p>Du lieu mau lay tu API, neu API chua san sang se tu dong dung fallback.</p>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <article key={product.id} className="product-card">
              <div className="product-badge">{product.category}</div>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <div className="product-footer">
                <strong>{product.price}</strong>
                <span>{product.colors.join(" / ")}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-panel" id="about">
        <div>
          <p className="eyebrow">Why us</p>
          <h2>Khoi dau nhanh, de mo rong</h2>
        </div>
        <p>
          Bo khoi tao nay co san frontend Next.js va backend NestJS, phu hop de
          phat trien shop giay, quan ly san pham, giam gia va don hang.
        </p>
      </section>
    </main>
  );
}