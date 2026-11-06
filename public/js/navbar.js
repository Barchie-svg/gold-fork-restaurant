/* =============================================
   THE GOLDEN FORK — NAVBAR (navbar.js)
   ============================================= */

(function () {
  const NAV_HTML = `
    <nav class="navbar" id="main-navbar">
      <a href="/" class="navbar-logo">🍴 The Golden <span>Fork</span></a>
      <ul class="navbar-links">
        <li><a href="/">Home</a></li>
        <li><a href="/menu.html">Menu</a></li>
        <li><a href="/reservations.html">Reservations</a></li>
        <li><a href="/events.html">Events</a></li>
        <li><a href="/about.html">About</a></li>
        <li><a href="/contact.html">Contact</a></li>
        <li><a href="/reviews.html">Reviews</a></li>
      </ul>
      <div class="navbar-actions">
        <button class="cart-btn" id="cart-toggle-btn" aria-label="Shopping Cart">
          <i class="fas fa-shopping-basket"></i>
          <span class="cart-badge" id="cart-badge">0</span>
        </button>
        <button class="hamburger" id="hamburger-btn" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
    <div class="mobile-menu" id="mobile-menu">
      <a href="/">Home</a>
      <a href="/menu.html">Menu</a>
      <a href="/reservations.html">Reservations</a>
      <a href="/events.html">Events</a>
      <a href="/about.html">About</a>
      <a href="/contact.html">Contact</a>
      <a href="/reviews.html">Reviews</a>
    </div>
  `;

  const CART_HTML = `
    <div class="cart-overlay" id="cart-overlay"></div>
    <aside class="cart-sidebar" id="cart-sidebar">
      <div class="cart-header">
        <h3>🛒 Your Cart</h3>
        <button class="cart-close" id="cart-close-btn" aria-label="Close cart">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="cart-items" id="cart-items-container">
        <div class="cart-empty">
          <i class="fas fa-shopping-basket"></i>
          <p>Your cart is empty</p>
        </div>
      </div>
      <div class="cart-footer">
        <div class="cart-total">
          <span>Total</span>
          <span id="cart-total-amount">KES 0</span>
        </div>
        <a href="/checkout.html" class="btn btn-primary w-full" id="checkout-btn">
          Proceed to Checkout
        </a>
      </div>
    </aside>
  `;

  const FOOTER_HTML = `
    <footer style="background:#111;border-top:1px solid #2a2a2a;padding:3rem 0 1.5rem;margin-top:5rem;">
      <div class="container">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:2.5rem;margin-bottom:2rem;">
          <div>
            <div style="font-family:'Playfair Display',serif;font-size:1.3rem;color:#C9A84C;margin-bottom:0.75rem;">🍴 The Golden Fork</div>
            <p style="color:#888;font-size:0.9rem;line-height:1.6;margin-bottom:1rem;">Where Every Meal Tells a Story. Fine dining in the heart of Nairobi since 2014.</p>
            <div style="display:flex;gap:0.75rem;">
              <a href="#" style="color:#888;font-size:1.1rem;transition:color .2s;" onmouseover="this.style.color='#C9A84C'" onmouseout="this.style.color='#888'"><i class="fab fa-facebook"></i></a>
              <a href="#" style="color:#888;font-size:1.1rem;transition:color .2s;" onmouseover="this.style.color='#C9A84C'" onmouseout="this.style.color='#888'"><i class="fab fa-instagram"></i></a>
              <a href="#" style="color:#888;font-size:1.1rem;transition:color .2s;" onmouseover="this.style.color='#C9A84C'" onmouseout="this.style.color='#888'"><i class="fab fa-twitter"></i></a>
              <a href="#" style="color:#888;font-size:1.1rem;transition:color .2s;" onmouseover="this.style.color='#C9A84C'" onmouseout="this.style.color='#888'"><i class="fab fa-tiktok"></i></a>
            </div>
          </div>
          <div>
            <h4 style="color:#f5f5f5;margin-bottom:1rem;font-size:0.95rem;text-transform:uppercase;letter-spacing:.05em;">Quick Links</h4>
            <div style="display:flex;flex-direction:column;gap:.5rem;">
              ${['/', 'Menu:/menu.html', 'Reservations:/reservations.html', 'Events:/events.html', 'About Us:/about.html', 'Contact:/contact.html', 'Reviews:/reviews.html'].map(l => {
                const [name, href] = l.includes(':') ? l.split(':') : [l, '/'];
                return `<a href="${href}" style="color:#888;text-decoration:none;font-size:.9rem;transition:color .2s;" onmouseover="this.style.color='#C9A84C'" onmouseout="this.style.color='#888'">${name === '/' ? 'Home' : name}</a>`;
              }).join('')}
            </div>
          </div>
          <div>
            <h4 style="color:#f5f5f5;margin-bottom:1rem;font-size:0.95rem;text-transform:uppercase;letter-spacing:.05em;">Contact Info</h4>
            <div style="display:flex;flex-direction:column;gap:.6rem;">
              <div style="color:#888;font-size:.9rem;"><i class="fas fa-map-marker-alt" style="color:#C9A84C;width:18px;"></i> Karen, Nairobi, Kenya</div>
              <div style="color:#888;font-size:.9rem;"><i class="fas fa-phone" style="color:#C9A84C;width:18px;"></i> +254 712 345 678</div>
              <div style="color:#888;font-size:.9rem;"><i class="fas fa-envelope" style="color:#C9A84C;width:18px;"></i> info@goldenfork.com</div>
            </div>
          </div>
          <div>
            <h4 style="color:#f5f5f5;margin-bottom:1rem;font-size:0.95rem;text-transform:uppercase;letter-spacing:.05em;">Hours</h4>
            <div style="display:flex;flex-direction:column;gap:.4rem;font-size:.88rem;color:#888;">
              <div style="display:flex;justify-content:space-between;"><span>Mon – Fri</span><span>11AM – 11PM</span></div>
              <div style="display:flex;justify-content:space-between;"><span>Saturday</span><span>10AM – 12AM</span></div>
              <div style="display:flex;justify-content:space-between;"><span>Sunday</span><span>10AM – 10PM</span></div>
            </div>
          </div>
        </div>
        <div style="border-top:1px solid #2a2a2a;padding-top:1.5rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;">
          <p style="color:#555;font-size:.85rem;">© ${new Date().getFullYear()} The Golden Fork Restaurant. All rights reserved.</p>
          <a href="/admin/login.html" style="color:#444;font-size:.8rem;text-decoration:none;" onmouseover="this.style.color='#C9A84C'" onmouseout="this.style.color='#444'">Admin Portal</a>
        </div>
      </div>
    </footer>
  `;

  function init() {
    // Inject navbar
    const navPlaceholder = document.getElementById('navbar-placeholder');
    if (navPlaceholder) {
      navPlaceholder.innerHTML = NAV_HTML;
    }

    // Inject cart sidebar
    document.body.insertAdjacentHTML('beforeend', CART_HTML);

    // Inject footer before close of body
    document.body.insertAdjacentHTML('beforeend', FOOTER_HTML);

    // Scroll behaviour
    const navbar = document.getElementById('main-navbar');
    if (navbar) {
      window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
      });
    }

    // Active link
    const links = document.querySelectorAll('.navbar-links a, .mobile-menu a');
    const currentPath = window.location.pathname;
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath || (href !== '/' && currentPath.startsWith(href))) {
        link.classList.add('active');
      }
    });

    // Hamburger
    const hamburger = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
      });
    }

    // Cart
    const cartToggle = document.getElementById('cart-toggle-btn');
    const cartClose = document.getElementById('cart-close-btn');
    const cartOverlay = document.getElementById('cart-overlay');

    if (cartToggle) cartToggle.addEventListener('click', () => Cart.openSidebar());
    if (cartClose) cartClose.addEventListener('click', () => Cart.closeSidebar());
    if (cartOverlay) cartOverlay.addEventListener('click', () => Cart.closeSidebar());

    // Init badge
    Cart.updateBadge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
