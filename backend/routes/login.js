const bcrypt = require('bcrypt');

class Admin {
  constructor(db) {
    this.db = db;
  }

  async initializeTables() {
    try {
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS admins (
          id INT AUTO_INCREMENT PRIMARY KEY,
          admin_id VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL
        )
      `);

      const hashedPassword = await bcrypt.hash('Abhay@123', 10);
      const [existingAdmins] = await this.db.query('SELECT * FROM admins WHERE admin_id = ?', ['Abhay']);
      if (existingAdmins.length === 0) {
        await this.db.query(
          'INSERT INTO admins (admin_id, password) VALUES (?, ?)',
          ['Abhay', hashedPassword]
        );
        console.log('Default admin created: admin_id=Abhay');
      }

      console.log('Admin tables initialized');
    } catch (error) {
      console.error('Failed to initialize admin tables:', error);
      throw new Error(`Failed to initialize admin tables: ${error.message}`);
    }
  }

  isAuthenticated(req, res, next) {
    const isLoggedIn = req.headers['x-admin-logged-in'] === 'true';
    const adminId = req.headers['x-admin-id'];
    console.log('isAuthenticated - isLoggedIn:', isLoggedIn, 'adminId:', adminId);
    if (isLoggedIn && adminId && adminId !== 'undefined') {
      req.admin_id = adminId;
      next();
    } else {
      res.status(401).json({ success: false, message: `Unauthorized access: Invalid or missing admin ID` });
    }
  }

  setupRoutes(app) {
    app.post('/api/admin/login', async (req, res) => {
      const { admin_id, password } = req.body;
      if (!admin_id || !password) {
        return res.status(400).json({ success: false, message: 'Admin ID and password are required' });
      }

      try {
        const [rows] = await this.db.query('SELECT * FROM admins WHERE admin_id = ?', [admin_id]);
        if (rows.length === 0) {
          return res.status(401).json({ success: false, message: 'Invalid admin ID or password' });
        }

        const admin = rows[0];
        const isMatch = await bcrypt.compare(password, admin.password);

        if (isMatch) {
          console.log('Login successful for admin_id:', admin_id);
          res.json({ success: true, message: 'Login successful', admin_id: admin.admin_id });
        } else {
          res.status(401).json({ success: false, message: 'Invalid admin ID or password' });
        }
      } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
      }
    });

    app.post('/api/admin/change-password', this.isAuthenticated.bind(this), async (req, res) => {
      const { admin_id, currentPassword, newPassword } = req.body;
      if (!admin_id || !currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Admin ID, current password, and new password are required' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long' });
      }

      try {
        const [rows] = await this.db.query('SELECT * FROM admins WHERE admin_id = ?', [admin_id]);
        if (rows.length === 0) {
          return res.status(401).json({ success: false, message: 'Admin not found' });
        }

        const admin = rows[0];
        const isMatch = await bcrypt.compare(currentPassword, admin.password);

        if (!isMatch) {
          return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await this.db.query('UPDATE admins SET password = ? WHERE admin_id = ?', [hashedNewPassword, admin_id]);

        console.log('Password changed for admin_id:', admin_id);
        res.json({ success: true, message: 'Password changed successfully' });
      } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
      }
    });
  }
}

module.exports = Admin;