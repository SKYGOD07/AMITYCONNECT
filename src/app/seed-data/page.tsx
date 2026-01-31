
"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { faker } from "@faker-js/faker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

const LOCATIONS = ["Hostel 1", "Hostel 2", "Library", "Main Gate", "Cafeteria", "Sports Complex"];
const DESTINATIONS = ["Airport", "City Centre", "Railway Station", "Mall"];

export default function SeedDataPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ type: string; count: number; status: 'success' | 'error' }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const seedUsers = async () => {
    const usersRef = collection(db, "users");
    const promises = [];
    for (let i = 0; i < 20; i++) {
      const role = faker.helpers.arrayElement(["student", "student", "student", "admin"]);
      promises.push(addDoc(usersRef, {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: role,
        hostel: faker.helpers.arrayElement(["Hostel 1", "Hostel 2", "Hostel 3"]),
        createdAt: Timestamp.now(),
      }));
    }
    await Promise.all(promises);
    return 20;
  };

  const seedRides = async () => {
    const ridesRef = collection(db, "rides");
    const promises = [];
    for (let i = 0; i < 10; i++) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const rideDate = faker.date.between({ from: tomorrow, to: new Date(tomorrow.getTime() + 86400000) });
  
        promises.push(addDoc(ridesRef, {
        driver: {
          name: faker.person.fullName(),
          id: faker.string.uuid(),
        },
        origin: faker.helpers.arrayElement(LOCATIONS),
        destination: faker.helpers.arrayElement(DESTINATIONS),
        departureTime: Timestamp.fromDate(rideDate),
        seatsAvailable: faker.number.int({ min: 1, max: 3 }),
        price: faker.number.int({ min: 50, max: 200 }),
        status: "active",
        createdAt: Timestamp.now(),
      }));
    }
    await Promise.all(promises);
    return 10;
  };

  const seedRequests = async () => {
    const requestsRef = collection(db, "requests");
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(addDoc(requestsRef, {
        requester: {
          name: faker.person.fullName(),
          id: faker.string.uuid(),
        },
        title: faker.helpers.arrayElement(["Need Paracetamol", "Printout needed", "Charger needed", "Notes needed", "Lunch pickup"]),
        description: faker.lorem.sentence(),
        location: faker.helpers.arrayElement(LOCATIONS),
        urgency: "Urgent",
        status: "open",
        createdAt: Timestamp.now(),
      }));
    }
    await Promise.all(promises);
    return 5;
  };

  const handleSeed = async () => {
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const userCount = await seedUsers();
      setResults(prev => [...prev, { type: "Users", count: userCount, status: 'success' }]);
      
      const rideCount = await seedRides();
      setResults(prev => [...prev, { type: "Rides", count: rideCount, status: 'success' }]);
      
      const requestCount = await seedRequests();
      setResults(prev => [...prev, { type: "Requests", count: requestCount, status: 'success' }]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while seeding data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
            Database Seeder
          </CardTitle>
          <CardDescription>
            Populate your Firestore with realistic demo data. Ensure you are signed in if rules require it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4">
            <Button 
              size="lg" 
              onClick={handleSeed} 
              disabled={loading}
              className="w-full h-16 text-lg font-semibold shadow-lg hover:shadow-primary/20 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Seeding Database...
                </>
              ) : (
                "Seed All Data (50+ Entries)"
              )}
            </Button>
            
            <p className="text-sm text-muted-foreground text-center">
              This will create 20 Users, 10 Rides (Tomorrow), and 5 Urgent Requests.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {results.map((res, i) => (
              <Alert key={i} className="animate-in zoom-in-95 duration-300">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertTitle>Success: {res.type}</AlertTitle>
                <AlertDescription>
                  Successfully created {res.count} {res.type.toLowerCase()} in Firestore.
                </AlertDescription>
              </Alert>
            ))}
          </div>
          
          {results.length > 0 && !loading && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center font-medium text-green-600 dark:text-green-400">
              ✅ Seeding Complete! You can now delete this page.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
