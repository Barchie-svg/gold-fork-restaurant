/* admin/menu.js */
let menuItems = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAdmin()) return;
  injectAdminSidebar('menu');
  await loadMenuItems();
  document.getElementById('menu-search').addEventListener('input', renderTable);
  document.getElementById('cat-filter').addEventListener('change', renderTable);
});

async function loadMenuItems() {
  try {
    const res = await api.menu.getAll();
    menuItems = res.data || [];
    renderTable();
  } catch {
    document.getElementById('menu-tbody').innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:2rem;">Could not load menu items</td></tr>';
  }
}

function renderTable() {
  const q = (document.getElementById('menu-search').value || '').toLowerCase();
  const cat = document.getElementById('cat-filter').value;
  const filtered = menuItems.filter(i =>
    (!cat || i.category === cat) &&
    (!q || i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
  );
  const tbody = document.getElementById('menu-tbody');
  if (!filtered.length) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:2rem;">No items found</td></tr>'; return; }
  tbody.innerHTML = filtered.map(item => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:.75rem;">
          <div class="menu-thumb">${item.image ? `<img src="/${item.image}" alt="${item.name}" />` : getCategoryEmoji(item.category)}</div>
          <div>
            <div style="font-weight:600;color:var(--text-primary);">${item.name}</div>
            <div style="font-size:.8rem;color:var(--text-muted);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.description}</div>
          </div>
        </div>
      </td>
      <td><span class="badge badge-pending" style="background:rgba(201,168,76,.1);color:var(--gold);">${item.category}</span></td>
      <td><strong style="color:var(--gold);">${formatKES(item.price)}</strong></td>
      <td>
        <label class="toggle">
          <input type="checkbox" ${item.available ? 'checked' : ''} onchange="toggleField('${item._id}','available',this.checked)" />
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td>
        <label class="toggle">
          <input type="checkbox" ${item.featured ? 'checked' : ''} onchange="toggleField('${item._id}','featured',this.checked)" />
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td>
        <div class="table-actions">
          <button class="btn btn-outline" style="font-size:.78rem;padding:.3rem .7rem;" onclick="editMenuItem('${item._id}')"><i class="fas fa-edit"></i></button>
          <button class="btn btn-danger" style="font-size:.78rem;padding:.3rem .7rem;" onclick="deleteMenuItem('${item._id}','${item.name}')"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');
}

function openMenuModal(item = null) {
  document.getElementById('item-id').value = item ? item._id : '';
  document.getElementById('modal-title').textContent = item ? 'Edit Menu Item' : 'Add Menu Item';
  document.getElementById('f-name').value = item ? item.name : '';
  document.getElementById('f-category').value = item ? item.category : '';
  document.getElementById('f-desc').value = item ? item.description : '';
  document.getElementById('f-price').value = item ? item.price : '';
  document.getElementById('f-available').checked = item ? item.available : true;
  document.getElementById('f-featured').checked = item ? item.featured : false;
  document.getElementById('f-image').value = '';
  document.getElementById('menu-modal').style.display = 'flex';
}

function closeMenuModal() {
  document.getElementById('menu-modal').style.display = 'none';
}

function editMenuItem(id) {
  const item = menuItems.find(i => i._id === id);
  if (item) openMenuModal(item);
}

async function toggleField(id, field, value) {
  try {
    const fd = new FormData();
    fd.append(field, value);
    await api.menu.update(id, fd);
    const item = menuItems.find(i => i._id === id);
    if (item) item[field] = value;
  } catch (err) {
    showToast(err.message || 'Update failed', 'error');
    await loadMenuItems();
  }
}

async function saveMenuItem() {
  const btn = document.getElementById('save-menu-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…';

  const id = document.getElementById('item-id').value;
  const fd = new FormData();
  fd.append('name', document.getElementById('f-name').value.trim());
  fd.append('category', document.getElementById('f-category').value);
  fd.append('description', document.getElementById('f-desc').value.trim());
  fd.append('price', document.getElementById('f-price').value);
  fd.append('available', document.getElementById('f-available').checked);
  fd.append('featured', document.getElementById('f-featured').checked);
  const imgFile = document.getElementById('f-image').files[0];
  if (imgFile) fd.append('image', imgFile);

  try {
    if (id) { await api.menu.update(id, fd); showToast('Item updated!'); }
    else { await api.menu.create(fd); showToast('Item added!'); }
    closeMenuModal();
    await loadMenuItems();
  } catch (err) {
    showToast(err.message || 'Save failed', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Save';
  }
}

async function deleteMenuItem(id, name) {
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
  try {
    await api.menu.delete(id);
    showToast(`"${name}" deleted`);
    await loadMenuItems();
  } catch (err) {
    showToast(err.message || 'Delete failed', 'error');
  }
}
