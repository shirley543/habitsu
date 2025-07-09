import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroupItem, RadioGroup } from "@/components/ui/radio-group";
import { TopBarClose } from "@/components/custom/TopBar";
import { useNavigate } from "@tanstack/react-router";
import { Switch } from "@/components/ui/switch";

interface SettingGroup {
  groupName: string, ///< e.g. Theme
  settingItems: SettingItem[],
}

enum SettingType {
  MenuItem = 'menu-item',
  Toggle = 'toggle',
  RadioGroup = 'radio-group',
};

interface MenuItemConfig {
  label: string,
  onMenuClick: () => void,
}

interface ToggleConfig {
  label: string,
  onToggleChange: () => void,
}

interface RadioGroupConfig {
  values: Array<{ label: string; value: string }>,
  onValueChange: (val: string) => void,
}

type SettingItem = { 
  settingType: SettingType.MenuItem,
  config: MenuItemConfig,
} | {
  settingType: SettingType.Toggle,
  config: ToggleConfig,
} | {
  settingType: SettingType.RadioGroup,
  config: RadioGroupConfig,
}

export function SettingsPage() {
  const navigate = useNavigate();

  const SETTING_GROUPS: SettingGroup[] = [
    // Theme
    {
      groupName: "Theme",
      settingItems: [{
        settingType: SettingType.RadioGroup,
        config: {
          values: [
            { label: "Light", value: "light" },
            { label: "Dark", value: "dark" },
          ],
          onValueChange: (val: string) => {
            console.log("value changed", val)
          }
        }
      }]
    },
    // Home
    {
      groupName: "Home",
      settingItems: [
        {
          settingType: SettingType.MenuItem,
          config: {
            label: "Goal Order",
            onMenuClick: () => {
              navigate({ to: "/settings/goalorder" });
            }
          }
        },
        {
          settingType: SettingType.MenuItem,
          config: {
            label: "Goal Visibility",
            onMenuClick: () => {
              navigate({ to: "/settings/goalvisibility" });
            }
          }
        },
        {
          settingType: SettingType.Toggle,
          config: {
            label: "Show Descriptions",
            onToggleChange: () => {
              console.log("value changed")
            }
          }
        },
      ]
    },
    // Profile Privacy
    {
      groupName: "Profile Privacy",
      settingItems: [{
        settingType: SettingType.RadioGroup,
        config: {
          values: [
            { label: "Private", value: "private" },
            { label: "Public", value: "public" },
          ],
          onValueChange: (val: string) => {
            console.log("value changed", val)
          }
        }
      }]
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <TopBarClose title="Settings" closeCallback={() => {
        navigate({
          to: '/goals'
        })
      }} />
      {/* Setting groups */}
      {
        SETTING_GROUPS.map((group) => {
          const settingItemLabelClass = "text-base font-medium";
          const settingItemPaddingClass = "px-5 py-2.5";

          return <div className="setting-group-with-label flex flex-col gap-0">
            <h2 className="text-base font-semibold">{group.groupName}</h2>
            <div className="card bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="flex flex-col">
                {group.settingItems.map((item) => {
                  switch (item.settingType) {
                    case SettingType.MenuItem:
                      return <button className={`hover:bg-neutral-50 transition-colors ${settingItemPaddingClass}`} onClick={item.config.onMenuClick}>
                        <Label className={settingItemLabelClass}>{item.config.label}</Label>
                      </button>

                    case SettingType.Toggle:
                      return <div className={`flex flex-row justify-between ${settingItemPaddingClass}`}>
                        <Label className={settingItemLabelClass}>{item.config.label}</Label>
                        <Switch onClick={item.config.onToggleChange}/>
                      </div>

                    case SettingType.RadioGroup:
                      return <RadioGroup className={`flex flex-col gap-2 ${settingItemPaddingClass}`}>{item.config.values.map((entry) => {
                        return <div className="flex flex-row gap-2.5 items-center">
                          <RadioGroupItem value={entry.value}></RadioGroupItem>
                          <Label className={settingItemLabelClass}>{entry.label}</Label>
                        </div>
                      })}</RadioGroup>
                    }
                })}
              </div>
            </div>
          </div>
        })
      }
    </div>
  )
}