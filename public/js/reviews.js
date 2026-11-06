/* reviews.js */
let selectedRating = 0;

document.addEventListener('DOMContentLoaded', async () => {
  await loadReviews();
  initStarPicker();
  document.getElementById('review-form').addEventListener('submit', submitReview);
});

async function loadReviews() {
  try {
    const res = await api.reviews.getApproved();
    const reviews = res.data || [];
    renderSummary(reviews);
    renderReviews(reviews);
  } catch {
    document.getElementById('rev-grid').innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;">Could not load reviews.</p>';
    document.getElementById('rating-bars').innerHTML = '<p style="color:var(--text-muted);">No data</p>';
  }
}

function renderSummary(reviews) {
  if (!reviews.length) {
    document.getElementById('avg-rating').textContent = '—';
    document.getElementById('rev-count').textContent = '0 reviews';
    document.getElementById('rating-bars').innerHTML = '<p style="color:var(--text-muted);font-size:.9rem;">No reviews yet. Be the first!</p>';
    return;
  }
  const avg = reviews.reduce((s,r) => s + r.rating, 0) / reviews.length;
  document.getElementById('avg-rating').textContent = avg.toFixed(1);
  document.getElementById('avg-stars').innerHTML = renderStars(Math.round(avg));
  document.getElementById('rev-count').textContent = `${reviews.length} review${reviews.length !== 1 ? 's' : ''}`;

  const counts = [0,0,0,0,0];
  reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++; });
  const max = Math.max(...counts, 1);
  document.getElementById('rating-bars').innerHTML = [5,4,3,2,1].map(star => `
    <div class="bar-row">
      <span class="bar-label">${star}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${(counts[star-1]/max)*100}%"></div></div>
      <span class="bar-count">${counts[star-1]}</span>
    </div>
  `).join('');
}

function renderReviews(reviews) {
  const grid = document.getElementById('rev-grid');
  if (!reviews.length) {
    grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;">No reviews yet.</p>';
    return;
  }
  grid.innerHTML = reviews.map(r => `
    <div class="rev-card">
      <div class="rev-card-top">
        <div class="rev-avatar">${getInitials(r.customerName)}</div>
        <div>
          <div class="rev-name">${r.customerName}</div>
          <div class="rev-date">${formatDate(r.createdAt)}</div>
        </div>
      </div>
      <div style="margin-bottom:.6rem;">${renderStars(r.rating)}</div>
      <p class="rev-comment">"${r.comment}"</p>
    </div>
  `).join('');
}

function initStarPicker() {
  const stars = document.querySelectorAll('.star-btn');
  stars.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedRating = parseInt(btn.dataset.val);
      document.getElementById('rv-rating').value = selectedRating;
      stars.forEach(s => {
        s.classList.toggle('active', parseInt(s.dataset.val) <= selectedRating);
      });
    });
    btn.addEventListener('mouseenter', () => {
      const val = parseInt(btn.dataset.val);
      stars.forEach(s => s.classList.toggle('hovered', parseInt(s.dataset.val) <= val));
    });
    btn.addEventListener('mouseleave', () => {
      stars.forEach(s => s.classList.remove('hovered'));
    });
  });
}

async function submitReview(e) {
  e.preventDefault();
  if (!selectedRating) { showToast('Please select a star rating', 'error'); return; }
  const btn = document.getElementById('rv-submit');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting…';

  try {
    await api.reviews.create({
      customerName: document.getElementById('rv-name').value.trim(),
      rating: selectedRating,
      comment: document.getElementById('rv-comment').value.trim(),
    });
    document.getElementById('rv-success').style.display = 'block';
    document.getElementById('review-form').style.display = 'none';
  } catch (err) {
    showToast(err.message || 'Submission failed', 'error');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Review';
  }
}
