import ErrandForm from "@/components/errands/ErrandForm";

export default function CreateErrandPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Request an Errand</h1>
                <p className="text-gray-500">Ask the community for help with deliveries or tasks.</p>
            </div>

            <ErrandForm />
        </div>
    );
}
