import { createLink, Link } from '@tanstack/react-router'
import { Button } from './ui/button'

export const CustomButtonLink = createLink(Button);

export default function Header() {
  return (
    <header className="p-2 flex gap-2 bg-white text-black justify-between">
      {/* <nav className="flex flex-row">
        <div className="px-2 font-bold">
          <Link to="/">Home</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to="/demo/form/simple">Simple Form</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to="/demo/form/address">Address Form</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to="/demo/tanstack-query">TanStack Query</Link>
        </div>
      </nav> */}
      <CustomButtonLink to="/demo/form/address">
        Year Select
      </CustomButtonLink>
      <CustomButtonLink to="/demo/form/address">
        Settings
      </CustomButtonLink>
      <CustomButtonLink to="/demo/form/address">
        Create Goal
      </CustomButtonLink>
    </header>
  )
}
