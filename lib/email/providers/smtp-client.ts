import type { Socket } from "node:net";

import {
  EMAIL_ERROR_CODES,
  EMAIL_ERROR_MESSAGES,
  EMAIL_NETWORK,
  EMAIL_PROVIDER_SMTP,
} from "@/lib/email/constants";
import { EmailProviderError } from "./types";
import { openTcpSocket, openTlsSocket, upgradeSocketToTls } from "./smtp-connect";
import { buildMessagePayload, extractMessageId } from "./smtp-message";
import { parseCapabilities, parseResponseLines } from "./smtp-response";
import { smtpAuthenticate } from "./smtp-auth";

export type SmtpClientOptions = {
  host: string;
  port: number;
  encryption: "ssl" | "starttls" | "none";
  username: string;
  password: string;
  timeoutMs?: number;
};

export type SmtpRecipientResult = {
  recipient: string;
  accepted: boolean;
  code: number;
  message: string;
};

export type SmtpSendResult = {
  accepted: SmtpRecipientResult[];
  rejected: SmtpRecipientResult[];
  responseCode: number;
  responseMessage: string;
  messageId?: string;
};

const CRLF = EMAIL_PROVIDER_SMTP.lineBreak;

export async function sendSmtpMail(
  options: SmtpClientOptions,
  mail: { from: string; recipients: string[]; subject: string; body: string; html: boolean },
): Promise<SmtpSendResult> {
  const timeoutMs = options.timeoutMs ?? EMAIL_NETWORK.connectTimeoutMs;
  const session = new SmtpSession(options);
  try {
    await session.connect(timeoutMs);
    const { recipients, rejected } = await session.sendMail(
      mail.from,
      mail.recipients,
      mail.subject,
      mail.body,
      mail.html,
    );
    await session.quit().catch(() => undefined);
    return {
      accepted: recipients.filter((row) => row.accepted),
      rejected: [...rejected, ...recipients.filter((row) => !row.accepted)],
      responseCode: session.lastCode,
      responseMessage: session.lastMessage,
      ...(session.messageId ? { messageId: session.messageId } : {}),
    };
  } catch (error) {
    session.destroy();
    if (error instanceof EmailProviderError) throw error;
    throw new EmailProviderError(
      EMAIL_ERROR_MESSAGES.providerNetworkError,
      EMAIL_ERROR_CODES.providerNetworkError,
      undefined,
      true,
    );
  }
}

class SmtpSession {
  private socket: Socket | null = null;
  private buffer = "";
  private responseLines: string[] = [];
  private pending:
    | {
        resolve: (lines: string[]) => void;
        reject: (error: unknown) => void;
        timer: ReturnType<typeof setTimeout>;
      }
    | undefined;
  private capabilities = new Set<string>();
  messageId?: string;
  lastCode = 0;
  lastMessage = "";

  constructor(private readonly options: SmtpClientOptions) {}

  async connect(timeoutMs: number): Promise<void> {
    const { host } = this.options;
    if (!host) {
      throw new EmailProviderError(
        EMAIL_ERROR_MESSAGES.providerNetworkError,
        EMAIL_ERROR_CODES.providerNetworkError,
      );
    }
    this.socket =
      this.options.encryption === "ssl"
        ? await openTlsSocket(host, this.options.port, timeoutMs)
        : await openTcpSocket(host, this.options.port, timeoutMs);
    this.socket.on("data", (chunk) => this.onData(chunk));
    const greeting = await this.command("", timeoutMs);
    if (greeting.code !== 220) {
      throw new EmailProviderError(
        `SMTP greeting rejected: ${greeting.text}`,
        EMAIL_ERROR_CODES.providerSmtpError,
        greeting.code,
        false,
      );
    }
    await this.ehlo(timeoutMs);
    if (this.options.encryption === "starttls") {
      await this.startTls(timeoutMs);
      await this.ehlo(timeoutMs);
    }
    await this.authenticate(timeoutMs);
  }

