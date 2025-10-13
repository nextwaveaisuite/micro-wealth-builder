import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { 
  TrendingUp, 
  Shield, 
  DollarSign, 
  Calendar, 
  PieChart, 
  Download,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap
} from 'lucide-react';
import { LineChart, Line, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { generateOrderPlan, calculateAllocation, checkRebalanceNeeded, projectFutureValue, simulateCrashRecovery, scoreAssets } from './lib/engine';
import { PROVIDERS, openProvider, downloadCSV, getRecommendedProvider } from './lib/deeplinks';
import { generatePerformanceData, calculatePL, generatePlannedBuys, ETF_COLORS } from './lib/performance';
import universe from './data/universe.json';
import './App.css';

// Default user settings
const DEFAULT_SETTINGS = {
  riskBand: 'balanced',
  contribution: {
    amount: 50,
    cadence: 'weekly'
  },
  buyTheDip: {
    enabled: true,
    triggered: false,
    extraAmount: 15
  }
};

// Mock holdings for demo
const DEMO_HOLDINGS = [
  { ticker: 'VAS', units: 15, value: 1350 },
  { ticker: 'VGS', units: 20, value: 2300 },
  { ticker: 'IVV', units: 5, value: 3000 },
  { ticker: 'VAF', units: 30, value: 1500 },
  { ticker: 'GOLD', units: 5, value: 1300 }
];

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#ca8a04'];

function App() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [holdings, setHoldings] = useState(DEMO_HOLDINGS);
  const [orderPlan, setOrderPlan] = useState(null);
  const [allocation, setAllocation] = useState(null);
  const [rebalanceCheck, setRebalanceCheck] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [performanceData] = useState(generatePerformanceData());
  const [plData] = useState(() => calculatePL(generatePerformanceData()));

  // Generate order plan when settings change
  useEffect(() => {
    const plan = generateOrderPlan(settings, holdings);
    setOrderPlan(plan);
    
    const alloc = calculateAllocation(holdings);
    setAllocation(alloc);
    
    const rebalance = checkRebalanceNeeded(holdings, settings.riskBand, '2024-01-01');
    setRebalanceCheck(rebalance);
  }, [settings, holdings]);

  // Projection data
  const projectionYears = 20;
  const monthlyContrib = settings.contribution.cadence === 'weekly' 
    ? settings.contribution.amount * 4.33 
    : settings.contribution.cadence === 'fortnightly'
    ? settings.contribution.amount * 2.17
    : settings.contribution.amount;
  
  const projectedValue = projectFutureValue(
    allocation?.total || 0,
    monthlyContrib,
    0.07,
    projectionYears
  );

  // Crash simulation data
  const crashData = simulateCrashRecovery(10000, monthlyContrib, -0.30, 18);

  // Pie chart data
  const pieData = holdings.map(h => {
    const asset = universe.find(a => a.ticker === h.ticker);
    return {
      name: h.ticker,
      value: h.value,
      category: asset?.category || 'unknown'
    };
  });

  const updateContribution = (amount) => {
    setSettings(prev => ({
      ...prev,
      contribution: { ...prev.contribution, amount: parseFloat(amount) || 0 }
    }));
  };

  const updateRiskBand = (band) => {
    setSettings(prev => ({ ...prev, riskBand: band }));
  };

  const toggleBuyTheDip = () => {
    setSettings(prev => ({
      ...prev,
      buyTheDip: { ...prev.buyTheDip, enabled: !prev.buyTheDip.enabled }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Micro Wealth Builder
          </h1>
          <p className="text-muted-foreground">
            Autonomous micro-investing powered by rules-based allocation
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="home" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </TabsTrigger>
            <TabsTrigger value="autopilot" className="gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Autopilot</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="gap-2">
              <PieChart className="w-4 h-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="simulator" className="gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Simulator</span>
            </TabsTrigger>
            <TabsTrigger value="execute" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Execute</span>
            </TabsTrigger>
          </TabsList>

          {/* Home Tab */}
          <TabsContent value="home" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${allocation?.total?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {allocation && (
                      <span className="text-green-600 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" />
                        +7.2% this month
                      </span>
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Next Contribution</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${orderPlan?.totalAmount || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {orderPlan?.nextRunDate}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Allocation Status</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {allocation && `${Math.round(allocation.growth * 100)}/${Math.round(allocation.safety * 100)}`}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Growth / Safety
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Next Order Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Next Order Plan
                </CardTitle>
                <CardDescription>
                  Automated allocation for your next contribution on {orderPlan?.nextRunDate}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderPlan?.orders.map((order, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold">{order.ticker}</div>
                      <div className="text-sm text-muted-foreground">{order.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{order.reason}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">${order.amount.toFixed(2)}</div>
                      <Badge variant={order.category === 'growth' ? 'default' : 'secondary'}>
                        {order.category}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {orderPlan?.dipExtra > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-sm">
                      Buy-the-dip triggered: <strong>${orderPlan.dipExtra}</strong> extra added
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Planned Buys with Priority */}
            <Card className="border-2 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Planned Buys (Priority Order)
                </CardTitle>
                <CardDescription>
                  Lowest fee wins per sleeve - MVP rule
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {orderPlan && generatePlannedBuys(orderPlan).map((buy, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                    buy.priority === 'high' 
                      ? 'bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-800' 
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  }`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{buy.ticker}</span>
                        <Badge variant={buy.sleeve === 'growth' ? 'default' : 'secondary'} className="text-xs">
                          {buy.sleeve}
                        </Badge>
                        {buy.priority === 'high' && (
                          <Badge className="bg-green-600 text-white text-xs">
                            ★ Lowest Fee
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Fee: {buy.fee}% • {buy.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">${buy.amount.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance Chart */}
            <Card className="border-2 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  12-Month Performance
                </CardTitle>
                <CardDescription>
                  Historical returns for Big 5 ETFs (normalized to 100)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="VAS.AX" stroke={ETF_COLORS['VAS.AX']} strokeWidth={2} dot={false} name="VAS" />
                    <Line type="monotone" dataKey="VGS.AX" stroke={ETF_COLORS['VGS.AX']} strokeWidth={2} dot={false} name="VGS" />
                    <Line type="monotone" dataKey="IVV.AX" stroke={ETF_COLORS['IVV.AX']} strokeWidth={2} dot={false} name="IVV" />
                    <Line type="monotone" dataKey="VAF.AX" stroke={ETF_COLORS['VAF.AX']} strokeWidth={2} dot={false} name="VAF" />
                    <Line type="monotone" dataKey="GOLD.AX" stroke={ETF_COLORS['GOLD.AX']} strokeWidth={2} dot={false} name="GOLD" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* P/L Panel */}
            <Card className="border-2 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  P/L (First → Last)
                </CardTitle>
                <CardDescription>
                  Ranked returns over 12 months
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {plData.map((item, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                    item.isPositive 
                      ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' 
                      : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-muted-foreground">#{idx + 1}</div>
                      <div>
                        <div className="font-bold">{item.ticker}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.firstValue.toFixed(2)} → {item.lastValue.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold flex items-center gap-1 ${
                        item.isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.isPositive ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                        {item.changePercent > 0 ? '+' : ''}{item.changePercent.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.isPositive ? '+' : ''}{item.change.toFixed(2)} pts
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Rebalance Alert */}
            {rebalanceCheck?.needed && (
              <Card className="border-orange-200 dark:border-orange-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <AlertCircle className="w-5 h-5" />
                    Rebalance Recommended
                  </CardTitle>
                  <CardDescription>{rebalanceCheck.reason}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    Your portfolio has drifted {(rebalanceCheck.maxDrift * 100).toFixed(1)}% from target.
                    Last rebalance was {rebalanceCheck.monthsSinceRebalance} months ago.
                  </p>
                  <Button variant="outline">View Rebalance Plan</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Autopilot Tab */}
          <TabsContent value="autopilot" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Policy Settings</CardTitle>
                <CardDescription>Configure your automated investment strategy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Risk Band */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Risk Profile</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['conservative', 'balanced', 'growth'].map(band => (
                      <Button
                        key={band}
                        variant={settings.riskBand === band ? 'default' : 'outline'}
                        onClick={() => updateRiskBand(band)}
                        className="capitalize"
                      >
                        {band === 'conservative' && <Shield className="w-4 h-4 mr-2" />}
                        {band === 'balanced' && <Target className="w-4 h-4 mr-2" />}
                        {band === 'growth' && <TrendingUp className="w-4 h-4 mr-2" />}
                        {band}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Contribution Amount */}
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Contribution Amount (${settings.contribution.amount} {settings.contribution.cadence})
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="200"
                    step="5"
                    value={settings.contribution.amount}
                    onChange={(e) => updateContribution(e.target.value)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>$5</span>
                    <span>$200</span>
                  </div>
                </div>

                {/* Cadence */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Contribution Frequency</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['weekly', 'fortnightly', 'monthly'].map(cadence => (
                      <Button
                        key={cadence}
                        variant={settings.contribution.cadence === cadence ? 'default' : 'outline'}
                        onClick={() => setSettings(prev => ({
                          ...prev,
                          contribution: { ...prev.contribution, cadence }
                        }))}
                        className="capitalize"
                      >
                        {cadence}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Buy the Dip */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <div>
                    <div className="font-medium">Buy the Dip</div>
                    <div className="text-sm text-muted-foreground">
                      Add extra ${settings.buyTheDip.extraAmount} when market drops 5%+
                    </div>
                  </div>
                  <Button
                    variant={settings.buyTheDip.enabled ? 'default' : 'outline'}
                    onClick={toggleBuyTheDip}
                  >
                    {settings.buyTheDip.enabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Projection */}
            <Card>
              <CardHeader>
                <CardTitle>20-Year Projection</CardTitle>
                <CardDescription>
                  Assuming 7% annual return with {settings.contribution.cadence} contributions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">
                  ${projectedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <p className="text-sm text-muted-foreground">
                  Current: ${allocation?.total?.toLocaleString() || 0} → 
                  Contributions: ${(monthlyContrib * 12 * projectionYears).toLocaleString()} → 
                  Growth: ${(projectedValue - (allocation?.total || 0) - monthlyContrib * 12 * projectionYears).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Allocation Pie */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Allocation</CardTitle>
                  <CardDescription>Portfolio distribution by asset</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Holdings List */}
              <Card>
                <CardHeader>
                  <CardTitle>Holdings</CardTitle>
                  <CardDescription>Your current positions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {holdings.map((holding, idx) => {
                    const asset = universe.find(a => a.ticker === holding.ticker);
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <div>
                          <div className="font-semibold">{holding.ticker}</div>
                          <div className="text-sm text-muted-foreground">{holding.units} units</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${holding.value.toLocaleString()}</div>
                          <Badge variant={asset?.category === 'growth' ? 'default' : 'secondary'}>
                            {asset?.category}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Asset Rankings */}
            <Card>
              <CardHeader>
                <CardTitle>Asset Rankings</CardTitle>
                <CardDescription>
                  Scored by your {settings.riskBand} risk profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {scoreAssets(universe.filter(a => a.eligible && a.category !== 'bundle'), settings.riskBand)
                    .slice(0, 5)
                    .map((asset, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl font-bold text-muted-foreground">#{idx + 1}</div>
                          <div>
                            <div className="font-semibold">{asset.ticker}</div>
                            <div className="text-sm text-muted-foreground">{asset.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{(asset.score * 100).toFixed(0)}</div>
                          <div className="text-xs text-muted-foreground">score</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Simulator Tab */}
          <TabsContent value="simulator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Crash & Recovery Simulation</CardTitle>
                <CardDescription>
                  30% market crash with continued DCA contributions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={crashData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Value ($)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      dot={false}
                      name="Portfolio Value"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-sm">
                    <strong>Key insight:</strong> Despite a 30% crash at month 6, continued contributions 
                    during the recovery phase allow you to buy assets at lower prices, accelerating long-term growth.
                    The portfolio fully recovers and exceeds pre-crash levels within 18 months.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Execute Tab */}
          <TabsContent value="execute" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Execute Orders</CardTitle>
                <CardDescription>
                  Choose your preferred platform to execute the order plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Export CSV */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold">Download Order CSV</div>
                      <div className="text-sm text-muted-foreground">
                        Import into your broker platform
                      </div>
                    </div>
                    <Button onClick={() => downloadCSV(orderPlan?.orders || [])}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                {/* Recommended Providers */}
                <div>
                  <h3 className="font-semibold mb-3">Recommended Platforms</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getRecommendedProvider(settings.contribution.amount).map(providerId => {
                      const provider = PROVIDERS[providerId];
                      return (
                        <div
                          key={providerId}
                          className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-colors cursor-pointer"
                          onClick={() => openProvider(providerId)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold">{provider.name}</div>
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {provider.description}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Min: ${provider.minContribution}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* All Providers */}
                <div>
                  <h3 className="font-semibold mb-3">All Platforms</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(PROVIDERS).map(([id, provider]) => (
                      <button
                        key={id}
                        className={`${provider.className} px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-md`}
                        onClick={() => openProvider(id)}
                      >
                        <ExternalLink className="w-4 h-4" />
                        {provider.name}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <strong>Important:</strong> This tool provides general educational information and 
                    automated portfolio suggestions based on your chosen settings. It is not personal 
                    financial advice. You are responsible for executing trades through your chosen broker. 
                    Past performance does not guarantee future results. Consider seeking advice from a 
                    licensed financial adviser.
                  </div>
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

