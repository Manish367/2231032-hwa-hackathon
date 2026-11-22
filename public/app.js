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
  $("#product-grid").innerHTML = state.products.map((p, index) => `
    <article class="product-card">
      <div class="product-image ${visualClass(p.id)}"><span class="product-badge">${escapeHtml(p.badge)}</span><img class="product-real-image" src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="${index < 6 ? "eager" : "lazy"}" decoding="async"></div>
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
      <div class="cart-thumb"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}"></div>
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

const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));

function closeOrders() {
  if (!$("#orders-drawer")) return;
  $("#orders-drawer").classList.remove("open");
  $("#orders-drawer").setAttribute("aria-hidden", "true");
  if (!$("#cart-drawer")?.classList.contains("open")) $("#drawer-backdrop").classList.remove("show");
}

async function loadOrders(openDrawer = false) {
  if (!$("#orders-list")) return;
  const count = $("#orders-count");
  const drawerCount = $("#orders-drawer-count");
  const list = $("#orders-list");
  list.innerHTML = '<div class="empty-cart">Loading orders…</div>';
  try {
    const response = await fetch("/api/admin/orders");
    if (!response.ok) throw new Error("Could not load placed orders.");
    const orders = await response.json();
    if (count) count.textContent = orders.length;
    if (drawerCount) drawerCount.textContent = `(${orders.length})`;
    if (!orders.length) {
      list.innerHTML = '<div class="empty-cart">No orders placed yet.</div>';
    } else {
      list.innerHTML = orders.map(order => `
        <div class="order-list-row">
          <button class="order-list-item" data-order-id="${escapeHtml(order.id)}">
            <span><strong>${escapeHtml(order.id)}</strong><small>${escapeHtml(new Date(order.createdAt).toLocaleString())}</small></span>
            <span><strong>${rupees(order.total)}</strong><small>${escapeHtml(order.status)}</small></span>
          </button>
          <button class="order-delete-button" data-delete-order="${escapeHtml(order.id)}" aria-label="Delete order ${escapeHtml(order.id)}">Delete</button>
        </div>`).join("");
      list.querySelectorAll("[data-order-id]").forEach(button => {
        button.addEventListener("click", () => showOrderDetails(button.dataset.orderId, orders));
      });
      list.querySelectorAll("[data-delete-order]").forEach(button => {
        button.addEventListener("click", () => deleteOrder(button.dataset.deleteOrder));
      });
    }
  } catch (error) {
    list.innerHTML = `<div class="empty-cart">${escapeHtml(error.message)}</div>`;
  }
  if (openDrawer) {
    if ($("#cart-drawer")) closeCart();
    $("#orders-drawer").classList.add("open");
    $("#orders-drawer").setAttribute("aria-hidden", "false");
    $("#drawer-backdrop").classList.add("show");
  }
}

function showOrderDetails(orderId, orders) {
  const order = orders.find(item => item.id === orderId);
  if (!order) return;
  $("#orders-list").innerHTML = `
    <button class="order-back" id="orders-back">← Back to all orders</button>
    <div class="order-detail">
      <p class="eyebrow">ORDER DETAILS</p>
      <div class="order-detail-title"><h3>${escapeHtml(order.id)}</h3><button class="order-delete-button" id="detail-delete-order" data-delete-order="${escapeHtml(order.id)}">Delete</button></div>
      <div class="order-detail-row"><span>Status</span><strong>${escapeHtml(order.status)}</strong></div>
      <div class="order-detail-row"><span>Placed</span><strong>${escapeHtml(new Date(order.createdAt).toLocaleString())}</strong></div>
      <div class="order-detail-section"><strong>Customer</strong><span>${escapeHtml(order.customer.name)}</span><span>${escapeHtml(order.customer.email)}</span><span>${escapeHtml(order.customer.phone || "No phone provided")}</span></div>
      <div class="order-detail-section"><strong>Delivery address</strong><span>${escapeHtml(order.customer.address)}</span><span>${escapeHtml(order.customer.city)} - ${escapeHtml(order.customer.postalCode)}</span></div>
      <div class="order-detail-section"><strong>Items</strong>${order.items.map(item => `<div class="order-detail-item"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}"><div><span>${escapeHtml(item.name)} × ${item.quantity}</span><strong>${rupees(item.price * item.quantity)}</strong></div></div>`).join("")}</div>
      <div class="order-detail-total"><span>Total</span><strong>${rupees(order.total)}</strong></div>
    </div>`;
  $("#orders-back").addEventListener("click", () => loadOrders());
  $("#detail-delete-order").addEventListener("click", () => deleteOrder(order.id));
}

async function deleteOrder(orderId) {
  if (!window.confirm(`Delete order ${orderId}?`)) return;
  try {
    const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not delete the order.");
    showToast(`Order ${orderId} deleted`);
    await loadOrders(true);
  } catch (error) {
    showToast(error.message);
  }
}

if ($("#cart-open")) $("#cart-open").addEventListener("click", openCart);
if ($("#cart-close")) $("#cart-close").addEventListener("click", closeCart);
if ($("#orders-open")) $("#orders-open").addEventListener("click", () => loadOrders(true));
if ($("#orders-close")) $("#orders-close").addEventListener("click", closeOrders);
if ($("#drawer-backdrop")) $("#drawer-backdrop").addEventListener("click", () => { closeCart(); closeOrders(); });
if ($("#checkout-open")) $("#checkout-open").addEventListener("click", () => {
  if (!state.cart.length) { showToast("Add something to your bag first."); return; }
  closeCart(); $("#checkout-modal").classList.add("show");
});
if ($("#checkout-close")) $("#checkout-close").addEventListener("click", () => $("#checkout-modal").classList.remove("show"));
if ($("#confirmation-close")) $("#confirmation-close").addEventListener("click", () => {
  $("#confirmation-modal").classList.remove("show");
  $("#drawer-backdrop").classList.remove("show");
});
if ($("#checkout-modal")) $("#checkout-modal").addEventListener("click", e => { if (e.target.id === "checkout-modal") $("#checkout-modal").classList.remove("show"); });
if ($("#checkout-form")) $("#checkout-form").addEventListener("submit", async e => {
  e.preventDefault();
  const checkoutForm = e.currentTarget;
  const button = $("#place-order"), error = $("#checkout-error");
  error.textContent = ""; button.disabled = true; button.textContent = "Placing your order…";
  const form = new FormData(checkoutForm);
  const customer = Object.fromEntries(form.entries());
  try {
    const response = await fetch("/api/orders", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer, items: state.cart })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not place order.");
    state.cart = []; saveCart(); $("#checkout-modal").classList.remove("show"); checkoutForm.reset();
    localStorage.setItem("pawquest-last-order", JSON.stringify({ order: result.order, total: result.order.total }));
    showToast(`Order ${result.order.id} received — thank you!`);
    document.getElementById("confirm-order-id-modal").textContent = result.order.id;
    document.getElementById("confirm-total-modal").textContent = rupees(result.order.total);
    $("#confirm-products-modal").innerHTML = result.order.items.map(item => `
      <div class="confirmation-product">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
        <div><strong>${escapeHtml(item.name)}</strong><span>Qty ${item.quantity}</span></div>
      </div>`).join("");
    $("#checkout-error").textContent = "";
    $("#confirmation-modal").classList.add("show");
    $("#drawer-backdrop").classList.add("show");
    setTimeout(() => { location.href = "/confirmation.html"; }, 3000);
  } catch (err) { error.textContent = err.message; }
  finally { button.disabled = false; button.innerHTML = 'Place demo order <span>→</span>'; }
});
if ($("#newsletter-form")) $("#newsletter-form").addEventListener("submit", e => {
  e.preventDefault(); $("#newsletter-message").textContent = "You're on the list! Thanks for joining us ✳"; e.currentTarget.reset();
});
if ($("#product-grid")) loadProducts();
loadOrders();
