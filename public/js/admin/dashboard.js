/* admin/dashboard.js */
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAdmin()) return;
  injectAdminSidebar('dashboard');

  document.getElementById('topbar-date').textContent = new Date().toLocaleDateString('en-KE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  await Promise.all([loadOrderStats(), loadReservationStats(), loadRecentReservations()]);
});

async function loadOrderStats() {
  try {
    const res = await api.orders.getStats();
    const d = res.data;

    document.getElementById('st-total-orders').textContent = d.totalOrders;
    document.getElementById('st-today-rev').textContent = formatKES(d.todayRevenue);

    renderRecentOrders(d.recentOrders || []);
    renderStatusChart(d.statusCounts);
    renderRevenueChart(d);
  } catch {
    document.getElementById('st-total-orders').textContent = '—';
    document.getElementById('st-today-rev').textContent = '—';
    document.getElementById('recent-orders-tbody').innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:2rem;">Could not load data</td></tr>';
  }
}

async function loadReservationStats() {
  try {
    const res = await api.reservations.getStats();
    document.getElementById('st-pend-res').textContent = res.data.pending;
  } catch { document.getElementById('st-pend-res').textContent = '—'; }
}

async function loadRecentReservations() {
  try {
    const res = await api.reservations.getAll('?limit=5&page=1');
    const tbody = document.getElementById('recent-res-tbody');
    const items = res.data || [];
    if (!items.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:2rem;">No reservations yet</td></tr>'; return; }
    tbody.innerHTML = items.map(r => `
      <tr>
        <td>${r.customerName}</td>
        <td>${formatDate(r.date)}</td>
        <td>${r.time}</td>
        <td>${r.guests}</td>
        <td>${statusBadge(r.status)}</td>
      </tr>`).join('');
    // Load event count
    try {
      const ev = await api.events.getAll('?status=pending');
      document.getElementById('st-events').textContent = ev.total || 0;
    } catch { document.getElementById('st-events').textContent = '—'; }
  } catch { document.getElementById('recent-res-tbody').innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:2rem;">Could not load data</td></tr>'; }
}

function renderRecentOrders(orders) {
  const tbody = document.getElementById('recent-orders-tbody');
  if (!orders.length) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:2rem;">No orders yet</td></tr>'; return; }
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><code style="color:var(--gold);font-size:.82rem;">#${String(o._id).slice(-6).toUpperCase()}</code></td>
      <td>${o.customerName}</td>
      <td>${o.items.length} item${o.items.length !== 1 ? 's' : ''}</td>
      <td><strong style="color:var(--gold);">${formatKES(o.totalAmount)}</strong></td>
      <td><span class="badge badge-${o.paymentStatus}">${o.paymentMethod}</span></td>
      <td>${statusBadge(o.status)}</td>
      <td style="color:var(--text-muted);font-size:.82rem;">${formatDateTime(o.createdAt)}</td>
    </tr>`).join('');
}

function renderStatusChart(counts) {
  const ctx = document.getElementById('statusChart');
  if (!ctx) return;
  const labels = Object.keys(counts);
  const data = Object.values(counts);
  const colors = ['#f59e0b','#3b82f6','#a855f7','#14b8a6','#22c55e','#ef4444'];
  new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: '#1a1a1a', borderWidth: 3 }] },
    options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#888', padding: 16, font: { size: 11 } } } } },
  });
}

function renderRevenueChart(stats) {
  const ctx = document.getElementById('revenueChart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Total Orders', 'Today Orders', 'Pending'],
      datasets: [{
        label: 'Count',
        data: [stats.totalOrders, stats.todayOrders, stats.pendingOrders],
        backgroundColor: ['rgba(201,168,76,.7)', 'rgba(34,197,94,.7)', 'rgba(245,158,11,.7)'],
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#888' }, grid: { color: '#2a2a2a' } },
        y: { ticks: { color: '#888' }, grid: { color: '#2a2a2a' }, beginAtZero: true },
      },
    },
  });
}
