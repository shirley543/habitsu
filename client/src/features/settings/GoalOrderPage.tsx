import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { RadioGroup } from "@radix-ui/react-radio-group";
import { RadioGroupItem } from "@/components/ui/radio-group";
import type { IconName } from "lucide-react/dynamic";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import IconButton from "@/components/custom/IconButton";

interface DummyGoalData {
  title: string,
  description: string,
  baseColour: string,
  iconName: IconName,
  goalThreshold: number,
};

const DUMMY_GOALS_DATA: DummyGoalData[] = [
  {
    title: "Drink water",
    description: "Drink at least 6 cups per day",
    baseColour: "#60A5FA", ///< TODOs: Blue/400
    iconName: "glass-water",
    goalThreshold: 6,
  },
  {
    title: "Play piano",
    description: "Play for 15 minutes per day",
    baseColour: "#F472B6", ///< TODOs: Pink/400
    iconName: "piano",
    goalThreshold: 15,
  },
  {
    title: "Reading",
    description: "Read 10 pages per day",
    baseColour: "#FBBF24", ///< TODOs: Amber/400
    iconName: "book",
    goalThreshold: 10,
  },
  {
    title: "Exercise",
    description: "Exercise for an hour at least once a week",
    baseColour: "#C084FC", ///< TODOs: Lime/400
    iconName: "biceps-flexed",
    goalThreshold: 1,
  },
]

interface GoalOrderItem {
  title: string,
  baseColour: string,
  iconName: IconName,
  order: number,
}

export function GoalOrderPage() {

  const GoalOrderItems: GoalOrderItem[] = DUMMY_GOALS_DATA.map((data, idx) => {
    return {
      title: data.title,
      baseColour: data.baseColour,
      iconName: data.iconName,
      order: idx,
    }
  })


  return (
    <div className="flex flex-col gap-3">
      {/* Topbar container */}
      <div className="topbar-container flex flex-row justify-between items-center">
        <h1 className="text-base font-extrabold">Goal Order</h1>
        <div className="buttons-container flex flex-row gap-1.5">
          <IconButton iconName="x"/>
        </div>
      </div>
      {/* Order controls container */}
      {
        GoalOrderItems.map((item) => {
          return (
            <div className="orderItem bg-white rounded-md flex flex-row overflow-hidden">
              <div className="tab w-2" style={{backgroundColor: item.baseColour}}></div>
              <div className="titleButtons w-full px-2.5 py-2 flex flex-row gap-2 items-center">
                <h2 className="title w-full text-sm font-semibold">{item.title}</h2>
                <div className="buttons flex flex-row gap-1">
                <IconButton iconName="arrow-up"/>
                <IconButton iconName="arrow-down"/>
                </div>
              </div>
            </div>
          )
        })
      }
    </div>
  )
}