"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function ErrandForm() {
    const { user } = useAuth();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [reward, setReward] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        setError("");

        try {
            await addDoc(collection(db, "errands"), {
                requesterId: user.uid,
                requesterName: user.displayName || "Anonymous",
                title,
                description,
                location,
                reward,
                status: 'OPEN',
                createdAt: serverTimestamp(),
            });

            router.push("/errands");
        } catch (err: any) {
            setError(err.message || "Failed to post errand");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                            placeholder="e.g., Buy me a coffee"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            placeholder="Details about what you need..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                            placeholder="Where to deliver/meet?"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Reward (Optional)</Label>
                        <Input
                            placeholder="e.g., Cost + $5 tip"
                            value={reward}
                            onChange={e => setReward(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                        {loading ? "Posting..." : "Post Request"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
