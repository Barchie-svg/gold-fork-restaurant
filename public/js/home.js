/* home.js — The Golden Fork Home Page */

document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([loadFeaturedMenu(), loadReviews()]);
});

async function loadFeaturedMenu() {
  const container = document.getElementById('featured-menu');
  if (!container) return;
  try {
    const res = await api.menu.getFeatured();
    const items = (res.data || []).slice(0, 6);
    if (!items.length) {
      container.innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;">No featured items yet.</p>';
      return;
    }
    container.innerHTML = items.map(item => `
      <div class="menu-card">
        <div class="menu-card-img">${getCategoryEmoji(item.category)}</div>
        <div class="menu-card-body">
          <div class="menu-card-category">${item.category}</div>
          <div class="menu-card-name">${item.name}</div>
          <div class="menu-card-desc">${item.description}</div>
          <div class="menu-card-footer">
            <span class="menu-price">${formatKES(item.price)}</span>
            <button class="btn btn-primary" style="font-size:.82rem;padding:.45rem 1rem;"
              onclick="addToCartFromHome(${JSON.stringify(item).replace(/"/g, '&quot;')})">
              🛒 Add to Cart
            </button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;">Could not load menu. <a href="/menu.html" style="color:var(--gold)">View full menu →</a></p>`;
  }
}

function addToCartFromHome(item) {
  Cart.add(item);
  showToast(`${item.name} added to cart!`);
  Cart.openSidebar();
}

async function loadReviews() {
  const container = document.getElementById('home-reviews');
  if (!container) return;
  try {
    const res = await api.reviews.getApproved();
    const reviews = (res.data || []).slice(0, 3);
    if (!reviews.length) {
      container.innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;">No reviews yet.</p>';
      return;
    }
    container.innerHTML = reviews.map(r => `
      <div class="review-card">
        <div class="review-card-top">
          <div class="review-avatar">${getInitials(r.customerName)}</div>
          <div>
            <div class="review-name">${r.customerName}</div>
            <div class="review-date">${formatDate(r.createdAt)}</div>
          </div>
        </div>
        <div style="margin-bottom:.6rem;">${renderStars(r.rating)}</div>
        <p class="review-comment">"${r.comment}"</p>
      </div>
    `).join('');
  } catch {
    container.innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;">Could not load reviews.</p>';
  }
}
