import { connect } from "node:tls";

const CRLF = "\r\n";

function once(socket) {
  return new Promise((resolve, reject) => {
    let buf = "";
    const timer = setTimeout(() => { cleanup(); reject(new Error("timeout")); }, 12000);
    const onData = (chunk) => {
      buf += chunk.toString("utf8");
      // a response is complete when a line ends with "code " (space) — mimic client
      const lines = buf.split("\n");
      for (const line of lines.slice(0, -1)) {
        if (/^\d{3} /.test(line)) {
          cleanup();
          resolve(lines.join("\n").replace(/\r/g, ""));
          return;
        }
      }
    };
    const onError = (e) => { cleanup(); reject(e); };
    const cleanup = () => {
      socket.removeListener("data", onData);
      socket.removeListener("error", onError);
      clearTimeout(timer);
    };
    socket.on("data", onData);
    socket.on("error", onError);
  });
}

async function main() {
  const socket = connect({ host: "smtp.gmail.com", port: 465, servername: "smtp.gmail.com", rejectUnauthorized: true });
  const greeting = await once(socket);
  console.log("GREETING:\n" + greeting + "\n---");

  socket.write(`EHLO localhost${CRLF}`);
  const ehlo = await once(socket);
  console.log("EHLO:\n" + ehlo + "\n---");
  socket.destroy();
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
