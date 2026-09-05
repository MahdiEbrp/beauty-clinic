import { sendSmtpMail } from "./lib/email/providers/smtp-client";

async function main() {
  const result = await sendSmtpMail(
    {
      host: "smtp.gmail.com",
      port: 465,
      encryption: "ssl",
      username: process.env.SEED_GMAIL_USERNAME ?? "",
      password: process.env.SEED_GMAIL_PASSWORD ?? "",
    },
    {
      from: process.env.SEED_GMAIL_USERNAME ?? "",
      recipients: ["mahdi.a.ebrp@gmail.com"],
      subject: "SMTP client test",
      body: "Hello from the beauty-clinic SMTP client",
      html: false,
    },
  );
  console.log(JSON.stringify(result, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error("ERROR:", error);
    process.exit(1);
  });
