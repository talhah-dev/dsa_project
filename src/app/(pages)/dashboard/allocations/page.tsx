"use client"

import * as React from "react"
import axios from "axios"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

type AllocationStatus = "reserved" | "admitted" | "discharged" | "cancelled"

type StayApi = {
    _id: string
    start: string
    end: string
    status: AllocationStatus
    bedId: { _id: string; code: string; ward: string; status: "active" | "inactive" }
    patientId: { _id: string; name: string; mrn?: string; phone?: string }
}

function statusBadge(status: AllocationStatus) {
    if (status === "cancelled") return <Badge variant="destructive">Cancelled</Badge>
    if (status === "discharged") return <Badge variant="outline">Discharged</Badge>
    if (status === "admitted") return <Badge variant="secondary">Admitted</Badge>
    return <Badge variant="secondary">Reserved</Badge>
}

export default function AllocationsPage() {
    const [stays, setStays] = React.useState<StayApi[]>([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const [query, setQuery] = React.useState("")
    const [status, setStatus] = React.useState<AllocationStatus | "all">("all")

    const fetchStays = React.useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await axios.get("/api/stays")
            setStays(res.data.stays ?? [])
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to load allocations")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchStays()
    }, [fetchStays])

    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase()
        return stays.filter((s) => {
            const patientName = s.patientId?.name?.toLowerCase() ?? ""
            const bedCode = s.bedId?.code?.toLowerCase() ?? ""
            const ward = s.bedId?.ward?.toLowerCase() ?? ""

            const matchesText = !q || patientName.includes(q) || bedCode.includes(q) || ward.includes(q)
            const matchesStatus = status === "all" ? true : s.status === status
            return matchesText && matchesStatus
        })
    }, [stays, query, status])

    const total = stays.length
    const active = stays.filter((s) => s.status === "reserved" || s.status === "admitted").length
    const upcoming = stays.filter((s) => s.status === "reserved").length

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Allocations</h1>
                    <p className="text-sm text-muted-foreground">
                        View and manage bed stays/reservations.
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchStays} disabled={loading}>
                        Refresh
                    </Button>
                    <Button asChild>
                        <a href="/dashboard/allocate">New Allocation</a>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-semibold">{total}</CardContent>
                </Card>

                <Card className="rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Active</CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-semibold">{active}</CardContent>
                </Card>

                <Card className="rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Upcoming</CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-semibold">{upcoming}</CardContent>
                </Card>
            </div>

            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>All Allocations</CardTitle>
                    <CardDescription>Search and filter allocations.</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {error && (
                        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Input
                            placeholder="Search by patient, bed, or ward..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="sm:max-w-sm"
                        />

                        <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="reserved">Reserved</SelectItem>
                                <SelectItem value="admitted">Admitted</SelectItem>
                                <SelectItem value="discharged">Discharged</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Bed</TableHead>
                                    <TableHead>Ward</TableHead>
                                    <TableHead>Start</TableHead>
                                    <TableHead>End</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!loading &&
                                    filtered.map((s) => (
                                        <TableRow key={s._id}>
                                            <TableCell className="font-medium">
                                                {s.patientId?.name ?? "—"}
                                            </TableCell>
                                            <TableCell>{s.bedId?.code ?? "—"}</TableCell>
                                            <TableCell>{s.bedId?.ward ?? "—"}</TableCell>
                                            <TableCell className="whitespace-nowrap">{String(s.start)}</TableCell>
                                            <TableCell className="whitespace-nowrap">{String(s.end)}</TableCell>
                                            <TableCell className="text-right">{statusBadge(s.status)}</TableCell>
                                        </TableRow>
                                    ))}

                                {!loading && filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                                            No allocations found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
