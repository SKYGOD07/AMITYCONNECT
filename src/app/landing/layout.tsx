import Header from "@/components/layout/Header";

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Landing page has its own header, so we don't include the global Header
    return (
        <div className="min-h-screen">
            {children}
        </div>
    );
}
