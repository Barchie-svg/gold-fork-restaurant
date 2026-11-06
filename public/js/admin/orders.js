/* admin/orders.js */
let currentPage = 1;
let totalPages = 1;

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAdmin()) return;
  injectAdminSidebar('orders');
  await loadOrders();
  document.getElementById('status-filter').addEventListener('change', () => { currentPage = 1; loadOrders(); });
  document.getElementById('order-search').addEventListener('input', () => { currentPage = 1; loadOrders(); });
});

async function loadOrders() {
  const status = document.getElementById('status-filter').value;
  const params = `?page=${currentPage}&limit=15${status ? '&status=' + status : ''}`;
  try {
    const res = await api.orders.getAll(params);
    totalPages = res.pages || 1;
    renderOrders(res.data || []);
    renderPagination(res.total || 0);
  } catch {
    document.getElementById('orders-tbody').innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:2rem;">Could not load orders</td></tr>';
  }
}

function renderOrders(orders) {
  const q = (document.getElementById('order-search').value || '').toLowerCase();
  const filtered = q ? orders.filter(o => o.customerName.toLowerCase().includes(q) || o.customerPhone.includes(q)) : orders;
  const tbody = document.getElementById('orders-tbody');
  if (!filtered.length) { tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:2rem;">No orders found</td></tr>'; return; }
  tbody.innerHTML = filtered.map(o => `
    <tr>
      <td><code style="color:var(--gold);font-size:.82rem;">#${String(o._id).slice(-6).toUpperCase()}</code></td>
      <td><div style="font-weight:600;">${o.customerName}</div><div style="font-size:.8rem;color:var(--text-muted);">${o.customerEmail || ''}</div></td>
      <td style="color:var(--text-muted);font-size:.88rem;">${o.customerPhone || '—'}</td>
      <td>${o.items.length}</td>
      <td><strong style="color:var(--gold);">${formatKES(o.totalAmount)}</strong></td>
      <td><div>${statusBadge(o.paymentStatus)}</div><div style="font-size:.78rem;color:var(--text-muted);margin-top:.25rem;">${o.paymentMethod}</div></td>
      <td style="color:var(--text-muted);font-size:.82rem;">${formatDateTime(o.createdAt)}</td>
      <td>
        <select style="background:var(--bg-elevated);border:1px solid var(--border-color);border-radius:4px;color:var(--text-secondary);padding:.3rem .5rem;font-size:.82rem;cursor:pointer;" 
          onchange="updateStatus('${o._id}',this.value)">
          ${['pending','confirmed','preparing','ready','delivered','cancelled'].map(s =>
            `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </td>
    </tr>`).join('');
}

async function updateStatus(id, status) {
  try {
    await api.orders.updateStatus(id, status);
    showToast(`Order status updated to "${status}"`);
  } catch (err) {
    showToast(err.message || 'Update failed', 'error');
    await loadOrders();
  }
}

function renderPagination(total) {
  document.getElementById('orders-pagination-info').textContent = `${total} order${total !== 1 ? 's' : ''} total`;
  const container = document.getElementById('orders-pagination');
  if (totalPages <= 1) { container.innerHTML = ''; return; }
  container.innerHTML = `
    <button class="btn btn-outline" style="font-size:.8rem;padding:.3rem .7rem;" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>‹</button>
    <span style="font-size:.85rem;color:var(--text-muted);padding:0 .5rem;">Page ${currentPage} of ${totalPages}</span>
    <button class="btn btn-outline" style="font-size:.8rem;padding:.3rem .7rem;" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>›</button>
  `;
}

function changePage(n) {
  if (n < 1 || n > totalPages) return;
  currentPage = n;
  loadOrders();
}
