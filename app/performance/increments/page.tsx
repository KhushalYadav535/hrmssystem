"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, TrendingUp, Wand2, CheckCircle, AlertCircle, BarChart3, RefreshCw, Play } from "lucide-react";
import apiService from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
    Computed: "bg-blue-100 text-blue-700",
    "Pending HR": "bg-yellow-100 text-yellow-700",
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    Applied: "bg-purple-100 text-purple-700",
};

const CURRENT_FY = (() => {
    const now = new Date();
    const year = now.getFullYear();
    return now.getMonth() >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
})();

export default function IncrementManagementPage() {
    const [records, setRecords] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>({});
    const [policy, setPolicy] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [computing, setComputing] = useState(false);
    const [filterStatus, setFilterStatus] = useState("all");
    const [fy, setFy] = useState(CURRENT_FY);
    const [seedOpen, setSeedOpen] = useState(false);
    const [seedFy, setSeedFy] = useState(CURRENT_FY);
    const [seedEffectiveDate, setSeedEffectiveDate] = useState("");
    const { toast } = useToast();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [recRes, polRes] = await Promise.all([
                apiService.get(`/increments?financialYear=${fy}`),
                apiService.get(`/increments/policy?financialYear=${fy}`),
            ]);
            setRecords(Array.isArray(recRes.data?.data) ? recRes.data.data : []);
            setSummary(recRes.data?.summary || {});
            setPolicy(polRes.data?.data);
        } catch { setRecords([]); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [fy]);

    const handleSeedPolicy = async () => {
        if (!seedFy || !seedEffectiveDate) { toast({ title: "Required fields missing", variant: "destructive" }); return; }
        try {
            await apiService.post("/increments/policy/seed-defaults", { financialYear: seedFy, effectiveDate: seedEffectiveDate });
            toast({ title: `Default increment policy created for FY ${seedFy}` });
            setSeedOpen(false);
            fetchData();
        } catch (e: any) { toast({ title: e?.response?.data?.message || "Error", variant: "destructive" }); }
    };

    const handleCompute = async () => {
        if (!policy) { toast({ title: "No increment policy found. Please create one first.", variant: "destructive" }); return; }
        setComputing(true);
        try {
            const res = await apiService.post("/increments/compute", {
                financialYear: fy,
                effectiveDate: policy.effectiveDate,
            });
            toast({ title: res.data?.message || "Increments computed" });
            fetchData();
        } catch (e: any) { toast({ title: e?.response?.data?.message || "Error computing", variant: "destructive" }); }
        setComputing(false);
    };

    const handleBulkApprove = async () => {
        if (!confirm(`Approve ALL ${records.filter(r => r.status === "Computed").length} computed increments for FY ${fy}?`)) return;
        try {
            const res = await apiService.post("/increments/bulk-approve", { financialYear: fy });
            toast({ title: res.data?.message || "All approved" });
            fetchData();
        } catch { toast({ title: "Error", variant: "destructive" }); }
    };

    const handleApprove = async (id: string) => {
        try {
            await apiService.put(`/increments/${id}/approve`, { remarks: "Approved" });
            toast({ title: "Increment approved" });
            fetchData();
        } catch { toast({ title: "Error", variant: "destructive" }); }
    };

    const handleApply = async (id: string) => {
        try {
            await apiService.post(`/increments/${id}/apply`, {});
            toast({ title: "Increment applied to employee salary" });
            fetchData();
        } catch { toast({ title: "Error applying", variant: "destructive" }); }
    };

    const filtered = filterStatus === "all" ? records : records.filter(r => r.status === filterStatus);
    const computed = records.filter(r => r.status === "Computed").length;
    const approved = records.filter(r => r.status === "Approved").length;
    const applied = records.filter(r => r.status === "Applied").length;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <TrendingUp className="text-emerald-500" /> Increment Management
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Appraisal rating → salary increment auto-computation</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Select value={fy} onValueChange={setFy}>
                        <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {["2024-2025", "2025-2026", "2026-2027"].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {!policy && (
                        <Dialog open={seedOpen} onOpenChange={setSeedOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline"><Wand2 className="h-4 w-4 mr-2" />Create Policy</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Create Default Increment Policy</DialogTitle></DialogHeader>
                                <div className="space-y-3 text-sm mt-2">
                                    <p className="text-muted-foreground">Creates a 5-band policy (Outstanding 15% → Below Expectations 0%) with grade multipliers.</p>
                                    <div><Label>Financial Year</Label><Input value={seedFy} onChange={e => setSeedFy(e.target.value)} placeholder="e.g. 2025-2026" /></div>
                                    <div><Label>Effective Date</Label><Input type="date" value={seedEffectiveDate} onChange={e => setSeedEffectiveDate(e.target.value)} /></div>
                                    <div className="flex gap-2 justify-end mt-2">
                                        <Button variant="outline" onClick={() => setSeedOpen(false)}>Cancel</Button>
                                        <Button onClick={handleSeedPolicy}>Create Policy</Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                    {policy && (
                        <Button onClick={handleCompute} disabled={computing}>
                            <Wand2 className="h-4 w-4 mr-2" />{computing ? "Computing..." : "Compute All"}
                        </Button>
                    )}
                    {computed > 0 && (
                        <Button variant="default" onClick={handleBulkApprove}>
                            <CheckCircle className="h-4 w-4 mr-2" />Bulk Approve ({computed})
                        </Button>
                    )}
                </div>
            </div>

            {/* Policy Banner */}
            {policy ? (
                <Card className="border-emerald-200 bg-emerald-50/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3 flex-wrap">
                            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                            <div>
                                <p className="font-medium text-emerald-800">Increment Policy Active — FY {policy.financialYear}</p>
                                <p className="text-sm text-emerald-700">{policy.ratingBands?.length} rating bands configured • {policy.gradeMultipliers?.length || 0} grade multipliers • Effective: {new Date(policy.effectiveDate).toLocaleDateString("en-IN")}</p>
                            </div>
                            <div className="ml-auto flex gap-2">
                                {policy.ratingBands?.map((b: any) => (
                                    <span key={b.label} className="text-xs bg-white border rounded px-2 py-1">
                                        {b.label.split("(")[0].trim()}: <b>{b.incrementPercentage}%</b>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-amber-200 bg-amber-50/30">
                    <CardContent className="p-4 flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                        <p className="text-amber-800">No increment policy for FY {fy}. Create one to enable auto-computation.</p>
                    </CardContent>
                </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                    { label: "Total", value: records.length, color: "text-gray-800" },
                    { label: "Computed", value: computed, color: "text-blue-600" },
                    { label: "Approved", value: approved, color: "text-green-600" },
                    { label: "Applied", value: applied, color: "text-purple-600" },
                    { label: "Avg Increment", value: summary.avgIncrementPercentage ? `${summary.avgIncrementPercentage}%` : "—", color: "text-emerald-600" },
                ].map(s => (
                    <Card key={s.label}>
                        <CardContent className="p-3 text-center">
                            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                            <div className="text-xs text-muted-foreground">{s.label}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {summary.totalIncrementAmount > 0 && (
                <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-0">
                    <CardContent className="p-4 flex items-center gap-4">
                        <DollarSign className="h-8 w-8 text-emerald-600" />
                        <div>
                            <p className="text-2xl font-bold text-emerald-700">₹{summary.totalIncrementAmount.toLocaleString("en-IN")}</p>
                            <p className="text-sm text-muted-foreground">Total Increment Cost — FY {fy}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                    {["all", "Computed", "Pending HR", "Approved", "Applied", "Rejected"].map(s => (
                        <SelectItem key={s} value={s}>{s === "all" ? "All Status" : s}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Records */}
            {loading ? <div className="text-center py-12 text-muted-foreground">Loading...</div> :
                filtered.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p>No increment records found for FY {fy}</p>
                        {policy && <p className="text-sm mt-1">Click "Compute All" to generate increments from appraisal ratings</p>}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filtered.map(r => (
                            <Card key={r._id} className="hover:shadow-sm transition-shadow">
                                <CardContent className="p-4 flex items-center justify-between gap-4">
                                    <div className="flex gap-3 items-center">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-sm font-bold text-emerald-700">
                                            {r.incrementPercentage}%
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold">{r.employeeId?.firstName} {r.employeeId?.lastName}</p>
                                                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{r.employeeId?.employeeCode}</span>
                                                <Badge className={STATUS_COLORS[r.status]}>{r.status}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{r.employeeId?.designation} • {r.employeeId?.department}</p>
                                            <div className="flex items-center gap-3 mt-1 text-sm">
                                                <span className="text-muted-foreground">Rating: <b>{r.finalAppraisalRating}</b> ({r.ratingLabel})</span>
                                                <span>₹{r.previousGross?.toLocaleString("en-IN")} → <b className="text-green-700">₹{r.newGross?.toLocaleString("en-IN")}</b></span>
                                                <span className="text-green-600 font-medium">+₹{r.incrementAmount?.toLocaleString("en-IN")}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        {(r.status === "Computed" || r.status === "Pending HR") && (
                                            <Button size="sm" onClick={() => handleApprove(r._id)}>
                                                <CheckCircle className="h-3.5 w-3.5 mr-1" />Approve
                                            </Button>
                                        )}
                                        {r.status === "Approved" && (
                                            <Button size="sm" variant="outline" onClick={() => handleApply(r._id)}>
                                                <Play className="h-3.5 w-3.5 mr-1" />Apply to Payroll
                                            </Button>
                                        )}
                                        {r.status === "Applied" && (
                                            <Badge className="bg-purple-100 text-purple-700">✓ Applied</Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
        </div>
    );
}
