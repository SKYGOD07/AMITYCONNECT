import Link from "next/link";
import { Ride } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Calendar, Users, ArrowRight, Car, MessageCircle } from "lucide-react";
import { format } from "date-fns";

interface RideCardProps {
    ride: Ride;
    onContact?: (rideId: string) => void;
}

// Helper to parse dates from either Firestore Timestamp or ISO string
function parseDate(date: any): Date | null {
    if (!date) return null;
    if (typeof date === 'string') return new Date(date);
    if (typeof date.toDate === 'function') return date.toDate();
    if (date instanceof Date) return date;
    return null;
}

export default function RideCard({ ride, onContact }: RideCardProps) {
    const isOffer = ride.type === 'OFFER';
    const departureDate = parseDate(ride.departureTime);
    const userName = ride.userName || ride.hostName || 'Anonymous';

    // Handle origin/destination as either string or object
    const originName = typeof ride.origin === 'string' ? ride.origin : ride.origin?.name || 'Unknown';
    const destName = typeof ride.destination === 'string' ? ride.destination : ride.destination?.name || 'Unknown';
    const seats = ride.availableSeats || ride.seatsAvailable || 0;

    return (
        <Card className="card-hover border-2 overflow-hidden">
            {/* Gradient header */}
            <div className={`h-2 ${isOffer ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`} />

            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <Link href={`/profile/${ride.hostId}`} className="flex items-center gap-3 group">
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm group-hover:ring-2 group-hover:ring-primary transition-all">
                            <AvatarImage src={ride.hostPhoto} />
                            <AvatarFallback className={isOffer ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}>
                                {userName[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold group-hover:text-primary transition-colors">{userName}</p>
                            <p className="text-xs text-muted-foreground">
                                {isOffer ? '🚗 Offering a ride' : '🙋 Looking for a ride'}
                            </p>
                        </div>
                    </Link>
                    <Badge
                        variant={isOffer ? "default" : "secondary"}
                        className={isOffer ? 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20' : 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20'}
                    >
                        {ride.type}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="pb-3 space-y-4">
                {/* Route */}
                <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 text-sm">
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
                            <div className="w-0.5 h-6 bg-muted-foreground/30" />
                            <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-background" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <p className="font-medium truncate">{originName}</p>
                            <p className="font-medium truncate">{destName}</p>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar size={16} />
                        <span className="font-medium">
                            {departureDate ? format(departureDate, 'MMM d, h:mm a') : 'TBD'}
                        </span>
                    </div>

                    {isOffer && seats > 0 && (
                        <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-green-500/10 text-green-600">
                            <Users size={14} />
                            <span className="text-xs font-medium">{seats} seats</span>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="pt-0 gap-2">
                <Button
                    className={`flex-1 gap-2 ${isOffer ? '' : 'bg-purple-600 hover:bg-purple-700'}`}
                    variant={isOffer ? "outline" : "default"}
                    onClick={() => onContact?.(ride.id)}
                >
                    <Car size={16} />
                    {isOffer ? 'Request Seat' : 'Offer Ride'}
                </Button>
                <Link href={`/profile/${ride.hostId}`}>
                    <Button variant="outline" size="icon" title="View Profile">
                        <MessageCircle size={16} />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
