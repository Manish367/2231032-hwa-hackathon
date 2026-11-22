const rupees = n => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const state = { products: [], cart: JSON.parse(localStorage.getItem("pawquest-cart") || "[]") };
const $ = selector => document.querySelector(selector);
const productVisual = id => id === "pawquest-station" ? `<div class="mini-station"><i></i><i></i><i></i></div>` : id === "scent-refill" ? `<div class="pocket-stack"><span></span><span></span><span></span></div>` : `<div class="challenge-shapes"><span>↔</span><span>✳</span><span>●</span></div>`;
const visualClass = id => id === "pawquest-station" ? "station-bg" : id === "scent-refill" ? "refill-bg" : "challenge-bg";

async function loadProducts() {
  try {
    const response = await fetch("/api/products");
    state.products = await response.json();
    renderProducts();
    renderCart();
  } catch {
    $("#product-grid").innerHTML = '<p class="loading">Could not load products. Please refresh the page.</p>';
  }
}
function renderProducts() {
  $("#product-grid").innerHTML = state.products.map(p => `
    <article class="product-card">
      <div class="product-image ${visualClass(p.id)}"><span class="product-badge">${p.badge}</span>${productVisual(p.id)}</div>
      <div class="product-info">
        <div class="product-meta"><span>${p.category}</span><span>★ ${p.rating} (${p.reviews})</span></div>
        <h3>${p.name}</h3><p>${p.tagline}</p>
        <div class="product-buy"><span class="price">${rupees(p.price)} <del>${rupees(p.compareAt)}</del></span><button class="add-button" data-add="${p.id}">+ Add to bag</button></div>
      </div>
    </article>`).join("");
  document.querySelectorAll("[data-add]").forEach(button => button.addEventListener("click", () => addToCart(button.dataset.add)));
}
function saveCart() { localStorage.setItem("pawquest-cart", JSON.stringify(state.cart)); renderCart(); }
function addToCart(id) {
  const item = state.cart.find(x => x.id === id);
  if (item) item.quantity = Math.min(10, item.quantity + 1);
  else state.cart.push({ id, quantity: 1 });
  saveCart(); showToast("Added to your bag ✳"); openCart();
}
function cartDetails() {
  return state.cart.map(item => {
    const product = state.products.find(p => p.id === item.id);
    return product ? { ...product, quantity: item.quantity } : null;
  }).filter(Boolean);
}
function renderCart() {
  const items = cartDetails();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  $("#cart-count").textContent = count;
  $("#drawer-count").textContent = `(${count})`;
  $("#cart-subtotal").textContent = rupees(total);
  $("#checkout-total").textContent = rupees(total);
  $("#cart-items").innerHTML = items.length ? items.map(item => `
    <div class="cart-line">
      <div class="cart-thumb">${item.id === "pawquest-station" ? "🐾" : item.id === "scent-refill" ? "🌿" : "✳"}</div>
      <div><h4>${item.name}</h4><small>${rupees(item.price)} each</small><div class="qty-control"><button data-qty="${item.id}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button data-qty="${item.id}" data-delta="1" aria-label="Increase quantity">+</button></div><button class="remove-item" data-remove="${item.id}">Remove</button></div>
      <strong style="font-size:11px">${rupees(item.price * item.quantity)}</strong>
    </div>`).join("") : '<div class="empty-cart">Your bag is waiting for a little joy. <a href="#shop" id="empty-shop">Explore the shop ↗</a></div>';
  document.querySelectorAll("[data-qty]").forEach(btn => btn.addEventListener("click", () => {
    const item = state.cart.find(x => x.id === btn.dataset.qty);
    if (!item) return;
    item.quantity += Number(btn.dataset.delta);
    if (item.quantity <= 0) state.cart = state.cart.filter(x => x.id !== item.id);
    if (item.quantity > 10) item.quantity = 10;
    saveCart();
  }));
  document.querySelectorAll("[data-remove]").forEach(btn => btn.addEventListener("click", () => {
    state.cart = state.cart.filter(x => x.id !== btn.dataset.remove); saveCart();
  }));
  const emptyShop = $("#empty-shop");
  if (emptyShop) emptyShop.addEventListener("click", closeCart);
}
function openCart() { $("#cart-drawer").classList.add("open"); $("#cart-drawer").setAttribute("aria-hidden", "false"); $("#drawer-backdrop").classList.add("show"); }
function closeCart() { $("#cart-drawer").classList.remove("open"); $("#cart-drawer").setAttribute("aria-hidden", "true"); $("#drawer-backdrop").classList.remove("show"); }
function showToast(message) { const toast = $("#toast"); toast.textContent = message; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 2200); }

$("#cart-open").addEventListener("click", openCart);
$("#cart-close").addEventListener("click", closeCart);
$("#drawer-backdrop").addEventListener("click", closeCart);
$("#checkout-open").addEventListener("click", () => {
  if (!state.cart.length) { showToast("Add something to your bag first."); return; }
  closeCart(); $("#checkout-modal").classList.add("show");
});
$("#checkout-close").addEventListener("click", () => $("#checkout-modal").classList.remove("show"));
$("#checkout-modal").addEventListener("click", e => { if (e.target.id === "checkout-modal") $("#checkout-modal").classList.remove("show"); });
$("#checkout-form").addEventListener("submit", async e => {
  e.preventDefault();
  const button = $("#place-order"), error = $("#checkout-error");
  error.textContent = ""; button.disabled = true; button.textContent = "Placing your order…";
  const form = new FormData(e.currentTarget);
  const customer = Object.fromEntries(form.entries());
  try {
    const response = await fetch("/api/orders", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer, items: state.cart })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not place order.");
    state.cart = []; saveCart(); $("#checkout-modal").classList.remove("show"); e.currentTarget.reset();
    showToast(`Order ${result.order.id} received — thank you!`);
    setTimeout(() => alert(`Thanks for your order!\\n\\nOrder ID: ${result.order.id}\\nTotal: ${rupees(result.order.total)}\\n\\nThis is a demo order; no payment was collected.`), 150);
  } catch (err) { error.textContent = err.message; }
  finally { button.disabled = false; button.innerHTML = 'Place demo order <span>→</span>'; }
});
$("#newsletter-form").addEventListener("submit", e => {
  e.preventDefault(); $("#newsletter-message").textContent = "You're on the list! Thanks for joining us ✳"; e.currentTarget.reset();
});
loadProducts();
