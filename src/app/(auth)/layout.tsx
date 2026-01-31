import LandingHeader from "@/components/layout/LandingHeader";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <LandingHeader />
            <div className="pt-16">
                {children}
            </div>
        </div>
    );
}
