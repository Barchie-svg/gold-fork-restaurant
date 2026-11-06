/* admin/auth.js — Admin Auth Guard & Sidebar */

function requireAdmin() {
  const token = localStorage.getItem('gf_admin_token');
  if (!token) { window.location.href = '/admin/login.html'; return false; }
  return true;
}

function adminLogout() {
  localStorage.removeItem('gf_admin_token');
  localStorage.removeItem('gf_admin_user');
  window.location.href = '/admin/login.html';
}

function getAdminUser() {
  try { return JSON.parse(localStorage.getItem('gf_admin_user') || '{}'); } catch { return {}; }
}

function injectAdminSidebar(activePage) {
  const user = getAdminUser();
  const initials = getInitials(user.name || 'Admin');
  const links = [
    { href: '/admin/dashboard.html', icon: 'tachometer-alt', label: 'Dashboard', key: 'dashboard' },
    { href: '/admin/menu.html', icon: 'utensils', label: 'Menu Items', key: 'menu' },
    { href: '/admin/orders.html', icon: 'receipt', label: 'Orders', key: 'orders' },
    { href: '/admin/reservations.html', icon: 'calendar-alt', label: 'Reservations', key: 'reservations' },
    { href: '/admin/events.html', icon: 'glass-cheers', label: 'Events', key: 'events' },
    { href: '/admin/reviews.html', icon: 'star', label: 'Reviews', key: 'reviews' },
  ];

  const sidebarHTML = `
    <aside class="admin-sidebar" id="admin-sidebar">
      <div class="admin-sidebar-logo">
        🍴 <div><div>Golden Fork</div><span>Admin Panel</span></div>
      </div>
      <nav class="admin-nav">
        <div class="admin-nav-section">Main</div>
        ${links.map(l => `
          <a href="${l.href}" class="${activePage === l.key ? 'active' : ''}">
            <i class="fas fa-${l.icon}"></i> ${l.label}
          </a>`).join('')}
        <div class="admin-nav-section" style="margin-top:1rem;">Settings</div>
        <a href="/" target="_blank"><i class="fas fa-external-link-alt"></i> View Website</a>
        <a href="#" onclick="adminLogout();return false;"><i class="fas fa-sign-out-alt"></i> Logout</a>
      </nav>
      <div class="admin-sidebar-footer">
        <div class="admin-user">
          <div class="admin-avatar">${initials}</div>
          <div class="admin-user-info">
            <div class="admin-user-name">${user.name || 'Admin'}</div>
            <div class="admin-user-role">Administrator</div>
          </div>
        </div>
      </div>
    </aside>
  `;

  const placeholder = document.getElementById('admin-sidebar-placeholder');
  if (placeholder) placeholder.outerHTML = sidebarHTML;
}