  async sendMail(
    from: string,
    recipients: string[],
    subject: string,
    body: string,
    html: boolean,
  ): Promise<{ recipients: SmtpRecipientResult[]; rejected: SmtpRecipientResult[] }> {
    const timeout = this.timeout();
    const fromResult = await this.command(`MAIL FROM:<${from}>`, timeout);
    if (fromResult.code !== 250) {
      throw new EmailProviderError(
        `SMTP rejected the sender ${from}: ${fromResult.text}`,
        EMAIL_ERROR_CODES.providerRejected,
        fromResult.code,
        false,
      );
    }
    const results: SmtpRecipientResult[] = [];
    for (const recipient of recipients) {
      const result = await this.command(`RCPT TO:<${recipient}>`, timeout);
      results.push({
        recipient,
        accepted: result.code >= 250 && result.code < 300,
        code: result.code,
        message: result.text,
      });
    }
    if (!results.some((row) => row.accepted)) {
      await this.command("RSET", timeout).catch(() => undefined);
      return { recipients: results, rejected: [] };
    }
    const data = await this.command("DATA", timeout);
    if (data.code !== 354) {
      await this.command("RSET", timeout).catch(() => undefined);
      return { recipients: [], rejected: results };
    }
    const payload = buildMessagePayload(from, recipients, subject, body, html);
    const final = await this.writePayload(payload, timeout);
    this.lastCode = final.code;
    this.lastMessage = final.text;
    this.messageId = extractMessageId(final.text);
    return {
      recipients: results,
      rejected: results.filter((row) => !row.accepted),
    };
  }

  async quit(): Promise<void> {
    await this.command("QUIT", this.timeout()).catch(() => undefined);
    this.destroy();
  }

  destroy(): void {
    if (!this.socket) return;
    this.socket.removeAllListeners("data");
    this.socket.destroy();
    this.socket = null;
    this.pending = undefined;
    this.responseLines = [];
    this.buffer = "";
  }

  private async startTls(timeoutMs: number): Promise<void> {
    if (!this.socket) throw new Error("Socket is not connected.");
    const response = await this.command("STARTTLS", timeoutMs);
    if (response.code !== 220) {
      throw new EmailProviderError(
        `SMTP STARTTLS rejected: ${response.text}`,
        EMAIL_ERROR_CODES.providerSmtpError,
        response.code,
        false,
      );
    }
    this.socket.removeAllListeners("data");
    const raw = this.socket;
    this.socket = null;
    this.capabilities = new Set();
    const upgraded = await upgradeSocketToTls(raw, this.options.host);
    this.socket = upgraded;
    this.buffer = "";
    this.responseLines = [];
    this.socket.on("data", (chunk) => this.onData(chunk));
  }

  private async ehlo(timeoutMs: number): Promise<void> {
    const response = await this.command(`EHLO ${this.localName()}`, timeoutMs);
    this.capabilities = parseCapabilities(response.lines);
    if (response.code !== 250) throw response;
  }

  private async authenticate(timeoutMs: number): Promise<void> {
    await smtpAuthenticate(
      (line, timeout) => this.command(line, timeout),
      this.capabilities,
      this.options,
      timeoutMs,
    );
  }

  private onData(chunk: Buffer): void {
    this.buffer += chunk.toString("utf8");
    let boundary = this.buffer.indexOf("\n");
    while (boundary !== -1) {
      const line = this.buffer.slice(0, boundary).replace(/\r$/, "");
      this.buffer = this.buffer.slice(boundary + 1);
      const match = /^(\d{3})([ -])(.*)$/.exec(line);
      if (!match) continue;
      this.responseLines.push(line);
      if (match[2] === " ") {
        const lines = this.responseLines;
        this.responseLines = [];
        const pending = this.pending;
        this.pending = undefined;
        if (pending) {
          clearTimeout(pending.timer);
          pending.resolve(lines);
        }
      }
      boundary = this.buffer.indexOf("\n");
    }
  }

  private command(
    line: string,
    timeoutMs: number,
  ): Promise<{ code: number; text: string; lines: string[] }> {
    if (!this.socket) throw new Error("Socket is not connected.");
    const response = this.readResponse(timeoutMs);
    if (line) this.socket.write(`${line}${CRLF}`);
    return response;
  }

  private writePayload(
    payload: string,
    timeoutMs: number,
  ): Promise<{ code: number; text: string }> {
    if (!this.socket) throw new Error("Socket is not connected.");
    const response = this.readResponse(timeoutMs);
    this.socket.write(payload);
    return response;
  }

  private readResponse(
    timeoutMs: number,
  ): Promise<{ code: number; text: string; lines: string[] }> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending = undefined;
        reject(
          new EmailProviderError(
            EMAIL_ERROR_MESSAGES.providerTimeout,
            EMAIL_ERROR_CODES.providerTimeout,
            undefined,
            true,
          ),
        );
      }, timeoutMs);
      this.pending = {
        resolve: (lines) => resolve(parseResponseLines(lines)),
        reject,
        timer,
      };
    });
  }

  private localName(): string {
    return "localhost";
  }

  private timeout(): number {
    return EMAIL_NETWORK.connectTimeoutMs;
  }
}