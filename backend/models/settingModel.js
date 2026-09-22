const db = require('../config/db');

const SettingModel = {
  /**
   * Get store system settings
   */
  async getSettings() {
    const { rows } = await db.query('SELECT * FROM settings WHERE id = $1', ['default']);
    if (rows.length === 0) {
      // Default fallback
      return {
        id: 'default',
        site_title: 'PremiumStore',
        support_whatsapp: '447455909204',
        support_phone: '+447455909204',
        support_email: 'support@premiumstore.app',
        paybill_number: '522533',
        account_number: '8106675',
        account_name: 'JASPER MARKETS',
        mpesa_active: true,
        card_active: true,
        maintenance_mode: false,
        maintenance_message: 'System undergoing scheduled upgrades.'
      };
    }
    return rows[0];
  },

  /**
   * Update store system settings
   */
  async updateSettings(updates) {
    const current = await this.getSettings();
    const merged = {
      site_title: updates.siteTitle !== undefined ? updates.siteTitle : (updates.site_title || current.site_title),
      support_whatsapp: updates.supportWhatsapp !== undefined ? updates.supportWhatsapp : (updates.support_whatsapp || current.support_whatsapp),
      support_phone: updates.supportPhone !== undefined ? updates.supportPhone : (updates.support_phone || current.support_phone),
      support_email: updates.supportEmail !== undefined ? updates.supportEmail : (updates.support_email || current.support_email),
      paybill_number: updates.paybillNumber !== undefined ? updates.paybillNumber : (updates.paybill_number || current.paybill_number),
      account_number: updates.accountNumber !== undefined ? updates.accountNumber : (updates.account_number || current.account_number),
      account_name: updates.accountName !== undefined ? updates.accountName : (updates.account_name || current.account_name),
      mpesa_active: updates.mpesaActive !== undefined ? updates.mpesaActive : (updates.mpesa_active !== undefined ? updates.mpesa_active : current.mpesa_active),
      card_active: updates.cardActive !== undefined ? updates.cardActive : (updates.card_active !== undefined ? updates.card_active : current.card_active),
      maintenance_mode: updates.maintenanceMode !== undefined ? updates.maintenanceMode : (updates.maintenance_mode !== undefined ? updates.maintenance_mode : current.maintenance_mode),
      maintenance_message: updates.maintenanceMessage !== undefined ? updates.maintenanceMessage : (updates.maintenance_message || current.maintenance_message),
    };

    const queryText = `
      INSERT INTO settings (
        id, site_title, support_whatsapp, support_phone, support_email,
        paybill_number, account_number, account_name, mpesa_active,
        card_active, maintenance_mode, maintenance_message, updated_at
      ) VALUES (
        'default', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP
      )
      ON CONFLICT (id) DO UPDATE SET
        site_title = EXCLUDED.site_title,
        support_whatsapp = EXCLUDED.support_whatsapp,
        support_phone = EXCLUDED.support_phone,
        support_email = EXCLUDED.support_email,
        paybill_number = EXCLUDED.paybill_number,
        account_number = EXCLUDED.account_number,
        account_name = EXCLUDED.account_name,
        mpesa_active = EXCLUDED.mpesa_active,
        card_active = EXCLUDED.card_active,
        maintenance_mode = EXCLUDED.maintenance_mode,
        maintenance_message = EXCLUDED.maintenance_message,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const params = [
      merged.site_title,
      merged.support_whatsapp,
      merged.support_phone,
      merged.support_email,
      merged.paybill_number,
      merged.account_number,
      merged.account_name,
      merged.mpesa_active,
      merged.card_active,
      merged.maintenance_mode,
      merged.maintenance_message
    ];

    const { rows } = await db.query(queryText, params);
    return rows[0];
  }
};

module.exports = SettingModel;
