/* admin/reviews.js */
let allReviews = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAdmin()) return;
  injectAdminSidebar('reviews');
  await loadReviews();
  document.getElementById('rev-filter').addEventListener('change', renderReviews);
});

async function loadReviews() {
  try {
    const res = await api.reviews.getAll();
    allReviews = res.data || [];
    updateCounts();
    renderReviews();
  } catch {
    document.getElementById('reviews-tbody').innerHTML =
      '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:2rem;">Could not load reviews</td></tr>';
  }
}

function updateCounts() {
  const pending = allReviews.filter(r => !r.approved).length;
  const approved = allReviews.filter(r => r.approved).length;
  document.getElementById('rev-counts').textContent =
    `${allReviews.length} total · ${approved} approved · ${pending} pending`;
}

function renderReviews() {
  const filter = document.getElementById('rev-filter').value;
  let items = allReviews;
  if (filter === 'true') items = allReviews.filter(r => r.approved);
  if (filter === 'false') items = allReviews.filter(r => !r.approved);

  const tbody = document.getElementById('reviews-tbody');
  if (!items.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:2rem;">No reviews found</td></tr>';
    return;
  }

  tbody.innerHTML = items.map(r => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:.6rem;">
          <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold-dark));display:flex;align-items:center;justify-content:center;font-weight:700;color:#000;font-size:.78rem;flex-shrink:0;">
            ${getInitials(r.customerName)}
          </div>
          <strong>${r.customerName}</strong>
        </div>
      </td>
      <td>
        <span style="color:var(--gold);">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
        <span style="color:var(--text-muted);font-size:.82rem;margin-left:.3rem;">${r.rating}/5</span>
      </td>
      <td style="max-width:260px;">
        <span style="color:var(--text-secondary);font-size:.88rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
          "${r.comment}"
        </span>
      </td>
      <td style="color:var(--text-muted);font-size:.82rem;">${formatDate(r.createdAt)}</td>
      <td>${r.approved
        ? '<span class="badge badge-approved">✅ Approved</span>'
        : '<span class="badge badge-pending">⏳ Pending</span>'}</td>
      <td>
        <div class="table-actions">
          ${r.approved
            ? `<button class="btn btn-outline" style="font-size:.78rem;padding:.3rem .7rem;" onclick="toggleApproval('${r._id}', false)" title="Reject">
                <i class="fas fa-times"></i> Reject
               </button>`
            : `<button class="btn btn-primary" style="font-size:.78rem;padding:.3rem .7rem;" onclick="toggleApproval('${r._id}', true)" title="Approve">
                <i class="fas fa-check"></i> Approve
               </button>`}
          <button class="btn btn-danger" style="font-size:.78rem;padding:.3rem .7rem;" onclick="deleteReview('${r._id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>`).join('');
}

async function toggleApproval(id, approved) {
  try {
    await api.reviews.updateStatus(id, approved);
    showToast(approved ? 'Review approved and published!' : 'Review rejected');
    await loadReviews();
  } catch (err) {
    showToast(err.message || 'Update failed', 'error');
  }
}

async function deleteReview(id) {
  if (!confirm('Delete this review? This cannot be undone.')) return;
  try {
    await api.reviews.delete(id);
    showToast('Review deleted');
    await loadReviews();
  } catch (err) {
    showToast(err.message || 'Delete failed', 'error');
  }
}
