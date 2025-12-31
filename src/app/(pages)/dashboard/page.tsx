"use client"

import * as React from "react"
import axios from "axios"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

type Bed = {
    _id: string
    code: string
    ward: string
    status: "active" | "inactive"
}

type StayStatus = "reserved" | "admitted" | "discharged" | "cancelled"

type Stay = {
    _id: string
    start: string
    end: string
    status: StayStatus
    bedId: { _id: string; code: string; ward: string; status: "active" | "inactive" }
    patientId: { _id: string; name: string; mrn?: string; phone?: string }
    createdAt?: string
}

function statusBadge(status: StayStatus) {
    if (status === "cancelled") return <Badge variant="destructive">Cancelled</Badge>
    if (status === "discharged") return <Badge variant="outline">Discharged</Badge>
    if (status === "admitted") return <Badge variant="secondary">Admitted</Badge>
    return <Badge variant="secondary">Reserved</Badge>
}

export default function DashboardPage() {
    const [beds, setBeds] = React.useState<Bed[]>([])
    const [stays, setStays] = React.useState<Stay[]>([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const fetchAll = React.useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const [bedsRes, staysRes] = await Promise.allSettled([
                axios.get("/api/beds"),
                axios.get("/api/stays"),
            ])

            if (bedsRes.status === "fulfilled") {
                setBeds(bedsRes.value.data.beds ?? [])
            } else {
                setBeds([])
                setError(bedsRes.reason?.response?.data?.message || "Failed to fetch beds")
            }

            if (staysRes.status === "fulfilled") {
                setStays(staysRes.value.data.stays ?? [])
            } else {
                setStays([])
                setError(staysRes.reason?.response?.data?.message || "Failed to fetch stays")
            }
        } finally {
            setLoading(false)
        }
    }, [])


    React.useEffect(() => {
        fetchAll()
    }, [fetchAll])

    const now = React.useMemo(() => new Date(), [])
    const next24h = React.useMemo(() => new Date(now.getTime() + 24 * 60 * 60 * 1000), [now])

    const activeBeds = React.useMemo(
        () => beds.filter((b) => b.status === "active"),
        [beds]
    )

    const activeStays = React.useMemo(
        () => stays.filter((s) => s.status !== "cancelled" && s.status !== "discharged"),
        [stays]
    )

    const occupiedBedIdsNow = React.useMemo(() => {
        const set = new Set<string>()
        for (const s of activeStays) {
            const start = new Date(s.start).getTime()
            const end = new Date(s.end).getTime()
            const t = now.getTime()
            if (start < t && t < end) set.add(s.bedId?._id)
        }
        return set
    }, [activeStays, now])

    const totalBeds = activeBeds.length
    const occupiedNow = occupiedBedIdsNow.size
    const availableNow = Math.max(0, totalBeds - occupiedNow)

    const upcoming24h = React.useMemo(() => {
        const t0 = now.getTime()
        const t1 = next24h.getTime()
        return activeStays.filter((s) => {
            const start = new Date(s.start).getTime()
            return start >= t0 && start <= t1
        }).length
    }, [activeStays, now, next24h])

    const recent = React.useMemo(() => {
        const sorted = [...stays].sort((a, b) => {
            const ta = new Date(a.createdAt ?? a.start).getTime()
            const tb = new Date(b.createdAt ?? b.start).getTime()
            return tb - ta
        })
        return sorted.slice(0, 8)
    }, [stays])

    return (
        <div className="space-y-8 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Live overview of beds and allocations.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button asChild>
                        <Link href="/dashboard/allocate">Allocate Bed</Link>
                    </Button>
                    <Button variant="outline" onClick={fetchAll} disabled={loading}>
                        Refresh
                    </Button>
                </div>
            </div>

            {/* {error && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
                    {error}
                </div>
            )} */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Beds (Active)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-3xl font-semibold">{totalBeds}</div>
                        <p className="text-xs text-muted-foreground">Beds available for allocation</p>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Available Now
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-3xl font-semibold">{availableNow}</div>
                        <p className="text-xs text-muted-foreground">Not occupied at this moment</p>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Occupied Now
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-3xl font-semibold">{occupiedNow}</div>
                        <p className="text-xs text-muted-foreground">Active overlaps right now</p>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Upcoming (24h)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-3xl font-semibold">{upcoming24h}</div>
                        <p className="text-xs text-muted-foreground">Start within next 24 hours</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="rounded-2xl lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Allocations</CardTitle>
                        <CardDescription>Latest stays/reservations created in the system.</CardDescription>
                    </CardHeader>

                    <CardContent>
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
                                        recent.map((s) => (
                                            <TableRow key={s._id}>
                                                <TableCell className="font-medium">{s.patientId?.name ?? "—"}</TableCell>
                                                <TableCell>{s.bedId?.code ?? "—"}</TableCell>
                                                <TableCell>{s.bedId?.ward ?? "—"}</TableCell>
                                                <TableCell className="whitespace-nowrap">{String(s.start)}</TableCell>
                                                <TableCell className="whitespace-nowrap">{String(s.end)}</TableCell>
                                                <TableCell className="text-right">{statusBadge(s.status)}</TableCell>
                                            </TableRow>
                                        ))}

                                    {!loading && recent.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                                                No allocations yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <Separator className="my-4" />

                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" asChild>
                                <Link href="/dashboard/allocations">View All Allocations</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/dashboard/beds">Manage Beds</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button className="w-full" asChild>
                            <Link href="/dashboard/allocate">New Allocation</Link>
                        </Button>
                        <Button className="w-full" variant="outline" asChild>
                            <Link href="/dashboard/beds">Add / Edit Beds</Link>
                        </Button>
                        <Button className="w-full" variant="outline" asChild>
                            <Link href="/dashboard/patients">Manage Patients</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
