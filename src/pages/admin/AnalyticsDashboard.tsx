import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, Briefcase, Target, Users, Car } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ReportsDataTable } from "@/components/admin/ReportsDataTable";

const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState("30");
  const [activeTab, setActiveTab] = useState("overview");

  // Demo data for KPIs
  const kpis = [
    {
      label: "Total Revenue",
      value: "£12,450",
      trend: "+12.5%",
      isPositive: true,
      icon: DollarSign,
    },
    {
      label: "Jobs Completed",
      value: "87",
      trend: "+8.2%",
      isPositive: true,
      icon: Briefcase,
    },
    {
      label: "Average Job Value",
      value: "£143",
      trend: "+4.1%",
      isPositive: true,
      icon: Target,
    },
    {
      label: "Fleet Utilisation",
      value: "72%",
      trend: "-2.3%",
      isPositive: false,
      icon: Car,
    },
    {
      label: "Repeat Clients",
      value: "61%",
      trend: "+5.7%",
      isPositive: true,
      icon: Users,
    },
  ];

  // Demo data for revenue trend
  const revenueData = [
    { period: "Week 1", revenue: 8500 },
    { period: "Week 2", revenue: 9200 },
    { period: "Week 3", revenue: 7800 },
    { period: "Week 4", revenue: 10100 },
    { period: "Week 5", revenue: 11200 },
    { period: "Week 6", revenue: 9800 },
    { period: "Week 7", revenue: 10500 },
    { period: "Week 8", revenue: 11800 },
    { period: "Week 9", revenue: 10900 },
    { period: "Week 10", revenue: 12200 },
    { period: "Week 11", revenue: 11500 },
    { period: "Week 12", revenue: 12450 },
  ];

  // Demo data for jobs completed
  const jobsData = [
    { period: "Week 1", jobs: 18 },
    { period: "Week 2", jobs: 22 },
    { period: "Week 3", jobs: 19 },
    { period: "Week 4", jobs: 25 },
    { period: "Week 5", jobs: 28 },
    { period: "Week 6", jobs: 24 },
    { period: "Week 7", jobs: 26 },
    { period: "Week 8", jobs: 30 },
    { period: "Week 9", jobs: 27 },
    { period: "Week 10", jobs: 31 },
    { period: "Week 11", jobs: 29 },
    { period: "Week 12", jobs: 32 },
  ];

  // Demo data for job type breakdown
  const jobTypeData = [
    { name: "Airport Transfers", value: 42, color: "hsl(45, 100%, 60%)" },
    { name: "Corporate Travel", value: 28, color: "hsl(45, 80%, 50%)" },
    { name: "Special Events", value: 18, color: "hsl(45, 60%, 40%)" },
    { name: "Close Protection", value: 12, color: "hsl(45, 40%, 30%)" },
  ];

  // Demo data for driver utilisation
  const driverUtilisationData = [
    { name: "James Mitchell", utilisation: 85 },
    { name: "Sarah Thompson", utilisation: 78 },
    { name: "David Chen", utilisation: 72 },
    { name: "Emma Wilson", utilisation: 68 },
    { name: "Robert Davies", utilisation: 62 },
  ];

  // Demo data for fleet
  const fleetData = [
    { vehicle: "RR Phantom", jobs: 12, mileage: "1,040", status: "Active" },
    { vehicle: "Range Rover", jobs: 8, mileage: "950", status: "In Service" },
    { vehicle: "Mercedes S-Class", jobs: 15, mileage: "1,230", status: "Active" },
    { vehicle: "BMW 7 Series", jobs: 11, mileage: "890", status: "Active" },
    { vehicle: "Bentley Flying Spur", jobs: 9, mileage: "780", status: "Active" },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-1">{label}</p>
          <p className="text-sm text-accent font-semibold">
            {payload[0].name === "revenue" ? "£" : ""}{payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
            <div>
              <h1 className="text-3xl font-display font-bold text-gradient-metal mb-2">
                Analytics & Reports
              </h1>
              <p className="text-muted-foreground">
                Performance insights and detailed operational data
              </p>
            </div>
            {activeTab === "overview" && (
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[180px] border-accent/30 focus:border-accent">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">This Year</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-12">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-glow transition-all"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="reports"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-glow transition-all"
            >
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-12 mt-8">

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 animate-fade-in animation-delay-200">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card 
                key={index} 
                className="relative overflow-hidden border-accent/20 hover:border-accent/40 transition-all hover-lift group"
              >
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-accent" />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-semibold ${
                      kpi.isPositive ? "text-green-500" : "text-red-500"
                    }`}>
                      {kpi.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {kpi.trend}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground mb-1">{kpi.value}</div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                </CardContent>
              </Card>
            );
            })}
            </div>

            {/* Revenue & Jobs Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in animation-delay-400">
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="font-display text-2xl">Revenue Over Time</CardTitle>
              <CardDescription>Last 12 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 20%)" />
                  <XAxis 
                    dataKey="period" 
                    stroke="hsl(0 0% 60%)"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="hsl(0 0% 60%)"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(45 100% 60%)" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(45 100% 60%)", r: 4 }}
                    activeDot={{ r: 6, fill: "hsl(45 100% 70%)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="font-display text-2xl">Jobs Completed</CardTitle>
              <CardDescription>Weekly breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={jobsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 20%)" />
                  <XAxis 
                    dataKey="period" 
                    stroke="hsl(0 0% 60%)"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="hsl(0 0% 60%)"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="jobs" 
                    fill="hsl(45 100% 60%)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              </CardContent>
            </Card>
            </div>

            {/* Operations Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in animation-delay-600">
          {/* Job Type Breakdown */}
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="font-display text-xl">Job Type Breakdown</CardTitle>
              <CardDescription>Distribution by service</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={jobTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {jobTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {jobTypeData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-semibold text-foreground">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Driver Utilisation */}
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="font-display text-xl">Driver Utilisation</CardTitle>
              <CardDescription>Assigned hours this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {driverUtilisationData.map((driver, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-foreground">{driver.name}</span>
                      <span className="text-sm font-semibold text-accent">{driver.utilisation}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-accent transition-all duration-500"
                        style={{ width: `${driver.utilisation}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="font-display text-xl">Performance Metrics</CardTitle>
              <CardDescription>Key operational indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">On-Time Arrivals</span>
                    <span className="text-2xl font-bold text-accent">94%</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Above target of 90%</div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Average Wait Time</span>
                    <span className="text-2xl font-bold text-foreground">3.2 min</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Below target of 5 min</div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Cancellation Rate</span>
                    <span className="text-2xl font-bold text-foreground">2.1%</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Within acceptable range</div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
                    <span className="text-2xl font-bold text-accent">4.8/5.0</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Based on 247 reviews</div>
                </div>
              </div>
              </CardContent>
            </Card>
            </div>

            {/* Fleet Insights */}
            <Card className="border-accent/20 animate-fade-in">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Fleet Insights</CardTitle>
            <CardDescription>Vehicle performance this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Vehicle</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Jobs</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Mileage</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fleetData.map((vehicle, index) => (
                    <tr 
                      key={index} 
                      className="border-b border-border/50 hover:bg-accent/5 transition-colors"
                    >
                      <td className="py-4 px-4 text-sm font-medium text-foreground">{vehicle.vehicle}</td>
                      <td className="py-4 px-4 text-sm text-foreground">{vehicle.jobs}</td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">{vehicle.mileage} mi</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          vehicle.status === "Active" 
                            ? "bg-accent/10 text-accent" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            vehicle.status === "Active" ? "bg-accent" : "bg-muted-foreground"
                          }`} />
                          {vehicle.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-8">
            <ReportsDataTable />
          </TabsContent>
        </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
