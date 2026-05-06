"use server";

import { render } from "@react-email/render";

import { email } from "@memora/email";
import { ChangeEmail } from "@memora/ui/components/email/change-email";
import { EmailVerificationEmail } from "@memora/ui/components/email/email-verification";
import { PasswordChangedEmail } from "@memora/ui/components/email/password-changed";
import { ResetPasswordEmail } from "@memora/ui/components/email/reset-password";

const APP_NAME = "Memora";
const FROM = "Memora <memora@baenninger.me>";

export async function sendResetPasswordEmail(
  userEmail: string,
  url: string
): Promise<void> {
  await email.emails.send({
    from: FROM,
    to: userEmail,
    subject: "Reset your password",
    html: await render(
      <ResetPasswordEmail
        appName={APP_NAME}
        darkMode={true}
        email={userEmail}
        url={url}
      />
    ),
  });
}

export async function sendVerificationEmail(
  userEmail: string,
  url: string
): Promise<void> {
  await email.emails.send({
    from: FROM,
    to: userEmail,
    subject: "Verify your email address",
    html: await render(
      <EmailVerificationEmail
        appName={APP_NAME}
        darkMode={true}
        email={userEmail}
        url={url}
      />
    ),
  });
}

export async function sendChangeEmailConfirmation(
  newEmail: string,
  url: string
): Promise<void> {
  await email.emails.send({
    from: FROM,
    to: newEmail,
    subject: "Confirm your new email address",
    html: await render(
      <ChangeEmail
        appName={APP_NAME}
        darkMode={true}
        newEmail={newEmail}
        url={url}
      />
    ),
  });
}

export async function sendPasswordChangedEmail(
  userEmail: string
): Promise<void> {
  await email.emails.send({
    from: FROM,
    to: userEmail,
    subject: "Your password has been changed",
    html: await render(
      <PasswordChangedEmail
        appName={APP_NAME}
        darkMode={true}
        email={userEmail}
      />
    ),
  });
}
