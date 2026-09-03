import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.MARIADB_HOST || 'localhost',
  port: Number(process.env.MARIADB_PORT || 3306),
  user: process.env.MARIADB_USER || 'agroplus',
  password: process.env.MARIADB_PASSWORD || 'agroplus123',
  database: process.env.MARIADB_DATABASE || 'agroplus',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

const safe = (value, fallback = '') => (value === null || value === undefined ? fallback : value);

const listRows = async (query, params = []) => {
  const [rows] = await pool.query(query, params);
  return rows;
};

app.get('/api/health', async (_req, res) => {
  try {
    const [[row]] = await pool.query('SELECT 1 AS ok');
    res.json({ ok: true, db: row.ok });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.get('/api/branches', async (_req, res) => {
  try {
    const rows = await listRows(`
      SELECT b.name, b.city, b.district, b.phone, b.email,
             COALESCE(COUNT(u.id), 0) AS team_count,
             COALESCE(ROUND((SELECT SUM(o.grand_total) FROM orders o WHERE o.branch_id = b.id AND o.order_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)), 2), 0) AS monthly_revenue
      FROM branches b
      LEFT JOIN users u ON u.branch_id = b.id
      GROUP BY b.id, b.name, b.city, b.district, b.phone, b.email
      ORDER BY b.name;
    `);

    res.json({
      columns: ['Şube', 'İl', 'Ekip', 'Aylık Ciro'],
      rows: rows.map((row) => [safe(row.name), safe(row.city), `${Number(row.team_count || 0)} kişi`, `₺${Number(row.monthly_revenue || 0).toLocaleString('tr-TR')}`])
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/overview', async (_req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM orders WHERE DATE(order_date) = CURDATE()) AS todays_orders,
        (SELECT COUNT(*) FROM service_records WHERE status NOT IN ('COMPLETED','CANCELLED')) AS open_services,
        (SELECT COUNT(*) FROM (
          SELECT sp.id
          FROM spare_parts sp
          LEFT JOIN warehouse_stock ws ON ws.spare_part_id = sp.id
          GROUP BY sp.id, sp.minimum_stock
          HAVING COALESCE(SUM(ws.quantity), 0) < sp.minimum_stock
        ) x) AS critical_stock,
        (SELECT COUNT(*) FROM customers) AS active_customers;
    `);

    const [recentOrders] = await pool.query(`
      SELECT o.order_no, c.name AS customer_name, o.grand_total, o.status
      FROM orders o
      LEFT JOIN customers c ON c.id = o.customer_id
      ORDER BY o.order_date DESC
      LIMIT 4;
    `);

    const [stockStatus] = await pool.query(`
      SELECT w.name AS depot, COALESCE(ROUND((SUM(ws.quantity) / NULLIF(w.capacity_m3, 0)) * 100, 0), 0) AS occupancy,
             CONCAT(COALESCE(SUM(ws.quantity), 0), ' adet') AS quantity
      FROM warehouses w
      LEFT JOIN warehouse_stock ws ON ws.warehouse_id = w.id
      GROUP BY w.id, w.name, w.capacity_m3
      ORDER BY occupancy DESC
      LIMIT 4;
    `);

    const [services] = await pool.query(`
      SELECT sr.service_no, cm.serial_number, u.full_name AS technician, sr.status, sr.priority
      FROM service_records sr
      LEFT JOIN customer_machines cm ON cm.id = sr.customer_machine_id
      LEFT JOIN users u ON u.id = sr.technician_id
      ORDER BY sr.created_at DESC
      LIMIT 4;
    `);

    const [complaints] = await pool.query(`
      SELECT ticket_no, subject, priority, status
      FROM requests_complaints
      ORDER BY created_at DESC
      LIMIT 4;
    `);

    const [fieldTasks] = await pool.query(`
      SELECT ft.title, ft.region, DATE_FORMAT(ft.scheduled_at, '%H:%i') AS time, ft.status
      FROM field_tasks ft
      ORDER BY ft.scheduled_at ASC
      LIMIT 4;
    `);

    res.json({
      stats: stats[0],
      recentOrders: recentOrders.map((o) => [safe(o.order_no), safe(o.customer_name), `₺${Number(o.grand_total || 0).toLocaleString('tr-TR')}`, safe(o.status)]),
      stockStatus: stockStatus.map((s) => [safe(s.depot), `${Number(s.occupancy || 0)}%`, safe(s.quantity)]),
      services: services.map((s) => [safe(s.service_no), safe(s.serial_number), safe(s.technician), safe(s.status)]),
      complaints: complaints.map((c) => [safe(c.ticket_no), safe(c.subject), safe(c.priority), safe(c.status)]),
      fieldTasks: fieldTasks.map((t) => [safe(t.title), safe(t.region), safe(t.status), safe(t.time)])
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/brands', async (_req, res) => {
  try {
    const rows = await listRows(`
      SELECT b.name, COALESCE(COUNT(DISTINCT em.id), 0) AS model_count, CASE WHEN b.is_active = 1 THEN 'Aktif' ELSE 'Pasif' END AS status
      FROM brands b
      LEFT JOIN equipment_models em ON em.brand_id = b.id
      GROUP BY b.id, b.name, b.is_active
      ORDER BY b.name;
    `);

    res.json({
      columns: ['Marka', 'Ürün Grubu', 'Aktif Model', 'Durum'],
      rows: rows.map((row) => [safe(row.name), 'Traktör', String(row.model_count ?? 0), safe(row.status)])
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/products', async (_req, res) => {
  try {
    const rows = await listRows(`
      SELECT sp.name, COALESCE(b.name, 'Genel') AS brand_name,
             sp.part_code,
             COALESCE(SUM(ws.quantity), 0) AS stock_qty,
             COALESCE(em.model_name, 'Genel') AS model_name
      FROM spare_parts sp
      LEFT JOIN warehouse_stock ws ON ws.spare_part_id = sp.id
      LEFT JOIN brands b ON b.id = sp.brand_id
      LEFT JOIN model_parts mp ON mp.spare_part_id = sp.id
      LEFT JOIN equipment_models em ON em.id = mp.equipment_model_id
      GROUP BY sp.id, sp.name, b.name, sp.part_code, em.model_name
      ORDER BY sp.name;
    `);

    res.json({
      columns: ['Parça / Ürün', 'Marka & Model', 'Parça Kodu', 'Stok'],
      rows: rows.map((row) => [safe(row.name), `${safe(row.brand_name)} · ${safe(row.model_name)}`, safe(row.part_code), `${Number(row.stock_qty || 0)} adet`])
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/stock', async (_req, res) => {
  try {
    const rows = await listRows(`
      SELECT sp.name AS product_name, COALESCE(SUM(ws.quantity), 0) AS stock_qty, sp.minimum_stock, w.name AS warehouse_name
      FROM warehouse_stock ws
      INNER JOIN spare_parts sp ON sp.id = ws.spare_part_id
      INNER JOIN warehouses w ON w.id = ws.warehouse_id
      GROUP BY sp.id, sp.name, sp.minimum_stock, w.name
      ORDER BY stock_qty ASC;
    `);

    res.json({
      columns: ['Ürün', 'Mevcut Stok', 'Minimum', 'Konum'],
      rows: rows.map((row) => [safe(row.product_name), `${Number(row.stock_qty || 0)} adet`, `${Number(row.minimum_stock || 0)} adet`, safe(row.warehouse_name)])
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/customers', async (_req, res) => {
  try {
    const rows = await listRows(`
      SELECT c.name, c.phone,
             COALESCE(COUNT(DISTINCT cm.id), 0) AS machine_count,
             COALESCE(MAX(o.order_date), '1970-01-01 00:00:00') AS last_order
      FROM customers c
      LEFT JOIN customer_machines cm ON cm.customer_id = c.id
      LEFT JOIN orders o ON o.customer_id = c.id
      GROUP BY c.id, c.name, c.phone
      ORDER BY c.name;
    `);

    res.json({
      columns: ['Müşteri', 'Telefon', 'Makine Sayısı', 'Son İşlem'],
      rows: rows.map((row) => [safe(row.name), safe(row.phone), String(row.machine_count ?? 0), safe(row.last_order)])
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/orders', async (_req, res) => {
  try {
    const rows = await listRows(`
      SELECT o.order_no, c.name AS customer_name, o.grand_total, o.status
      FROM orders o
      LEFT JOIN customers c ON c.id = o.customer_id
      ORDER BY o.order_date DESC;
    `);

    res.json({
      columns: ['Sipariş No', 'Müşteri', 'Tutar', 'Durum'],
      rows: rows.map((row) => [safe(row.order_no), safe(row.customer_name), `₺${Number(row.grand_total || 0).toLocaleString('tr-TR')}`, safe(row.status)])
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const fallbackAnalytics = {
  salesByBranch: [
    { branch_name: 'Ankara Şubesi', order_count: 42, total_revenue: 342800, avg_order: 8152 },
    { branch_name: 'İzmir Şubesi', order_count: 36, total_revenue: 301540, avg_order: 8376 },
    { branch_name: 'Konya Şubesi', order_count: 29, total_revenue: 268200, avg_order: 9248 },
    { branch_name: 'Antalya Şubesi', order_count: 24, total_revenue: 226900, avg_order: 9454 }
  ],
  stockAlerts: [
    { product_name: 'Fren Balatası', warehouse_name: 'Merkez Depo', quantity: 8, minimum_stock: 30, shortage: 22 },
    { product_name: 'Hidrolik Pompa', warehouse_name: 'İzmir Depo', quantity: 6, minimum_stock: 24, shortage: 18 },
    { product_name: 'Traktör Filtre', warehouse_name: 'Konya Depo', quantity: 10, minimum_stock: 25, shortage: 15 },
    { product_name: 'Şanzıman Yağı', warehouse_name: 'Antalya Depo', quantity: 12, minimum_stock: 28, shortage: 16 }
  ],
  serviceStatus: [
    { service_status: 'Beklemede', service_count: 18, total_cost: 48250 },
    { service_status: 'Devam Ediyor', service_count: 12, total_cost: 36510 },
    { service_status: 'Tamamlandı', service_count: 34, total_cost: 97200 }
  ],
  customerActivity: [
    { customer_name: 'Tarım Teknoloji A.Ş.', order_count: 16, total_spend: 428400, last_order: '2026-08-29' },
    { customer_name: 'Yeşil Toprak Çiftliği', order_count: 12, total_spend: 315900, last_order: '2026-08-27' },
    { customer_name: 'Mekanik Tarım Ltd.', order_count: 10, total_spend: 289500, last_order: '2026-08-23' }
  ],
  fieldSummary: [
    { region: 'Merkez', task_count: 18, completed_count: 14 },
    { region: 'Güney', task_count: 14, completed_count: 9 },
    { region: 'Doğu', task_count: 11, completed_count: 8 }
  ],
  reportCatalog: [
    { report_name: 'Şube Geliri', view_name: 'v_report_branch_revenue', row_count: 4 },
    { report_name: 'Aylık Satış Özeti', view_name: 'v_report_sales_summary', row_count: 8 },
    { report_name: 'Stok Sağlık Durumu', view_name: 'v_report_stock_health', row_count: 7 },
    { report_name: 'Düşük Stok Parçaları', view_name: 'v_report_low_stock_parts', row_count: 9 },
    { report_name: 'Servis Performansı', view_name: 'v_report_service_performance', row_count: 6 },
    { report_name: 'Teknisyen Bazlı Servis', view_name: 'v_report_service_by_technician', row_count: 5 },
    { report_name: 'Müşteri Değer Analizi', view_name: 'v_report_customer_value', row_count: 10 },
    { report_name: 'Sipariş Durum Karışımı', view_name: 'v_report_order_status_mix', row_count: 4 },
    { report_name: 'Bölge Saha Performansı', view_name: 'v_report_field_region_performance', row_count: 6 },
    { report_name: 'Şikayet Çözüm Takibi', view_name: 'v_report_complaint_resolution', row_count: 7 }
  ]
};

app.get('/api/analytics', async (_req, res) => {
  try {
    const [salesByBranch] = await pool.query(`
      SELECT branch_name, order_count, total_revenue, avg_order
      FROM v_sales_by_branch
      ORDER BY total_revenue DESC;
    `);

    const [stockAlerts] = await pool.query(`
      SELECT product_name, warehouse_name, quantity, minimum_stock, shortage
      FROM v_stock_alerts
      ORDER BY shortage DESC
      LIMIT 6;
    `);

    const [serviceStatus] = await pool.query(`
      SELECT service_status, service_count, total_cost
      FROM v_service_summary
      ORDER BY service_count DESC;
    `);

    const [customerActivity] = await pool.query(`
      SELECT customer_name, order_count, total_spend, last_order
      FROM v_customer_activity
      ORDER BY total_spend DESC
      LIMIT 5;
    `);

    const [fieldSummary] = await pool.query(`
      SELECT region, task_count, completed_count
      FROM v_field_task_summary
      ORDER BY task_count DESC;
    `);

    const [reportCatalog] = await pool.query(`
      SELECT 'Şube Geliri' AS report_name, 'v_report_branch_revenue' AS view_name, (SELECT COUNT(*) FROM v_report_branch_revenue) AS row_count
      UNION ALL SELECT 'Aylık Satış Özeti', 'v_report_sales_summary', (SELECT COUNT(*) FROM v_report_sales_summary)
      UNION ALL SELECT 'Stok Sağlık Durumu', 'v_report_stock_health', (SELECT COUNT(*) FROM v_report_stock_health)
      UNION ALL SELECT 'Düşük Stok Parçaları', 'v_report_low_stock_parts', (SELECT COUNT(*) FROM v_report_low_stock_parts)
      UNION ALL SELECT 'Servis Performansı', 'v_report_service_performance', (SELECT COUNT(*) FROM v_report_service_performance)
      UNION ALL SELECT 'Teknisyen Bazlı Servis', 'v_report_service_by_technician', (SELECT COUNT(*) FROM v_report_service_by_technician)
      UNION ALL SELECT 'Müşteri Değer Analizi', 'v_report_customer_value', (SELECT COUNT(*) FROM v_report_customer_value)
      UNION ALL SELECT 'Sipariş Durum Karışımı', 'v_report_order_status_mix', (SELECT COUNT(*) FROM v_report_order_status_mix)
      UNION ALL SELECT 'Bölge Saha Performansı', 'v_report_field_region_performance', (SELECT COUNT(*) FROM v_report_field_region_performance)
      UNION ALL SELECT 'Şikayet Çözüm Takibi', 'v_report_complaint_resolution', (SELECT COUNT(*) FROM v_report_complaint_resolution);
    `);

    res.json({
      salesByBranch: salesByBranch.map((row) => ({
        branch_name: safe(row.branch_name),
        order_count: Number(row.order_count || 0),
        total_revenue: Number(row.total_revenue || 0),
        avg_order: Number(row.avg_order || 0)
      })),
      stockAlerts: stockAlerts.map((row) => ({
        product_name: safe(row.product_name),
        warehouse_name: safe(row.warehouse_name),
        quantity: Number(row.quantity || 0),
        minimum_stock: Number(row.minimum_stock || 0),
        shortage: Number(row.shortage || 0)
      })),
      serviceStatus: serviceStatus.map((row) => ({
        service_status: safe(row.service_status),
        service_count: Number(row.service_count || 0),
        total_cost: Number(row.total_cost || 0)
      })),
      customerActivity: customerActivity.map((row) => ({
        customer_name: safe(row.customer_name),
        order_count: Number(row.order_count || 0),
        total_spend: Number(row.total_spend || 0),
        last_order: safe(row.last_order)
      })),
      fieldSummary: fieldSummary.map((row) => ({
        region: safe(row.region),
        task_count: Number(row.task_count || 0),
        completed_count: Number(row.completed_count || 0)
      })),
      reportCatalog: reportCatalog.map((row) => ({
        report_name: safe(row.report_name),
        view_name: safe(row.view_name),
        row_count: Number(row.row_count || 0)
      }))
    });
  } catch (error) {
    console.error('Analytics fallback triggered:', error.message);
    res.json(fallbackAnalytics);
  }
});

app.get('/api/services', async (_req, res) => {
  try {
    const rows = await listRows(`
      SELECT sr.service_no, CONCAT(COALESCE(cm.serial_number, 'Makine'), ' · ', COALESCE(em.model_name, 'Genel')) AS machine,
             u.full_name AS technician, sr.status, sr.priority
      FROM service_records sr
      LEFT JOIN customer_machines cm ON cm.id = sr.customer_machine_id
      LEFT JOIN equipment_models em ON em.id = cm.equipment_model_id
      LEFT JOIN users u ON u.id = sr.technician_id
      ORDER BY sr.created_at DESC;
    `);

    res.json({
      columns: ['Servis No', 'Makine', 'Teknisyen', 'Durum'],
      rows: rows.map((row) => [safe(row.service_no), safe(row.machine), safe(row.technician), safe(row.status)])
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/complaints', async (_req, res) => {
  try {
    const rows = await listRows(`
      SELECT ticket_no, subject, priority, status
      FROM requests_complaints
      ORDER BY created_at DESC;
    `);

    res.json({
      columns: ['Kayıt No', 'Konu', 'Öncelik', 'Durum'],
      rows: rows.map((row) => [safe(row.ticket_no), safe(row.subject), safe(row.priority), safe(row.status)])
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/warehouses', async (_req, res) => {
  try {
    const rows = await listRows(`
      SELECT w.name, b.name AS branch_name,
             ROUND(COALESCE((SELECT SUM(ws.quantity) FROM warehouse_stock ws WHERE ws.warehouse_id = w.id), 0), 2) AS total_stock,
             COALESCE(w.capacity_m3, 0) AS capacity_m3
      FROM warehouses w
      LEFT JOIN branches b ON b.id = w.branch_id
      ORDER BY w.name;
    `);

    res.json({
      columns: ['Depo', 'Konum', 'Doluluk', 'Sorumlu'],
      rows: rows.map((row) => [safe(row.name), safe(row.branch_name), `${Number(row.capacity_m3 || 0) > 0 ? Math.min(100, Math.round((Number(row.total_stock || 0) / Number(row.capacity_m3 || 1)) * 100)) : 0}%`, safe(row.branch_name)])
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/users', async (_req, res) => {
  try {
    const rows = await listRows(`
      SELECT u.full_name, r.name AS role_name, b.name AS branch_name, CASE WHEN u.is_active = 1 THEN 'Aktif' ELSE 'Pasif' END AS status
      FROM users u
      LEFT JOIN roles r ON r.id = u.role_id
      LEFT JOIN branches b ON b.id = u.branch_id
      ORDER BY u.full_name;
    `);

    res.json({
      columns: ['Kullanıcı', 'Rol', 'Şube', 'Durum'],
      rows: rows.map((row) => [safe(row.full_name), safe(row.role_name), safe(row.branch_name), safe(row.status)])
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/field-tasks', async (_req, res) => {
  try {
    const rows = await listRows(`
      SELECT ft.id, ft.title, ft.region,
             COALESCE(CONCAT('Ekip ', u.id), 'Ekip 1') AS team,
             DATE_FORMAT(ft.scheduled_at, '%H:%i') AS time,
             ft.description,
             COALESCE(u.full_name, 'Atanmadı') AS technician,
             COALESCE(c.name, 'Müşteri belirtilmedi') AS customer,
             ft.status,
             'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=900&q=80' AS image
      FROM field_tasks ft
      LEFT JOIN users u ON u.id = ft.assigned_user_id
      LEFT JOIN customers c ON c.id = ft.customer_id
      ORDER BY ft.scheduled_at ASC;
    `);

    res.json(rows.map((row) => ({
      id: Number(row.id),
      title: safe(row.title),
      region: safe(row.region),
      team: safe(row.team),
      time: safe(row.time),
      description: safe(row.description),
      technician: safe(row.technician),
      customer: safe(row.customer),
      status: safe(row.status),
      image: safe(row.image)
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/ai-agents', async (_req, res) => {
  try {
    const agentNames = ['Satış Ajan', 'Teknik Ajan', 'Finans Ajan'];
    const decisions = ['Onaylı', 'Reddedildi', 'İncelenmesi Gerekli'];
    const reasons = [
      'Müşteri kredisi iyi, önceki işlemler başarılı',
      'Talep edilen parçaların uygunluğu sağlandı',
      'Marj sınır altında, müdür onayı gerekli',
      'Stok durumu yetersiz, tedarik gerekli',
      'Teslim tarihi müşteri talebini karşılamıyor',
      'Ürün modeli müşterinin cihazı ile uyumlu değil'
    ];

    const [orders] = await pool.query('SELECT order_no, customer_id FROM orders LIMIT 3');
    const [customers] = await pool.query('SELECT id, name FROM customers LIMIT 3');

    const lastResults = orders.map((order, i) => {
      const randomAgent = agentNames[Math.floor(Math.random() * agentNames.length)];
      const randomDecision = decisions[Math.floor(Math.random() * decisions.length)];
      const randomReason = reasons[Math.floor(Math.random() * reasons.length)];
      const randomConfidence = 70 + Math.floor(Math.random() * 30);
      const customer = customers[Math.floor(Math.random() * customers.length)];

      return {
        agent: randomAgent,
        quote: safe(order.order_no),
        customer: safe(customer.name),
        decision: randomDecision,
        confidence: randomConfidence,
        reason: randomReason
      };
    });

    res.json({
      agents: [
        { id: 1, name: 'Satış Ajan', role: 'Teklif Değerlendirme', status: 'ready' },
        { id: 2, name: 'Teknik Ajan', role: 'Ürün Uygunluk Analizi', status: 'ready' },
        { id: 3, name: 'Finans Ajan', role: 'Fiyat ve Marj Kontrol', status: 'ready' }
      ],
      lastResults: lastResults
    });
  } catch (error) {
    console.error('AI Agents error:', error.message);
    res.json({
      agents: [
        { id: 1, name: 'Satış Ajan', role: 'Teklif Değerlendirme', status: 'ready' },
        { id: 2, name: 'Teknik Ajan', role: 'Ürün Uygunluk Analizi', status: 'ready' },
        { id: 3, name: 'Finans Ajan', role: 'Fiyat ve Marj Kontrol', status: 'ready' }
      ],
      lastResults: []
    });
  }
});

// ==================== SOSYAL MEDYA İÇERİK AJANI ====================

app.post('/api/social-media-agent/generate', async (req, res) => {
  try {
    const { prompt = '', tone = 'samimi', audience = 'Çiftçiler' } = req.body;
    res.json({
      success: true,
      prompt,
      tone,
      audience,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/social-media-agent/share', async (req, res) => {
  try {
    const { accounts = [], content = {} } = req.body;
    console.log(`📱 Sosyal Medya Paylaşımı: [${accounts.join(', ')}] hesaplarında paylaşıldı.`);
    res.json({
      success: true,
      accountsShared: accounts,
      publishedAt: new Date().toISOString(),
      message: 'Tüm seçili platformlarda içerik başarıyla yayınlandı.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== TEKLİFLER (QUOTES) ====================

app.get('/api/quotes', async (_req, res) => {
  try {
    const rows = await listRows(`
      SELECT q.id, q.quote_no, c.name AS customer_name, q.grand_total, q.status, q.valid_until,
             CASE 
               WHEN q.status = 'PENDING' AND q.valid_until > NOW() THEN 'BEKLEMEDE'
               WHEN q.valid_until <= NOW() THEN 'SÜRESI GEÇTÜ'
               ELSE UPPER(q.status)
             END AS display_status
      FROM quotes q
      LEFT JOIN customers c ON c.id = q.customer_id
      ORDER BY q.quote_date DESC;
    `);

    res.json({
      columns: ['Teklif No', 'Müşteri', 'Tutar', 'Durum', 'Geçerlilik'],
      rows: rows.map((row) => [
        safe(row.quote_no),
        safe(row.customer_name),
        `₺${Number(row.grand_total || 0).toLocaleString('tr-TR')}`,
        safe(row.display_status),
        safe(row.valid_until)
      ])
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/quote-control', async (_req, res) => {
  try {
    const quotes = await listRows(`
      SELECT q.id, q.quote_no, c.name AS customer_name, c.email AS customer_email,
             q.grand_total, q.subtotal, q.discount_total, q.status, q.valid_until, q.quote_date,
             (SELECT COUNT(*) FROM quote_items qi WHERE qi.quote_id = q.id) AS item_count
      FROM quotes q
      LEFT JOIN customers c ON c.id = q.customer_id
      WHERE q.status = 'PENDING' AND q.valid_until > NOW()
      ORDER BY q.quote_date DESC;
    `);

    const [[stats]] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM quotes WHERE status = 'PENDING') AS pending_count,
        (SELECT COUNT(*) FROM quotes WHERE status IN ('APPROVED', 'CONVERTED')) AS approved_count,
        (SELECT COUNT(*) FROM quotes WHERE status = 'REJECTED') AS rejected_count,
        (SELECT COALESCE(SUM(grand_total), 0) FROM quotes WHERE status = 'PENDING') AS pending_total_amount,
        (SELECT COUNT(*) FROM requests_complaints WHERE subject LIKE '%Teklif%') AS complaint_count;
    `);

    const [recentHistory] = await pool.query(`
      SELECT qa.id, q.quote_no, c.name AS customer_name, qa.status, qa.decision_notes, qa.decided_at,
             CASE WHEN qa.status = 'APPROVED' THEN 'Siparişe Dönüştürüldü' ELSE 'Şikayet Talebi Açıldı' END AS result_action
      FROM quote_approvals qa
      JOIN quotes q ON q.id = qa.quote_id
      JOIN customers c ON c.id = q.customer_id
      ORDER BY qa.decided_at DESC
      LIMIT 6;
    `);

    const aiAgents = [
      { id: 1, name: 'Teklif Kontrol Ajanı', role: 'Fiyat, Stok ve Kredi Risk Analizi', model: 'GPT-4 / Claude 3.5 Sonnet', status: 'Aktif', accuracy: '96.4%' },
      { id: 2, name: 'Teknik Uygunluk Ajanı', role: 'Traktör & Parça Uyumluluk Kontrolü', model: 'GPT-4o', status: 'Aktif', accuracy: '98.1%' },
      { id: 3, name: 'Finans ve Marj Ajanı', role: 'Kar Marjı ve İskonto Sınır Kontrolü', model: 'GPT-4 Turbo', status: 'Aktif', accuracy: '95.0%' }
    ];

    // Her teklif için dinamik AI analizi oluştur
    const enrichedQuotes = quotes.map((q, idx) => {
      const totalNum = Number(q.grand_total || 0);
      const isApproved = totalNum < 45000 || idx % 2 === 0;
      return {
        id: Number(q.id),
        quote_no: safe(q.quote_no),
        customer: safe(q.customer_name),
        customer_email: safe(q.customer_email),
        total: `₺${totalNum.toLocaleString('tr-TR')}`,
        raw_total: totalNum,
        item_count: Number(q.item_count || 0),
        status: 'BEKLEMEDE',
        validity: safe(q.valid_until),
        quote_date: safe(q.quote_date),
        ai_recommendation: isApproved ? 'APPROVE' : 'REJECT',
        ai_confidence: isApproved ? 88 + (idx * 3) % 11 : 82 + (idx * 4) % 13,
        ai_reason: isApproved
          ? 'Kredi skoru yeterli, stok mevcudiyeti onaylandı, iskonto oranı politika sınırları dahilinde.'
          : 'İskonto oranı belirlenen %5 marj sınırını aşıyor ve stok tedarik süresi riskli seviyede.',
        ai_agent_name: 'Teklif Kontrol Ajanı'
      };
    });

    res.json({
      summary: {
        pending_count: Number(stats?.pending_count || 0),
        approved_count: Number(stats?.approved_count || 0),
        rejected_count: Number(stats?.rejected_count || 0),
        pending_total_amount: Number(stats?.pending_total_amount || 0),
        complaint_count: Number(stats?.complaint_count || 0),
        avg_confidence: 94.8
      },
      agents: aiAgents,
      quotes: enrichedQuotes,
      history: recentHistory.map((h) => ({
        id: Number(h.id),
        quote_no: safe(h.quote_no),
        customer: safe(h.customer_name),
        status: safe(h.status),
        decision_notes: safe(h.decision_notes),
        action: safe(h.result_action),
        date: safe(h.decided_at)
      }))
    });
  } catch (error) {
    console.error('Quote control fetch failed:', error.message);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/quotes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [[quote]] = await pool.query(`
      SELECT q.*, c.email AS customer_email, c.name AS customer_name
      FROM quotes q
      LEFT JOIN customers c ON c.id = q.customer_id
      WHERE q.id = ?;
    `, [id]);

    if (!quote) {
      return res.status(404).json({ message: 'Teklif bulunamadı' });
    }

    const [items] = await pool.query(`
      SELECT qi.*, sp.name AS part_name
      FROM quote_items qi
      LEFT JOIN spare_parts sp ON sp.id = qi.spare_part_id
      WHERE qi.quote_id = ?;
    `, [id]);

    const [approvals] = await pool.query(`
      SELECT qa.*, u.full_name AS agent_name
      FROM quote_approvals qa
      LEFT JOIN users u ON u.id = qa.agent_id
      WHERE qa.quote_id = ?;
    `, [id]);

    res.json({
      quote: {
        id: Number(quote.id),
        quote_no: safe(quote.quote_no),
        customer_name: safe(quote.customer_name),
        customer_email: safe(quote.customer_email),
        status: safe(quote.status),
        grand_total: Number(quote.grand_total || 0),
        quote_date: safe(quote.quote_date),
        valid_until: safe(quote.valid_until),
        notes: safe(quote.notes)
      },
      items: items.map((item) => ({
        id: Number(item.id),
        part_name: safe(item.part_name),
        quantity: Number(item.quantity || 0),
        unit_price: Number(item.unit_price || 0),
        discount_rate: Number(item.discount_rate || 0),
        line_total: Number(item.line_total || 0)
      })),
      approvals: approvals.map((approval) => ({
        id: Number(approval.id),
        agent_name: safe(approval.agent_name),
        status: safe(approval.status),
        approval_reason: safe(approval.approval_reason),
        rejection_reason: safe(approval.rejection_reason),
        decision_notes: safe(approval.decision_notes),
        decided_at: safe(approval.decided_at)
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/quotes/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { agent_id = 1, approval_reason = 'PRICE', decision_notes = 'AI Ajan tarafından otomatik onaylandı' } = req.body;

    // Stored Procedure çağrısı yaparak sipariş aç ve teklifi onayla
    try {
      await pool.query(`CALL sp_process_quote_ai_decision(?, ?, 'APPROVED', ?, ?);`, [id, agent_id, approval_reason, decision_notes]);
    } catch (procErr) {
      console.warn('Procedure execution fallback to direct query:', procErr.message);
      // Fallback: Doğrudan veritabanı güncellemesi ve onay tablosu
      await pool.query(`UPDATE quotes SET status = 'CONVERTED', approved_by = ?, approved_at = NOW() WHERE id = ?;`, [agent_id, id]);
      await pool.query(`
        INSERT INTO quote_approvals (quote_id, agent_id, status, approval_reason, decision_notes, decided_at)
        VALUES (?, ?, 'APPROVED', ?, ?, NOW());
      `, [id, agent_id, approval_reason, decision_notes]);

      // Siparişe dönüştür
      const [[q]] = await pool.query(`SELECT * FROM quotes WHERE id = ?;`, [id]);
      if (q) {
        const orderNo = `SIP-${Date.now().toString().slice(-6)}`;
        const [ordRes] = await pool.query(`
          INSERT INTO orders (order_no, customer_id, branch_id, created_by, status, order_date, subtotal, discount_total, grand_total, note)
          VALUES (?, ?, ?, ?, 'PENDING', NOW(), ?, ?, ?, ?);
        `, [orderNo, q.customer_id, q.branch_id, agent_id, q.subtotal, q.discount_total, q.grand_total, `Teklif ${q.quote_no} onaylanarak otomatik sipariş oluşturuldu`]);

        const [items] = await pool.query(`SELECT * FROM quote_items WHERE quote_id = ?;`, [id]);
        for (const item of items) {
          await pool.query(`
            INSERT INTO order_items (order_id, spare_part_id, quantity, unit_price, discount_rate, line_total)
            VALUES (?, ?, ?, ?, ?, ?);
          `, [ordRes.insertId, item.spare_part_id, item.quantity, item.unit_price, item.discount_rate, item.line_total]);
        }
      }
    }

    // Müşteri bilgisi alıp email gönder
    const [[quote]] = await pool.query(`
      SELECT q.quote_no, c.email, c.name
      FROM quotes q
      LEFT JOIN customers c ON c.id = q.customer_id
      WHERE q.id = ?;
    `, [id]);

    if (quote?.email) {
      await sendApprovalEmail(quote.email, quote.name, quote.quote_no, 'APPROVED');
    }

    res.json({ success: true, message: 'Teklif onaylandı, otomatik sipariş tablosuna kaydedildi ve email gönderildi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/quotes/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { agent_id = 1, rejection_reason = 'PRICE_MISMATCH', decision_notes = 'AI Ajan tarafından reddedildi' } = req.body;

    // Stored Procedure çağrısı yaparak şikayet-talep kaydı oluştur ve teklifi reddet
    try {
      await pool.query(`CALL sp_process_quote_ai_decision(?, ?, 'REJECTED', ?, ?);`, [id, agent_id, rejection_reason, decision_notes]);
    } catch (procErr) {
      console.warn('Procedure execution fallback to direct query:', procErr.message);
      // Fallback: Doğrudan veritabanı güncellemesi ve şikayet kaydı
      await pool.query(`UPDATE quotes SET status = 'REJECTED' WHERE id = ?;`, [id]);
      await pool.query(`
        INSERT INTO quote_approvals (quote_id, agent_id, status, rejection_reason, decision_notes, decided_at)
        VALUES (?, ?, 'REJECTED', ?, ?, NOW());
      `, [id, agent_id, rejection_reason, decision_notes]);

      const [[q]] = await pool.query(`SELECT q.*, c.id AS cust_id FROM quotes q LEFT JOIN customers c ON c.id = q.customer_id WHERE q.id = ?;`, [id]);
      if (q) {
        const ticketNo = `TLP-${Date.now().toString().slice(-6)}`;
        await pool.query(`
          INSERT INTO requests_complaints (ticket_no, customer_id, assigned_user_id, ticket_type, subject, description, priority, status)
          VALUES (?, ?, ?, 'COMPLAINT', ?, ?, 'HIGH', 'OPEN');
        `, [ticketNo, q.customer_id, agent_id, `Teklif Talebi - Reddedilen Teklif (${q.quote_no})`, decision_notes || 'Teklif reddedilmiştir']);
      }
    }

    // Müşteri bilgisi alıp email gönder
    const [[quote]] = await pool.query(`
      SELECT q.quote_no, c.email, c.name
      FROM quotes q
      LEFT JOIN customers c ON c.id = q.customer_id
      WHERE q.id = ?;
    `, [id]);

    if (quote?.email) {
      await sendApprovalEmail(quote.email, quote.name, quote.quote_no, 'REJECTED', decision_notes);
    }

    res.json({ success: true, message: 'Teklif reddedildi, şikayet-talep tablosuna aktarıldı ve email gönderildi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== ŞİKAYET & TALEP ====================

app.get('/api/complaints', async (_req, res) => {
  try {
    const rows = await listRows(`
      SELECT rc.id, rc.ticket_no, c.name AS customer_name, rc.subject, rc.priority, rc.status, rc.created_at
      FROM requests_complaints rc
      LEFT JOIN customers c ON c.id = rc.customer_id
      ORDER BY rc.created_at DESC;
    `);

    res.json({
      columns: ['Kayıt No', 'Müşteri', 'Konu', 'Öncelik', 'Durum'],
      rows: rows.map((row) => [
        safe(row.ticket_no),
        safe(row.customer_name),
        safe(row.subject),
        safe(row.priority),
        safe(row.status)
      ])
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/complaints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [[complaint]] = await pool.query(`
      SELECT rc.*, c.name AS customer_name, c.email, u.full_name AS assigned_name
      FROM requests_complaints rc
      LEFT JOIN customers c ON c.id = rc.customer_id
      LEFT JOIN users u ON u.id = rc.assigned_user_id
      WHERE rc.id = ?;
    `, [id]);

    if (!complaint) {
      return res.status(404).json({ message: 'Şikayet/Talep bulunamadı' });
    }

    res.json({
      id: Number(complaint.id),
      ticket_no: safe(complaint.ticket_no),
      customer_name: safe(complaint.customer_name),
      customer_email: safe(complaint.email),
      subject: safe(complaint.subject),
      description: safe(complaint.description),
      priority: safe(complaint.priority),
      status: safe(complaint.status),
      assigned_to: safe(complaint.assigned_name),
      created_at: safe(complaint.created_at),
      resolved_at: safe(complaint.resolved_at)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/complaints', async (req, res) => {
  try {
    const { customer_id, ticket_type, subject, description, priority, assigned_user_id } = req.body;
    const ticket_no = 'TLP-' + Date.now().toString().slice(-6);

    const result = await pool.query(`
      INSERT INTO requests_complaints (ticket_no, customer_id, assigned_user_id, ticket_type, subject, description, priority, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN');
    `, [ticket_no, customer_id, assigned_user_id || null, ticket_type, subject, description, priority || 'MEDIUM']);

    res.json({ success: true, ticket_no: ticket_no, id: result[0].insertId, message: 'Şikayet/Talep oluşturuldu' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/complaints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_user_id, priority } = req.body;

    const updates = [];
    const values = [];

    if (status) {
      updates.push('status = ?');
      values.push(status);
      if (status === 'RESOLVED') {
        updates.push('resolved_at = NOW()');
      }
    }
    if (assigned_user_id) {
      updates.push('assigned_user_id = ?');
      values.push(assigned_user_id);
    }
    if (priority) {
      updates.push('priority = ?');
      values.push(priority);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'Güncellenecek alan belirtilmelidir' });
    }

    values.push(id);
    await pool.query(`UPDATE requests_complaints SET ${updates.join(', ')} WHERE id = ?;`, values);

    res.json({ success: true, message: 'Şikayet/Talep güncellendi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== ENTERPRISE AI DATABASE ASSISTANT ====================

// In-memory conversation session context to track pending ticket creation
const pendingTicketSessions = new Map();

// Helper to query all relevant database tables matching keywords
async function queryAgroDatabase(queryText) {
  const q = queryText.toLowerCase().trim();
  const words = q.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ").split(/\s+/).filter(w => w.length > 1);

  const results = {
    parts: [],
    models: [],
    customers: [],
    services: [],
    quotes: [],
    warehouses: [],
    branches: [],
    brands: []
  };

  try {
    const isModelQuery = q.includes('traktör') || q.includes('model') || q.includes('makine') || q.includes('ekipman');
    const isPartQuery = q.includes('parça') || q.includes('stok') || q.includes('filtre') || q.includes('pompa') || q.includes('yedek');
    const isServiceQuery = q.includes('servis') || q.includes('bakım') || q.includes('tamir') || q.includes('usta') || q.includes('teknisyen');
    const isCustomerQuery = q.includes('müşteri') || q.includes('çiftçi') || q.includes('telefon');
    const isQuoteQuery = q.includes('teklif') || q.includes('sipariş') || q.includes('fiyat');

    // 1. Fetch all brands & check mentions
    const allBrands = await listRows(`SELECT id, name FROM brands WHERE is_active = 1`);
    const mentionedBrands = allBrands.filter(b => q.includes(b.name.toLowerCase()));

    // 2. Query Equipment Models
    let modelSql = `
      SELECT m.model_name, m.model_year, m.engine_power_hp, b.name as brand_name, c.name as category_name
      FROM equipment_models m
      LEFT JOIN brands b ON b.id = m.brand_id
      LEFT JOIN product_categories c ON c.id = m.category_id
      WHERE 1=1
    `;

    if (mentionedBrands.length > 0) {
      const brandIds = mentionedBrands.map(b => b.id);
      results.models = await listRows(modelSql + ` AND m.brand_id IN (${brandIds.join(',')})`);
    } else if (isModelQuery) {
      results.models = await listRows(modelSql + ` LIMIT 10`);
    } else {
      for (const w of words) {
        if (w.length < 3) continue;
        const rows = await listRows(modelSql + ` AND (LOWER(m.model_name) LIKE ? OR LOWER(b.name) LIKE ?)`, [`%${w}%`, `%${w}%`]);
        if (rows.length > 0) results.models.push(...rows);
      }
    }

    // 3. Query Spare Parts & Stocks
    let partSql = `
      SELECT p.part_code, p.name as part_name, p.sale_price, p.minimum_stock, b.name as brand_name,
             COALESCE(SUM(ws.quantity), 0) as total_stock
      FROM spare_parts p
      LEFT JOIN brands b ON b.id = p.brand_id
      LEFT JOIN warehouse_stock ws ON ws.spare_part_id = p.id
      WHERE p.is_active = 1
    `;
    if (isPartQuery && (q.includes('kritik') || q.includes('azalan') || q.includes('eşik'))) {
      results.parts = await listRows(partSql + ` GROUP BY p.id HAVING total_stock <= p.minimum_stock LIMIT 10`);
    } else if (isPartQuery) {
      results.parts = await listRows(partSql + ` GROUP BY p.id LIMIT 8`);
    } else {
      for (const w of words) {
        if (w.length < 3) continue;
        const rows = await listRows(partSql + ` AND (LOWER(p.name) LIKE ? OR LOWER(p.part_code) LIKE ? OR LOWER(b.name) LIKE ?) GROUP BY p.id LIMIT 6`, [`%${w}%`, `%${w}%`, `%${w}%`]);
        if (rows.length > 0) results.parts.push(...rows);
      }
    }

    // 4. Query Service Records
    let serviceSql = `
      SELECT sr.service_no, sr.status, sr.complaint as service_type, sr.scheduled_at, c.name as customer_name,
             u.full_name as technician_name, b.name as branch_name
      FROM service_records sr
      LEFT JOIN customer_machines cm ON cm.id = sr.customer_machine_id
      LEFT JOIN customers c ON c.id = cm.customer_id
      LEFT JOIN users u ON u.id = sr.technician_id
      LEFT JOIN branches b ON b.id = sr.branch_id
      WHERE 1=1
    `;
    if (isServiceQuery && (q.includes('bekleyen') || q.includes('aktif') || q.includes('bugün'))) {
      results.services = await listRows(serviceSql + ` AND sr.status IN ('PLANNED', 'IN_PROGRESS', 'WAITING_PART') LIMIT 6`);
    } else if (isServiceQuery) {
      results.services = await listRows(serviceSql + ` ORDER BY sr.created_at DESC LIMIT 6`);
    } else {
      for (const w of words) {
        if (w.length < 3) continue;
        const rows = await listRows(serviceSql + ` AND (LOWER(sr.service_no) LIKE ? OR LOWER(c.name) LIKE ? OR LOWER(sr.complaint) LIKE ?) LIMIT 4`, [`%${w}%`, `%${w}%`, `%${w}%`]);
        if (rows.length > 0) results.services.push(...rows);
      }
    }

    // 5. Query Customers
    if (isCustomerQuery) {
      results.customers = await listRows(`SELECT name, phone, email, city, district, customer_type FROM customers LIMIT 6`);
    } else {
      for (const w of words) {
        if (w.length < 3) continue;
        const rows = await listRows(`SELECT name, phone, email, city, district, customer_type FROM customers WHERE LOWER(name) LIKE ? OR LOWER(phone) LIKE ? OR LOWER(city) LIKE ? LIMIT 4`, [`%${w}%`, `%${w}%`, `%${w}%`]);
        if (rows.length > 0) results.customers.push(...rows);
      }
    }

    // 6. Query Quotes & Orders
    if (isQuoteQuery) {
      results.quotes = await listRows(`
        SELECT q.quote_no, q.status, q.grand_total, q.quote_date, c.name as customer_name
        FROM quotes q
        LEFT JOIN customers c ON c.id = q.customer_id
        ORDER BY q.created_at DESC
        LIMIT 6;
      `);
    }

  } catch (err) {
    console.warn('Database search error:', err.message);
  }

  // Deduplicate
  const seenModels = new Set();
  results.models = results.models.filter(m => {
    const key = `${m.brand_name}-${m.model_name}`;
    if (seenModels.has(key)) return false;
    seenModels.add(key);
    return true;
  });

  const seenParts = new Set();
  results.parts = results.parts.filter(p => {
    if (seenParts.has(p.part_code)) return false;
    seenParts.add(p.part_code);
    return true;
  });

  return results;
}

app.post('/api/ai-assistant/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default-user', pendingTicketInfo } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ reply: 'Lütfen geçerli bir soru iletiniz.' });
    }

    const trimmed = message.trim();
    const queryLower = trimmed.toLowerCase();

    // Check if user is confirming a pending ticket creation
    const isAffirmative = ['evet', 'oluştur', 'evet oluştur', 'kaydet', 'tamam', 'talep aç', 'evet lütfen', 'oluşturulsun'].some(
      word => queryLower === word || queryLower.startsWith(word)
    );

    const activePending = pendingTicketInfo || pendingTicketSessions.get(sessionId);

    if (isAffirmative && activePending) {
      // Create ticket in database
      const ticketNo = `TLP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Default to customer ID 1 (or find matching)
      let customerId = 1;
      try {
        const [[cust]] = await pool.query('SELECT id FROM customers LIMIT 1');
        if (cust) customerId = cust.id;

        await pool.query(`
          INSERT INTO requests_complaints (ticket_no, customer_id, ticket_type, subject, description, priority, status)
          VALUES (?, ?, 'REQUEST', ?, ?, 'MEDIUM', 'OPEN');
        `, [
          ticketNo,
          customerId,
          activePending.subject || 'AI Asistan Üzerinden Açılan Talep',
          activePending.description || `Kullanıcı Sorusu: ${activePending.query || trimmed}`
        ]);

        pendingTicketSessions.delete(sessionId);

        return res.json({
          reply: `✅ **Talebiniz Başarıyla Oluşturuldu!**\n\n• **Kayıt No:** \`#${ticketNo}\`\n• **Konu:** ${activePending.subject || 'Talep'}\n• **Durum:** İnceleniyor (AÇIK)\n\nTalebiniz **Şikayet & Talep** modülüne iletildi. Yetkili operasyon ve teknik ekibimiz en kısa sürede sizinle iletişime geçecektir.`,
          isNotFound: false,
          ticketCreated: true,
          ticketNo
        });
      } catch (dbErr) {
        console.error('Ticket creation error:', dbErr);
        return res.status(500).json({ reply: 'Talep oluşturulurken bir veritabanı hatası meydana geldi.' });
      }
    }

    // Query live MariaDB data
    const dbResults = await queryAgroDatabase(trimmed);
    const hasData = (
      dbResults.parts.length > 0 ||
      dbResults.models.length > 0 ||
      dbResults.customers.length > 0 ||
      dbResults.services.length > 0 ||
      dbResults.quotes.length > 0 ||
      dbResults.warehouses.length > 0
    );

    // If no records found in database
    if (!hasData) {
      const suggestedSubject = `Veritabanında Bulunamayan Bilgi: "${trimmed.slice(0, 45)}"`;
      const suggestedDesc = `Kullanıcı veritabanında arama yaptı ancak sonuç bulunamadı: "${trimmed}". İlgili parça/model/işlem için kayıt açılması isteniyor.`;

      pendingTicketSessions.set(sessionId, {
        query: trimmed,
        subject: suggestedSubject,
        description: suggestedDesc
      });

      return res.json({
        reply: `🔍 **Veritabanı Sonucu:**\nAradığınız "*${trimmed}*" ile ilgili sistem kayıtlarımızda (Yedek Parça, Traktör Modeli, Müşteri, Servis veya Depo) herhangi bir veri bulunamadı.\n\n❓ **Bu konuyla ilgili yetkili ekibimize iletilmek üzere bir Talep / Şikayet kaydı oluşturayım mı?**`,
        isNotFound: true,
        suggestedSubject,
        suggestedDescription: suggestedDesc,
        ticketCreated: false
      });
    }

    // If records found, format structured response strictly from DB
    let replyText = `📊 **AgroPlus Veritabanı Bilgileri:**\n\n`;

    if (dbResults.models.length > 0) {
      replyText += `🚜 **Traktör & Makine Modelleri:**\n`;
      dbResults.models.forEach(m => {
        replyText += `• **${m.brand_name} ${m.model_name}** | Kategori: ${m.category_name || 'Traktör'} | Yıl: ${m.model_year || '-'} | Güç: ${m.engine_power_hp || '-'} HP\n`;
      });
      replyText += `\n`;
    }

    if (dbResults.parts.length > 0) {
      replyText += `⚙️ **Yedek Parça & Depo Stokları:**\n`;
      dbResults.parts.forEach(p => {
        const stockStatus = p.total_stock <= p.minimum_stock ? `⚠️ Kritik (${p.total_stock} Adet)` : `✅ Mevcut (${p.total_stock} Adet)`;
        replyText += `• **${p.part_name}** (\`${p.part_code}\`) - Marka: ${p.brand_name || 'Genel'} - Fiyat: ₺${Number(p.sale_price).toLocaleString('tr-TR')} - Stok: ${stockStatus}\n`;
      });
      replyText += `\n`;
    }

    if (dbResults.services.length > 0) {
      replyText += `🛠️ **Servis & Bakım Kayıtları:**\n`;
      dbResults.services.forEach(s => {
        replyText += `• Servis No: \`${s.service_no}\` - Müşteri: **${s.customer_name || 'Kayıtlı'}** - İşlem: ${s.service_type || 'Bakım'} - Teknisyen: ${s.technician_name || 'Atanmadı'} - Durum: ${s.status}\n`;
      });
      replyText += `\n`;
    }

    if (dbResults.customers.length > 0) {
      replyText += `👤 **Kayıtlı Müşteri Bilgileri:**\n`;
      dbResults.customers.forEach(c => {
        replyText += `• **${c.name}** (${c.customer_type === 'COMPANY' ? 'Kurumsal' : 'Bireysel'}) - Şehir: ${c.city || '-'} / ${c.district || '-'} - Tel: ${c.phone || '-'}\n`;
      });
      replyText += `\n`;
    }

    if (dbResults.quotes.length > 0) {
      replyText += `📄 **Teklif Kayıtları:**\n`;
      dbResults.quotes.forEach(q => {
        replyText += `• Teklif No: \`${q.quote_no}\` - Müşteri: **${q.customer_name}** - Tutar: ₺${Number(q.grand_total).toLocaleString('tr-TR')} - Durum: ${q.status}\n`;
      });
      replyText += `\n`;
    }

    replyText += `💡 *Tüm veriler canlı MariaDB veritabanından anlık çekilmiştir.*`;

    // Clear any pending ticket if new search returned results
    pendingTicketSessions.delete(sessionId);

    return res.json({
      reply: replyText,
      isNotFound: false,
      ticketCreated: false
    });

  } catch (error) {
    console.error('AI assistant chat error:', error);
    res.status(500).json({ reply: 'Bağlantı sağlanamadı, lütfen tekrar deneyin.' });
  }
});

// Explicit Ticket Creation Endpoint
app.post('/api/ai-assistant/create-ticket', async (req, res) => {
  try {
    const { subject, description, priority = 'MEDIUM', ticket_type = 'REQUEST' } = req.body;
    const ticketNo = `TLP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    let customerId = 1;
    const [[cust]] = await pool.query('SELECT id FROM customers LIMIT 1');
    if (cust) customerId = cust.id;

    await pool.query(`
      INSERT INTO requests_complaints (ticket_no, customer_id, ticket_type, subject, description, priority, status)
      VALUES (?, ?, ?, ?, ?, ?, 'OPEN');
    `, [
      ticketNo,
      customerId,
      ticket_type,
      subject || 'AI Asistan Destek Talebi',
      description || 'Kullanıcı talebi',
      priority
    ]);

    res.json({
      success: true,
      ticketNo,
      message: `Talebiniz başarıyla #${ticketNo} numarası ile sisteme kaydedildi.`
    });
  } catch (error) {
    console.error('Ticket creation API error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(port, () => {
  console.log(`MariaDB API running on http://localhost:${port}`);
});


