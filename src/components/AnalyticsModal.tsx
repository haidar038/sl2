import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, Users, Globe, Monitor, MousePointer, Download } from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO, subDays } from "date-fns";

interface AnalyticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  urlId: string;
  urlSlug: string;
}

interface Click {
  id: string;
  created_at: string;
  ip_hash: string;
  user_agent: string;
  referrer: string;
  country: string;
  city: string;
  device: string;
  browser: string;
  os: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

export const AnalyticsModal = ({ open, onOpenChange, urlId, urlSlug }: AnalyticsModalProps) => {
  const [clicks, setClicks] = useState<Click[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchClicks();
    }
  }, [open, urlId]);

  const fetchClicks = async () => {
    setLoading(true);
    try {
      console.log('Fetching clicks for URL ID:', urlId);

      const { data, error } = await supabase
        .from('clicks')
        .select('*')
        .eq('url_id', urlId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching clicks:', error);
        throw error;
      }

      console.log('Fetched clicks data:', data);
      console.log('Total clicks found:', data?.length || 0);

      setClicks(data || []);
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalClicks = clicks.length;
  const uniqueIPs = new Set(clicks.map(c => c.ip_hash)).size;
  const uniqueCountries = new Set(clicks.filter(c => c.country).map(c => c.country)).size;
  const avgClicksPerDay = clicks.length > 0
    ? (clicks.length / Math.max(1, Math.ceil((new Date().getTime() - new Date(clicks[0]?.created_at).getTime()) / (1000 * 60 * 60 * 24)))).toFixed(1)
    : '0';

  // Clicks over time (last 30 days)
  const clicksOverTime = () => {
    const data: { [key: string]: number } = {};
    const last30Days = 30;

    for (let i = last30Days; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'MMM dd');
      data[date] = 0;
    }

    clicks.forEach(click => {
      const date = format(parseISO(click.created_at), 'MMM dd');
      if (data[date] !== undefined) {
        data[date]++;
      }
    });

    return Object.entries(data).map(([date, count]) => ({ date, clicks: count }));
  };

  // Device breakdown
  const deviceData = () => {
    const devices: { [key: string]: number } = {};
    clicks.forEach(click => {
      const device = click.device || 'Unknown';
      devices[device] = (devices[device] || 0) + 1;
    });
    return Object.entries(devices).map(([name, value]) => ({ name, value }));
  };

  // Browser breakdown
  const browserData = () => {
    const browsers: { [key: string]: number } = {};
    clicks.forEach(click => {
      const browser = click.browser || 'Unknown';
      browsers[browser] = (browsers[browser] || 0) + 1;
    });
    return Object.entries(browsers)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  };

  // OS breakdown
  const osData = () => {
    const oses: { [key: string]: number } = {};
    clicks.forEach(click => {
      const os = click.os || 'Unknown';
      oses[os] = (oses[os] || 0) + 1;
    });
    return Object.entries(oses)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  };

  // Country breakdown
  const countryData = () => {
    const countries: { [key: string]: number } = {};
    clicks.forEach(click => {
      const country = click.country || 'Unknown';
      countries[country] = (countries[country] || 0) + 1;
    });
    return Object.entries(countries)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  };

  // Referrer breakdown
  const referrerData = () => {
    const referrers: { [key: string]: number } = {};
    clicks.forEach(click => {
      let referrer = 'Direct';
      if (click.referrer) {
        try {
          const url = new URL(click.referrer);
          referrer = url.hostname;
        } catch {
          referrer = 'Direct';
        }
      }
      referrers[referrer] = (referrers[referrer] || 0) + 1;
    });
    return Object.entries(referrers)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  };

  // Export analytics to CSV
  const exportToCSV = () => {
    if (clicks.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      // Create CSV header
      const headers = [
        'Date & Time',
        'Country',
        'City',
        'Device',
        'Browser',
        'OS',
        'Referrer',
        'IP Hash'
      ];

      // Create CSV rows
      const rows = clicks.map(click => [
        format(parseISO(click.created_at), 'yyyy-MM-dd HH:mm:ss'),
        click.country || 'Unknown',
        click.city || 'Unknown',
        click.device || 'Unknown',
        click.browser || 'Unknown',
        click.os || 'Unknown',
        click.referrer || 'Direct',
        click.ip_hash ? click.ip_hash.substring(0, 16) + '...' : 'N/A'
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `analytics-${urlSlug}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Analytics exported successfully!');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export analytics');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Analytics for /{urlSlug}</DialogTitle>
              <DialogDescription>
                Detailed analytics and insights for your short URL
              </DialogDescription>
            </div>
            {!loading && clicks.length > 0 && (
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MousePointer className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalClicks}</p>
                    <p className="text-xs text-muted-foreground">Total Clicks</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{uniqueIPs}</p>
                    <p className="text-xs text-muted-foreground">Unique Visitors</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{avgClicksPerDay}</p>
                    <p className="text-xs text-muted-foreground">Avg/Day</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{uniqueCountries}</p>
                    <p className="text-xs text-muted-foreground">Countries</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts */}
            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="devices">Devices</TabsTrigger>
                <TabsTrigger value="browsers">Browsers</TabsTrigger>
                <TabsTrigger value="locations">Locations</TabsTrigger>
                <TabsTrigger value="referrers">Referrers</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Clicks Over Time (Last 30 Days)</h3>
                  {clicks.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No data available</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={clicksOverTime()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="clicks" stroke="#8884d8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="devices" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Device Distribution</h3>
                    {deviceData().length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No data available</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={deviceData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {deviceData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Operating Systems</h3>
                    {osData().length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No data available</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={osData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="browsers" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Browser Distribution</h3>
                  {browserData().length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No data available</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={browserData()} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="locations" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Top Countries</h3>
                  {countryData().length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No data available</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={countryData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#0088FE" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="referrers" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Top Referrers</h3>
                  {referrerData().length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No data available</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={referrerData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#FFBB28" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
