"use client";

import { formatDateDDMMYYYY } from '@/lib/date-format';
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Scale, Plus, ChevronRight, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import apiService from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
    Submitted: "bg-blue-100 text-blue-700",
    "Under Review": "bg-yellow-100 text-yellow-700",
    "Manager Responded": "bg-orange-100 text-orange-700",
    "Escalated to HR": "bg-red-100 text-red-700",
    "HR Reviewed": "bg-purple-100 text-purple-700",
    Resolved: "bg-green-100 text-green-700",
    Rejected: "bg-gray-100 text-gray-600",
};

export default function AppraisalDisputesPage() {
    const [disputes, setDisputes] = useState<any[]>([]);
    const [cycles, setCycles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [selectedDispute, setSelectedDispute] = useState<any>(null);
    const [respondOpen, setRespondOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState("all");
    const { toast } = useToast();

    const [form, setForm] = useState({ appraisalCycleId: "", disputeType: "Overall Rating", originalRating: "", requestedRating: "", reason: "", evidenceDescription: "" });
    const [response, setResponse] = useState({ response: "", decision: "Rejected", revisedRating: "" });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [disRes, cycRes] = await Promise.all([
                apiService.get("/appraisal-disputes"),
                apiService.get("/appraisal/cycles"),
            ]);
            setDisputes(Array.isArray(disRes.data?.data) ? disRes.data.data : []);
            setCycles(Array.isArray(cycRes.data?.data) ? cycRes.data.data : []);
        } catch { setDisputes([]); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmitDispute = async () => {
        if (!form.appraisalCycleId || !form.reason) {
            toast({ title: "Required fields missing", variant: "destructive" }); return;
        }
        try {
            await apiService.post("/appraisal-disputes", form);
            toast({ title: "Dispute submitted successfully" });
            setCreateOpen(false);
            setForm({ appraisalCycleId: "", disputeType: "Overall Rating", originalRating: "", requestedRating: "", reason: "", evidenceDescription: "" });
            fetchData();
        } catch (e: any) { toast({ title: e?.response?.data?.message || "Error", variant: "destructive" }); }
    };

    const handleManagerRespond = async () => {
        if (!selectedDispute) return;
        try {
            await apiService.put(`/appraisal-disputes/${selectedDispute._id}/manager-respond`, response);
            toast({ title: "Response submitted" });
            setRespondOpen(false);
            fetchData();
        } catch (e: any) { toast({ title: e?.response?.data?.message || "Error", variant: "destructive" }); }
    };

    const handleEscalate = async (id: string) => {
        const reason = prompt("Reason for escalation to HR:");
        if (!reason) return;
        try {
            await apiService.put(`/appraisal-disputes/${id}/escalate`, { reason });
            toast({ title: "Escalated to HR" });
            fetchData();
        } catch { toast({ title: "Error", variant: "destructive" }); }
    };

    const filtered = disputes.filter(d => filterStatus === "all" || d.status === filterStatus);

    const getStatusIcon = (status: string) => {
        if (status === "Resolved") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        if (status === "Rejected") return <AlertCircle className="h-4 w-4 text-red-500" />;
        return <Clock className="h-4 w-4 text-yellow-500" />;
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><Scale className="text-purple-500" /> Appraisal Disputes</h1>
                    <p className="text-muted-foreground text-sm mt-1">Challenge ratings, request HR review for appraisal fairness</p>
                </div>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Raise Dispute</Button></DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>Raise Appraisal Dispute</DialogTitle></DialogHeader>
                        <div className="space-y-3 mt-2">
                            <div>
                                <Label>Appraisal Cycle *</Label>
                                <Select value={form.appraisalCycleId} onValueChange={v => setForm(p => ({ ...p, appraisalCycleId: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select cycle" /></SelectTrigger>
                                    <SelectContent>{cycles.map(c => <SelectItem key={c._id} value={c._id}>{c.cycleName || c.year}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Dispute Type</Label>
                                <Select value={form.disputeType} onValueChange={v => setForm(p => ({ ...p, disputeType: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{["Overall Rating", "Goal Score", "Competency Rating", "KPI Achievement", "Other"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><Label>Original Rating (1-5)</Label><Input type="number" min={1} max={5} step={0.5} value={form.originalRating} onChange={e => setForm(p => ({ ...p, originalRating: e.target.value }))} /></div>
                                <div><Label>Requested Rating (1-5)</Label><Input type="number" min={1} max={5} step={0.5} value={form.requestedRating} onChange={e => setForm(p => ({ ...p, requestedRating: e.target.value }))} /></div>
                            </div>
                            <div><Label>Reason *</Label><Textarea rows={3} placeholder="Why do you disagree with this rating?" value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} /></div>
                            <div><Label>Supporting Evidence</Label><Textarea rows={2} placeholder="Describe any evidence (achievements, emails, etc.)" value={form.evidenceDescription} onChange={e => setForm(p => ({ ...p, evidenceDescription: e.target.value }))} /></div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                                <Button onClick={handleSubmitDispute}>Submit</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["Submitted", "Manager Responded", "Escalated to HR", "Resolved"].map(s => (
                    <Card key={s} className="cursor-pointer" onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}>
                        <CardContent className="p-3 text-center">
                            <div className="text-xl font-bold">{disputes.filter(d => d.status === s).length}</div>
                            <div className="text-xs text-muted-foreground">{s}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                    {["all", ...Object.keys(STATUS_COLORS)].map(s => <SelectItem key={s} value={s}>{s === "all" ? "All Status" : s}</SelectItem>)}
                </SelectContent>
            </Select>

            {/* Disputes list */}
            {loading ? <div className="text-center py-12 text-muted-foreground">Loading...</div> :
                filtered.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Scale className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p>No disputes found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map(d => (
                            <Card key={d._id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex gap-3">
                                            {getStatusIcon(d.status)}
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-semibold">{d.employeeId?.firstName} {d.employeeId?.lastName}</p>
                                                    <Badge className="text-xs">{d.disputeType}</Badge>
                                                    <Badge className={STATUS_COLORS[d.status]}>{d.status}</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-0.5">{d.appraisalCycleId?.cycleName || d.appraisalCycleId?.year}</p>
                                                {d.originalRating && d.requestedRating && (
                                                    <p className="text-sm mt-1">
                                                        Rating: <span className="font-medium line-through text-red-500">{d.originalRating}</span>
                                                        <ChevronRight className="h-4 w-4 inline" />
                                                        <span className="font-medium text-green-600">{d.requestedRating}</span>
                                                    </p>
                                                )}
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{d.reason}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">Submitted: {formatDateDDMMYYYY(d.submittedDate)}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 shrink-0">
                                            {d.status === "Submitted" && (
                                                <Button size="sm" onClick={() => { setSelectedDispute(d); setRespondOpen(true); }}>Respond</Button>
                                            )}
                                            {d.status === "Manager Responded" && (
                                                <Button size="sm" variant="outline" onClick={() => handleEscalate(d._id)}>Escalate to HR</Button>
                                            )}
                                            {d.finalRating && (
                                                <div className="text-center"><p className="text-xs text-muted-foreground">Final</p><p className="text-lg font-bold text-green-600">{d.finalRating}</p></div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

            {/* Manager response dialog */}
            <Dialog open={respondOpen} onOpenChange={setRespondOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Manager Response</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <Label>Decision</Label>
                            <Select value={response.decision} onValueChange={v => setResponse(p => ({ ...p, decision: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{["Accepted", "Partially Accepted", "Rejected"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        {(response.decision === "Accepted" || response.decision === "Partially Accepted") && (
                            <div><Label>Revised Rating</Label><Input type="number" min={1} max={5} step={0.5} value={response.revisedRating} onChange={e => setResponse(p => ({ ...p, revisedRating: e.target.value }))} /></div>
                        )}
                        <div><Label>Response / Comments</Label><Textarea rows={3} placeholder="Explain your decision..." value={response.response} onChange={e => setResponse(p => ({ ...p, response: e.target.value }))} /></div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setRespondOpen(false)}>Cancel</Button>
                            <Button onClick={handleManagerRespond}>Submit Response</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
