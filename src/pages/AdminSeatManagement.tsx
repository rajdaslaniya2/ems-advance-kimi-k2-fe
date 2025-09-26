import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';

interface Seat {
  id?: string;
  seatNumber: string;
  row: string;
  section: string;
  price: number;
  type: 'regular' | 'vip' | 'premium';
}

const AdminSeatManagement: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<any>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [rows, setRows] = useState(8);
  const [seatsPerRow, setSeatsPerRow] = useState(10);
  const [basePrice, setBasePrice] = useState(50);
  const [sections, setSections] = [
    { name: 'VIP', rows: ['A', 'B'], multiplier: 2.0 },
    { name: 'Premium', rows: ['C', 'D', 'E'], multiplier: 1.5 },
    { name: 'General', rows: ['F', 'G', 'H'], multiplier: 1.0 }
  ];

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const eventData = await api.getEvent(eventId!);
      setEvent(eventData);
      setBasePrice(eventData.price || 50);
    } catch (err) {
      console.error('Failed to fetch event:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateSeats = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const newSeats: Seat[] = [];
    
    for (let i = 0; i < rows; i++) {
      const row = alphabet[i];
      const section = sections.find(s => s.rows.includes(row));
      
      for (let j = 1; j <= seatsPerRow; j++) {
        const price = Math.round(basePrice * (section?.multiplier || 1));
        const type = section?.name === 'VIP' ? 'vip' : section?.name === 'Premium' ? 'premium' : 'regular';
        
        newSeats.push({
          seatNumber: j.toString(),
          row,
          section: section?.name || 'General',
          price,
          type
        });
      }
    }
    
    setSeats(newSeats);
  };

  const handleSave = async () => {
    if (!eventId) return;
    
    try {
      setSaving(true);
      await api.createSeats(eventId, seats);
      alert('Seats created successfully!');
    } catch (err: any) {
      alert('Failed to create seats: ' + err.response?.data?.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6">Manage Seats - {event?.name}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Rows</label>
              <input
                type="number"
                value={rows}
                onChange={(e) => setRows(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg"
                min="1"
                max="26"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Seats per Row</label>
              <input
                type="number"
                value={seatsPerRow}
                onChange={(e) => setSeatsPerRow(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg"
                min="1"
                max="30"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Base Price</label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg"
                min="1"
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Sections</h3>
            <div className="space-y-2">
              {sections.map((section, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <input
                    type="text"
                    value={section.name}
                    onChange={(e) => {
                      const newSections = [...sections];
                      newSections[index].name = e.target.value;
                      setSections(newSections);
                    }}
                    className="px-3 py-2 border rounded-lg w-24"
                  />
                  <input
                    type="text"
                    value={section.rows.join(',')}
                    onChange={(e) => {
                      const newSections = [...sections];
                      newSections[index].rows = e.target.value.split(',').map(r => r.trim());
                      setSections(newSections);
                    }}
                    className="px-3 py-2 border rounded-lg w-32"
                    placeholder="A,B,C"
                  />
                  <input
                    type="number"
                    value={section.multiplier}
                    onChange={(e) => {
                      const newSections = [...sections];
                      newSections[index].multiplier = Number(e.target.value);
                      setSections(newSections);
                    }}
                    className="px-3 py-2 border rounded-lg w-20"
                    step="0.1"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={generateSeats}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Preview Seats ({seats.length} total)
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving || seats.length === 0}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400"
            >
              {saving ? 'Creating...' : 'Create Seats'}
            </button>
          </div>

          {seats.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Preview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sections.map(section => (
                  <div key={section.name} className="border rounded-lg p-3">
                    <h4 className="font-medium">{section.name}</h4>
                    <p className="text-sm text-gray-600">
                      Rows: {section.rows.join(', ')}
                    </p>
                    <p className="text-sm text-gray-600">
                      Price: ${Math.round(basePrice * section.multiplier)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSeatManagement;
