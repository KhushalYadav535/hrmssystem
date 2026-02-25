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
import { BookOpen, Plus, Search, Star, ChevronDown, ChevronUp, Wand2 } from "lucide-react";
import apiService from "@/lib/api";

const CATEGORY_COLORS: Record<string, string> = {
    Core: "bg-blue-100 text-blue-700",
    Leadership: "bg-purple-100 text-purple-700",
    Functional: "bg-orange-100 text-orange-700",
    Technical: "bg-green-100 text-green-700",
    Behavioral: "bg-pink-100 text-pink-700",
};

export default function CompetencyLibraryPage() {
    const [competencies, setCompetencies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    const [createOpen, setCreateOpen] = useState(false);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [seeding, setSeeding] = useState(false);
    const { toast } = useToast();

    const [form, setForm] = useState({ name: "", code: "", category: "Core", description: "", defaultWeightage: "10" });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await apiService.get("/competencies");
            setCompetencies(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch { setCompetencies([]); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreate = async () => {
        if (!form.name || !form.code || !form.category || !form.description) {
            toast({ title: "All fields required", variant: "destructive" }); return;
        }
        try {
            await apiService.post("/competencies", { ...form, defaultWeightage: Number(form.defaultWeightage) });
            toast({ title: "Competency created" });
            setCreateOpen(false);
            setForm({ name: "", code: "", category: "Core", description: "", defaultWeightage: "10" });
            fetchData();
        } catch (e: any) { toast({ title: e?.response?.data?.message || "Error", variant: "destructive" }); }
    };

    const handleSeedDefaults = async () => {
        setSeeding(true);
        try {
            const res = await apiService.post("/competencies/seed/defaults", {});
            toast({ title: `${res.data?.count || 10} default competencies added!` });
            fetchData();
        } catch (e: any) { toast({ title: e?.response?.data?.message || "Seed failed", variant: "destructive" }); }
        setSeeding(false);
    };

    const handleToggle = async (id: string, isActive: boolean) => {
        try {
            if (!isActive) {
                await apiService.delete(`/competencies/${id}`);
            } else {
                await apiService.put(`/competencies/${id}`, { isActive: true });
            }
            toast({ title: `Competency ${isActive ? "activated" : "deactivated"}` });
            fetchData();
        } catch { toast({ title: "Error", variant: "destructive" }); }
    };

    const filtered = competencies.filter(c => {
        const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase());
        const matchCat = filterCategory === "all" || c.category === filterCategory;
        return matchSearch && matchCat;
    });

    const categories = ["Core", "Leadership", "Functional", "Technical", "Behavioral"];

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="text-blue-500" /> Competency Library</h1>
                    <p className="text-muted-foreground text-sm mt-1">Define competency framework with 5-level proficiency scales</p>
                </div>
                <div className="flex gap-2">
                    {competencies.length === 0 && (
                        <Button variant="outline" onClick={handleSeedDefaults} disabled={seeding}>
                            <Wand2 className="h-4 w-4 mr-2" />{seeding ? "Adding..." : "Add Defaults (10)"}
                        </Button>
                    )}
                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Competency</Button></DialogTrigger>
                        <DialogContent className="max-w-lg">
                            <DialogHeader><DialogTitle>Create Competency</DialogTitle></DialogHeader>
                            <div className="space-y-3 mt-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Communication" /></div>
                                    <div><Label>Code *</Label><Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="e.g. COMM" maxLength={8} /></div>
                                </div>
                                <div>
                                    <Label>Category *</Label>
                                    <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div><Label>Description *</Label><Textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What this competency measures..." /></div>
                                <div><Label>Default Weightage (%)</Label><Input type="number" min={0} max={100} value={form.defaultWeightage} onChange={e => setForm(p => ({ ...p, defaultWeightage: e.target.value }))} /></div>
                                <div className="flex gap-2 justify-end">
                                    <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                                    <Button onClick={handleCreate}>Create</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Category summary */}
            <div className="flex flex-wrap gap-2">
                {categories.map(cat => {
                    const count = competencies.filter(c => c.category === cat && c.isActive).length;
                    return (
                        <button key={cat} onClick={() => setFilterCategory(filterCategory === cat ? "all" : cat)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${filterCategory === cat ? "ring-2 ring-offset-1 ring-primary" : ""} ${CATEGORY_COLORS[cat]}`}>
                            {cat} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search by name or code..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {/* Competency cards */}
            {loading ? <div className="text-center py-12 text-muted-foreground">Loading...</div> :
                filtered.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="mb-4">No competencies found</p>
                        {competencies.length === 0 && <Button onClick={handleSeedDefaults} variant="outline"><Wand2 className="h-4 w-4 mr-2" />Add 10 Default Competencies</Button>}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {filtered.map(c => (
                            <Card key={c._id} className={`transition-all ${!c.isActive ? "opacity-50" : "hover:shadow-md"}`}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge className={CATEGORY_COLORS[c.category]}>{c.category}</Badge>
                                                <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{c.code}</span>
                                            </div>
                                            <CardTitle className="text-base">{c.name}</CardTitle>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-center">
                                                <div className="text-sm font-bold">{c.defaultWeightage}%</div>
                                                <div className="text-xs text-muted-foreground">Weightage</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-muted-foreground">{c.description}</p>
                                    {/* Proficiency levels preview */}
                                    <div className="flex gap-1">
                                        {(c.proficiencyLevels || []).map((pl: any) => (
                                            <div key={pl.level} className="flex-1 text-center">
                                                <div className="flex justify-center mb-1">
                                                    {Array.from({ length: pl.level }).map((_, i) => <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
                                                    {Array.from({ length: 5 - pl.level }).map((_, i) => <Star key={i} className="h-3 w-3 text-gray-200" />)}
                                                </div>
                                                <p className="text-xs text-muted-foreground">{pl.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Expandable indicators */}
                                    <button className="text-xs text-primary flex items-center gap-1" onClick={() => setExpanded(expanded === c._id ? null : c._id)}>
                                        {expanded === c._id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                        {expanded === c._id ? "Hide" : "Show"} behavioral indicators
                                    </button>
                                    {expanded === c._id && (
                                        <div className="border-t pt-2 space-y-2">
                                            {(c.proficiencyLevels || []).map((pl: any) => (
                                                <div key={pl.level}>
                                                    <p className="text-xs font-medium">Level {pl.level} — {pl.label}</p>
                                                    <ul className="mt-0.5 space-y-0.5">
                                                        {(pl.behavioralIndicators || []).map((bi: string, i: number) => (
                                                            <li key={i} className="text-xs text-muted-foreground flex gap-1"><span>•</span><span>{bi}</span></li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="outline" onClick={() => handleToggle(c._id, !c.isActive)}>
                                            {c.isActive ? "Deactivate" : "Activate"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
        </div>
    );
}
