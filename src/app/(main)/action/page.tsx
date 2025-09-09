'use client';

import ActionLogger from "@/components/actionPage/ActionLogger";
import Dashboard from "@/components/actionPage/Dashboard";

export default function ActionPage() {
    return (
        <>
            <Dashboard totalPoints={1} />
            <ActionLogger sdgData={[
                { id: 1, title: "No Poverty" },
                { id: 2, title: "Zero Hunger" },
                { id: 3, title: "Good Health and Well-being" },
                { id: 4, title: "Quality Education" },
            ]} onActionSubmit={() => {
                // Handle action submission logic here
                console.log("Action submitted");
            }} />
        </>
    );
}