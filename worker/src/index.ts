import portrait from "./maarten.txt";

const TERMINAL_AGENTS = [
  "curl",
  "wget",
  "httpie",
  "fetch/",
  "lwp-request",
  "python-requests",
  "go-http-client",
];

function isTerminalClient(request: Request): boolean {
  const ua = (request.headers.get("user-agent") || "").toLowerCase();
  return TERMINAL_AGENTS.some((agent) => ua.includes(agent));
}

const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const CYAN = "\x1b[36m";
const BLUE_BOLD = "\x1b[1;34m";
const R = "\x1b[0m";

// OSC 8 hyperlink: works in modern terminals, degrades gracefully in others
const link = (url: string, text: string) =>
  `\x1b]8;;${url}\x07${text}\x1b]8;;\x07`;

const pad = (n: number) => " ".repeat(n);

// Portrait is 25 visible chars wide.
// Widest info line (LinkedIn) is 49 visible chars.
// Center everything on the same axis, then add a global left margin.
const CONTENT_WIDTH = 49;
const PORTRAIT_WIDTH = 25;
const MARGIN = 3;
const PORTRAIT_OFFSET = Math.floor((CONTENT_WIDTH - PORTRAIT_WIDTH) / 2); // 12

function centerPad(textWidth: number): string {
  return pad(MARGIN + Math.floor((CONTENT_WIDTH - textWidth) / 2));
}

const centeredPortrait = portrait
  .split("\n")
  .map((line) =>
    line.length > 0 ? pad(MARGIN + PORTRAIT_OFFSET) + line : line,
  )
  .join("\n");

const INFO = `
${centerPad(22)}${BOLD}Maarten Van Steenkiste${R}

${centerPad(39)}${DIM}Husband · Father · Maker · Essentialist${R}

${centerPad(30)}Software Engineer at ${BLUE_BOLD}${link("https://craftzing.com", "Craftzing")}${R}

${centerPad(41)}${DIM}${"─".repeat(41)}${R}

${pad(MARGIN)}${CYAN}GitHub${R}     ${link("https://github.com/m44rten1", "github.com/m44rten1")}
${pad(MARGIN)}${CYAN}Email${R}      ${link("mailto:m.vansteenkiste@me.com", "m.vansteenkiste@me.com")}
${pad(MARGIN)}${CYAN}LinkedIn${R}   ${link("https://www.linkedin.com/in/maarten-van-steenkiste", "linkedin.com/in/maarten-van-steenkiste")}
${pad(MARGIN)}${CYAN}Notes${R}      ${link("https://m44rten.com/blog/", "m44rten.com/blog/")}

`;

const TERMINAL_OUTPUT = centeredPortrait + INFO;

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/" && isTerminalClient(request)) {
      return new Response(TERMINAL_OUTPUT, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // Pass through to origin (GitHub Pages)
    return fetch(request);
  },
};
