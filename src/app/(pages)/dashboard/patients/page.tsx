"use client"

import * as React from "react"
import axios from "axios"
import { IconPlus, IconPencil, IconRefresh } from "@tabler/icons-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

type Patient = {
    _id: string
    name: string
    mrn?: string
    phone?: string
    createdAt?: string
}

export default function PatientsPage() {
    const [patients, setPatients] = React.useState<Patient[]>([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const [query, setQuery] = React.useState("")

    const [addOpen, setAddOpen] = React.useState(false)
    const [editOpen, setEditOpen] = React.useState(false)

    const [newName, setNewName] = React.useState("")
    const [newMrn, setNewMrn] = React.useState("")
    const [newPhone, setNewPhone] = React.useState("")

    const [editId, setEditId] = React.useState<string | null>(null)
    const [editName, setEditName] = React.useState("")
    const [editMrn, setEditMrn] = React.useState("")
    const [editPhone, setEditPhone] = React.useState("")

    const fetchPatients = React.useCallback(async (q?: string) => {
        setLoading(true)
        setError(null)
        try {
            const res = await axios.get("/api/patients", {
                params: q?.trim() ? { q: q.trim() } : {},
            })
            setPatients(res.data.patients ?? [])
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to load patients")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchPatients()
    }, [fetchPatients])

    const onSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchPatients(query)
    }

    const resetAdd = () => {
        setNewName("")
        setNewMrn("")
        setNewPhone("")
    }

    const onAddPatient = async () => {
        if (!newName.trim()) return
        setLoading(true)
        setError(null)
        try {
            await axios.post("/api/patients", {
                name: newName.trim(),
                mrn: newMrn.trim() || undefined,
                phone: newPhone.trim() || undefined,
            })
            setAddOpen(false)
            resetAdd()
            await fetchPatients(query)
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to add patient")
        } finally {
            setLoading(false)
        }
    }

    const openEdit = (p: Patient) => {
        setEditId(p._id)
        setEditName(p.name ?? "")
        setEditMrn(p.mrn ?? "")
        setEditPhone(p.phone ?? "")
        setEditOpen(true)
    }

    const onEditPatient = async () => {
        if (!editId || !editName.trim()) return
        setLoading(true)
        setError(null)
        try {
            await axios.patch(`/api/patients/${editId}`, {
                name: editName.trim(),
                mrn: editMrn.trim() || undefined,
                phone: editPhone.trim() || undefined,
            })
            setEditOpen(false)
            setEditId(null)
            await fetchPatients(query)
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to update patient")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Patients</h1>
                    <p className="text-sm text-muted-foreground">
                        Create and search patients for bed allocation.
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => fetchPatients(query)} disabled={loading}>
                        <IconRefresh className="mr-2 size-4" />
                        Refresh
                    </Button>

                    <Dialog open={addOpen} onOpenChange={setAddOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <IconPlus className="mr-2 size-4" />
                                Add Patient
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add Patient</DialogTitle>
                                <DialogDescription>Enter patient details.</DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="e.g., Ali Raza"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mrn">MRN (optional)</Label>
                                    <Input
                                        id="mrn"
                                        value={newMrn}
                                        onChange={(e) => setNewMrn(e.target.value)}
                                        placeholder="e.g., MRN-20411"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone (optional)</Label>
                                    <Input
                                        id="phone"
                                        value={newPhone}
                                        onChange={(e) => setNewPhone(e.target.value)}
                                        placeholder="e.g., 0300-1234567"
                                    />
                                </div>

                                {error && (
                                    <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
                                        {error}
                                    </div>
                                )}
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setAddOpen(false)} disabled={loading}>
                                    Cancel
                                </Button>
                                <Button onClick={onAddPatient} disabled={loading || !newName.trim()}>
                                    Add
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Patient List</CardTitle>
                    <CardDescription>Search patients by name, MRN, or phone.</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {error && (
                        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={onSearch} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                            placeholder="Search patients..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="sm:max-w-sm"
                        />
                        <div className="flex gap-2">
                            <Button type="submit" variant="outline" disabled={loading}>
                                Search
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setQuery("")
                                    fetchPatients("")
                                }}
                                disabled={loading}
                            >
                                Clear
                            </Button>
                        </div>
                    </form>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>MRN</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!loading &&
                                    patients.map((p) => (
                                        <TableRow key={p._id}>
                                            <TableCell className="font-medium">{p.name}</TableCell>
                                            <TableCell>{p.mrn ?? "—"}</TableCell>
                                            <TableCell>{p.phone ?? "—"}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openEdit(p)}
                                                    disabled={loading}
                                                >
                                                    <IconPencil className="mr-2 size-4" />
                                                    Edit
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                {!loading && patients.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                                            No patients found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Patient</DialogTitle>
                        <DialogDescription>Update patient details.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="editName">Name</Label>
                            <Input
                                id="editName"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="editMrn">MRN (optional)</Label>
                            <Input
                                id="editMrn"
                                value={editMrn}
                                onChange={(e) => setEditMrn(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="editPhone">Phone (optional)</Label>
                            <Input
                                id="editPhone"
                                value={editPhone}
                                onChange={(e) => setEditPhone(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
                                {error}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button onClick={onEditPatient} disabled={loading || !editName.trim()}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
