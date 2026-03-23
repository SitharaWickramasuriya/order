"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { addToCart } from "@/lib/cart";

type Product = {
  id: string;
  itemCode: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  imageUrl?: string;
};

const categoryTiles = [
  { name: "Dairy, Bread & Eggs", icon: "🥛" },
  { name: "Snack & Munchies", icon: "🍟" },
  { name: "Bakery & Biscuits", icon: "🍪" },
  { name: "Instant Food", icon: "🍜" },
  { name: "Tea, Coffee & Drinks", icon: "☕" },
  { name: "Atta, Rice & Dal", icon: "🌾" },
];

const mainNav = ["Home", "Dropdown Menu", "Mega menu", "Dashboard"];

function categoryEmoji(category?: string) {
  const value = category?.toLowerCase() ?? "";
  if (value.includes("fruit") || value.includes("vegetable")) return "🥬";
  if (value.includes("dairy")) return "🥛";
  if (value.includes("bakery")) return "🥖";
  if (value.includes("drink") || value.includes("beverage")) return "🧃";
  if (value.includes("snack")) return "🍪";
  return "🛒";
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetch("/api/products")
        .then((res) => res.json())
        .then((data) => setProducts(data.slice(0, 12)));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function handleAdd(product: Product) {
    addToCart({ productId: product.id, name: product.name, price: product.price, quantity: 1 });
    setMessage(`${product.name} added to cart`);
    setTimeout(() => setMessage(""), 2500);
  }

  const popularProducts = products.slice(0, 10);
  const dailyBest = products.slice(0, 4);

  return (
    <div className="store-wrap">
      <div className="store-topbar">
        <div className="store-shell">
          <p>Super Value Deals - Save more with coupons</p>
          <button type="button">English ▾</button>
        </div>
      </div>

      <header className="store-header store-shell">
        <Link href="/" className="store-brand">
          <span className="store-brand-mark">🛒</span>
          <strong>FreshCart</strong>
        </Link>

        <label className="store-search" htmlFor="search-input">
          <span>🔎</span>
          <input id="search-input" type="search" placeholder="Search for products" />
        </label>

        <button type="button" className="store-location">
          📍 Location
        </button>

        <div className="store-actions">
          <Link href="/products" aria-label="wishlist">
            ♡
          </Link>
          <Link href="/admin" aria-label="account">
            👤
          </Link>
          <Link href="/cart" aria-label="cart">
            🛍️
          </Link>
        </div>
      </header>

      <nav className="store-nav store-shell">
        <button type="button" className="store-departments">
          ☰ All Departments
        </button>
        <div className="store-nav-links">
          {mainNav.map((item) => (
            <a key={item} href="#">
              {item}
            </a>
          ))}
        </div>
      </nav>

      <main className="store-shell store-main">
        <section className="store-hero">
          <div className="store-hero-copy">
            <span className="store-pill">Free Shipping - orders over $100</span>
            <h1>
              Free Shipping on
              <br />
              orders over <strong>$100</strong>
            </h1>
            <p>
              Free shipping to first-time customers only. After promotions and discounts are applied.
            </p>
            <div className="store-hero-cta">
              <Link href="/products" className="btn btn-primary">
                Shop Now
              </Link>
              <Link href="/checkout" className="btn btn-outline">
                Checkout
              </Link>
            </div>
          </div>
          <div className="store-hero-art" aria-hidden="true">
            <span>🥬</span>
            <span>🍋</span>
            <span>🍅</span>
            <span>🧅</span>
            <span>🌶️</span>
          </div>
        </section>

        <section className="store-categories">
          <h2>Featured Categories</h2>
          <div className="store-category-grid">
            {categoryTiles.map((cat) => (
              <article key={cat.name}>
                <span>{cat.icon}</span>
                <h3>{cat.name}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="store-promo-grid">
          <article>
            <div>
              <h3>Fruits & Vegetables</h3>
              <p>Get Upto 30% Off</p>
              <Link href="/products" className="btn btn-primary">
                Shop Now
              </Link>
            </div>
            <span aria-hidden="true">🥕</span>
          </article>
          <article>
            <div>
              <h3>Freshly Baked Buns</h3>
              <p>Get Upto 25% Off</p>
              <Link href="/products" className="btn btn-primary">
                Shop Now
              </Link>
            </div>
            <span aria-hidden="true">🥖</span>
          </article>
        </section>

        <section className="store-products">
          <div className="store-section-head">
            <h2>Popular Products</h2>
            <Link href="/products">Browse all</Link>
          </div>
          {message ? <div className="store-alert">{message}</div> : null}
          <div className="store-product-grid">
            {popularProducts.length === 0 ? (
              <div className="store-empty">Products will appear once added.</div>
            ) : (
              popularProducts.map((product) => (
                <article key={product.id} className="store-product-card">
                  <div className="store-product-media" aria-hidden="true">
                    {categoryEmoji(product.category)}
                  </div>
                  <div className="store-product-body">
                    <p>{product.category ?? "Grocery"}</p>
                    <h3>{product.name}</h3>
                    <div className="store-rating">★★★★★ <span>4.5</span></div>
                    <div className="store-product-buy">
                      <div>
                        <strong>${product.price.toFixed(2)}</strong>
                        <small>${(product.price * 1.18).toFixed(2)}</small>
                      </div>
                      <button className="btn btn-primary" type="button" onClick={() => handleAdd(product)}>
                        + Add
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="store-daily-best">
          <h2>Daily Best Sells</h2>
          <div className="store-daily-grid">
            <article className="store-daily-banner">
              <h3>100% Organic Coffee Beans.</h3>
              <p>Get the best deal before close.</p>
              <Link href="/products" className="btn btn-primary">
                Shop Now
              </Link>
            </article>
            {dailyBest.map((product) => (
              <article key={`daily-${product.id}`} className="store-daily-card">
                <div className="store-product-media" aria-hidden="true">
                  {categoryEmoji(product.category)}
                </div>
                <p>{product.category ?? "Groceries"}</p>
                <h3>{product.name}</h3>
                <div className="store-product-buy">
                  <div>
                    <strong>${product.price.toFixed(2)}</strong>
                    <small>${(product.price * 1.1).toFixed(2)}</small>
                  </div>
                  <button className="btn btn-primary" type="button" onClick={() => handleAdd(product)}>
                    + Add to Cart
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <section className="store-features store-shell">
        <article>
          <h3>10 minute grocery now</h3>
          <p>Get your order delivered to your doorstep at the earliest from FreshCart pickup stores near you.</p>
        </article>
        <article>
          <h3>Best Prices & Offers</h3>
          <p>Cheaper prices than your local supermarket, great cashback offers to top it off. Get best prices & offers.</p>
        </article>
        <article>
          <h3>Wide Assortment</h3>
          <p>Choose from 5000+ products across food, personal care, household and other categories.</p>
        </article>
        <article>
          <h3>Easy Returns</h3>
          <p>Not satisfied with a product? Return it at the doorstep and get a refund within hours.</p>
        </article>
      </section>

      <footer className="store-footer">
        <div className="store-shell store-footer-grid">
          <div>
            <h4>Categories</h4>
            <a href="#">Vegetables & Fruits</a>
            <a href="#">Breakfast & instant food</a>
            <a href="#">Bakery & Biscuits</a>
            <a href="#">Personal care</a>
          </div>
          <div>
            <h4>Get to know us</h4>
            <a href="#">Company</a>
            <a href="#">About</a>
            <a href="#">Blog</a>
            <a href="#">Help Center</a>
          </div>
          <div>
            <h4>For Consumers</h4>
            <a href="#">Payments</a>
            <a href="#">Shipping</a>
            <a href="#">Product Returns</a>
            <a href="#">FAQ</a>
          </div>
          <div>
            <h4>Become a Shopper</h4>
            <a href="#">Shopper Opportunities</a>
            <a href="#">Become a Shopper</a>
            <a href="#">Earnings</a>
            <a href="#">Ideas & Guides</a>
          </div>
        </div>
        <div className="store-shell store-footer-bottom">
          <p>© 2026 FreshCart inspired storefront template</p>
          <p>Get deliveries with FreshCart app</p>
        </div>
      </footer>
    </div>
  );
}
