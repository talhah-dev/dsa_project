"use client"

import * as React from "react"
import axios from "axios"
import { IconPlus, IconPencil, IconTrash, IconRefresh } from "@tabler/icons-react"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type BedStatus = "active" | "inactive"

type Bed = {
    _id: string
    code: string
    ward: string
    status: BedStatus
}

const wards = ["ICU", "General", "Surgery", "Pediatrics"]

function StatusBadge({ status }: { status: BedStatus }) {
    return (
        <Badge variant={status === "active" ? "secondary" : "outline"}>{status}</Badge>
    )
}

export default function BedsPage() {
    const [beds, setBeds] = React.useState<Bed[]>([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const [addOpen, setAddOpen] = React.useState(false)
    const [editOpen, setEditOpen] = React.useState(false)

    const [newCode, setNewCode] = React.useState("")
    const [newWard, setNewWard] = React.useState<string>("")
    const [newStatus, setNewStatus] = React.useState<BedStatus>("active")

    const [editId, setEditId] = React.useState<string | null>(null)
    const [editCode, setEditCode] = React.useState("")
    const [editWard, setEditWard] = React.useState<string>("")
    const [editStatus, setEditStatus] = React.useState<BedStatus>("active")

    const fetchBeds = React.useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await axios.get("/api/beds")
            setBeds(res.data.beds ?? [])
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to load beds")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchBeds()
    }, [fetchBeds])

    const totalBeds = beds.length
    const activeBeds = beds.filter((b) => b.status === "active").length
    const inactiveBeds = totalBeds - activeBeds

    const resetAddForm = () => {
        setNewCode("")
        setNewWard("")
        setNewStatus("active")
    }

    const onAddBed = async () => {
        if (!newCode.trim() || !newWard) return
        setLoading(true)
        setError(null)
        try {
            await axios.post("/api/beds", {
                code: newCode.trim(),
                ward: newWard,
                status: newStatus,
            })
            setAddOpen(false)
            resetAddForm()
            await fetchBeds()
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to add bed")
        } finally {
            setLoading(false)
        }
    }

    const openEdit = (bed: Bed) => {
        setEditId(bed._id)
        setEditCode(bed.code)
        setEditWard(bed.ward)
        setEditStatus(bed.status)
        setEditOpen(true)
    }

    const onEditBed = async () => {
        if (!editId || !editCode.trim() || !editWard) return
        setLoading(true)
        setError(null)
        try {
            await axios.patch(`/api/beds/${editId}`, {
                code: editCode.trim(),
                ward: editWard,
                status: editStatus,
            })
            setEditOpen(false)
            setEditId(null)
            await fetchBeds()
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to update bed")
        } finally {
            setLoading(false)
        }
    }

    const onDeleteBed = async (id: string) => {
        setLoading(true)
        setError(null)
        try {
            await axios.delete(`/api/beds/${id}`)
            await fetchBeds()
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to delete bed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Beds</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage hospital beds and their status.
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchBeds} disabled={loading}>
                        <IconRefresh className="mr-2 size-4" />
                        Refresh
                    </Button>

                    <Dialog open={addOpen} onOpenChange={setAddOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <IconPlus className="mr-2 size-4" />
                                Add Bed
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add Bed</DialogTitle>
                                <DialogDescription>Enter bed details to add it.</DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bedCode">Bed Code</Label>
                                    <Input
                                        id="bedCode"
                                        placeholder="e.g., ICU-05"
                                        value={newCode}
                                        onChange={(e) => setNewCode(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Ward</Label>
                                    <Select value={newWard} onValueChange={setNewWard}>
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
                                    <Label>Status</Label>
                                    <Select
                                        value={newStatus}
                                        onValueChange={(v) => setNewStatus(v as BedStatus)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">active</SelectItem>
                                            <SelectItem value="inactive">inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                <Button onClick={onAddBed} disabled={loading || !newCode.trim() || !newWard}>
                                    Add
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">Total Beds</CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-semibold">{totalBeds}</CardContent>
                </Card>

                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">Active Beds</CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-semibold">{activeBeds}</CardContent>
                </Card>

                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">Inactive Beds</CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-semibold">{inactiveBeds}</CardContent>
                </Card>
            </div>

            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Bed List</CardTitle>
                    <CardDescription>All beds from database.</CardDescription>
                </CardHeader>

                <CardContent>
                    {error && (
                        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Bed Code</TableHead>
                                    <TableHead>Ward</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {beds.map((bed) => (
                                    <TableRow key={bed._id}>
                                        <TableCell className="font-medium">{bed.code}</TableCell>
                                        <TableCell>{bed.ward}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={bed.status} />
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <div className="inline-flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openEdit(bed)}
                                                    disabled={loading}
                                                >
                                                    <IconPencil className="mr-2 size-4" />
                                                    Edit
                                                </Button>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="sm" variant="destructive" disabled={loading}>
                                                            <IconTrash className="mr-2 size-4" />
                                                            Delete
                                                        </Button>
                                                    </AlertDialogTrigger>

                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete bed?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => onDeleteBed(bed._id)}>
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {!loading && beds.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                                            No beds found.
                                        </TableCell>
                                    </TableRow>
                                )}

                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                                            Loading...
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
                        <DialogTitle>Edit Bed</DialogTitle>
                        <DialogDescription>Update bed details.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="editCode">Bed Code</Label>
                            <Input
                                id="editCode"
                                value={editCode}
                                onChange={(e) => setEditCode(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Ward</Label>
                            <Select value={editWard} onValueChange={setEditWard}>
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
                            <Label>Status</Label>
                            <Select
                                value={editStatus}
                                onValueChange={(v) => setEditStatus(v as BedStatus)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">active</SelectItem>
                                    <SelectItem value="inactive">inactive</SelectItem>
                                </SelectContent>
                            </Select>
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
                        <Button onClick={onEditBed} disabled={loading || !editCode.trim() || !editWard}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
