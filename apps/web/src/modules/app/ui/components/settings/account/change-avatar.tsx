import { useAuth, useSession, useUpdateUser } from "@better-auth-ui/react";
import { fileToBase64 } from "@better-auth-ui/react/core";
import { Button } from "@memora/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@memora/ui/components/dropdown-menu";
import { Field } from "@memora/ui/components/field";
import { Label } from "@memora/ui/components/label";
import { Spinner } from "@memora/ui/components/spinner";
import { Trash2, Upload } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { UserAvatar } from "@/modules/app/ui/components/user/user-avatar";

interface ChangeAvatarProps {
  className?: string;
}

export function ChangeAvatar({ className }: ChangeAvatarProps) {
  const { localization, avatar } = useAuth();
  const { data: session } = useSession();

  const { mutate: updateUser, isPending: updatePending } = useUpdateUser();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isPending = updatePending || isUploading || isDeleting;

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    e.target.value = "";

    setIsUploading(true);

    try {
      const resized =
        (await avatar.resize?.(file, avatar.size, avatar.extension)) || file;

      const image =
        (await avatar.upload?.(resized)) || (await fileToBase64(resized));

      updateUser(
        { image },
        {
          onSuccess: () =>
            toast.success(localization.settings.avatarChangedSuccess),
        }
      );
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsUploading(false);
    }
  }

  function handleDelete() {
    const currentImage = session?.user.image;

    updateUser(
      { image: null },
      {
        onSuccess: async () => {
          if (currentImage) {
            setIsDeleting(true);
            try {
              await avatar.delete?.(currentImage);
              toast.success(localization.settings.avatarDeletedSuccess);
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : "Failed to delete avatar"
              );
            } finally {
              setIsDeleting(false);
            }
            return;
          }

          toast.success(localization.settings.avatarDeletedSuccess);
        },
      }
    );
  }

  return (
    <Field className={className}>
      <Label>{localization.settings.avatar}</Label>

      <input
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        ref={fileInputRef}
        type="file"
      />

      <div className="flex items-center gap-4">
        <Button
          className="h-auto w-auto rounded-full p-0"
          disabled={isPending}
          onClick={() => fileInputRef.current?.click()}
          type="button"
          variant="ghost"
        >
          <UserAvatar className="size-12" isPending={isPending} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                disabled={!session || isPending}
                size="sm"
                variant="secondary"
              />
            }
          >
            {isPending && <Spinner />}
            {localization.settings.changeAvatar}
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-fit">
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <Upload className="text-muted-foreground" />

              {localization.settings.uploadAvatar}
            </DropdownMenuItem>

            <DropdownMenuItem
              disabled={!session?.user.image}
              onClick={handleDelete}
              variant="destructive"
            >
              <Trash2 />

              {localization.settings.deleteAvatar}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Field>
  );
}
