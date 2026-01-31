import RideForm from "@/components/rides/RideForm";

export default function CreateRidePage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Post a Ride</h1>
                <p className="text-gray-500">Share your journey or ask for a lift.</p>
            </div>

            <RideForm />
        </div>
    );
}
