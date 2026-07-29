import { MongoClient } from 'mongodb';

// Read both manually-created records and live AI incidents from the shared Mongo database.
async function getRecords() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/emergency_dispatcher";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('emergency_dispatcher');
    const [records, incidents] = await Promise.all([
      db.collection('records').find({}).sort({ timestamp: -1 }).toArray(),
      db.collection('incidents').find({}).sort({ updated_at: -1 }).toArray(),
    ]);
    const saved = records.map((record) => ({ ...record, _id: record._id.toString(), incident_id: String(record.incident_id ?? record.call_id), timestamp: record.timestamp ?? record.updated_at, type: record.type ?? record.incident_type ?? 'Unknown', severity: String(record.severity ?? 'unknown'), location: record.location ?? 'Not confirmed', status: record.status ?? record.dispatcher_status ?? 'Active', summary: record.summary ?? record.reply ?? '' }));
    const live = incidents.map((incident) => ({ ...incident, _id: String(incident.call_id), incident_id: String(incident.call_id), timestamp: incident.updated_at, type: incident.incident_type ?? 'Unknown', severity: String(incident.severity ?? 'unknown'), location: incident.location ?? 'Not confirmed', status: incident.dispatcher_status === 'resolved' ? 'Resolved' : 'Active', summary: incident.summary ?? incident.reply ?? '' }));
    return [...saved, ...live].sort((a, b) => new Date(String(b.timestamp)).getTime() - new Date(String(a.timestamp)).getTime());
  } catch (error) {
    console.error("MongoDB Error:", error);
    return [];
  } finally {
    await client.close();
  }
}

export default async function RecordsPage() {
  const records = await getRecords();

  return (
    <div style={{ padding: '3rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Incident Records</h1>
          <p style={{ color: '#64748b', margin: 0, marginTop: '0.25rem' }}>Historical log of all emergency calls processed by E-MRG.</p>
        </div>
        <a href="/" style={{ color: 'var(--accent-red)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          &larr; Back to Home
        </a>
      </header>

      <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Incident ID</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Type</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Severity</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Location</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  No records found. Make sure MongoDB is running.
                </td>
              </tr>
            ) : records.map((record, i) => (
              <tr key={record._id} style={{ borderBottom: i === records.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>{record.incident_id}</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>{record.type}</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600,
                    background: record.severity === 'Critical' ? 'var(--accent-red-light)' : record.severity === 'High' ? '#ffedd5' : '#dcfce7',
                    color: record.severity === 'Critical' ? 'var(--accent-red)' : record.severity === 'High' ? '#ea580c' : '#16a34a'
                  }}>
                    {record.severity}
                  </span>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)' }}>{record.location}</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600,
                    background: record.status === 'Active' ? '#dbeafe' : '#f1f5f9',
                    color: record.status === 'Active' ? '#2563eb' : '#64748b'
                  }}>
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
