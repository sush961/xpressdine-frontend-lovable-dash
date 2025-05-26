
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data for reservations
const reservations = [
  {
    id: '1',
    name: 'Sarah Johnson',
    time: '12:30 PM',
    date: 'Today',
    guests: 4,
    status: 'confirmed'
  },
  {
    id: '2',
    name: 'Michael Chen',
    time: '1:45 PM',
    date: 'Today',
    guests: 2,
    status: 'pending'
  },
  {
    id: '3',
    name: 'David Smith',
    time: '7:30 PM',
    date: 'Today',
    guests: 6,
    status: 'confirmed'
  },
  {
    id: '4',
    name: 'Jessica Wong',
    time: '8:00 PM',
    date: 'Today',
    guests: 3,
    status: 'confirmed'
  },
];

export function ReservationsList() {
  const navigate = useNavigate();
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Today's Reservations</CardTitle>
        <button 
          className="text-sm text-brand-orange font-medium hover:underline"
          onClick={() => navigate('/reservations?filter=today')}
        >
          View All
        </button>
      </CardHeader>
      <CardContent className="px-6 pb-4">
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div 
              key={reservation.id}
              className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-medium text-sm">
                  {reservation.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium">{reservation.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {reservation.time} · {reservation.guests} guests
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span 
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    reservation.status === 'confirmed' 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-yellow-50 text-yellow-700'
                  }`}
                >
                  {reservation.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
