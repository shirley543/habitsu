import type { IconName } from 'lucide-react/dynamic'
import IconButton from './IconButton'

interface TopBarSlottedProps {
  title: string
  leftSlotItems?: React.ReactNode
  rightSlotItems?: React.ReactNode
}

/**
 * Top bar: contains title in center, left slot and right slot for nodes
 */
const TopBarSlotted: React.FC<TopBarSlottedProps> = ({
  title,
  leftSlotItems,
  rightSlotItems,
}) => {
  return (
    <div className="flex flex-row gap-3">
      {leftSlotItems && (
        <div className="flex flex-row gap-1.5">{leftSlotItems}</div>
      )}
      <div className="flex flex-row justify-between items-center w-full">
        <h1 className="text-base font-extrabold w-full">{title}</h1>
        {rightSlotItems && (
          <div className="flex flex-row gap-1.5">{rightSlotItems}</div>
        )}
      </div>
    </div>
  )
}

interface TopBarCloseProps {
  title: string
  closeCallback: () => void
}

/**
 * Top bar close: contains title and close (x) button on right
 */
const TopBarClose: React.FC<TopBarCloseProps> = ({ title, closeCallback }) => {
  const rightSlotItems = (() => {
    return (
      <>
        <div className="buttons-container flex flex-row gap-1.5">
          <IconButton
            iconName="x"
            onClickCallback={closeCallback}
            tooltip="Close"
          />
        </div>
      </>
    )
  })()

  return <TopBarSlotted title={title} rightSlotItems={rightSlotItems} />
}

interface TopBarBackProps {
  title: string
  backCallback: () => void
}

/**
 * Top bar back: contains title and back (<-) button on left
 */
const TopBarBack: React.FC<TopBarBackProps> = ({ title, backCallback }) => {
  const leftSlotItems = (() => {
    return (
      <>
        <div className="buttons-container flex flex-row gap-1.5">
          <IconButton
            iconName="arrow-left"
            onClickCallback={backCallback}
            tooltip="Back"
          />
        </div>
      </>
    )
  })()

  return <TopBarSlotted title={title} leftSlotItems={leftSlotItems} />
}

interface TopBarButtonConfig {
  iconName: IconName
  tooltip?: string
  clickCallback: () => void
}

interface TopBarConfigProps {
  title: string
  leftConfig?: TopBarButtonConfig[]
  rightConfig?: TopBarButtonConfig[]
}

/**
 * Top bar config: contains title and left/ right slots based on configs provided
 */
const TopBarConfig: React.FC<TopBarConfigProps> = ({
  title,
  leftConfig,
  rightConfig,
}) => {
  const createSlotFromConfig = (configArr: TopBarButtonConfig[]) => {
    return (
      <>
        {configArr?.map((item) => {
          return (
            <IconButton
              iconName={item.iconName}
              onClickCallback={item.clickCallback}
              tooltip={item.tooltip}
            />
          )
        })}
      </>
    )
  }

  const leftSlotItems = leftConfig
    ? createSlotFromConfig(leftConfig)
    : undefined
  const rightSlotItems = rightConfig
    ? createSlotFromConfig(rightConfig)
    : undefined

  return (
    <TopBarSlotted
      title={title}
      leftSlotItems={leftSlotItems}
      rightSlotItems={rightSlotItems}
    />
  )
}

export { TopBarClose, TopBarBack, TopBarConfig, TopBarSlotted }
