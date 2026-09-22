const db = require('../config/db');

const AppModel = {
  /**
   * Get all published apps (with optional category, search, and sort filters)
   */
  async getAll({ category, search, featured, status = 'published', limit = 100, offset = 0 }) {
    let queryText = 'SELECT * FROM apps WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      queryText += ` AND status = $${params.length}`;
    }

    if (category && category !== 'All Categories' && category !== 'all') {
      params.push(category);
      queryText += ` AND category = $${params.length}`;
    }

    if (featured !== undefined) {
      params.push(featured === true || featured === 'true');
      queryText += ` AND featured = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      queryText += ` AND (title ILIKE $${params.length} OR tagline ILIKE $${params.length} OR description ILIKE $${params.length} OR category ILIKE $${params.length})`;
    }

    queryText += ' ORDER BY featured DESC, rating DESC, downloads DESC, created_at DESC';

    params.push(parseInt(limit, 10));
    queryText += ` LIMIT $${params.length}`;

    params.push(parseInt(offset, 10));
    queryText += ` OFFSET $${params.length}`;

    const { rows } = await db.query(queryText, params);
    return rows;
  },

  /**
   * Get an app by ID
   */
  async getById(id) {
    const { rows } = await db.query('SELECT * FROM apps WHERE id = $1', [id]);
    return rows[0] || null;
  },

  /**
   * Create a new application
   */
  async create(appData) {
    const rawPrice = parseFloat(appData.price) || 0.15;
    const price = rawPrice > 3.85 ? 3.85 : (rawPrice < 0.15 ? 0.15 : Math.round(rawPrice * 100) / 100);
    const originalPrice = parseFloat(appData.originalPrice) || (price < 3.85 ? Math.min(5.75, Math.round(price * 1.5 * 100) / 100) : 5.75);
    const id = appData.id || ('app_' + Math.random().toString(36).substring(2, 8));

    const queryText = `
      INSERT INTO apps (
        id, title, tagline, category, price, original_price,
        rating, rating_count, downloads, version, size, platform,
        cover_image, gallery, description, features, release_notes,
        download_url, featured, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      ) RETURNING *;
    `;

    const params = [
      id,
      appData.title || 'Untitled App',
      appData.tagline || '',
      appData.category || 'Utilities',
      price,
      originalPrice,
      appData.rating || 5.0,
      appData.ratingCount || 1,
      appData.downloads || 0,
      appData.version || '1.0.0',
      appData.size || '25.0 MB',
      appData.platform || 'Cross-Platform',
      appData.coverImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      JSON.stringify(appData.gallery || []),
      appData.description || '',
      JSON.stringify(appData.features || []),
      appData.releaseNotes || 'Initial stable release.',
      appData.downloadUrl || 'https://vault-storage.app/packages/app-bundle.zip',
      !!appData.featured,
      appData.status || 'published'
    ];

    const { rows } = await db.query(queryText, params);
    return rows[0];
  },

  /**
   * Update an existing application
   */
  async update(id, updates) {
    const fields = [];
    const params = [id];

    const allowedKeys = {
      title: 'title',
      tagline: 'tagline',
      category: 'category',
      price: 'price',
      originalPrice: 'original_price',
      rating: 'rating',
      ratingCount: 'rating_count',
      downloads: 'downloads',
      version: 'version',
      size: 'size',
      platform: 'platform',
      coverImage: 'cover_image',
      gallery: 'gallery',
      description: 'description',
      features: 'features',
      releaseNotes: 'release_notes',
      downloadUrl: 'download_url',
      featured: 'featured',
      status: 'status'
    };

    Object.keys(updates).forEach((key) => {
      if (allowedKeys[key]) {
        let val = updates[key];
        if (key === 'gallery' || key === 'features') {
          val = JSON.stringify(val);
        }
        params.push(val);
        fields.push(`${allowedKeys[key]} = $${params.length}`);
      }
    });

    if (fields.length === 0) return this.getById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');

    const queryText = `
      UPDATE apps
      SET ${fields.join(', ')}
      WHERE id = $1
      RETURNING *;
    `;

    const { rows } = await db.query(queryText, params);
    return rows[0] || null;
  },

  /**
   * Delete an app
   */
  async delete(id) {
    const { rowCount } = await db.query('DELETE FROM apps WHERE id = $1', [id]);
    return rowCount > 0;
  },

  /**
   * Increment downloads count
   */
  async incrementDownloads(id) {
    const { rows } = await db.query(
      'UPDATE apps SET downloads = downloads + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING downloads',
      [id]
    );
    return rows[0] ? rows[0].downloads : null;
  }
};

module.exports = AppModel;
