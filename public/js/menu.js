/* menu.js */
let allItems = [];
let activeCategory = '';

document.addEventListener('DOMContentLoaded', () => {
  loadMenu();

  // Category filters
  document.getElementById('cat-filters').addEventListener('click', e => {
    const btn = e.target.closest('.cat-btn');
    if (!btn) return;
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = btn.dataset.cat;
    renderMenu();
  });

  // Search
  document.getElementById('menu-search').addEventListener('input', renderMenu);

  // Float cart
  updateFloatCart();
});

async function loadMenu() {
  try {
    const res = await api.menu.getAll();
    allItems = res.data || [];
    renderMenu();
  } catch {
    document.getElementById('menu-grid').innerHTML = `<p class="no-results"><i class="fas fa-exclamation-circle"></i>Could not load menu. Please try again.</p>`;
  }
}

function renderMenu() {
  const query = (document.getElementById('menu-search').value || '').toLowerCase();
  const filtered = allItems.filter(item => {
    const matchCat = !activeCategory || item.category === activeCategory;
    const matchSearch = !query || item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
    return matchCat && matchSearch;
  });

  const grid = document.getElementById('menu-grid');
  if (!filtered.length) {
    grid.innerHTML = `<div class="no-results"><i class="fas fa-search"></i><p>No dishes found. Try a different search or category.</p></div>`;
    return;
  }

  grid.innerHTML = filtered.map(item => `
    <div class="m-card">
      <div class="m-img">
        ${item.image ? `<img src="/${item.image}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;">` : getCategoryEmoji(item.category)}
        ${item.featured ? '<span class="m-badge">★ Featured</span>' : ''}
        ${!item.available ? '<div class="m-unavailable">Unavailable</div>' : ''}
      </div>
      <div class="m-body">
        <div class="m-cat">${item.category}</div>
        <div class="m-name">${item.name}</div>
        <div class="m-desc">${item.description}</div>
        <div class="m-footer">
          <span class="m-price">${formatKES(item.price)}</span>
          <button class="btn btn-primary" style="font-size:.82rem;padding:.45rem 1rem;"
            onclick="addItem(${JSON.stringify(item).replace(/"/g,'&quot;')})"
            ${!item.available ? 'disabled style="opacity:.5;cursor:not-allowed;"' : ''}>
            🛒 Add
          </button>
        </div>
      </div>
    </div>
  `).join('');

  updateFloatCart();
}

function addItem(item) {
  Cart.add(item);
  showToast(`${item.name} added to cart!`);
  updateFloatCart();
}

function updateFloatCart() {
  const btn = document.getElementById('float-cart-btn');
  const countEl = document.getElementById('float-cart-count');
  if (!btn) return;
  const count = Cart.count();
  if (countEl) countEl.textContent = count;
  btn.style.display = count > 0 ? 'flex' : 'none';
}
