import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || "/api/v1";
const formatINR = (value) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
}).format(Number(value) || 0);
const FREE_SHIPPING_THRESHOLD = 75;
const SHIPPING_FEE = 8;
const fallbackProducts = [
  { _id: "demo-1", name: "Studio Everyday Tote", product_description: "A considered carry-all for busy days, crafted in durable canvas.", price: 68, ratings: 4.8, product_category: "Lifestyle", Stock: 12, image: [{ product_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80" }] },
  { _id: "demo-2", name: "Cloud Knit Throw", product_description: "Soft texture and an easy palette for a calmer corner at home.", price: 92, ratings: 4.6, product_category: "Home", Stock: 8, image: [{ product_url: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=80" }] },
  { _id: "demo-3", name: "Contour Ceramic Set", product_description: "Hand-finished forms that make everyday rituals feel special.", price: 54, ratings: 4.9, product_category: "Home", Stock: 20, image: [{ product_url: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=80" }] },
  { _id: "demo-4", name: "Daily Field Jacket", product_description: "Lightweight utility, refined for the everyday.", price: 148, ratings: 4.7, product_category: "Apparel", Stock: 5, image: [{ product_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80" }] }
];

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, { credentials: "include", headers: { "Content-Type": "application/json", ...options.headers }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

function imageFor(product) {
  return product?.image?.[0]?.product_url || product?.image?.[0]?.url || fallbackProducts[0].image[0].product_url;
}

function App() {
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("sandium-cart") || "[]"));
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { localStorage.setItem("sandium-cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { request("/me").then((data) => setUser(data.user)).catch(() => {}); }, []);
  const addToCart = (product) => setCart((items) => {
    const found = items.find((item) => item._id === product._id);
    return found ? items.map((item) => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { ...product, quantity: 1 }];
  });
  const removeFromCart = (id) => setCart((items) => items.filter((item) => item._id !== id));
  return <div className="app-shell">
    <Header cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} user={user} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    <Routes>
      <Route path="/" element={<Home addToCart={addToCart} />} />
      <Route path="/shop" element={<Shop addToCart={addToCart} />} />
      <Route path="/product/:id" element={<ProductPage addToCart={addToCart} />} />
      <Route path="/cart" element={<Cart cart={cart} setCart={setCart} removeFromCart={removeFromCart} />} />
      <Route path="/login" element={<Auth onLogin={setUser} />} />
      <Route path="/orders" element={<Orders user={user} />} />
      <Route path="*" element={<Home addToCart={addToCart} />} />
    </Routes>
    <Footer />
  </div>;
}

function Header({ cartCount, user, menuOpen, setMenuOpen }) {
  return <header className="site-header"><div className="header-inner">
    <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">☰</button>
    <Link to="/" className="brand">SANDIUM<span>•</span></Link>
    <nav className={menuOpen ? "nav-links open" : "nav-links"}><Link to="/shop">Shop</Link><a href="/#story">Our story</a><a href="/#journal">Journal</a></nav>
    <div className="header-actions"><Link to="/login" className="profile-link" aria-label="Account">{user ? user.name.split(" ")[0] : "Account"}</Link><Link to="/cart" className="cart-link">Bag <b>{cartCount}</b></Link></div>
  </div></header>;
}

function Home({ addToCart }) {
  return <main><section className="hero"><div className="hero-copy"><p className="eyebrow">THE OBJECTS EDIT · 2025</p><h1>Make room for<br /><em>the good things.</em></h1><p className="hero-text">Thoughtfully designed objects for a life well lived. Less, but better.</p><Link className="button button-light" to="/shop">Explore the collection <span>↗</span></Link></div><div className="hero-image" /></section>
    <section className="trust-strip"><span>Free shipping over {formatINR(FREE_SHIPPING_THRESHOLD)}</span><span>Small-batch, always</span><span>30-day easy returns</span></section>
    <section className="section featured"><div className="section-heading"><div><p className="eyebrow">CURATED FOR YOU</p><h2>New in the studio</h2></div><Link className="text-link" to="/shop">View all products ↗</Link></div><ProductGrid addToCart={addToCart} limit={4} /></section>
    <section className="story" id="story"><div className="story-image" /><div className="story-copy"><p className="eyebrow">A LITTLE MORE INTENTION</p><h2>Good design<br /><em>has a feeling.</em></h2><p>We look for the beautiful, useful, and enduring — from makers who care about the details as much as we do.</p><Link className="text-link" to="/shop">Discover our point of view ↗</Link></div></section>
    <section className="newsletter" id="journal"><p className="eyebrow">THE SANDIUM LETTER</p><h2>A thoughtful note,<br /><em>once in a while.</em></h2><form onSubmit={(e) => e.preventDefault()}><input type="email" placeholder="Your email address" aria-label="Email address" /><button className="button button-dark">Subscribe ↗</button></form></section>
  </main>;
}

function Shop({ addToCart }) {
  const [params, setParams] = useSearchParams(); const [query, setQuery] = useState(params.get("keyword") || "");
  const category = params.get("category") || "All";
  return <main className="shop-page"><div className="shop-heading"><div><p className="eyebrow">THE COLLECTION</p><h1>Things with a<br /><em>point of view.</em></h1></div><p className="shop-intro">A considered edit of pieces made to be used, loved, and lived with.</p></div>
    <div className="shop-toolbar"><div className="categories">{["All", "Home", "Lifestyle", "Apparel"].map((item) => <button className={category === item ? "active" : ""} key={item} onClick={() => setParams(item === "All" ? {} : { category: item })}>{item}</button>)}</div><label className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search collection" /></label></div>
    <ProductGrid addToCart={addToCart} query={query} category={category} />
  </main>;
}

function ProductGrid({ addToCart, query = "", category = "All", limit }) {
  const [products, setProducts] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { request(`/products?keyword=${encodeURIComponent(query)}`).then((data) => setProducts(data.products || [])).catch((e) => setError(e.message)).finally(() => setLoading(false)); }, [query]);
  const shown = useMemo(() => (products.length ? products : fallbackProducts).filter((p) => category === "All" || p.product_category === category).slice(0, limit || 50), [products, category, limit]);
  if (loading) return <div className="loading-grid">{[1, 2, 3, 4].map((x) => <div className="skeleton" key={x} />)}</div>;
  return <>{error && <div className="notice">Live catalog unavailable — showing a preview collection.</div>}<div className="product-grid">{shown.map((product) => <ProductCard key={product._id} product={product} addToCart={addToCart} />)}</div>{!shown.length && <div className="empty-state">No pieces matched your search.</div>}</>;
}

function ProductCard({ product, addToCart }) {
  return <article className="product-card"><Link to={`/product/${product._id}`} className="product-image"><img src={imageFor(product)} alt={product.name} /><span className="quick-add" onClick={(e) => { e.preventDefault(); addToCart(product); }}>Add to bag</span></Link><div className="product-meta"><div><p className="product-category">{product.product_category || "Collection"}</p><Link to={`/product/${product._id}`}><h3>{product.name}</h3></Link></div><strong>{formatINR(product.price)}</strong></div><div className="rating">★★★★★ <span>{Number(product.ratings || 0).toFixed(1)}</span></div></article>;
}

function ProductPage({ addToCart }) {
  const { id } = useParams(); const [product, setProduct] = useState(null); const [quantity, setQuantity] = useState(1); const [error, setError] = useState("");
  useEffect(() => { request(`/product/${id}`).then((data) => setProduct(data.product)).catch(() => { const local = fallbackProducts.find((item) => item._id === id); if (local) setProduct(local); else setError("This product could not be found."); }); }, [id]);
  if (error) return <main className="empty-state page-empty"><h2>{error}</h2><Link className="button button-dark" to="/shop">Back to shop</Link></main>;
  if (!product) return <div className="page-loading">Loading product…</div>;
  return <main className="detail-page"><div className="detail-image"><img src={imageFor(product)} alt={product.name} /></div><div className="detail-info"><p className="eyebrow">{product.product_category || "THE COLLECTION"}</p><h1>{product.name}</h1><div className="detail-rating">★★★★★ <span>{Number(product.ratings || 0).toFixed(1)} · {product.numOfReviews || 0} reviews</span></div><p className="detail-price">{formatINR(product.price)}</p><p className="detail-description">{product.product_description}</p><div className="quantity"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><span>{quantity}</span><button onClick={() => setQuantity(quantity + 1)}>+</button></div><button className="button button-dark add-button" onClick={() => { for (let i = 0; i < quantity; i++) addToCart(product); }}>Add to bag — {formatINR(Number(product.price || 0) * quantity)}</button><div className="detail-perks"><span>♧ <b>Made to last</b><small>Considered materials, honest construction.</small></span><span>↺ <b>Easy returns</b><small>30 days to decide, no questions asked.</small></span></div></div></main>;
}

function Cart({ cart, setCart, removeFromCart }) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0); const update = (id, quantity) => setCart(cart.map((item) => item._id === id ? { ...item, quantity: Math.max(1, quantity) } : item));
  if (!cart.length) return <main className="empty-state page-empty"><p className="eyebrow">YOUR BAG</p><h1>Quietly empty.</h1><p>There are plenty of good things waiting for you.</p><Link className="button button-dark" to="/shop">Explore the collection</Link></main>;
  return <main className="cart-page"><div className="section-heading"><div><p className="eyebrow">YOUR BAG</p><h1>Your considered<br /><em>selection.</em></h1></div></div><div className="cart-layout"><div className="cart-items">{cart.map((item) => <div className="cart-item" key={item._id}><img src={imageFor(item)} alt={item.name} /><div className="cart-item-info"><p className="product-category">{item.product_category}</p><h3>{item.name}</h3><p>{formatINR(item.price)}</p><div className="quantity"><button onClick={() => update(item._id, item.quantity - 1)}>−</button><span>{item.quantity}</span><button onClick={() => update(item._id, item.quantity + 1)}>+</button></div></div><button className="remove" onClick={() => removeFromCart(item._id)}>Remove</button></div>)}</div><aside className="summary"><p className="eyebrow">ORDER SUMMARY</p><div><span>Subtotal</span><b>{formatINR(subtotal)}</b></div><div><span>Shipping</span><span>{subtotal >= FREE_SHIPPING_THRESHOLD ? "Free" : formatINR(SHIPPING_FEE)}</span></div><hr /><div className="total"><span>Total</span><b>{formatINR(subtotal + (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE))}</b></div><Link className="button button-dark checkout-button" to="/login">Continue to checkout ↗</Link><small>Taxes calculated at checkout. Secure payments.</small></aside></div></main>;
}

function Auth({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false); const [form, setForm] = useState({ name: "", email: "", password: "" }); const [error, setError] = useState(""); const navigate = useNavigate();
  const submit = async (e) => { e.preventDefault(); setError(""); try { const data = await request(isRegister ? "/register" : "/login", { method: "POST", body: JSON.stringify(form) }); onLogin(data.user); navigate("/"); } catch (e) { setError(e.message); } };
  return <main className="auth-page"><div className="auth-card"><p className="eyebrow">{isRegister ? "WELCOME IN" : "WELCOME BACK"}</p><h1>{isRegister ? "Join the good<br /><em>things.</em>" : "Good to see<br /><em>you again.</em>"}</h1><form onSubmit={submit}>{isRegister && <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}<input required type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><input required minLength="8" type="password" placeholder="Password (8+ characters)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />{error && <p className="form-error">{error}</p>}<button className="button button-dark" type="submit">{isRegister ? "Create account ↗" : "Sign in ↗"}</button></form><button className="switch-auth" onClick={() => setIsRegister(!isRegister)}>{isRegister ? "Already have an account? Sign in" : "New to Sandium? Create an account"}</button></div></main>;
}

function Orders({ user }) {
  const [orders, setOrders] = useState([]); useEffect(() => { if (user) request("/orders/me").then((data) => setOrders(data.orders || [])).catch(() => {}); }, [user]);
  if (!user) return <main className="empty-state page-empty"><h2>Sign in to see your orders.</h2><Link className="button button-dark" to="/login">Sign in</Link></main>;
  return <main className="orders-page"><p className="eyebrow">YOUR ACCOUNT</p><h1>Your orders.</h1>{orders.length ? orders.map((order) => <div className="order-row" key={order._id}><span>#{order._id.slice(-7).toUpperCase()}</span><span>{new Date(order.createdAt).toLocaleDateString()}</span><b>{order.orderStatus}</b><strong>{formatINR(order.totalPrice)}</strong></div>) : <p className="muted">Your order history will appear here.</p>}</main>;
}

function Footer() { return <footer><div className="footer-brand">SANDIUM<span>•</span><p>Better things, thoughtfully chosen.</p></div><div className="footer-links"><div><b>Explore</b><Link to="/shop">Shop all</Link><a href="/#story">Our story</a><a href="/#journal">The journal</a></div><div><b>Help</b><span>Shipping & returns</span><span>Contact us</span><span>FAQs</span></div></div><small>© 2025 Sandium. Made with intention.</small></footer>; }

createRoot(document.getElementById("root")).render(<BrowserRouter><App /></BrowserRouter>);
