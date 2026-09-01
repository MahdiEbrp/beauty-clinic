import { connect as tcpConnect, type Socket } from "node:net";
import { connect as tlsConnect, type ConnectionOptions } from "node:tls";

import {
  EMAIL_ERROR_CODES,
  EMAIL_ERROR_MESSAGES,
} from "@/lib/email/constants";
import { EmailProviderError } from "./types";

function rejectTimeout(): EmailProviderError {
  return new EmailProviderError(
    EMAIL_ERROR_MESSAGES.providerTimeout,
    EMAIL_ERROR_CODES.providerTimeout,
    undefined,
    true,
  );
}

export async function openTcpSocket(
  host: string,
  port: number,
  timeoutMs: number,
): Promise<Socket> {
  return new Promise<Socket>((resolve, reject) => {
    const socket = tcpConnect({ host, port });
    let settled = false;
    const settle = (error: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error) reject(error);
      else resolve(socket);
    };
    const timer = setTimeout(() => {
      socket.destroy();
      settle(rejectTimeout());
    }, timeoutMs);
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => {
      socket.setTimeout(0);
      settle(null);
    });
    socket.once("error", (error) => {
      socket.destroy();
      settle(error);
    });
  });
}

export async function openTlsSocket(
  host: string,
  port: number,
  timeoutMs: number,
): Promise<Socket> {
  const connection: ConnectionOptions = {
    host,
    port,
    servername: host,
    rejectUnauthorized: true,
  };
  return new Promise<Socket>((resolve, reject) => {
    const socket = tlsConnect(connection);
    let settled = false;
    const settle = (error: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error) reject(error);
      else resolve(socket);
    };
    const timer = setTimeout(() => {
      socket.destroy();
      settle(rejectTimeout());
    }, timeoutMs);
    socket.setTimeout(timeoutMs);
    socket.once("secureConnect", () => {
      socket.setTimeout(0);
      settle(null);
    });
    socket.once("error", (error) => {
      socket.destroy();
      settle(error);
    });
  });
}

export async function upgradeSocketToTls(socket: Socket, host: string): Promise<Socket> {
  return new Promise<Socket>((resolve, reject) => {
    const tls = tlsConnect({
      socket,
      servername: host,
      rejectUnauthorized: true,
    });
    tls.once("secureConnect", () => {
      tls.setTimeout(0);
      resolve(tls);
    });
    tls.once("error", reject);
  });
}