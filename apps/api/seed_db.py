import { MongoClient } from 'pymongo'
import datetime

uri = "mongodb://localhost:27017" # default or whatever is in settings
client = MongoClient(uri)
db = client['emergency_dispatcher']
records_col = db['records']

# clear old data
records_col.delete_many({})

dummy_records = [
    {
        "incident_id": "EMRG-2025-0415",
        "type": "Medical Emergency",
        "severity": "High",
        "location": "123 Main St, Apt 4B",
        "caller": "Jane Doe",
        "phone": "+1 555-0198",
        "timestamp": datetime.datetime.utcnow() - datetime.timedelta(minutes=10),
        "status": "Resolved",
        "summary": "Caller reported intense chest pain and shortness of breath. EMT dispatched immediately."
    },
    {
        "incident_id": "EMRG-2025-0416",
        "type": "Structure Fire",
        "severity": "Critical",
        "location": "890 Oak Ave, Warehouse 3",
        "caller": "John Smith",
        "phone": "+1 555-0222",
        "timestamp": datetime.datetime.utcnow() - datetime.timedelta(hours=2),
        "status": "Active",
        "summary": "Large warehouse fire reported. 3 engines on scene. No known casualties yet."
    },
    {
        "incident_id": "EMRG-2025-0417",
        "type": "Traffic Accident",
        "severity": "Medium",
        "location": "I-95 Northbound, Mile 42",
        "caller": "Anonymous",
        "phone": "+1 555-0888",
        "timestamp": datetime.datetime.utcnow() - datetime.timedelta(days=1),
        "status": "Resolved",
        "summary": "Two car collision, minor injuries. Traffic cleared."
    },
    {
        "incident_id": "EMRG-2025-0418",
        "type": "Disturbance",
        "severity": "Low",
        "location": "Central Park South",
        "caller": "Mike T.",
        "phone": "+1 555-0999",
        "timestamp": datetime.datetime.utcnow() - datetime.timedelta(days=2),
        "status": "Resolved",
        "summary": "Noise complaint, officers resolved the issue."
    }
]

records_col.insert_many(dummy_records)
print("Dummy data seeded successfully!")
