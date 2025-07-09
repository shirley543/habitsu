import IconButton from "@/components/custom/IconButton";
import { TopBarClose } from "@/components/custom/TopBar";
import { useNavigate } from "@tanstack/react-router";
import { useGoals } from "../goals/GoalApi";
import { ErrorBodyComponent } from "@/components/custom/ErrorComponents";
import { SortableList } from "./SortableList";

export function GoalOrderPage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGoals();

  return (
    <div className="flex flex-col gap-3">
      {/* Topbar config */}
      <TopBarClose title="Goal Order" closeCallback={() => { navigate({ to: "/settings" })}} />
      {/* Order controls container */}
      {error && <ErrorBodyComponent error={error} onRefreshClick={() => { console.log("on refresh click" )}}/>}
      {data &&
        data.map((item) => {
          return (
            <div className="orderItem bg-white rounded-md flex flex-row overflow-hidden">
              <div className="tab w-2" style={{backgroundColor: `#${item.colour}`}}></div>
              <div className="titleButtons w-full px-2.5 py-2 flex flex-row gap-2 items-center">
                <h2 className="title w-full text-sm font-semibold">{item.title}</h2>
                <div className="buttons flex flex-row gap-1">
                <IconButton iconName="arrow-up" onClickCallback={() => { console.log("clicked up") }}/>
                <IconButton iconName="arrow-down" onClickCallback={() => { console.log("clicked down") }}/>
                </div>
              </div>
            </div>
          )
        })
      }
      <SortableList node={<div>Hello</div>}/>
    </div>
  )
}