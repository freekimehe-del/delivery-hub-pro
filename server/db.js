const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || null;

let pool = null;

if (DATABASE_URL) {
  pool = new Pool({ connectionString: DATABASE_URL });
}

async function insertDocument(metadata) {
  if (!pool) return null;
  const client = await pool.connect();
  try {
    const { shipment_id, doc_type, reference_number, issue_date, expiry_date, storage_path, verification_status, metadata_json } = metadata;
    const res = await client.query(
      `INSERT INTO shipment_documents (shipment_id, doc_type, reference_number, issue_date, expiry_date, storage_path, verification_status, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [shipment_id, doc_type || 'invoice', reference_number || null, issue_date || null, expiry_date || null, storage_path || null, verification_status || 'pending', metadata_json || {}]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}

module.exports = { insertDocument };
