"use client";

import {
  useAuth,
  useSession,
  useSetActiveSession,
} from "@better-auth-ui/react";
import { Button } from "@memora/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@memora/ui/components/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@memora/ui/components/tabs";
import { cn } from "@memora/ui/lib/utils";
import type { User } from "better-auth";
import {
  ChevronsUpDown,
  LogIn,
  LogOut,
  Monitor,
  Moon,
  Settings,
  Sun,
  UserPlus2,
  UsersRound,
} from "lucide-react";
import { SwitchAccountMenu } from "./switch-account-menu";
import { UserAvatar } from "./user-avatar";
import { UserView } from "./user-view";

export interface UserButtonProps {
  align?: "center" | "end" | "start" | undefined;
  className?: string;
  sideOffset?: number;
  size?: "default" | "icon";
  themeToggle?: boolean;
  user?: User & { username?: string | null; displayUsername?: string | null };
  variant?:
    | "default"
    | "destructive"
    | "ghost"
    | "link"
    | "outline"
    | "secondary";
}

/**
 * Render a user dropdown button that shows user info, settings, theme controls, and authentication actions.
 *
 * Includes user profile, settings link, optional multi-session account switching, theme picker,
 * and sign-in/sign-up/sign-out actions depending on authentication state.
 *
 * @param className - Additional CSS classes applied to the button trigger
 * @param align - Alignment of the dropdown menu relative to the trigger
 * @param sideOffset - Offset between the trigger and the dropdown menu
 * @param size - "icon" renders only the avatar; "default" renders a full button with label and chevron
 * @param themeToggle - When true, renders a theme picker in the menu; defaults to true
 * @param variant - Visual variant of the trigger button
 * @returns The dropdown menu component with user actions
 */
export function UserButton({
  className,
  align,
  sideOffset,
  size = "default",
  themeToggle = true,
  user,
  variant = "ghost",
}: UserButtonProps) {
  const {
    basePaths,
    viewPaths,
    localization,
    multiSession,
    Link,
    appearance: { theme, setTheme, themes },
  } = useAuth();

  const { isPending: settingActiveSession } = useSetActiveSession();
  const { data: session, isPending: sessionPending } = useSession({
    enabled: !user,
  });
  const resolvedUser = user ?? session?.user;
  const isAuthenticated = !!resolvedUser;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          size === "icon" && "rounded-full",
          size === "icon" && className
        )}
      >
        {size === "icon" ? (
          <UserAvatar
            isPending={sessionPending || settingActiveSession}
            user={resolvedUser}
          />
        ) : (
          <Button
            className={cn("h-auto py-2.5 font-normal", className)}
            size="lg"
            variant={variant}
          >
            {isAuthenticated || sessionPending || settingActiveSession ? (
              <UserView
                isPending={!!settingActiveSession}
                user={resolvedUser}
              />
            ) : (
              <>
                <UserAvatar />

                <div className="grid flex-1 text-left text-sm leading-tight">
                  {localization.auth.account}
                </div>
              </>
            )}

            <ChevronsUpDown className="ml-auto" />
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        className="w-[--radix-dropdown-menu-trigger-width] min-w-40 max-w-[48svw] md:min-w-56"
        sideOffset={sideOffset}
      >
        {isAuthenticated && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal text-sm">
                <UserView user={resolvedUser} />
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
          </>
        )}

        {isAuthenticated ? (
          <>
            <DropdownMenuItem
              render={
                <Link
                  href={`${basePaths.settings}/${viewPaths.settings.account}`}
                />
              }
            >
              <Settings className="text-muted-foreground" />
              {localization.settings.settings}
            </DropdownMenuItem>

            {multiSession && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <UsersRound className="text-muted-foreground" />

                  {localization.auth.switchAccount}
                </DropdownMenuSubTrigger>

                <SwitchAccountMenu />
              </DropdownMenuSub>
            )}

            <DropdownMenuSeparator />

            {themeToggle && theme && setTheme && !!themes?.length && (
              <>
                <DropdownMenuItem
                  className="cursor-default! justify-between py-0.75 hover:bg-transparent!"
                  closeOnClick={false}
                >
                  {localization.settings.theme}

                  <Tabs onValueChange={setTheme} value={theme}>
                    <TabsList className="h-6!">
                      {themes.includes("system") && (
                        <TabsTrigger
                          aria-label={localization.settings.system}
                          className="size-5 p-0"
                          value="system"
                        >
                          <Monitor className="size-3" />
                        </TabsTrigger>
                      )}
                      {themes.includes("light") && (
                        <TabsTrigger
                          aria-label={localization.settings.light}
                          className="size-5 p-0"
                          value="light"
                        >
                          <Sun className="size-3" />
                        </TabsTrigger>
                      )}
                      {themes.includes("dark") && (
                        <TabsTrigger
                          aria-label={localization.settings.dark}
                          className="size-5 p-0"
                          value="dark"
                        >
                          <Moon className="size-3" />
                        </TabsTrigger>
                      )}
                    </TabsList>
                  </Tabs>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem
              render={
                <Link href={`${basePaths.auth}/${viewPaths.auth.signOut}`} />
              }
            >
              <LogOut className="text-muted-foreground" />
              {localization.auth.signOut}
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem
              render={
                <Link href={`${basePaths.auth}/${viewPaths.auth.signIn}`} />
              }
            >
              <LogIn className="text-muted-foreground" />
              {localization.auth.signIn}
            </DropdownMenuItem>

            <DropdownMenuItem
              render={
                <Link href={`${basePaths.auth}/${viewPaths.auth.signUp}`} />
              }
            >
              <UserPlus2 className="text-muted-foreground" />
              {localization.auth.signUp}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
