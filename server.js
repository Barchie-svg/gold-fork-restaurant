require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🍴  The Golden Fork server running on http://localhost:${PORT}`);
  console.log(`📋  Admin Dashboard: http://localhost:${PORT}/admin/login.html\n`);
});
