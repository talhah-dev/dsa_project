"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

type LoginResponse = {
    message: string
    token: string
    user: { id: string; name: string; email: string }
}

export default function LoginPage() {
    const router = useRouter()

    const [loading, setLoading] = React.useState(false)
    const [showPassword, setShowPassword] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [remember, setRemember] = React.useState(true)

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const form = new FormData(e.currentTarget)
        const email = String(form.get("email") ?? "").trim()
        const password = String(form.get("password") ?? "")

        if (!email || !password) {
            setError("Please enter your email and password.")
            setLoading(false)
            return
        }

        try {
            const res = await axios.post("/api/auth/login", { email, password })
            const data = res.data as LoginResponse

            if (remember) localStorage.setItem("token", data.token)
            else sessionStorage.setItem("token", data.token)

            router.push("/dashboard")
        } catch (err: any) {
            setError(err?.response?.data?.message || "Login failed.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6">
            <Card className="w-full max-w-md rounded-2xl">
                <CardHeader>
                    <CardTitle>Welcome back</CardTitle>
                    <CardDescription>Log in to access your dashboard.</CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="you@example.com" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                />
                                <Button type="button" variant="outline" onClick={() => setShowPassword((v) => !v)}>
                                    {showPassword ? "Hide" : "Show"}
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={remember}
                                    onCheckedChange={(v) => setRemember(Boolean(v))}
                                />
                                Remember me
                            </label>

                            <Link
                                href="/forgot-password"
                                className="text-sm text-muted-foreground underline underline-offset-4"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {error && (
                            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
                                {error}
                            </div>
                        )}

                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? "Logging in..." : "Log in"}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Don&apos;t have an account?{" "}
                            <Link href="/auth/signup" className="text-foreground underline underline-offset-4">
                                Sign up
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
