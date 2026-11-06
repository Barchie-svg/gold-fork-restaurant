/* checkout.js */
let currentStep = 1;
let selectedPayMethod = 'mpesa';
let customerDetails = {};

document.addEventListener('DOMContentLoaded', () => {
  renderCartReview();
  document.getElementById('to-step2').addEventListener('click', () => {
    if (Cart.count() === 0) { showToast('Your cart is empty!', 'error'); return; }
    goStep(2);
  });
  document.getElementById('details-form').addEventListener('submit', e => {
    e.preventDefault();
    customerDetails = {
      name: document.getElementById('cust-name').value.trim(),
      email: document.getElementById('cust-email').value.trim(),
      phone: document.getElementById('cust-phone').value.trim(),
      address: document.getElementById('cust-address').value.trim(),
      notes: document.getElementById('cust-notes').value.trim(),
    };
    document.getElementById('mpesa-phone').value = customerDetails.phone;
    document.getElementById('pay-total-display').innerHTML =
      `<span>Total to Pay</span><span>${formatKES(Cart.total())}</span>`;
    goStep(3);
  });
});

function goStep(n) {
  document.querySelectorAll('.checkout-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`panel-${n}`).classList.add('active');
  document.querySelectorAll('.step').forEach((s, i) => {
    s.classList.remove('active', 'done');
    if (i + 1 < n) s.classList.add('done');
    if (i + 1 === n) s.classList.add('active');
  });
  currentStep = n;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderCartReview() {
  const items = Cart.get();
  const container = document.getElementById('cart-review-content');
  if (!items.length) {
    container.innerHTML = `<div class="cart-empty-msg"><p>Your cart is empty. <a href="/menu.html" style="color:var(--gold)">Browse the menu</a></p></div>`;
    return;
  }
  container.innerHTML = `
    <table class="cart-table">
      <thead><tr><th>Item</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr></thead>
      <tbody>
        ${items.map(i => `
          <tr>
            <td><strong>${i.name}</strong></td>
            <td>${formatKES(i.price)}</td>
            <td>
              <div style="display:flex;align-items:center;gap:.4rem;">
                <button onclick="changeQty('${i._id}',-1)" style="background:var(--bg-elevated);border:1px solid var(--border-color);color:var(--text-primary);width:26px;height:26px;border-radius:4px;cursor:pointer;">−</button>
                <span>${i.quantity}</span>
                <button onclick="changeQty('${i._id}',1)" style="background:var(--bg-elevated);border:1px solid var(--border-color);color:var(--text-primary);width:26px;height:26px;border-radius:4px;cursor:pointer;">+</button>
              </div>
            </td>
            <td><strong style="color:var(--gold);">${formatKES(i.price * i.quantity)}</strong></td>
            <td><button onclick="removeItem('${i._id}')" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:.9rem;"><i class="fas fa-trash"></i></button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="order-total"><span>Total</span><span>${formatKES(Cart.total())}</span></div>
  `;
}

function changeQty(id, delta) {
  const items = Cart.get();
  const item = items.find(i => i._id === id);
  if (item) Cart.updateQty(id, item.quantity + delta);
  renderCartReview();
}

function removeItem(id) {
  Cart.remove(id);
  renderCartReview();
}

function selectPayMethod(method) {
  selectedPayMethod = method;
  document.querySelectorAll('.pay-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.pay-panel').forEach(p => p.classList.remove('active'));
  event.currentTarget.classList.add('active');
  document.getElementById(`pay-${method}`).classList.add('active');
}

async function payMpesa() {
  const phone = document.getElementById('mpesa-phone').value.trim();
  if (!phone) { showToast('Please enter your M-Pesa phone number', 'error'); return; }

  const btn = document.getElementById('pay-mpesa-btn');
  const status = document.getElementById('mpesa-status');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';

  try {
    // First place the order
    const orderId = await placeOrderData('mpesa');
    if (!orderId) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-mobile-alt"></i> Send STK Push'; return; }

    await api.payments.mpesaSTKPush({ phone, amount: Cart.total(), orderId });

    status.style.display = 'block';
    status.innerHTML = '📱 <strong>STK push sent!</strong> Check your phone and enter your M-Pesa PIN to complete payment.';
    btn.innerHTML = '✅ STK Sent';

    setTimeout(() => { Cart.clear(); showConfirmation(orderId); }, 2000);
  } catch (err) {
    showToast(err.message || 'M-Pesa payment failed', 'error');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-mobile-alt"></i> Send STK Push';
  }
}

async function payStripe() {
  try {
    const orderId = await placeOrderData('stripe');
    if (!orderId) return;
    await api.payments.createStripeIntent({ amount: Cart.total(), orderId });
    Cart.clear();
    showToast('Payment intent created! (Sandbox mode)', 'info');
    showConfirmation(orderId);
  } catch (err) {
    showToast(err.message || 'Card payment failed', 'error');
  }
}

async function placeOrder(method) {
  const orderId = await placeOrderData(method);
  if (orderId) { Cart.clear(); showConfirmation(orderId); }
}

async function placeOrderData(method) {
  try {
    const items = Cart.get().map(i => ({
      menuItemId: i._id, name: i.name, price: i.price, quantity: i.quantity,
    }));
    const res = await api.orders.create({
      customerName: customerDetails.name,
      customerEmail: customerDetails.email,
      customerPhone: customerDetails.phone,
      deliveryAddress: customerDetails.address,
      notes: customerDetails.notes,
      items,
      paymentMethod: method,
    });
    return res.data._id;
  } catch (err) {
    showToast(err.message || 'Failed to place order', 'error');
    return null;
  }
}

function showConfirmation(orderId) {
  document.getElementById('confirm-order-id').textContent = `Order #${String(orderId).slice(-6).toUpperCase()}`;
  const summary = document.getElementById('confirm-summary');
  summary.innerHTML = `
    <div style="background:var(--bg-elevated);border-radius:var(--radius-sm);padding:1rem;">
      <div style="display:flex;justify-content:space-between;margin-bottom:.5rem;font-size:.9rem;color:var(--text-muted);">
        <span>Customer</span><span style="color:var(--text-primary);">${customerDetails.name}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:.9rem;color:var(--text-muted);">
        <span>Payment</span><span style="color:var(--gold);text-transform:capitalize;">${selectedPayMethod}</span>
      </div>
    </div>`;
  goStep(4);
}
