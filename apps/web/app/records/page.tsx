import { MongoClient } from 'mongodb';

// Connect to MongoDB and fetch records
async function getRecords() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('emergency_dispatcher');
    const collection = db.collection('records');
    
    // Seed dummy data if empty
    const count = await collection.countDocuments();
    if (count === 0) {
      const dummyRecords = [
        { incident_id: "EMRG-2025-0415", type: "Medical Emergency", severity: "High", location: "123 Main St, Apt 4B", caller: "Jane Doe", phone: "+1 555-0198", timestamp: new Date(), status: "Resolved", summary: "Caller reported intense chest pain and shortness of breath. EMT dispatched immediately." },
        { incident_id: "EMRG-2025-0416", type: "Structure Fire", severity: "Critical", location: "890 Oak Ave, Warehouse 3", caller: "John Smith", phone: "+1 555-0222", timestamp: new Date(Date.now() - 3600000), status: "Active", summary: "Large warehouse fire reported. 3 engines on scene. No known casualties yet." },
        { incident_id: "EMRG-2025-0417", type: "Traffic Accident", severity: "Medium", location: "I-95 Northbound, Mile 42", caller: "Anonymous", phone: "+1 555-0888", timestamp: new Date(Date.now() - 7200000), status: "Resolved", summary: "Two car collision, minor injuries. Traffic cleared." },
        { incident_id: "EMRG-2025-0418", type: "Disturbance", severity: "Low", location: "Central Park South", caller: "Mike T.", phone: "+1 555-0999", timestamp: new Date(Date.now() - 14400000), status: "Resolved", summary: "Noise complaint, officers resolved the issue." }
      ];
      await collection.insertMany(dummyRecords);
    }
    
    const records = await collection.find({}).sort({ timestamp: -1 }).toArray();
    return records.map(r => ({...r, _id: r._id.toString()})) as any[];
  } catch (error) {
    console.error("MongoDB Error:", error);
    return []; // Return empty if mongo fails
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
