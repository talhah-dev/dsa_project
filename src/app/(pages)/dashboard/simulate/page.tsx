"use client"

import * as React from "react"
import axios from "axios"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

type Scenario = "peak" | "long" | "random"

type SimulateResponse = {
    scenario: Scenario
    requests: number
    success: number
    failed: number
    createdStayIds: string[]
    note?: string
}

export default function SimulatePage() {
    const [scenario, setScenario] = React.useState<Scenario>("peak")
    const [requests, setRequests] = React.useState("50")
    const [bedsMin, setBedsMin] = React.useState("20")

    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [result, setResult] = React.useState<SimulateResponse | null>(null)

    const runSimulation = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setResult(null)

        const reqNum = Number(requests)
        const bedsNum = Number(bedsMin)

        if (!Number.isFinite(reqNum) || reqNum <= 0) {
            setError("Requests must be a valid number greater than 0.")
            return
        }
        if (!Number.isFinite(bedsNum) || bedsNum <= 0) {
            setError("bedsMin must be a valid number greater than 0.")
            return
        }

        setLoading(true)
        try {
            const res = await axios.post("/api/simulate", {
                scenario,
                requests: reqNum,
                bedsMin: bedsNum,
            })
            setResult(res.data as SimulateResponse)
        } catch (err: any) {
            setError(err?.response?.data?.message || "Simulation failed.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Simulate Data</h1>
                    <p className="text-sm text-muted-foreground">
                        Generate dummy data to test peak admissions, long stays, and random arrivals.
                    </p>
                </div>

                <Button variant="outline" asChild>
                    <Link href="/dashboard/allocations">View Allocations</Link>
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="rounded-2xl lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Run Simulation</CardTitle>
                        <CardDescription>Creates dummy patients and stays using allocation logic.</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={runSimulation} className="space-y-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Scenario</Label>
                                    <Select value={scenario} onValueChange={(v) => setScenario(v as Scenario)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select scenario" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="peak">Peak admissions</SelectItem>
                                            <SelectItem value="long">Long stays</SelectItem>
                                            <SelectItem value="random">Random arrivals</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="requests">Requests</Label>
                                    <Input
                                        id="requests"
                                        inputMode="numeric"
                                        value={requests}
                                        onChange={(e) => setRequests(e.target.value)}
                                        placeholder="e.g., 100"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bedsMin">Minimum Active Beds</Label>
                                <Input
                                    id="bedsMin"
                                    inputMode="numeric"
                                    value={bedsMin}
                                    onChange={(e) => setBedsMin(e.target.value)}
                                    placeholder="e.g., 30"
                                />
                            </div>

                            <Separator />

                            {error && (
                                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Running..." : "Run Simulation"}
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
                        <CardDescription>Output from /api/simulate</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {!result ? (
                            <div className="text-sm text-muted-foreground">
                                No result yet. Run a simulation to see output.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">Scenario</div>
                                    <Badge variant="secondary">{result.scenario}</Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">Requests</div>
                                    <div className="font-medium">{result.requests}</div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">Success</div>
                                    <div className="font-medium">{result.success}</div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">Failed</div>
                                    <div className="font-medium">{result.failed}</div>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">Created Stay IDs</div>
                                    <div className="max-h-40 overflow-auto rounded-lg border p-2 text-xs">
                                        {result.createdStayIds.length ? (
                                            <ul className="space-y-1">
                                                {result.createdStayIds.map((id) => (
                                                    <li key={id} className="break-all">
                                                        {id}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="text-muted-foreground">None</div>
                                        )}
                                    </div>
                                    {result.note && (
                                        <div className="text-xs text-muted-foreground">{result.note}</div>
                                    )}
                                </div>

                                <Button className="w-full" variant="outline" asChild>
                                    <Link href="/dashboard/allocations">Open Allocations</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
