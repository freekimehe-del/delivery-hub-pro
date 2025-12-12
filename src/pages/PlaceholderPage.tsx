import { Construction } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PlaceholderPage() {
    const location = useLocation();
    const pageName = location.pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Module";

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-fade-in">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <Construction className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-3">{pageName}</h1>
            <p className="text-slate-500 max-w-md mb-8">
                This module is currently under development as part of the new organizational structure.
                Check back soon for updates!
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
            </Button>
        </div>
    );
}
