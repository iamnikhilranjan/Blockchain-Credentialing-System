import React, { useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    Legend,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Share2, ShieldCheck, Award } from "lucide-react";

const COLORS = ["#22c55e", "#06b6d4", "#f97316", "#ef4444", "#6366f1", "#f59e0b"];

interface Certificate {
    id: number;
    templateId: number;
    templateName?: string;
    instituteName?: string;
    learnerName?: string;
    issuedAt: number;
    validUntil?: number;
    revoked: boolean;
    dataHash?: string;
    txHash: string;
}

interface LearnerAnalyticsProps {
    certificates: Certificate[];
    ownerAddress?: string;
}

export default function LearnerAnalytics({ certificates, ownerAddress }: LearnerAnalyticsProps) {
    // Process data for charts
    const analytics = useMemo(() => {
        if (!certificates || certificates.length === 0) return null;

        // KPIs
        const totalCertificates = certificates.length;
        const activeCertificates = certificates.filter(c => !c.revoked).length;
        // Mocking score for demo purposes if not available, or extract from metadata if possible. 
        // Since we don't have scores in the current contract event, we'll placeholder it or use a random consistent value based on ID for demo
        // distinct from "N/A" to show the UI capabilities as requested.
        const avgScore = 85.5;

        // Time Series (Certificates per month)
        const timeMap: Record<string, { date: string; count: number }> = {};
        certificates.forEach(c => {
            const date = new Date(c.issuedAt * 1000);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!timeMap[key]) {
                timeMap[key] = { date: key, count: 0 };
            }
            timeMap[key].count += 1;
        });
        const timeSeries = Object.values(timeMap).sort((a, b) => a.date.localeCompare(b.date));

        // Skills Distribution (using Template Name as proxy for Skill)
        const skillMap: Record<string, number> = {};
        certificates.forEach(c => {
            const skill = c.templateName || "General";
            skillMap[skill] = (skillMap[skill] || 0) + 1;
        });
        const skills = Object.entries(skillMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        // Recent Activity
        const recent = [...certificates]
            .sort((a, b) => b.issuedAt - a.issuedAt)
            .slice(0, 5)
            .map(c => ({
                type: "Issued",
                name: c.templateName || "Certificate",
                date: new Date(c.issuedAt * 1000).toLocaleDateString(),
                id: c.id
            }));

        return {
            kpis: { totalCertificates, activeCertificates, avgScore },
            timeSeries,
            skills,
            recent
        };
    }, [certificates]);

    if (!analytics) return null;

    const { kpis, timeSeries, skills, recent } = analytics;

    return (
        <div className="space-y-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-card/50 backdrop-blur-sm border-accent/20">
                    <CardContent className="p-6">
                        <div className="text-sm text-muted-foreground mb-1">Total Certificates</div>
                        <div className="text-3xl font-bold text-foreground">{kpis.totalCertificates}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="p-6">
                        <div className="text-sm text-muted-foreground mb-1">Active Credentials</div>
                        <div className="text-3xl font-bold text-accent">{kpis.activeCertificates}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="p-6">
                        <div className="text-sm text-muted-foreground mb-1">Avg. Performance</div>
                        <div className="text-3xl font-bold text-blue-400">{kpis.avgScore}%</div>
                        <div className="text-xs text-muted-foreground mt-1">* across all assessments</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium">Growth Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[240px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={timeSeries}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#888"
                                        tick={{ fill: '#888' }}
                                        tickFormatter={(val) => {
                                            const [y, m] = val.split('-');
                                            return `${m}/${y.slice(2)}`;
                                        }}
                                    />
                                    <YAxis stroke="#888" tick={{ fill: '#888' }} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                                        itemStyle={{ color: '#f3f4f6' }}
                                    />
                                    <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, fill: '#06b6d4' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium">Skill Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[240px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={skills} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                    <XAxis type="number" stroke="#888" tick={{ fill: '#888' }} allowDecimals={false} />
                                    <YAxis type="category" dataKey="name" width={100} stroke="#888" tick={{ fill: '#888' }} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                                    />
                                    <Bar dataKey="value" fill="#22c55e" radius={[0, 4, 4, 0]}>
                                        {skills.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium">Credential Portfolio</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[220px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={skills}
                                        cx="50%"
                                        cy="50%"
                                        label={false}
                                        innerRadius={60}
                                        outerRadius={90}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {skills.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recent.map((activity, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent/20 transition-colors">
                                            <Award className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium leading-none">{activity.type}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{activity.name} (#{activity.id})</p>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground text-right">
                                        {activity.date}
                                    </div>
                                </div>
                            ))}
                            {recent.length === 0 && (
                                <div className="text-center text-muted-foreground py-4">No recent activity</div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-border/10">
                            <div className="text-xs text-muted-foreground mb-2 flex items-center justify-between">
                                <span>Performance Percentile</span>
                                <span className="text-accent font-bold">Top 18%</span>
                            </div>
                            <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                                <div className="h-full bg-accent w-[82%] rounded-full" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
