import { MongoClient } from 'mongodb';
import ClientRecordsTable from './ClientRecordsTable';

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
    <main style={{ padding: 'clamp(1rem, 3vw, 3rem)', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
      <header style={{ padding: '24px 28px', borderRadius: 18, color: '#fff', background: 'linear-gradient(115deg, #121a2d, #20233b)', boxShadow: '0 18px 40px rgba(15,23,42,.16)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ margin: 0, color: '#fca5a5', fontSize: 12, fontWeight: 800, letterSpacing: '.1em' }}>DATABASE ARCHIVE</p>
          <h1 style={{ margin: '6px 0 0', fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}>Incident Records</h1>
          <p style={{ color: '#cbd5e1', marginTop: '0.5rem', fontSize: '0.95rem' }}>Historical log of all emergency calls processed by E-MRG.</p>
        </div>
        <a href="/" className="btn-primary" style={{ background: 'var(--accent-red)', color: '#fff', textDecoration: 'none', padding: '0.6rem 1.2rem', borderRadius: '10px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(239,68,68,.3)' }}>
          &larr; Back to Home
        </a>
      </header>

      <ClientRecordsTable records={records} />
    </main>
  );
}
