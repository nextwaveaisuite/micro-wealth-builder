import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Input } from '@/components/ui/input.jsx';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity,
  Shield,
  LogOut,
  Eye,
  AlertCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminAuth, adminDb } from './lib/supabase';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Dashboard data
  const [stats, setStats] = useState({ totalUsers: 0, totalValue: 0, avgValue: 0 });
  const [users, setUsers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [platformStats, setPlatformStats] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const checkAuth = async () => {
    const user = await adminAuth.getUser();
    setIsAuthenticated(!!user);
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error } = await adminAuth.signIn(email, password);
    
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setIsAuthenticated(true);
    setLoading(false);
  };

  const handleLogout = async () => {
    await adminAuth.signOut();
    setIsAuthenticated(false);
  };

  const loadDashboardData = async () => {
    const statsData = await adminDb.getUserStats();
    setStats(statsData);

    const { data: usersData } = await adminDb.getUsers();
    setUsers(usersData || []);

    const { data: ordersData } = await adminDb.getRecentOrders();
    setRecentOrders(ordersData || []);

    const platformData = await adminDb.getPlatformStats();
    setPlatformStats(platformData || []);

    const { data: logsData } = await adminDb.getSystemLogs();
    setSystemLogs(logsData || []);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="w-16 h-16 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Console</CardTitle>
            <CardDescription>Micro Wealth Builder Administration</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              )}
              
              <div>
                <label className="text-sm font-semibold mb-2 block">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Admin Console
              </h1>
              <p className="text-xs text-muted-foreground">Micro Wealth Builder</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-slate-200 dark:border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
                </div>
                <Users className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 dark:border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Total Portfolio Value</p>
                  <p className="text-3xl font-bold mt-2">${(stats.totalValue / 1000).toFixed(0)}k</p>
                </div>
                <DollarSign className="w-12 h-12 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 dark:border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Avg Portfolio</p>
                  <p className="text-3xl font-bold mt-2">${(stats.avgValue / 1000).toFixed(1)}k</p>
                </div>
                <TrendingUp className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 border-b-2">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="logs">System Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card className="border-2 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="font-bold">User Management</CardTitle>
                <CardDescription>View and manage all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No users yet</p>
                  ) : (
                    users.map((user, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border-2 border-slate-200 dark:border-slate-700">
                        <div className="flex-1">
                          <div className="font-bold">{user.user_id}</div>
                          <div className="text-sm text-muted-foreground">
                            Risk: {user.risk_band} • ${user.contribution_amount}/{user.contribution_cadence}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.buy_the_dip_enabled ? 'default' : 'secondary'}>
                            {user.buy_the_dip_enabled ? 'DIP ON' : 'DIP OFF'}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="border-2 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="font-bold">Platform Usage</CardTitle>
                <CardDescription>Most popular ETFs and assets</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={platformStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ticker" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card className="border-2 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="font-bold">Recent Orders</CardTitle>
                <CardDescription>Latest order activity across all users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentOrders.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No orders yet</p>
                  ) : (
                    recentOrders.map((order, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border-2 border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold">${order.total_amount}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.orders?.length || 0} assets • {order.dip_extra > 0 ? `+$${order.dip_extra} dip` : 'Regular'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card className="border-2 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="font-bold">System Logs</CardTitle>
                <CardDescription>Admin actions and system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {systemLogs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No logs yet</p>
                  ) : (
                    systemLogs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm border border-slate-200 dark:border-slate-700">
                        <Activity className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-bold">{log.action}</div>
                          <div className="text-xs text-muted-foreground">{log.details}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;

