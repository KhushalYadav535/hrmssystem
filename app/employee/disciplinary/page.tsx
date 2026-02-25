"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Plus, Search, Eye, CheckCircle, Clock, User, Shield } from "lucide-react";
import apiService from "@/lib/api";

const RECORD_TYPES = ["Verbal Warning", "Written Warning", "Show Cause Notice", "Memo", "Suspension", "Termination", "Other"];
const STATUS_COLORS: Record<string, string> = {
    Issued: "bg-orange-100 text-orange-700",
    Acknowledged: "bg-blue-100 text-blue-700",
    Closed: "bg-green-100 text-green-700",
    Draft: "bg-gray-100 text-gray-700",
};

export default function DisciplinaryPage() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [createOpen, setCreateOpen] = useState(false);
    const [viewRecord, setViewRecord] = useState<any>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const { toast } = useToast();

    const [form, setForm] = useState({
        employeeId: "", type: "", incidentDate: "", description: "", reason: "",
        suspensionFromDate: "", suspensionToDate: "", remarks: "",
    });

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const res = await apiService.get("/disciplinary");
            setRecords(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch { setRecords([]); }
        setLoading(false);
    };

    const fetchEmployees = async () => {
        try {
            const res = await apiService.get("/employees?limit=200");
            setEmployees(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch { setEmployees([]); }
    };

    useEffect(() => { fetchRecords(); fetchEmployees(); }, []);

    const handleCreate = async () => {
        if (!form.employeeId || !form.type || !form.incidentDate || !form.description || !form.reason) {
            toast({ title: "Required fields missing", variant: "destructive" }); return;
        }
        try {
            await apiService.post("/disciplinary", form);
            toast({ title: "Disciplinary record created" });
            setCreateOpen(false);
            setForm({ employeeId: "", type: "", incidentDate: "", description: "", reason: "", suspensionFromDate: "", suspensionToDate: "", remarks: "" });
            fetchRecords();
        } catch (e: any) {
            toast({ title: e?.response?.data?.message || "Error", variant: "destructive" });
        }
    };

    const handleUpdateOutcome = async (id: string, outcome: string) => {
        try {
            await apiService.put(`/disciplinary/${id}/outcome`, { outcome, status: "Closed" });
            toast({ title: "Outcome updated" });
            fetchRecords();
        } catch { toast({ title: "Error updating outcome", variant: "destructive" }); }
    };

    const filtered = records.filter(r => {
        const name = `${r.employeeId?.firstName} ${r.employeeId?.lastName}`.toLowerCase();
        const matchSearch = !search || name.includes(search.toLowerCase()) || r.type?.toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === "all" || r.type === filterType;
        const matchStatus = filterStatus === "all" || r.status === filterStatus;
        return matchSearch && matchType && matchStatus;
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><AlertTriangle className="text-orange-500" /> Disciplinary Records</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage employee warnings, memos, and disciplinary actions</p>
                </div>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4 mr-2" />New Record</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>Create Disciplinary Record</DialogTitle></DialogHeader>
                        <div className="space-y-3 mt-2">
                            <div>
                                <Label>Employee *</Label>
                                <Select value={form.employeeId} onValueChange={v => setForm(p => ({ ...p, employeeId: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                                    <SelectContent>{employees.map(e => <SelectItem key={e._id} value={e._id}>{e.firstName} {e.lastName} ({e.employeeCode})</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Action Type *</Label>
                                <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                    <SelectContent>{RECORD_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div><Label>Incident Date *</Label><Input type="date" value={form.incidentDate} onChange={e => setForm(p => ({ ...p, incidentDate: e.target.value }))} /></div>
                            {form.type === "Suspension" && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div><Label>Suspension From</Label><Input type="date" value={form.suspensionFromDate} onChange={e => setForm(p => ({ ...p, suspensionFromDate: e.target.value }))} /></div>
                                    <div><Label>Suspension To</Label><Input type="date" value={form.suspensionToDate} onChange={e => setForm(p => ({ ...p, suspensionToDate: e.target.value }))} /></div>
                                </div>
                            )}
                            <div><Label>Reason *</Label><Textarea rows={2} placeholder="Why is this action being taken?" value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} /></div>
                            <div><Label>Description *</Label><Textarea rows={3} placeholder="Detailed description of the incident..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
                            <div><Label>Remarks</Label><Input placeholder="Additional remarks" value={form.remarks} onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))} /></div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreate}>Create</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Issued", "Acknowledged", "Closed", "Total"].map(s => (
                    <Card key={s}>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold">
                                {s === "Total" ? records.length : records.filter(r => r.status === s).length}
                            </div>
                            <div className="text-sm text-muted-foreground">{s}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Search employee..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48"><SelectValue placeholder="All Types" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {RECORD_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {["all", "Issued", "Acknowledged", "Closed", "Draft"].map(s => <SelectItem key={s} value={s}>{s === "all" ? "All Status" : s}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {/* Records */}
            {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>No disciplinary records found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(r => (
                        <Card key={r._id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4 flex items-start justify-between gap-4">
                                <div className="flex gap-3 items-start">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                        <User className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{r.employeeId?.firstName} {r.employeeId?.lastName}</p>
                                        <p className="text-sm text-muted-foreground">{r.employeeId?.employeeCode} • {r.employeeId?.designation}</p>
                                        <p className="text-sm mt-1">{r.type}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">Incident: {new Date(r.incidentDate).toLocaleDateString("en-IN")} • Issued by: {r.issuedByName}</p>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{r.reason}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 shrink-0">
                                    <Badge className={STATUS_COLORS[r.status] || "bg-gray-100 text-gray-700"}>{r.status}</Badge>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => setViewRecord(r)}>
                                            <Eye className="h-3.5 w-3.5 mr-1" />View
                                        </Button>
                                        {r.status === "Acknowledged" && (
                                            <Button size="sm" variant="default" onClick={() => handleUpdateOutcome(r._id, "Resolved")}>
                                                <CheckCircle className="h-3.5 w-3.5 mr-1" />Close
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* View Dialog */}
            {viewRecord && (
                <Dialog open={!!viewRecord} onOpenChange={() => setViewRecord(null)}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>Disciplinary Record Details</DialogTitle></DialogHeader>
                        <div className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <div><p className="text-muted-foreground">Employee</p><p className="font-medium">{viewRecord.employeeId?.firstName} {viewRecord.employeeId?.lastName}</p></div>
                                <div><p className="text-muted-foreground">Type</p><p className="font-medium">{viewRecord.type}</p></div>
                                <div><p className="text-muted-foreground">Incident Date</p><p>{new Date(viewRecord.incidentDate).toLocaleDateString("en-IN")}</p></div>
                                <div><p className="text-muted-foreground">Status</p><Badge className={STATUS_COLORS[viewRecord.status]}>{viewRecord.status}</Badge></div>
                                <div><p className="text-muted-foreground">Issued By</p><p>{viewRecord.issuedByName}</p></div>
                                <div><p className="text-muted-foreground">Outcome</p><p>{viewRecord.outcome || "Pending"}</p></div>
                            </div>
                            <div className="border-t pt-3">
                                <p className="text-muted-foreground mb-1">Reason</p>
                                <p>{viewRecord.reason}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Description</p>
                                <p>{viewRecord.description}</p>
                            </div>
                            {viewRecord.employeeResponse && (
                                <div className="border-t pt-3">
                                    <p className="text-muted-foreground mb-1">Employee Response</p>
                                    <p>{viewRecord.employeeResponse}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(viewRecord.employeeResponseDate).toLocaleDateString("en-IN")}</p>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
