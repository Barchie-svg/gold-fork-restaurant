/* =============================================
   THE GOLDEN FORK — CART (cart.js)
   ============================================= */

const Cart = {
  STORAGE_KEY: 'gf_cart',

  get() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  },

  save(items) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    this.updateBadge();
    this.renderSidebar();
  },

  add(item) {
    const items = this.get();
    const existing = items.find(i => i._id === item._id);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      items.push({ ...item, quantity: 1 });
    }
    this.save(items);
  },

  remove(itemId) {
    const items = this.get().filter(i => i._id !== itemId);
    this.save(items);
  },

  updateQty(itemId, qty) {
    if (qty < 1) { this.remove(itemId); return; }
    const items = this.get();
    const item = items.find(i => i._id === itemId);
    if (item) item.quantity = qty;
    this.save(items);
  },

  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.updateBadge();
    this.renderSidebar();
  },

  total() {
    return this.get().reduce((sum, i) => sum + i.price * i.quantity, 0);
  },

  count() {
    return this.get().reduce((sum, i) => sum + i.quantity, 0);
  },

  updateBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    const count = this.count();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  },

  renderSidebar() {
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total-amount');
    if (!container) return;

    const items = this.get();

    if (items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <i class="fas fa-shopping-basket"></i>
          <p>Your cart is empty</p>
          <small>Add items from the menu to get started</small>
        </div>`;
    } else {
      container.innerHTML = items.map(item => `
        <div class="cart-item">
          <div class="cart-item-emoji">${getCategoryEmoji(item.category)}</div>
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">${formatKES(item.price)}</div>
            <div class="cart-qty-controls">
              <button onclick="Cart.updateQty('${item._id}', ${item.quantity - 1})">−</button>
              <span>${item.quantity}</span>
              <button onclick="Cart.updateQty('${item._id}', ${item.quantity + 1})">+</button>
            </div>
          </div>
          <button class="cart-remove" onclick="Cart.remove('${item._id}')" title="Remove">
            <i class="fas fa-trash"></i>
          </button>
        </div>`).join('');
    }

    if (totalEl) totalEl.textContent = formatKES(this.total());
  },

  openSidebar() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    this.renderSidebar();
  },

  closeSidebar() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  },
};
