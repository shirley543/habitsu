import { Button } from "@/components/ui/button";
import { CalendarDays, Plus, Settings } from "lucide-react";
import Heatmap from "./components/Heatmap";


export const GoalsPage = () => {
  return (
    <div className="bg-neutral-100 px-3 py-3">
      {/* Topbar container */}
      <div className="topbar-container flex flex-row justify-between items-center">
        <h1 className="text-base font-extrabold">Goals List</h1>
        <div className="buttons-container">
          <Button variant="secondary" size="icon">
            <CalendarDays className="size-4"/>
          </Button>
          <Button variant="secondary" size="icon">
            <Settings className="size-4"/>
          </Button>
          <Button variant="secondary" size="icon">
            <Plus className="size-4"/>
          </Button>
        </div>
      </div>
      {/* Heatmaps container */}
      <div className="flex flex-col gap-3">
        <Heatmap />
      </div>
      
      <p>Welcome to the dashboard!</p>
    </div>
  );
};
