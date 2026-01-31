import { collection, query, where, getDocs, Timestamp, orderBy, limit } from "firebase/firestore";
import { db } from "./firebase";
import { Ride } from "@/types";

// Helper to get millis from Timestamp or string
function getTimeMillis(time: Timestamp | string): number {
    if (typeof time === 'string') {
        return new Date(time).getTime();
    }
    return time.toMillis();
}

interface RideRequest {
    destination: string; // Ideally this would be geohashed or coordinates, but using string for MVP
    departureTime: Timestamp;
}

/**
 * Finds matching rides for a given request.
 * Criteria:
 * 1. Same destination (exact string match for now)
 * 2. Departure time within +/- 30 minutes
 * 3. Type is 'OFFER'
 * 4. Seats available > 0
 * 5. Status is 'OPEN'
 */
export async function findMatchingRides(userRequest: RideRequest): Promise<Ride[]> {
    try {
        const ridesRef = collection(db, "rides");

        // Calculate time window
        const requestTimeMillis = userRequest.departureTime.toMillis();
        const thirtyMinutesMillis = 30 * 60 * 1000;

        const minTime = Timestamp.fromMillis(requestTimeMillis - thirtyMinutesMillis);
        const maxTime = Timestamp.fromMillis(requestTimeMillis + thirtyMinutesMillis);

        // Note: Firestore compound queries have limitations. 
        // We can't perform range filters on different fields in the same query easily without creating an index.
        // For MVP, we will filter by status, type, and seats > 0 primarily, 
        // and then do client-side filtering for time if needed to avoid complex index setup,
        // OR just filter by time and do the rest in memory if the dataset is small.
        // Let's try to be as efficient as possible with available indexes.

        // Strategy: Filter by type 'OFFER' (equality) and status 'OPEN' (equality) and seats > 0 (range).
        // Then filter by destination and time in memory if necessary, OR
        // Filter by Destination (equality) and Time (range).

        // Best Approach for this specific "Smart Matching" query:
        // Query: destination == request.destination AND type == 'OFFER' AND status == 'OPEN'
        // This allows us to get all relevant rides for that location.
        // Then we filter for time and seats in the application code.
        // This avoids the issue of multiple inequality filters (time range vs seats > 0).

        const q = query(
            ridesRef,
            where("type", "==", "OFFER"),
            where("status", "==", "OPEN"),
            where("destination", "==", userRequest.destination)
        );

        const querySnapshot = await getDocs(q);
        const potentialRides: Ride[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data() as Omit<Ride, 'id'>;
            potentialRides.push({ id: doc.id, ...data });
        });

        // In-memory advanced filtering
        const matchedRides = potentialRides.filter((ride) => {
            // 1. Check seats available
            if ((ride.seatsAvailable || 0) <= 0) return false;

            // 2. Check time window
            const rideTimeMillis = getTimeMillis(ride.departureTime);
            const timeDiff = Math.abs(rideTimeMillis - requestTimeMillis);

            return timeDiff <= thirtyMinutesMillis;
        });

        // Sort by closeness in time
        matchedRides.sort((a, b) => {
            const timeDiffA = Math.abs(getTimeMillis(a.departureTime) - requestTimeMillis);
            const timeDiffB = Math.abs(getTimeMillis(b.departureTime) - requestTimeMillis);
            return timeDiffA - timeDiffB;
        });

        return matchedRides;

    } catch (error) {
        console.error("Error finding matching rides:", error);
        return [];
    }
}
