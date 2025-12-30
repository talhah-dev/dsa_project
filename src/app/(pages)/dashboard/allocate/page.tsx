"use client"

import * as React from "react"
import axios from "axios"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type AllocationResponse = {
    bed: { id: string; code: string; ward: string }
    patient: { id: string; name: string }
    stay: {
        _id: string
        start: string
        end: string
        status: "reserved" | "admitted" | "discharged" | "cancelled"
    }
}

const wards = ["ICU", "General", "Surgery", "Pediatrics"]

export default function AllocatePage() {
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [result, setResult] = React.useState<AllocationResponse | null>(null)

    const [patientName, setPatientName] = React.useState("")
    const [mrn, setMrn] = React.useState("")
    const [phone, setPhone] = React.useState("")
    const [ward, setWard] = React.useState<string>("")
    const [start, setStart] = React.useState("")
    const [end, setEnd] = React.useState("")

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setResult(null)

        if (!patientName.trim() || !ward || !start || !end) {
            setError("Please fill patient name, ward, start and end.")
            return
        }

        setLoading(true)
        try {
            const payload = {
                patientName: patientName.trim(),
                mrn: mrn.trim() || undefined,
                phone: phone.trim() || undefined,
                ward,
                start,
                end,
            }

            const res = await axios.post("/api/allocate", payload)
            setResult(res.data as AllocationResponse)
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Allocation failed. Please try again."
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Allocate Bed</h1>
                <p className="text-sm text-muted-foreground">
                    Allocate a bed for a patient within a time interval.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="rounded-2xl lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Allocation Request</CardTitle>
                        <CardDescription>
                            Enter patient and time details. The system will assign a free bed.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={onSubmit} className="space-y-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="patientName">Patient Name</Label>
                                    <Input
                                        id="patientName"
                                        placeholder="e.g., Ayesha Khan"
                                        value={patientName}
                                        onChange={(e) => setPatientName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mrn">MRN (optional)</Label>
                                    <Input
                                        id="mrn"
                                        placeholder="e.g., MRN-10293"
                                        value={mrn}
                                        onChange={(e) => setMrn(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Ward</Label>
                                    <Select value={ward} onValueChange={setWard} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select ward" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {wards.map((w) => (
                                                <SelectItem key={w} value={w}>
                                                    {w}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone (optional)</Label>
                                    <Input
                                        id="phone"
                                        placeholder="e.g., 0300-1234567"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="start">Start Date/Time</Label>
                                    <Input
                                        id="start"
                                        type="datetime-local"
                                        value={start}
                                        onChange={(e) => setStart(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end">End Date/Time</Label>
                                    <Input
                                        id="end"
                                        type="datetime-local"
                                        value={end}
                                        onChange={(e) => setEnd(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <Separator />

                            {error && (
                                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Allocating..." : "Find & Allocate Bed"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setError(null)
                                        setResult(null)
                                    }}
                                    disabled={loading}
                                >
                                    Clear
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle>Result</CardTitle>
                        <CardDescription>Allocation output will appear here.</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {!result ? (
                            <div className="text-sm text-muted-foreground">
                                No allocation yet. Submit a request to see results.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">Status</div>
                                    <Badge variant="secondary">{result.stay.status}</Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">Patient</div>
                                    <div className="font-medium">{result.patient.name}</div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">Bed</div>
                                    <div className="font-medium">{result.bed.code}</div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">Ward</div>
                                    <div className="font-medium">{result.bed.ward}</div>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">Start</div>
                                    <div className="font-medium">{String(result.stay.start)}</div>

                                    <div className="text-sm text-muted-foreground">End</div>
                                    <div className="font-medium">{String(result.stay.end)}</div>
                                </div>

                                <Button className="w-full" variant="outline" asChild>
                                    <a href="/dashboard/allocations">View Allocations</a>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
