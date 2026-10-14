import MailerPage from "@/components/MailerPage";
import { getMailer, mailerMetadata } from "@/lib/mailers";

export const metadata = mailerMetadata("steamplant");

export default function Page() {
  return <MailerPage mailer={getMailer("steamplant")} />;
}
