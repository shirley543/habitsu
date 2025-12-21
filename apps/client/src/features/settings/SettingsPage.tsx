import { useNavigate } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { TopBarClose } from '@/components/custom/TopBar'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

enum SettingGroupStyle {
  Default = 'default',
  Danger = 'danger',
}

interface SettingGroup {
  groupName: string // /< e.g. Theme
  settingItems: Array<SettingItem>
  style?: SettingGroupStyle
}

enum SettingType {
  MenuItem = 'menu-item',
  Toggle = 'toggle',
  RadioGroupCompact = 'radio-group-compact',
  RadioGroupDetailed = 'radio-group-detailed',
}

interface MenuItemConfig {
  label: string
  onMenuClick: () => void
}

interface ToggleConfig {
  label: string
  onToggleChange: () => void
}

interface RadioGroupCompactConfig {
  label: string
  values: Array<{ label: string; value: string }>
  onValueChange: (val: string) => void
}

interface RadioGroupDetailedConfig {
  label: string
  values: Array<{ label: string; detail: string; value: string }>
  onValueChange: (val: string) => void
}

type SettingItem =
  | {
      settingType: SettingType.MenuItem
      config: MenuItemConfig
    }
  | {
      settingType: SettingType.Toggle
      config: ToggleConfig
    }
  | {
      settingType: SettingType.RadioGroupCompact
      config: RadioGroupCompactConfig
    }
  | {
      settingType: SettingType.RadioGroupDetailed
      config: RadioGroupDetailedConfig
    }

export function SettingsPage() {
  const navigate = useNavigate()

  const SETTING_GROUPS: Array<SettingGroup> = [
    // Appearance
    {
      groupName: 'Appearance',
      settingItems: [
        {
          settingType: SettingType.RadioGroupCompact,
          config: {
            label: 'Theme Mode',
            values: [
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' },
            ],
            onValueChange: (val: string) => {
              console.log('value changed', val)
            },
          },
        },
      ],
    },
    // Goal Settings
    {
      groupName: 'Goal Settings',
      settingItems: [
        {
          settingType: SettingType.MenuItem,
          config: {
            label: 'Goal Order',
            onMenuClick: () => {
              navigate({ to: '/settings/goal-order' })
            },
          },
        },
        {
          settingType: SettingType.MenuItem,
          config: {
            label: 'Goal Visibility',
            onMenuClick: () => {
              navigate({ to: '/settings/goal-visibility' })
            },
          },
        },
        {
          settingType: SettingType.Toggle,
          config: {
            label: 'Show Descriptions',
            onToggleChange: () => {
              console.log('value changed')
            },
          },
        },
      ],
    },
    // Profile Settings
    {
      groupName: 'Profile Settings',
      settingItems: [
        {
          settingType: SettingType.RadioGroupDetailed,
          config: {
            label: 'Profile Privacy',
            values: [
              {
                label: 'Public',
                detail: 'Anyone can see your profile info',
                value: 'public',
              },
              {
                label: 'Private',
                detail: 'Only you can see your profile',
                value: 'private',
              },
            ],
            onValueChange: (val: string) => {
              console.log('value changed', val)
            },
          },
        },
        {
          settingType: SettingType.MenuItem,
          config: {
            label: 'Account Details',
            onMenuClick: () => {
              navigate({ to: '/settings/account-details' })
            },
          },
        },
      ],
    },
    // Danger Zone
    {
      groupName: 'Danger Zone',
      settingItems: [
        {
          settingType: SettingType.MenuItem,
          config: {
            label: 'Delete Account',
            onMenuClick: () => {
              navigate({ to: '/settings/delete-account' })
            },
          },
        },
      ],
      style: SettingGroupStyle.Danger,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <TopBarClose
        title="Settings"
        closeCallback={() => {
          navigate({
            to: '/goals',
          })
        }}
      />
      {/* Setting groups */}
      {SETTING_GROUPS.map((group) => {
        const settingItemLabelClass = 'text-base font-semibold'
        const settingItemPaddingClass = 'px-5 py-2.5'
        const settingItemsLen = group.settingItems.length

        return (
          <div
            className={`setting-group-with-label flex flex-col gap-1 ${group.style === SettingGroupStyle.Danger ? 'text-red-800' : 'text-zinc-950'}`}
          >
            <h2 className="text-base font-semibold">{group.groupName}</h2>
            <div className="card bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="flex flex-col">
                {group.settingItems.map((item, idx) => {
                  switch (item.settingType) {
                    case SettingType.MenuItem:
                      return (
                        <>
                          <button
                            className={`hover:bg-neutral-50 transition-colors flex flex-row items-center justify-between ${settingItemPaddingClass}`}
                            onClick={item.config.onMenuClick}
                          >
                            <Label className={settingItemLabelClass}>
                              {item.config.label}
                            </Label>
                            <ChevronRight size="16" />
                          </button>
                          {idx < settingItemsLen - 1 && (
                            <Separator className="mx-4" />
                          )}
                        </>
                      )

                    case SettingType.Toggle:
                      return (
                        <>
                          <div
                            className={`flex flex-row justify-between ${settingItemPaddingClass}`}
                          >
                            <Label className={settingItemLabelClass}>
                              {item.config.label}
                            </Label>
                            <Switch onClick={item.config.onToggleChange} />
                          </div>
                          {idx < settingItemsLen - 1 && (
                            <Separator className="mx-4" />
                          )}
                        </>
                      )

                    case SettingType.RadioGroupCompact:
                      return (
                        <>
                          <RadioGroup
                            className={`flex flex-col gap-2 ${settingItemPaddingClass}`}
                          >
                            <h2 className="text-sm font-semibold">
                              {item.config.label}
                            </h2>
                            <div className="grid grid-cols-2">
                              {item.config.values.map((entry) => {
                                return (
                                  <div className="flex flex-row gap-2.5 items-center">
                                    <RadioGroupItem
                                      value={entry.value}
                                    ></RadioGroupItem>
                                    <Label className={settingItemLabelClass}>
                                      {entry.label}
                                    </Label>
                                  </div>
                                )
                              })}
                            </div>
                          </RadioGroup>
                          {idx < settingItemsLen - 1 && (
                            <Separator className="mx-4" />
                          )}
                        </>
                      )

                    case SettingType.RadioGroupDetailed:
                      return (
                        <>
                          <RadioGroup
                            className={`flex flex-col gap-2 ${settingItemPaddingClass}`}
                          >
                            <h2 className="text-sm font-semibold">
                              {item.config.label}
                            </h2>
                            {item.config.values.map((entry) => {
                              return (
                                <div className="flex flex-row gap-2.5 items-center">
                                  <RadioGroupItem
                                    value={entry.value}
                                  ></RadioGroupItem>
                                  <div>
                                    <Label className={settingItemLabelClass}>
                                      {entry.label}
                                    </Label>
                                    <p>{entry.detail}</p>
                                  </div>
                                </div>
                              )
                            })}
                          </RadioGroup>
                          {idx < settingItemsLen - 1 && (
                            <Separator className="mx-4" />
                          )}
                        </>
                      )
                  }
                })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
