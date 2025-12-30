"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignupPage() {
    const [loading, setLoading] = React.useState(false)
    const [showPassword, setShowPassword] = React.useState(false)
    const [showConfirm, setShowConfirm] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const form = new FormData(e.currentTarget)
        const name = String(form.get("name") ?? "").trim()
        const email = String(form.get("email") ?? "").trim()
        const password = String(form.get("password") ?? "")
        const confirmPassword = String(form.get("confirmPassword") ?? "")

        if (!name || !email || !password || !confirmPassword) {
            setError("Please fill in all fields.")
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.")
            setLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            setLoading(false)
            return
        }

        // Frontend-only: replace with API call later
        await new Promise((r) => setTimeout(r, 700))

        setLoading(false)
        alert("Account created (mock). Connect API to finish signup.")
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6">
            <Card className="w-full max-w-md rounded-2xl">
                <CardHeader>
                    <CardTitle>Create an account</CardTitle>
                    <CardDescription>Sign up to access the dashboard.</CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" placeholder="Muhammad Talha" autoComplete="name" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                autoComplete="email"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowPassword((v) => !v)}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowConfirm((v) => !v)}
                                >
                                    {showConfirm ? "Hide" : "Show"}
                                </Button>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
                                {error}
                            </div>
                        )}

                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create account"}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/login" className="text-foreground underline underline-offset-4">
                                Log in
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
