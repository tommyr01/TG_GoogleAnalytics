import Link from "next/link"

import { siteConfig } from "@/lib/config"
import { Icons } from "@/components/icons"
import { ModeSwitcher } from "@/components/mode-switcher"
import { Button } from "@/registry/new-york-v4/ui/button"

export function SiteHeader() {
  return (
    <header className="bg-background sticky top-0 z-50 w-full border-b">
      <div className="container-wrapper 3xl:fixed:px-0 px-6">
        <div className="3xl:fixed:container flex h-(--header-height) items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="size-8"
          >
            <Link href="/">
              <Icons.logo className="size-5" />
              <span className="sr-only">{siteConfig.name}</span>
            </Link>
          </Button>
          <div className="ml-2">
            <Link href="/" className="font-semibold text-lg">
              {siteConfig.name}
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ModeSwitcher />
          </div>
        </div>
      </div>
    </header>
  )
}
