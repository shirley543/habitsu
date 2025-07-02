import type { IconName } from "lucide-react/dynamic";
import IconButton from "./IconButton"

interface TopBarInternalProps {
  title: string,
  leftSlot?: React.ReactNode,
  rightSlot?: React.ReactNode,
}

/**
 * Top bar: contains title in center, left slot and right slot for nodes (any c)
 */
const TopBarInternal: React.FC<TopBarInternalProps> = ({ title, leftSlot, rightSlot }) => {
  return (
    <div className="flex flex-row gap-3">
      {leftSlot}
      <div className="flex flex-row justify-between items-center w-full">
        <h1 className="text-base font-extrabold w-full">{title}</h1>
        {rightSlot}
      </div>
    </div>
  )
}

interface TopBarCloseProps {
  title: string,
  closeCallback: () => void;
}

/**
 * Top bar close: contains title and close (x) button on right
 */
const TopBarClose: React.FC<TopBarCloseProps> = ({ title, closeCallback }) => {
  const rightSlot = (() => {
    return <>
      <div className="buttons-container flex flex-row gap-1.5">
        <IconButton iconName="x" onClickCallback={closeCallback}/>
      </div>
    </>
  })();
  
  return (
    <TopBarInternal title={title} rightSlot={rightSlot} />
  )
}

interface TopBarBackProps {
  title: string,
  backCallback: () => void;
}

/**
 * Top bar back: contains title and back (<-) button on left
 */
const TopBarBack: React.FC<TopBarBackProps> = ({ title, backCallback }) => {
  const leftSlot = (() => {
    return <>
      <div className="buttons-container flex flex-row gap-1.5">
        <IconButton iconName="arrow-left" onClickCallback={backCallback}/>
      </div>
    </>
  })();
  
  return (
    <TopBarInternal title={title} leftSlot={leftSlot} />
  )
}

interface TopBarButtonConfig {
  iconName: IconName,
  clickCallback: () => void;
}

interface TopBarConfigProps {
  title: string,
  leftConfig?: TopBarButtonConfig[],
  rightConfig?: TopBarButtonConfig[],
}

/**
 * Top bar config: contains title and left/ right slots based on configs provided
 */
const TopBarConfig: React.FC<TopBarConfigProps> = ({ title, leftConfig, rightConfig }) => {
  const createSlotFromConfig = (configArr: TopBarButtonConfig[]) => {
    return <div className="flex flex-row gap-1.5">
      {
        configArr?.map((item) => {
          return <IconButton iconName={item.iconName} onClickCallback={item.clickCallback}/>
        })
      }
    </div>
  }
  
  const leftSlot = leftConfig ? createSlotFromConfig(leftConfig) : undefined;
  const rightSlot = rightConfig ? createSlotFromConfig(rightConfig) : undefined;

  return (
    <TopBarInternal title={title} leftSlot={leftSlot} rightSlot={rightSlot} />
  )
}

export { TopBarClose, TopBarBack, TopBarConfig }
