"use client";

import { useAuth, useListAccounts } from "@better-auth-ui/react";

import { Card, CardContent } from "@memora/ui/components/card";
import { Separator } from "@memora/ui/components/separator";
import { Spinner } from "@memora/ui/components/spinner";
import { cn } from "@memora/ui/lib/utils";

import { LinkedAccount } from "./linked-account";

interface LinkedAccountsProps {
  className?: string;
}

/**
 * Render a card showing linked social accounts and available social providers to link.
 *
 * Linked accounts (excluding the "credential" provider) are shown with an unlink control;
 * available providers are shown with a link control. Button states and labels reflect
 * ongoing link/unlink activity and use localization for provider-specific text.
 *
 * @returns A JSX element containing the linked accounts card
 */
export function LinkedAccounts({ className }: LinkedAccountsProps) {
  const { localization, socialProviders } = useAuth();

  const { data: accounts, isPending } = useListAccounts();

  const linkedAccounts = accounts?.filter(
    (account) => account.providerId !== "credential"
  );

  const allRows = [
    ...(linkedAccounts?.map((account) => ({
      key: account.id,
      account,
      provider: account.providerId,
    })) ?? []),
    ...(socialProviders?.map((provider) => ({
      key: provider,
      account: undefined,
      provider,
    })) ?? []),
  ];

  return (
    <div>
      <h2 className="mb-3 font-semibold text-sm">
        {localization.settings.linkedAccounts}
      </h2>

      <Card className={cn("p-0", className)}>
        <CardContent className="p-0">
          {isPending ? (
            <div className="flex justify-center p-6">
              <Spinner className="size-5" />
            </div>
          ) : (
            allRows.map((row, index) => (
              <div key={row.key}>
                {index > 0 && <Separator />}

                <LinkedAccount account={row.account} provider={row.provider} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
