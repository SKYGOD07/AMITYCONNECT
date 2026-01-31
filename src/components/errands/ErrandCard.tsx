import { Errand } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Gift, Clock, CheckCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";

interface ErrandCardProps {
    errand: Errand;
    onAccept?: (errandId: string) => void;
    onComplete?: (errandId: string) => void;
}

// Helper to parse dates from either Firestore Timestamp or ISO string
function parseDate(date: any): Date | null {
    if (!date) return null;
    if (typeof date === 'string') return new Date(date);
    if (typeof date.toDate === 'function') return date.toDate();
    if (date instanceof Date) return date;
    return null;
}

export default function ErrandCard({ errand, onAccept, onComplete }: ErrandCardProps) {
    const { user } = useAuth();
    const isOwner = user?.uid === errand.requesterId;
    const isHelper = user?.uid === errand.helperId;
    const createdDate = parseDate(errand.createdAt);

    // Location is a string per the Errand type
    const locationName = errand.location || 'Unknown';

    const statusColors = {
        OPEN: 'bg-green-500/10 text-green-600 border-green-500/20',
        IN_PROGRESS: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
        COMPLETED: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    };

    return (
        <Card className="card-hover border-2 overflow-hidden">
            {/* Status indicator */}
            <div className={`h-2 ${errand.status === 'OPEN' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                errand.status === 'IN_PROGRESS' ? 'bg-gradient-to-r from-orange-500 to-yellow-500' :
                    'bg-gradient-to-r from-blue-500 to-cyan-500'
                }`} />

            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                            <AvatarFallback className="bg-green-100 text-green-600">
                                {errand.requesterName?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{errand.requesterName || 'Anonymous'}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock size={12} />
                                <span>{createdDate ? format(createdDate, 'MMM d, h:mm a') : 'Just now'}</span>
                            </div>
                        </div>
                    </div>
                    <Badge className={statusColors[errand.status] || statusColors.OPEN}>
                        {errand.status === 'IN_PROGRESS' ? 'In Progress' : errand.status}
                    </Badge>
                </div>
                <CardTitle className="mt-3 text-lg">{errand.title}</CardTitle>
            </CardHeader>

            <CardContent className="pb-3 space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{errand.description}</p>

                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin size={16} />
                        <span className="truncate max-w-[150px]">{locationName}</span>
                    </div>
                    {errand.reward && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-600 font-medium">
                            <Gift size={14} />
                            <span className="text-xs">{errand.reward}</span>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="pt-0">
                {isOwner && errand.status === 'IN_PROGRESS' && (
                    <Button className="w-full gap-2 bg-green-600 hover:bg-green-700" onClick={() => onComplete?.(errand.id)}>
                        <CheckCircle size={16} />
                        Mark as Completed
                    </Button>
                )}
                {!isOwner && errand.status === 'OPEN' && (
                    <Button className="w-full gap-2" onClick={() => onAccept?.(errand.id)}>
                        Accept Errand
                    </Button>
                )}
                {errand.status === 'COMPLETED' && (
                    <Button variant="outline" className="w-full gap-2" disabled>
                        <CheckCircle size={16} />
                        Completed
                    </Button>
                )}
                {isHelper && errand.status === 'IN_PROGRESS' && (
                    <Button variant="secondary" className="w-full gap-2" disabled>
                        <Loader2 size={16} className="animate-spin" />
                        In Progress...
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
