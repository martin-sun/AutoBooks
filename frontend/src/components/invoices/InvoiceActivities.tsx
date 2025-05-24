import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { format } from 'date-fns';

// Invoice Activity interface
interface InvoiceActivity {
  id: string;
  invoice_id: string;
  activity_type: string;
  description: string;
  performed_by: string;
  performed_by_name: string;
  created_at: string;
}

interface InvoiceActivitiesProps {
  activities: InvoiceActivity[];
}

// Date and time formatting function
function formatDateTime(dateString: string): string {
  return format(new Date(dateString), 'PPP p');
}

// Activity icon based on type
function ActivityIcon({ type }: { type: string }) {
  const getIconClass = (type: string) => {
    switch (type.toLowerCase()) {
      case 'created':
        return 'bg-blue-100 text-blue-600';
      case 'updated':
        return 'bg-purple-100 text-purple-600';
      case 'sent':
        return 'bg-green-100 text-green-600';
      case 'payment':
        return 'bg-emerald-100 text-emerald-600';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getIconClass(type)}`}>
      {type.charAt(0).toUpperCase()}
    </div>
  );
}

export function InvoiceActivities({ activities }: InvoiceActivitiesProps) {
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            No activities recorded for this invoice yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort activities by date (newest first)
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedActivities.map((activity) => (
            <div key={activity.id} className="flex">
              <ActivityIcon type={activity.activity_type} />
              <div className="ml-4 flex-1">
                <div className="flex justify-between">
                  <p className="font-medium">{activity.description}</p>
                  <span className="text-sm text-muted-foreground">
                    {formatDateTime(activity.created_at)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  by {activity.performed_by_name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
