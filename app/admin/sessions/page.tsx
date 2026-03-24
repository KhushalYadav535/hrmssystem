"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Monitor, LogOut, Shield, Users, Smartphone } from "lucide-react";
import apiService from "@/lib/api";
import { formatDateDDMMYYYY } from "@/lib/date-format";

export default function SessionManagementPage() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [revoking, setRevoking] = useState<string | null>(null);
    const { toast } = useToast();

    const normalizeSessionList = (raw: unknown): any[] => {
        if (Array.isArray(raw)) return raw;
        if (raw && typeof raw === "object" && Array.isArray((raw as any).data)) return (raw as any).data;
        return [];
    };

    const normalizeStats = (raw: unknown): Record<string, any> => {
        if (raw && typeof raw === "object" && !Array.isArray(raw) && "totalActiveSessions" in (raw as object)) {
            return raw as Record<string, any>;
        }
        if (raw && typeof raw === "object" && (raw as any).data && typeof (raw as any).data === "object") {
            return (raw as any).data;
        }
        return {};
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sessRes, statsRes] = await Promise.all([
                apiService.get("/sessions/all"),
                apiService.get("/sessions/stats"),
            ]);
            setSessions(normalizeSessionList(sessRes.data));
            setStats(normalizeStats(statsRes.data));
        } catch {
            setSessions([]);
            setStats({});
        }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleForceLogout = async (userId: string, sessionId: string, userName: string) => {
        if (!confirm(`Force logout session for ${userName}?`)) return;
        setRevoking(sessionId);
        try {
            await apiService.delete(`/sessions/${userId}/${sessionId}`);
            toast({ title: `Session terminated for ${userName}` });
            fetchData();
        } catch { toast({ title: "Error", variant: "destructive" }); }
        setRevoking(null);
    };

    const handleForceLogoutAll = async (userId: string, userName: string) => {
        if (!confirm(`Force logout ALL sessions for ${userName}?`)) return;
        try {
            await apiService.delete(`/sessions/${userId}/all`);
            toast({ title: `All sessions terminated for ${userName}` });
            fetchData();
        } catch { toast({ title: "Error", variant: "destructive" }); }
    };

    const groupByUser = sessions.reduce((acc: Record<string, any[]>, s) => {
        const key = s.userId;
        if (!acc[key]) acc[key] = [];
        acc[key].push(s);
        return acc;
    }, {});

    const getDeviceIcon = (userAgent: string) => {
        if (!userAgent) return <Monitor className="h-4 w-4" />;
        if (/mobile|android|iphone/i.test(userAgent)) return <Smartphone className="h-4 w-4 text-blue-500" />;
        return <Monitor className="h-4 w-4 text-gray-500" />;
    };

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="text-indigo-500" /> Session Management</h1>
                        <p className="text-muted-foreground text-sm mt-1">Monitor and manage active user sessions across all devices</p>
                    </div>
                    <Button variant="outline" onClick={fetchData}>Refresh</Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-indigo-600">{stats.totalActiveSessions || 0}</div>
                            <div className="text-sm text-muted-foreground">Active Sessions</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-green-600">{stats.activeUsers || 0}</div>
                            <div className="text-sm text-muted-foreground">Active Users</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm font-medium mb-2 flex items-center gap-1"><Users className="h-4 w-4" />By Role</div>
                            {Object.entries(stats.byRole || {}).map(([role, count]) => (
                                <div key={role} className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{role}</span>
                                    <span className="font-medium">{count as number}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-muted-foreground">Loading sessions...</div>
                ) : Object.keys(groupByUser).length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Shield className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p>No active sessions found</p>
                        <p className="text-xs mt-2 max-w-md mx-auto">Sessions appear after users sign in. If this stays empty, confirm the API returns data at GET /api/sessions/all.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(groupByUser).map(([userId, userSessions]) => {
                            const first = userSessions[0];
                            return (
                                <Card key={userId}>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-base">{first.userName}</CardTitle>
                                                <p className="text-sm text-muted-foreground">{first.userEmail}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-indigo-100 text-indigo-700">{first.role}</Badge>
                                                <Badge className="bg-green-100 text-green-700">{userSessions.length} session{userSessions.length > 1 ? "s" : ""}</Badge>
                                                {userSessions.length > 1 && (
                                                    <Button size="sm" variant="destructive" onClick={() => handleForceLogoutAll(userId, first.userName)}>
                                                        <LogOut className="h-3.5 w-3.5 mr-1" />Logout All
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {userSessions.map((session: any) => (
                                            <div key={session.sessionId} className="flex items-center justify-between border rounded-lg p-3 bg-muted/30">
                                                <div className="flex items-center gap-3">
                                                    {getDeviceIcon(session.userAgent)}
                                                    <div>
                                                        <p className="text-sm font-medium">{session.ipAddress || "Unknown IP"}</p>
                                                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs" title={session.userAgent}>{session.userAgent?.slice(0, 60) || "Unknown browser"}</p>
                                                        <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                                                            <span>Login: {session.loginAt ? formatDateDDMMYYYY(session.loginAt, { withTime: true }) : "—"}</span>
                                                            <span>Last active: {session.lastActivity ? formatDateDDMMYYYY(session.lastActivity, { withTime: true }) : "—"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"
                                                    onClick={() => handleForceLogout(userId, session.sessionId, first.userName)}
                                                    disabled={revoking === session.sessionId}>
                                                    <LogOut className="h-3.5 w-3.5 mr-1" />
                                                    {revoking === session.sessionId ? "..." : "Revoke"}
                                                </Button>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
