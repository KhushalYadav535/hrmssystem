"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Plus, Search, ArrowUpRight, CheckCircle, Clock, FileText } from "lucide-react";
import apiService from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
    "Pending HR": "bg-yellow-100 text-yellow-700",
    "Pending Management": "bg-orange-100 text-orange-700",
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    Cancelled: "bg-gray-100 text-gray-600",
};

export default function PromotionsPage() {
    const [promotions, setPromotions] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const { toast } = useToast();

    const [form, setForm] = useState({
        employeeId: "", promotionType: "Merit",
        previousDesignation: "", newDesignation: "", newGrade: "",
        previousSalary: "", newSalary: "",
        effectiveDate: "", justification: "",
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pr, emp] = await Promise.all([
                apiService.get("/promotions"),
                apiService.get("/employees?limit=200"),
            ]);
            setPromotions(Array.isArray(pr.data?.data) ? pr.data.data : []);
            setEmployees(Array.isArray(emp.data?.data) ? emp.data.data : []);
        } catch { setPromotions([]); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreate = async () => {
        if (!form.employeeId || !form.newDesignation || !form.effectiveDate || !form.justification) {
            toast({ title: "Required fields missing", variant: "destructive" }); return;
        }
        try {
            await apiService.post("/promotions", form);
            toast({ title: "Promotion recommendation submitted" });
            setCreateOpen(false);
            setForm({ employeeId: "", promotionType: "Merit", previousDesignation: "", newDesignation: "", newGrade: "", previousSalary: "", newSalary: "", effectiveDate: "", justification: "" });
            fetchData();
        } catch (e: any) { toast({ title: e?.response?.data?.message || "Error", variant: "destructive" }); }
    };

    const handleEmployeeSelect = (empId: string) => {
        const emp = employees.find(e => e._id === empId);
        setForm(p => ({
            ...p,
            employeeId: empId,
            previousDesignation: emp?.designation || "",
        }));
    };

    const handleApprove = async (id: string) => {
        try {
            await apiService.put(`/promotions/${id}/approve`, { comments: "Approved" });
            toast({ title: "Promotion approved! Employee notified." });
            fetchData();
        } catch { toast({ title: "Error approving", variant: "destructive" }); }
    };

    const handleGenerateLetter = async (id: string) => {
        try {
            await apiService.get(`/promotions/${id}/letter`);
            toast({ title: "Promotion letter generated" });
            fetchData();
        } catch { toast({ title: "Error generating letter", variant: "destructive" }); }
    };

    const filtered = promotions.filter(p => {
        const name = `${p.employeeId?.firstName} ${p.employeeId?.lastName}`.toLowerCase();
        const matchSearch = !search || name.includes(search.toLowerCase()) || p.newDesignation?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === "all" || p.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const stats = {
        pending: promotions.filter(p => p.status?.includes("Pending")).length,
        approved: promotions.filter(p => p.status === "Approved").length,
        total: promotions.length,
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><TrendingUp className="text-green-500" /> Promotion Management</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage employee promotions, approvals and letters</p>
                </div>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4 mr-2" />New Promotion</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>Create Promotion Recommendation</DialogTitle></DialogHeader>
                        <div className="space-y-3 mt-2 max-h-[70vh] overflow-y-auto pr-1">
                            <div>
                                <Label>Employee *</Label>
                                <Select value={form.employeeId} onValueChange={handleEmployeeSelect}>
                                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                                    <SelectContent>{employees.map(e => <SelectItem key={e._id} value={e._id}>{e.firstName} {e.lastName} ({e.employeeCode})</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Promotion Type</Label>
                                <Select value={form.promotionType} onValueChange={v => setForm(p => ({ ...p, promotionType: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{["Merit", "Seniority", "Performance-Based", "Cross-Functional", "Acting", "Other"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><Label>Current Designation</Label><Input value={form.previousDesignation} onChange={e => setForm(p => ({ ...p, previousDesignation: e.target.value }))} /></div>
                                <div><Label>New Designation *</Label><Input value={form.newDesignation} onChange={e => setForm(p => ({ ...p, newDesignation: e.target.value }))} /></div>
                            </div>
                            <div><Label>New Grade</Label><Input placeholder="e.g. Scale II, JMG Scale I" value={form.newGrade} onChange={e => setForm(p => ({ ...p, newGrade: e.target.value }))} /></div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><Label>Current Salary (₹)</Label><Input type="number" value={form.previousSalary} onChange={e => setForm(p => ({ ...p, previousSalary: e.target.value }))} /></div>
                                <div><Label>New Salary (₹)</Label><Input type="number" value={form.newSalary} onChange={e => setForm(p => ({ ...p, newSalary: e.target.value }))} /></div>
                            </div>
                            <div><Label>Effective Date *</Label><Input type="date" value={form.effectiveDate} onChange={e => setForm(p => ({ ...p, effectiveDate: e.target.value }))} /></div>
                            <div><Label>Justification *</Label><Textarea rows={3} placeholder="Reason for promotion, key achievements..." value={form.justification} onChange={e => setForm(p => ({ ...p, justification: e.target.value }))} /></div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreate}>Submit</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-orange-600">{stats.pending}</div><div className="text-sm text-muted-foreground">Pending Approval</div></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-green-600">{stats.approved}</div><div className="text-sm text-muted-foreground">Approved</div></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">{stats.total}</div><div className="text-sm text-muted-foreground">Total</div></CardContent></Card>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Search employee or designation..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {["all", "Pending HR", "Pending Management", "Approved", "Rejected"].map(s => <SelectItem key={s} value={s}>{s === "all" ? "All Status" : s}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {/* List */}
            {loading ? <div className="text-center py-12 text-muted-foreground">Loading...</div> :
                filtered.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p>No promotion records found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map(p => (
                            <Card key={p._id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4 flex items-center justify-between gap-4">
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <ArrowUpRight className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{p.employeeId?.firstName} {p.employeeId?.lastName}</p>
                                            <p className="text-sm text-muted-foreground">{p.employeeId?.employeeCode}</p>
                                            <p className="text-sm mt-1">
                                                <span className="text-muted-foreground">{p.previousDesignation}</span>
                                                {" → "}
                                                <span className="font-medium text-green-700">{p.newDesignation}</span>
                                                {p.newGrade && <span className="ml-1 text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">{p.newGrade}</span>}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Effective: {new Date(p.effectiveDate).toLocaleDateString("en-IN")} •
                                                {p.salaryIncrement > 0 && ` Increment: ₹${p.salaryIncrement.toLocaleString("en-IN")} (+${p.incrementPercentage}%)`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <Badge className={STATUS_COLORS[p.status] || "bg-gray-100 text-gray-700"}>{p.status}</Badge>
                                        <div className="flex gap-2">
                                            {(p.status === "Pending Management" || p.status === "Pending HR") && (
                                                <Button size="sm" onClick={() => handleApprove(p._id)}>
                                                    <CheckCircle className="h-3.5 w-3.5 mr-1" />Approve
                                                </Button>
                                            )}
                                            {p.status === "Approved" && !p.letterGenerated && (
                                                <Button size="sm" variant="outline" onClick={() => handleGenerateLetter(p._id)}>
                                                    <FileText className="h-3.5 w-3.5 mr-1" />Generate Letter
                                                </Button>
                                            )}
                                            {p.letterGenerated && (
                                                <Badge className="bg-blue-100 text-blue-700"><FileText className="h-3 w-3 mr-1" />Letter Ready</Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
