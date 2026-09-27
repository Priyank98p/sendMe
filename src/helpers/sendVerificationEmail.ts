import { resend } from "@/lib/resend";
import verificationEmail from "../../emails/verificationEmails";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerification(
  email: string,
  username: string,
  verifyCode: string,
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: email,
      subject: "SendMe | Verification email",
      react: verificationEmail({ username, otp: verifyCode }),
    });

    return { success: true, message: "Verification email sent" };
  } catch (emailError) {
    console.log("Error sending verififcation email", emailError);
    return { success: false, message: "failed to send verification email" };
  }
}
