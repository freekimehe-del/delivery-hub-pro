import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function FinancePage() {
    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Finance Module</h1>
                <p className="text-muted-foreground">Access to finance features is coming soon...</p>
            </div>
        </DashboardLayout>
    );
}
