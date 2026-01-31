const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, Timestamp } = require("firebase/firestore");
const { getAuth, signInAnonymously, createUserWithEmailAndPassword } = require("firebase/auth");
const { faker } = require("@faker-js/faker");

const firebaseConfig = {
    apiKey: "AIzaSyCjOMtmfyqbLEt4lZoC_IxBXNHHGOzgpN8",
    authDomain: "campus-flow-app-60fa8.firebaseapp.com",
    projectId: "campus-flow-app-60fa8",
    storageBucket: "campus-flow-app-60fa8.firebasestorage.app",
    messagingSenderId: "990548010268",
    appId: "1:990548010268:web:da49d89ec21bac94fd86d9",
    measurementId: "G-8JNMDH21K0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const LOCATIONS = ["Hostel 1", "Hostel 2", "Library", "Main Gate", "Cafeteria", "Sports Complex"];
const DESTINATIONS = ["Airport", "City Centre", "Railway Station", "Mall"];

async function authenticate() {
    try {
        console.log("Attempting Anonymous Auth...");
        await signInAnonymously(auth);
        console.log("✅ Signed in anonymously");
    } catch (error) {
        if (error.code === 'auth/operation-not-allowed' || error.code === 'auth/admin-restricted-operation') {
            console.log("⚠️ Anonymous auth disabled. Trying to create a temporary seeder user...");
            try {
                const email = `seeder_${Date.now()}@example.com`;
                const password = "password123";
                await createUserWithEmailAndPassword(auth, email, password);
                console.log("✅ Created and signed in as temporary user:", email);
            } catch (createError) {
                console.error("❌ Auth failed. Ensure Anonymous Auth is enabled or Email/Password sign-up is allowed in Firebase Console.");
                throw createError;
            }
        } else {
            throw error;
        }
    }
}

async function seedUsers() {
    console.log("Seeding Users...");
    const usersRef = collection(db, "users");
    const promises = [];

    for (let i = 0; i < 20; i++) {
        const role = faker.helpers.arrayElement(["student", "student", "student", "admin"]);
        const user = {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            role: role,
            hostel: faker.helpers.arrayElement(["Hostel 1", "Hostel 2", "Hostel 3"]),
            createdAt: Timestamp.now(),
        };
        promises.push(addDoc(usersRef, user));
    }

    await Promise.all(promises);
    console.log("Only generated 20 Users.");
}

async function seedRides() {
    console.log("Seeding Rides...");
    const ridesRef = collection(db, "rides");
    const promises = [];

    for (let i = 0; i < 10; i++) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const rideDate = faker.date.between({ from: tomorrow, to: new Date(tomorrow.getTime() + 86400000) });

        const ride = {
            driver: {
                name: faker.person.fullName(),
                id: faker.string.uuid(), // Placeholder ID
            },
            origin: faker.helpers.arrayElement(LOCATIONS),
            destination: faker.helpers.arrayElement(DESTINATIONS),
            departureTime: Timestamp.fromDate(rideDate),
            seatsAvailable: faker.number.int({ min: 1, max: 3 }),
            price: faker.number.int({ min: 50, max: 200 }),
            status: "active",
            createdAt: Timestamp.now(),
        };
        promises.push(addDoc(ridesRef, ride));
    }

    await Promise.all(promises);
    console.log("Generated 10 Active Rides.");
}

async function seedRequests() {
    console.log("Seeding Requests...");
    const requestsRef = collection(db, "requests");
    const promises = [];

    for (let i = 0; i < 5; i++) {
        const request = {
            requester: {
                name: faker.person.fullName(),
                id: faker.string.uuid(), // Placeholder ID
            },
            title: faker.helpers.arrayElement(["Need Paracetamol", "Printout needed", "Charger needed", "Notes needed", "Lunch pickup"]),
            description: faker.lorem.sentence(),
            location: faker.helpers.arrayElement(LOCATIONS),
            urgency: "Urgent",
            status: "open",
            createdAt: Timestamp.now(),
        };
        promises.push(addDoc(requestsRef, request));
    }

    await Promise.all(promises);
    console.log("Generated 5 Urgent Requests.");
}

async function main() {
    try {
        await authenticate();
        await seedUsers();
        await seedRides();
        await seedRequests();
        console.log("✅ Database seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    }
}

main();
