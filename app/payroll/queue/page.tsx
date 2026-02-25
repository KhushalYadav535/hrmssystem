"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Zap, Play, RefreshCw, CheckCircle2, XCircle, Clock, Cpu, AlertTriangle } from "lucide-react";
import apiService from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
    queued: "bg-blue-100 text-blue-700",
    active: "bg-yellow-100 text-yellow-700",
    completed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    processing: "bg-orange-100 text-orange-700",
};

const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

export default function PayrollQueuePage() {
    const [queueStats, setQueueStats] = useState<any>({});
    const [activeJobs, setActiveJobs] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);
    const pollIntervals = useRef<Record<string, NodeJS.Timeout>>({});
    const { toast } = useToast();

    const now = new Date();
    const [month, setMonth] = useState(MONTHS[now.getMonth()]);
    const [year, setYear] = useState(String(now.getFullYear()));

    const fetchStats = async () => {
        try {
            const res = await apiService.get("/payroll/queue/stats");
            setQueueStats(res.data?.data || {});
        } catch { setQueueStats({}); }
        setLoading(false);
    };

    useEffect(() => { fetchStats(); const t = setInterval(fetchStats, 10000); return () => clearInterval(t); }, []);

    const pollJobStatus = (jobId: string) => {
        if (pollIntervals.current[jobId]) return;
        pollIntervals.current[jobId] = setInterval(async () => {
            try {
                const res = await apiService.get(`/payroll/queue/job/${jobId}`);
                const status = res.data?.data;
                if (status) {
                    setActiveJobs(prev => ({ ...prev, [jobId]: status }));
                    if (status.status === "completed" || status.status === "failed") {
                        clearInterval(pollIntervals.current[jobId]);
                        delete pollIntervals.current[jobId];
                        fetchStats();
                        if (status.status === "completed") {
                            toast({ title: `Payroll processed: ${status.result?.processed}/${status.result?.total} employees ✓` });
                        } else {
                            toast({ title: `Payroll job failed: ${status.error}`, variant: "destructive" });
                        }
                    }
                }
            } catch { }
        }, 2000);
    };

    const handleEnqueue = async () => {
        setRunning(true);
        try {
            const res = await apiService.post("/payroll/queue/process", { month, year: Number(year) });
            const data = res.data;
            if (!data?.jobId) throw new Error("No job ID returned");

            const jobId = data.jobId;
            setActiveJobs(prev => ({ ...prev, [jobId]: { status: data.mode === "sync" ? "completed" : "queued", progress: 0, jobId } }));
            toast({ title: data.message });

            if (data.mode === "async") {
                pollJobStatus(jobId);
            } else if (data.result) {
                setActiveJobs(prev => ({ ...prev, [jobId]: { status: "completed", progress: 100, result: data.result, jobId } }));
            }
        } catch (e: any) {
            toast({ title: e?.response?.data?.message || "Error starting payroll", variant: "destructive" });
        }
        setRunning(false);
    };

    const getStatusIcon = (s: string) => {
        if (s === "completed") return <CheckCircle2 className="h-5 w-5 text-green-500" />;
        if (s === "failed") return <XCircle className="h-5 w-5 text-red-500" />;
        if (s === "active" || s === "processing") return <Cpu className="h-5 w-5 text-orange-500 animate-pulse" />;
        return <Clock className="h-5 w-5 text-blue-500" />;
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><Zap className="text-yellow-500" />Async Payroll Queue</h1>
                    <p className="text-muted-foreground text-sm mt-1">Process payroll for 500+ employees without HTTP timeouts</p>
                </div>
                <Button variant="outline" onClick={fetchStats}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
            </div>

            {/* Queue Mode Banner */}
            <Card className={`border-2 ${queueStats.available ? "border-green-200 bg-green-50/30" : "border-amber-200 bg-amber-50/30"}`}>
                <CardContent className="p-4 flex items-center gap-3">
                    {queueStats.available ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                    ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                    )}
                    <div>
                        <p className={`font-medium ${queueStats.available ? "text-green-800" : "text-amber-800"}`}>
                            Mode: {queueStats.available ? "🚀 Async (Redis connected)" : "⚙️ Synchronous (Redis not connected)"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {queueStats.available
                                ? "Jobs are processed in the background. Frontend polls for status every 2 seconds."
                                : "Payroll runs synchronously. Connect Redis for async processing of large employee sets."}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Queue Stats */}
            {queueStats.available && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                        { label: "Waiting", value: queueStats.waiting, color: "text-blue-600" },
                        { label: "Active", value: queueStats.active, color: "text-orange-600" },
                        { label: "Completed", value: queueStats.completed, color: "text-green-600" },
                        { label: "Failed", value: queueStats.failed, color: "text-red-600" },
                        { label: "Delayed", value: queueStats.delayed, color: "text-gray-600" },
                    ].map(s => (
                        <Card key={s.label}>
                            <CardContent className="p-3 text-center">
                                <div className={`text-xl font-bold ${s.color}`}>{s.value ?? "—"}</div>
                                <div className="text-xs text-muted-foreground">{s.label}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Run Payroll */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Process Payroll</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-3 flex-wrap items-end">
                        <div className="flex-1 min-w-36">
                            <label className="text-sm font-medium mb-1 block">Month</label>
                            <Select value={month} onValueChange={setMonth}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="w-28">
                            <label className="text-sm font-medium mb-1 block">Year</label>
                            <Input value={year} onChange={e => setYear(e.target.value)} type="number" min={2020} max={2030} />
                        </div>
                        <Button onClick={handleEnqueue} disabled={running} className="gap-2">
                            <Play className="h-4 w-4" />{running ? "Queuing..." : "Run Payroll"}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Processes all active employees. Runs in background — no page refresh needed. Check job status below.
                    </p>
                </CardContent>
            </Card>

            {/* Active / Recent Jobs */}
            {Object.keys(activeJobs).length > 0 && (
                <div className="space-y-3">
                    <h2 className="font-semibold text-lg">Jobs This Session</h2>
                    {Object.entries(activeJobs).map(([jobId, job]: [string, any]) => (
                        <Card key={jobId} className={`border-l-4 ${job.status === "completed" ? "border-l-green-500" :
                                job.status === "failed" ? "border-l-red-500" :
                                    "border-l-yellow-500"
                            }`}>
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(job.status)}
                                        <div>
                                            <p className="font-medium">Job #{jobId}</p>
                                            <p className="text-sm text-muted-foreground">{month} {year}</p>
                                        </div>
                                    </div>
                                    <Badge className={STATUS_COLORS[job.status] || "bg-gray-100 text-gray-700"}>
                                        {job.status}
                                    </Badge>
                                </div>

                                {(job.status === "active" || job.status === "processing" || job.status === "queued") && (
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span>Processing...</span>
                                            <span>{job.progress || 0}%</span>
                                        </div>
                                        <Progress value={job.progress || 0} className="h-2" />
                                    </div>
                                )}

                                {job.status === "completed" && job.result && (
                                    <div className="grid grid-cols-3 gap-3 text-center text-sm border-t pt-3">
                                        <div><p className="font-bold text-lg text-green-600">{job.result.processed}</p><p className="text-muted-foreground">Processed</p></div>
                                        <div><p className="font-bold text-lg">{job.result.total}</p><p className="text-muted-foreground">Total</p></div>
                                        <div><p className="font-bold text-lg text-red-600">{job.result.errors || 0}</p><p className="text-muted-foreground">Errors</p></div>
                                    </div>
                                )}

                                {job.status === "failed" && (
                                    <p className="text-sm text-red-600 bg-red-50 rounded p-2">{job.error}</p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {loading && Object.keys(activeJobs).length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Zap className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>No recent payroll jobs. Run a payroll to see it here.</p>
                </div>
            )}
        </div>
    );
}
