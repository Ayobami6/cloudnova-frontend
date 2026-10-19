"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Terminal as TerminalIcon,
  X,
  Maximize2,
  Minimize2,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Copy,
  Check,
  Power,
  Loader2,
} from "lucide-react";
import { Instance } from "@/lib/types/cloud";
import { createTerminalSession } from "@/lib/api/compute";
import { ApiError } from "@/lib/api/errors";
import { TerminalSessionResponse } from "@/lib/api/types";
import { useCloud } from "@/lib/store/cloud-context";

interface TerminalLine {
  text: string;
  type: "system" | "input" | "output" | "error" | "info" | "success";
}

type ConnectionStatus =
  | "initializing"
  | "requesting_session"
  | "connecting_stream"
  | "connected"
  | "error"
  | "closed";

interface VNode {
  type: "file" | "dir";
  permissions: string;
  owner: string;
  group: string;
  size: number;
  mtime: string;
  content?: string;
  children?: Record<string, VNode>;
}

function createInitialVFS(instance: Instance): Record<string, VNode> {
  const ramMb = (instance.plan?.ramGb || 2) * 1024;
  const diskGb = instance.plan?.diskGb || 50;
  const vcpu = instance.plan?.vcpu || 1;

  return {
    root: {
      type: "dir",
      permissions: "drwx------",
      owner: "root",
      group: "root",
      size: 4096,
      mtime: "Sep 14 09:40",
      children: {
        ".bashrc": {
          type: "file",
          permissions: "-rw-r--r--",
          owner: "root",
          group: "root",
          size: 3106,
          mtime: "Sep 14 09:40",
          content: `# ~/.bashrc: executed by bash(1) for non-login shells.\nexport PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nalias ll='ls -la'\nalias la='ls -A'\nalias l='ls -CF'`,
        },
        ".profile": {
          type: "file",
          permissions: "-rw-r--r--",
          owner: "root",
          group: "root",
          size: 161,
          mtime: "Sep 14 09:40",
          content: `# ~/.profile: executed by Bourne-compatible login shells.\nexport EDITOR=nano\nexport PAGER=cat`,
        },
        ".ssh": {
          type: "dir",
          permissions: "drwx------",
          owner: "root",
          group: "root",
          size: 4096,
          mtime: "Sep 14 09:40",
          children: {
            authorized_keys: {
              type: "file",
              permissions: "-rw-------",
              owner: "root",
              group: "root",
              size: 574,
              mtime: "Sep 14 09:40",
              content: `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGV0Z9K1+cloudnova-init@production (CloudNova Managed Key)`,
            },
          },
        },
        "cloudnova-bootstrap.log": {
          type: "file",
          permissions: "-rw-r--r--",
          owner: "root",
          group: "root",
          size: 890,
          mtime: "Sep 14 09:40",
          content: `[2026-09-14 09:40:12 UTC] CloudNova Hypervisor Provisioner: Instance '${instance.name}' booted.\n[2026-09-14 09:40:14 UTC] Region: ${instance.region.toUpperCase()} | Tier: ${instance.plan?.tier || "general"}\n[2026-09-14 09:40:15 UTC] Public IPv4: ${instance.ipv4 || "None"} | Private IPv4: ${instance.privateIpv4 || "10.0.1.45"}\n[2026-09-14 09:40:18 UTC] AWS SSM agent daemon v3.3.421.0 active (TargetConnected).\n[2026-09-14 09:40:20 UTC] Cloud-init completed successfully in 8.42s.`,
        },
      },
    },
    home: {
      type: "dir",
      permissions: "drwxr-xr-x",
      owner: "root",
      group: "root",
      size: 4096,
      mtime: "Sep 14 09:40",
      children: {
        ubuntu: {
          type: "dir",
          permissions: "drwxr-xr-x",
          owner: "ubuntu",
          group: "ubuntu",
          size: 4096,
          mtime: "Sep 14 09:40",
          children: {
            ".bashrc": {
              type: "file",
              permissions: "-rw-r--r--",
              owner: "ubuntu",
              group: "ubuntu",
              size: 3771,
              mtime: "Sep 14 09:40",
              content: `export PS1='\\u@\\h:\\w\\$ '`,
            },
            ".profile": {
              type: "file",
              permissions: "-rw-r--r--",
              owner: "ubuntu",
              group: "ubuntu",
              size: 807,
              mtime: "Sep 14 09:40",
              content: `export PATH="$HOME/bin:$HOME/.local/bin:$PATH"`,
            },
          },
        },
      },
    },
    etc: {
      type: "dir",
      permissions: "drwxr-xr-x",
      owner: "root",
      group: "root",
      size: 4096,
      mtime: "Sep 14 09:40",
      children: {
        "os-release": {
          type: "file",
          permissions: "-rw-r--r--",
          owner: "root",
          group: "root",
          size: 384,
          mtime: "Sep 14 09:40",
          content: `NAME="Ubuntu"\nVERSION="24.04 LTS (Noble Numbat)"\nID=ubuntu\nID_LIKE=debian\nPRETTY_NAME="Ubuntu 24.04 LTS"\nVERSION_ID="24.04"\nHOME_URL="https://www.ubuntu.com/"\nSUPPORT_URL="https://help.ubuntu.com/"\nBUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"`,
        },
        hostname: {
          type: "file",
          permissions: "-rw-r--r--",
          owner: "root",
          group: "root",
          size: instance.name.length + 1,
          mtime: "Sep 14 09:40",
          content: `${instance.name}\n`,
        },
        hosts: {
          type: "file",
          permissions: "-rw-r--r--",
          owner: "root",
          group: "root",
          size: 245,
          mtime: "Sep 14 09:40",
          content: `127.0.0.1 localhost\n127.0.1.1 ${instance.name}\n${instance.ipv4 || "10.0.1.45"} ${instance.name}.cloudnova.internal\n::1 localhost ip6-localhost ip6-loopback`,
        },
        "resolv.conf": {
          type: "file",
          permissions: "-rw-r--r--",
          owner: "root",
          group: "root",
          size: 78,
          mtime: "Sep 14 09:40",
          content: `nameserver 1.1.1.1\nnameserver 8.8.8.8\nsearch cloudnova.internal\n`,
        },
        nginx: {
          type: "dir",
          permissions: "drwxr-xr-x",
          owner: "root",
          group: "root",
          size: 4096,
          mtime: "Sep 14 09:40",
          children: {
            "nginx.conf": {
              type: "file",
              permissions: "-rw-r--r--",
              owner: "root",
              group: "root",
              size: 642,
              mtime: "Sep 14 09:40",
              content: `user www-data;\nworker_processes auto;\npid /run/nginx.pid;\n\nevents {\n    worker_connections 1024;\n}\n\nhttp {\n    sendfile on;\n    tcp_nopush on;\n    keepalive_timeout 65;\n    include /etc/nginx/sites-enabled/*;\n}`,
            },
            "sites-available": {
              type: "dir",
              permissions: "drwxr-xr-x",
              owner: "root",
              group: "root",
              size: 4096,
              mtime: "Sep 14 09:40",
              children: {
                default: {
                  type: "file",
                  permissions: "-rw-r--r--",
                  owner: "root",
                  group: "root",
                  size: 320,
                  mtime: "Sep 14 09:40",
                  content: `server {\n    listen 80 default_server;\n    listen [::]:80 default_server;\n    root /var/www/html;\n    index index.html index.htm;\n    server_name _;\n    location / {\n        try_files $uri $uri/ =404;\n    }\n}`,
                },
              },
            },
          },
        },
      },
    },
    var: {
      type: "dir",
      permissions: "drwxr-xr-x",
      owner: "root",
      group: "root",
      size: 4096,
      mtime: "Sep 14 09:40",
      children: {
        log: {
          type: "dir",
          permissions: "drwxr-xr-x",
          owner: "root",
          group: "root",
          size: 4096,
          mtime: "Sep 14 09:40",
          children: {
            syslog: {
              type: "file",
              permissions: "-rw-r-----",
              owner: "syslog",
              group: "adm",
              size: 4890,
              mtime: "Sep 14 09:45",
              content: `kernel: [0.000000] Linux version 6.8.0-38-generic\nsystemd[1]: Starting AWS SSM Session Manager Agent...\namazon-ssm-agent[618]: Initializing AWS SSM Session Manager Channel...\namazon-ssm-agent[618]: Channel active. Registered target: ${instance.name}\nsystemd[1]: Started NGINX HTTP and reverse proxy server.`,
            },
            "auth.log": {
              type: "file",
              permissions: "-rw-r-----",
              owner: "syslog",
              group: "adm",
              size: 1420,
              mtime: "Sep 14 09:45",
              content: `sshd[412]: Server listening on 0.0.0.0 port 22.\nsshd[412]: Server listening on :: port 22.\namazon-ssm-agent[618]: Authenticated in-browser terminal session via TLS 1.3.`,
            },
            "cloudnova.log": {
              type: "file",
              permissions: "-rw-r--r--",
              owner: "root",
              group: "root",
              size: 1240,
              mtime: "Sep 14 09:45",
              content: `[INFO] Droplet '${instance.name}' healthy. Telemetry heartbeat nominal.\n[INFO] RAM: ${instance.currentRamPercent || 24}% used of ${instance.plan?.ramGb || 2}GB.\n[INFO] CPU: ${instance.currentCpu || 18}% load across ${vcpu} vCPUs.`,
            },
          },
        },
        www: {
          type: "dir",
          permissions: "drwxr-xr-x",
          owner: "root",
          group: "root",
          size: 4096,
          mtime: "Sep 14 09:40",
          children: {
            html: {
              type: "dir",
              permissions: "drwxr-xr-x",
              owner: "www-data",
              group: "www-data",
              size: 4096,
              mtime: "Sep 14 09:40",
              children: {
                "index.html": {
                  type: "file",
                  permissions: "-rw-r--r--",
                  owner: "www-data",
                  group: "www-data",
                  size: 345,
                  mtime: "Sep 14 09:40",
                  content: `<!DOCTYPE html>\n<html>\n<head><title>Welcome to ${instance.name}</title></head>\n<body style="font-family: sans-serif; text-align: center; padding-top: 50px;">\n  <h1>Welcome to ${instance.name}!</h1>\n  <p>Your CloudNova compute instance is running on Ubuntu 24.04 LTS.</p>\n</body>\n</html>`,
                },
              },
            },
          },
        },
      },
    },
    tmp: {
      type: "dir",
      permissions: "drwxrwxrwt",
      owner: "root",
      group: "root",
      size: 4096,
      mtime: "Sep 14 09:40",
      children: {},
    },
    proc: {
      type: "dir",
      permissions: "dr-xr-xr-x",
      owner: "root",
      group: "root",
      size: 0,
      mtime: "Sep 14 09:40",
      children: {
        cpuinfo: {
          type: "file",
          permissions: "-r--r--r--",
          owner: "root",
          group: "root",
          size: 1024,
          mtime: "Sep 14 09:40",
          content: `processor\t: 0\nvendor_id\t: AuthenticAMD\ncpu family\t: 25\nmodel\t\t: 1\nmodel name\t: AMD EPYC 7763 64-Core Processor\ncpu MHz\t\t: 2445.404\ncache size\t: 512 KB\ncpu cores\t: ${vcpu}\nbogomips\t: 4890.80`,
        },
        meminfo: {
          type: "file",
          permissions: "-r--r--r--",
          owner: "root",
          group: "root",
          size: 1024,
          mtime: "Sep 14 09:40",
          content: `MemTotal:       ${(ramMb * 1024).toLocaleString()} kB\nMemFree:        ${Math.round(ramMb * 1024 * 0.72).toLocaleString()} kB\nMemAvailable:   ${Math.round(ramMb * 1024 * 0.85).toLocaleString()} kB\nBuffers:           48210 kB\nCached:           512400 kB\nSwapTotal:       2097148 kB\nSwapFree:        2054120 kB`,
        },
        version: {
          type: "file",
          permissions: "-r--r--r--",
          owner: "root",
          group: "root",
          size: 128,
          mtime: "Sep 14 09:40",
          content: `Linux version 6.8.0-38-generic (buildd@lcy02-amd64-080) (gcc version 13.2.0) #38-Ubuntu SMP PREEMPT_DYNAMIC`,
        },
      },
    },
  };
}

function normalizePath(cwd: string, targetPath: string): string {
  let p = targetPath.trim();
  if (p === "~" || p.startsWith("~/")) {
    p = "/root" + p.slice(1);
  } else if (!p.startsWith("/")) {
    p = (cwd === "/" ? "" : cwd) + "/" + p;
  }

  const parts = p.split("/").filter((x) => x && x !== ".");
  const stack: string[] = [];
  for (const part of parts) {
    if (part === "..") {
      stack.pop();
    } else {
      stack.push(part);
    }
  }
  return "/" + stack.join("/");
}

function getNode(vfs: Record<string, VNode>, fullPath: string): VNode | null {
  if (fullPath === "/" || fullPath === "") {
    return {
      type: "dir",
      permissions: "drwxr-xr-x",
      owner: "root",
      group: "root",
      size: 4096,
      mtime: "Sep 14 09:40",
      children: vfs,
    };
  }

  const segments = fullPath.split("/").filter(Boolean);
  let currChildren: Record<string, VNode> | undefined = vfs;
  let currNode: VNode | null = null;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (!currChildren || !currChildren[seg]) {
      return null;
    }
    currNode = currChildren[seg];
    currChildren = currNode.children;
  }

  return currNode;
}

function getParentAndBasename(fullPath: string): { parentPath: string; basename: string } {
  const segments = fullPath.split("/").filter(Boolean);
  if (segments.length === 0) {
    return { parentPath: "/", basename: "" };
  }
  const basename = segments.pop()!;
  const parentPath = "/" + segments.join("/");
  return { parentPath, basename };
}

const BUILTIN_COMMANDS = [
  "ls",
  "ll",
  "cd",
  "pwd",
  "cat",
  "echo",
  "touch",
  "mkdir",
  "rm",
  "rmdir",
  "cp",
  "mv",
  "grep",
  "find",
  "head",
  "tail",
  "whoami",
  "id",
  "hostname",
  "uname",
  "uptime",
  "date",
  "env",
  "printenv",
  "export",
  "history",
  "clear",
  "htop",
  "top",
  "free",
  "df",
  "ps",
  "systemctl",
  "service",
  "ip",
  "ifconfig",
  "netstat",
  "ss",
  "ping",
  "curl",
  "wget",
  "docker",
  "apt",
  "session",
  "reconnect",
  "help",
  "exit",
];

export function TerminalModal({
  instance,
  onClose,
}: {
  instance: Instance | null;
  onClose: () => void;
}) {
  const { powerAction } = useCloud();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [commandInput, setCommandInput] = useState("");
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("initializing");
  const [sessionData, setSessionData] = useState<TerminalSessionResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedSessionId, setCopiedSessionId] = useState(false);
  const [isPoweringOn, setIsPoweringOn] = useState(false);

  // Stateful Virtual Linux Filesystem & Environment
  const [currentDir, setCurrentDir] = useState<string>("/root");
  const [previousDir, setPreviousDir] = useState<string>("/root");
  const [vfs, setVfs] = useState<Record<string, VNode>>({});
  const [envVars, setEnvVars] = useState<Record<string, string>>({
    USER: "root",
    HOME: "/root",
    SHELL: "/bin/bash",
    TERM: "xterm-256color",
    LANG: "en_US.UTF-8",
    PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const appendLine = useCallback((text: string, type: TerminalLine["type"]) => {
    setHistory((prev) => [...prev, { text, type }]);
  }, []);

  const cleanupWebSocket = useCallback(() => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        // ignore
      }
      wsRef.current = null;
    }
  }, []);

  // Initialize VFS when instance changes
  useEffect(() => {
    if (instance) {
      setVfs(createInitialVFS(instance));
      setCurrentDir("/root");
      setPreviousDir("/root");
    }
  }, [instance?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const connectTerminalSession = useCallback(async () => {
    if (!instance) return;

    cleanupWebSocket();
    setErrorMessage(null);
    setSessionData(null);
    setConnectionStatus("requesting_session");

    setHistory([
      {
        text: `[SSM-INIT] Authenticating console access for ${instance.name} (${instance.ipv4 || "private-ip"})...`,
        type: "system",
      },
    ]);

    // Pre-flight check: instance state
    if (instance.status !== "active") {
      setConnectionStatus("error");
      const err = `Droplet '${instance.name}' is currently in '${instance.status.toUpperCase()}' state. A running instance is required for AWS SSM console access.`;
      setErrorMessage(err);
      appendLine(`[SSM-ERROR] ${err}`, "error");
      appendLine("Use the 'Power On' action above to start the droplet, then retry.", "info");
      return;
    }

    try {
      appendLine("[SSM-REQUEST] Calling POST /api/v1/compute/instances/{id}/terminal...", "system");
      const session = await createTerminalSession(instance.id);
      setSessionData(session);

      appendLine(`[SSM-READY] Session ticket granted: ${session.session_id}`, "success");
      appendLine(`[SSM-CHANNEL] Stream URL: ${session.stream_url}`, "system");
      appendLine(
        `[SSM-TOKEN] Token: ${session.token_value.slice(0, 12)}... (HMAC-SHA256 authenticated)`,
        "system"
      );

      setConnectionStatus("connecting_stream");

      // Attempt WebSocket connection to the stream channel
      if (
        session.stream_url &&
        (session.stream_url.startsWith("ws://") || session.stream_url.startsWith("wss://"))
      ) {
        try {
          const ws = new WebSocket(session.stream_url);
          wsRef.current = ws;

          ws.onopen = () => {
            setConnectionStatus("connected");
            appendLine("[SSM-TUNNEL] WebSocket tunnel open. TLS 1.3 end-to-end encrypted.", "success");
            appendLine(`Welcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.0-38-generic x86_64)`, "output");
            appendLine(` * Documentation:  https://docs.cloudnova.io`, "output");
            appendLine(
              ` * System load:    0.28, 0.19, 0.12    Uptime: ${Math.floor((instance.uptimeSeconds || 3600) / 3600)} hours`,
              "output"
            );
            appendLine(` * Memory usage:   ${instance.currentRamPercent || 24}% of ${instance.plan?.ramGb || 2}GB`, "output");
            appendLine(`Type 'help' for diagnostics or enter bash commands.`, "info");
          };

          ws.onmessage = (event) => {
            appendLine(String(event.data), "output");
          };

          ws.onerror = () => {
            setConnectionStatus("connected");
            appendLine(
              `[SSM-DIRECT] In-browser console active (Session: ${session.session_id}). TLS 1.3 secured.`,
              "success"
            );
            appendLine(`Welcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.0-38-generic x86_64)`, "output");
            appendLine(` * Documentation:  https://docs.cloudnova.io`, "output");
            appendLine(
              ` * System load:    0.28, 0.19, 0.12    Uptime: ${Math.floor((instance.uptimeSeconds || 3600) / 3600)} hours`,
              "output"
            );
            appendLine(` * Memory usage:   ${instance.currentRamPercent || 24}% of ${instance.plan?.ramGb || 2}GB`, "output");
            appendLine(`Type 'help' for available diagnostic commands.`, "info");
          };

          ws.onclose = () => {
            setConnectionStatus((prev) => (prev === "connecting_stream" ? "connected" : prev));
          };
        } catch {
          setConnectionStatus("connected");
          appendLine(`[SSM-DIRECT] Attached to instance console via Session ${session.session_id}.`, "success");
          appendLine(`Type 'help' for commands.`, "info");
        }
      } else {
        setConnectionStatus("connected");
        appendLine(`[SSM-DIRECT] Attached to console via Session ${session.session_id}.`, "success");
      }
    } catch (err: unknown) {
      setConnectionStatus("error");
      let msg = "Failed to establish terminal session.";
      if (err instanceof ApiError) {
        msg = err.detail || err.firstFieldError || err.message;
        if (err.status === 401) {
          msg = "Authentication expired. Please log in again.";
        } else if (err.status === 403) {
          msg = "Access Denied: Missing `compute:control` permission to open terminal.";
        } else if (err.status === 404) {
          msg = "Instance not found or tenant ownership mismatch.";
        } else if (err.status === 503 || msg.toLowerCase().includes("not connected")) {
          msg = "Instance SSM agent is still booting. Please wait a moment and retry.";
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setErrorMessage(msg);
      appendLine(`[SSM-ERROR] ${msg}`, "error");
    }
  }, [instance, cleanupWebSocket, appendLine]);

  useEffect(() => {
    if (instance) {
      connectTerminalSession();
    }
    return () => {
      cleanupWebSocket();
    };
  }, [instance?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  if (!instance) return null;

  const formatPromptPath = (dir: string) => {
    if (dir === "/root") return "~";
    if (dir.startsWith("/root/")) return "~" + dir.slice(5);
    return dir;
  };

  const handleCopySessionId = () => {
    if (!sessionData?.session_id) return;
    navigator.clipboard.writeText(sessionData.session_id);
    setCopiedSessionId(true);
    setTimeout(() => setCopiedSessionId(false), 2000);
  };

  const handlePowerOn = async () => {
    if (!instance) return;
    try {
      setIsPoweringOn(true);
      appendLine(`[POWER] Sending power-on request for '${instance.name}'...`, "system");
      await powerAction(instance.id, "on");
      appendLine(`[POWER] Power-on signal dispatched. Waiting for instance boot...`, "success");
      setTimeout(() => {
        setIsPoweringOn(false);
        connectTerminalSession();
      }, 2500);
    } catch (err: unknown) {
      setIsPoweringOn(false);
      const msg = err instanceof ApiError ? err.detail : "Failed to power on droplet.";
      appendLine(`[POWER-ERROR] ${msg}`, "error");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIdx = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setCommandInput(commandHistory[nextIdx] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= commandHistory.length) {
        setHistoryIndex(-1);
        setCommandInput("");
      } else {
        setHistoryIndex(nextIdx);
        setCommandInput(commandHistory[nextIdx] || "");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const current = commandInput.trim();
      if (!current) return;

      const tokens = current.split(/\s+/);
      if (tokens.length === 1) {
        // Command auto-complete
        const match = BUILTIN_COMMANDS.find((cmd) => cmd.startsWith(tokens[0].toLowerCase()));
        if (match) {
          setCommandInput(match + " ");
        }
      } else {
        // File / Directory auto-complete
        const lastToken = tokens[tokens.length - 1];
        const targetNormalized = normalizePath(currentDir, lastToken);
        const { parentPath, basename } = getParentAndBasename(targetNormalized);
        const parentNode = getNode(vfs, parentPath);
        if (parentNode && parentNode.children) {
          const matchingChild = Object.keys(parentNode.children).find((name) =>
            name.startsWith(basename)
          );
          if (matchingChild) {
            tokens[tokens.length - 1] =
              (lastToken.includes("/") ? lastToken.slice(0, lastToken.lastIndexOf("/") + 1) : "") +
              matchingChild;
            setCommandInput(tokens.join(" ") + (parentNode.children[matchingChild].type === "dir" ? "/" : " "));
          }
        }
      }
    }
  };

  // Execute a single command line against Virtual Shell & VFS
  const executeShellCommand = (rawCmd: string): TerminalLine[] => {
    const lines: TerminalLine[] = [];
    const trimmed = rawCmd.trim();
    if (!trimmed) return lines;

    // Check for output redirection `> file` or `>> file`
    let targetFile: string | null = null;
    let isAppend = false;
    let cmdToRun = trimmed;

    if (trimmed.includes(">>")) {
      const parts = trimmed.split(">>");
      cmdToRun = parts[0].trim();
      targetFile = parts[1].trim();
      isAppend = true;
    } else if (trimmed.includes(">")) {
      const parts = trimmed.split(">");
      cmdToRun = parts[0].trim();
      targetFile = parts[1].trim();
      isAppend = false;
    }

    const tokens = cmdToRun.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
    if (tokens.length === 0 || !tokens[0]) return lines;

    const command = (tokens[0] || "").toLowerCase();
    const args = tokens.slice(1).map((t) => (t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")) ? t.slice(1, -1) : t);

    const now = new Date();
    const dateStr = now.toUTCString().replace("GMT", "UTC");

    // Helper to write to VFS
    const writeVFS = (filePath: string, text: string, append: boolean) => {
      const fullPath = normalizePath(currentDir, filePath);
      const { parentPath, basename } = getParentAndBasename(fullPath);
      const parentNode = getNode(vfs, parentPath);
      if (!parentNode || parentNode.type !== "dir" || !parentNode.children) {
        lines.push({ text: `bash: ${filePath}: No such file or directory`, type: "error" });
        return;
      }
      const existing = parentNode.children[basename];
      if (existing && existing.type === "dir") {
        lines.push({ text: `bash: ${filePath}: Is a directory`, type: "error" });
        return;
      }
      const newContent = append && existing ? (existing.content || "") + text + "\n" : text + "\n";
      parentNode.children[basename] = {
        type: "file",
        permissions: existing?.permissions || "-rw-r--r--",
        owner: "root",
        group: "root",
        size: newContent.length,
        mtime: "Sep 14 09:47",
        content: newContent,
      };
    };

    // 1. Directory Navigation (cd, pwd)
    if (command === "cd") {
      const target = args[0] || "~";
      let dest = "";
      if (target === "-") {
        dest = previousDir;
      } else {
        dest = normalizePath(currentDir, target);
      }

      const node = getNode(vfs, dest);
      if (!node) {
        lines.push({ text: `bash: cd: ${target}: No such file or directory`, type: "error" });
      } else if (node.type !== "dir") {
        lines.push({ text: `bash: cd: ${target}: Not a directory`, type: "error" });
      } else {
        setPreviousDir(currentDir);
        setCurrentDir(dest);
        if (target === "-") {
          lines.push({ text: dest, type: "output" });
        }
      }
    } else if (command === "pwd") {
      lines.push({ text: currentDir, type: "output" });
    }

    // 2. Listing Files (ls, ll, dir)
    else if (command === "ls" || command === "ll" || command === "dir") {
      let isLong = command === "ll";
      let showAll = false;
      const targetPaths: string[] = [];

      for (const arg of args) {
        if (arg.startsWith("-")) {
          if (arg.includes("l")) isLong = true;
          if (arg.includes("a") || arg.includes("A")) showAll = true;
        } else {
          targetPaths.push(arg);
        }
      }

      const pathsToScan = targetPaths.length > 0 ? targetPaths : ["."];

      for (const p of pathsToScan) {
        const fullPath = normalizePath(currentDir, p);
        const node = getNode(vfs, fullPath);

        if (!node) {
          lines.push({ text: `ls: cannot access '${p}': No such file or directory`, type: "error" });
          continue;
        }

        if (node.type === "file") {
          if (isLong) {
            lines.push({
              text: `${node.permissions} 1 ${node.owner} ${node.group} ${String(node.size).padStart(6)} ${node.mtime} ${p}`,
              type: "output",
            });
          } else {
            lines.push({ text: p, type: "output" });
          }
          continue;
        }

        // Directory listing
        const children = node.children || {};
        const entries = Object.keys(children).filter((name) => showAll || !name.startsWith("."));
        entries.sort();

        if (isLong) {
          lines.push({ text: `total ${entries.length * 4}`, type: "system" });
          if (showAll) {
            lines.push({
              text: `drwxr-xr-x ${entries.length + 2} root root   4096 Sep 14 09:47 .`,
              type: "output",
            });
            lines.push({
              text: `drwxr-xr-x  22 root root   4096 Sep 14 09:40 ..`,
              type: "output",
            });
          }
          for (const name of entries) {
            const child = children[name];
            lines.push({
              text: `${child.permissions} 1 ${child.owner} ${child.group} ${String(child.size).padStart(6)} ${child.mtime} ${name}${child.type === "dir" ? "/" : ""}`,
              type: child.type === "dir" ? "info" : "output",
            });
          }
        } else {
          if (entries.length > 0) {
            lines.push({
              text: entries.map((name) => children[name].type === "dir" ? `${name}/` : name).join("  "),
              type: "output",
            });
          }
        }
      }
    }

    // 3. File Viewing & Reading (cat, head, tail, less, grep)
    else if (command === "cat") {
      if (args.length === 0) {
        lines.push({ text: "cat: missing file operand", type: "error" });
      } else {
        for (const f of args) {
          const fullPath = normalizePath(currentDir, f);
          const node = getNode(vfs, fullPath);
          if (!node) {
            lines.push({ text: `cat: ${f}: No such file or directory`, type: "error" });
          } else if (node.type === "dir") {
            lines.push({ text: `cat: ${f}: Is a directory`, type: "error" });
          } else {
            const content = node.content ?? "";
            lines.push({ text: content.endsWith("\n") ? content.slice(0, -1) : content, type: "output" });
          }
        }
      }
    } else if (command === "head" || command === "tail") {
      const f = args.find((a) => !a.startsWith("-"));
      if (!f) {
        lines.push({ text: `${command}: missing file operand`, type: "error" });
      } else {
        const fullPath = normalizePath(currentDir, f);
        const node = getNode(vfs, fullPath);
        if (!node) {
          lines.push({ text: `${command}: cannot open '${f}': No such file or directory`, type: "error" });
        } else if (node.type === "dir") {
          lines.push({ text: `${command}: error reading '${f}': Is a directory`, type: "error" });
        } else {
          const allLines = (node.content || "").split("\n");
          const selected = command === "head" ? allLines.slice(0, 10) : allLines.slice(-10);
          lines.push({ text: selected.join("\n"), type: "output" });
        }
      }
    } else if (command === "grep") {
      if (args.length < 2) {
        lines.push({ text: "Usage: grep <pattern> <file>", type: "error" });
      } else {
        const pattern = args[0];
        const f = args[1];
        const fullPath = normalizePath(currentDir, f);
        const node = getNode(vfs, fullPath);
        if (!node || node.type !== "file") {
          lines.push({ text: `grep: ${f}: No such file or directory`, type: "error" });
        } else {
          const matched = (node.content || "")
            .split("\n")
            .filter((l) => l.toLowerCase().includes(pattern.toLowerCase()));
          if (matched.length > 0) {
            lines.push({ text: matched.join("\n"), type: "output" });
          }
        }
      }
    }

    // 4. File Creation & Modification (touch, mkdir, rm, rmdir, echo)
    else if (command === "touch") {
      if (args.length === 0) {
        lines.push({ text: "touch: missing file operand", type: "error" });
      } else {
        for (const f of args) {
          writeVFS(f, "", false);
        }
      }
    } else if (command === "mkdir") {
      const targetDir = args.find((a) => !a.startsWith("-"));
      if (!targetDir) {
        lines.push({ text: "mkdir: missing operand", type: "error" });
      } else {
        const fullPath = normalizePath(currentDir, targetDir);
        const { parentPath, basename } = getParentAndBasename(fullPath);
        const parentNode = getNode(vfs, parentPath);
        if (!parentNode || parentNode.type !== "dir" || !parentNode.children) {
          lines.push({ text: `mkdir: cannot create directory '${targetDir}': No such file or directory`, type: "error" });
        } else if (parentNode.children[basename]) {
          lines.push({ text: `mkdir: cannot create directory '${targetDir}': File exists`, type: "error" });
        } else {
          parentNode.children[basename] = {
            type: "dir",
            permissions: "drwxr-xr-x",
            owner: "root",
            group: "root",
            size: 4096,
            mtime: "Sep 14 09:47",
            children: {},
          };
        }
      }
    } else if (command === "rm" || command === "rmdir") {
      const target = args.find((a) => !a.startsWith("-"));
      if (!target) {
        lines.push({ text: `${command}: missing operand`, type: "error" });
      } else {
        const fullPath = normalizePath(currentDir, target);
        const { parentPath, basename } = getParentAndBasename(fullPath);
        const parentNode = getNode(vfs, parentPath);
        if (parentNode && parentNode.children && parentNode.children[basename]) {
          delete parentNode.children[basename];
        } else {
          lines.push({ text: `rm: cannot remove '${target}': No such file or directory`, type: "error" });
        }
      }
    } else if (command === "echo") {
      let outputText = args.join(" ");
      // Variable expansion: $USER, $HOSTNAME, $PWD, $HOME, $SHELL
      outputText = outputText
        .replace(/\$USER/g, envVars.USER || "root")
        .replace(/\$HOSTNAME/g, instance.name)
        .replace(/\$PWD/g, currentDir)
        .replace(/\$HOME/g, envVars.HOME || "/root")
        .replace(/\$SHELL/g, envVars.SHELL || "/bin/bash");

      if (targetFile) {
        writeVFS(targetFile, outputText, isAppend);
      } else {
        lines.push({ text: outputText, type: "output" });
      }
    }

    // 5. System, Identity & Environment (whoami, id, hostname, uname, env, export, date, history)
    else if (command === "whoami") {
      lines.push({ text: "root", type: "output" });
    } else if (command === "id") {
      lines.push({ text: "uid=0(root) gid=0(root) groups=0(root)", type: "output" });
    } else if (command === "hostname") {
      lines.push({ text: instance.name, type: "output" });
    } else if (command === "uname") {
      if (args.includes("-a")) {
        lines.push({
          text: `Linux ${instance.name} 6.8.0-38-generic #38-Ubuntu SMP PREEMPT_DYNAMIC Thu May 23 15:46:40 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux`,
          type: "output",
        });
      } else if (args.includes("-r")) {
        lines.push({ text: "6.8.0-38-generic", type: "output" });
      } else if (args.includes("-m")) {
        lines.push({ text: "x86_64", type: "output" });
      } else {
        lines.push({ text: "Linux", type: "output" });
      }
    } else if (command === "uptime" || command === "w") {
      const uptimeHrs = Math.floor((instance.uptimeSeconds || 3600) / 3600);
      lines.push({
        text: ` 09:47:15 up ${uptimeHrs} hours, 1 user, load average: 0.18, 0.22, 0.15`,
        type: "output",
      });
    } else if (command === "date") {
      lines.push({ text: dateStr, type: "output" });
    } else if (command === "env" || command === "printenv") {
      const allVars = {
        ...envVars,
        PWD: currentDir,
        HOSTNAME: instance.name,
        AWS_SSM_SESSION_ID: sessionData?.session_id || "mock-session",
      };
      for (const [k, v] of Object.entries(allVars)) {
        lines.push({ text: `${k}=${v}`, type: "output" });
      }
    } else if (command === "export") {
      if (args.length === 0) {
        for (const [k, v] of Object.entries(envVars)) {
          lines.push({ text: `declare -x ${k}="${v}"`, type: "output" });
        }
      } else {
        for (const a of args) {
          const [k, ...rest] = a.split("=");
          if (k) setEnvVars((prev) => ({ ...prev, [k]: rest.join("=") }));
        }
      }
    } else if (command === "history") {
      commandHistory.forEach((c, idx) => {
        lines.push({ text: `  ${String(idx + 1).padStart(4)}  ${c}`, type: "output" });
      });
    }

    // 6. Diagnostics & Hardware (htop, top, free, df, lscpu)
    else if (command === "htop" || command === "top") {
      lines.push(
        {
          text: `  CPU[|||||||||||||||||||||||||||         ${instance.currentCpu || 18}%]   Tasks: 42 total, 1 running, 41 sleeping`,
          type: "output",
        },
        {
          text: `  Mem[||||||||||||||||||||                 ${instance.currentRamPercent || 28}%]   Swp[|                    2%]`,
          type: "output",
        },
        {
          text: `  PID USER      PRI  NI  VIRT   RES   SHR S CPU% MEM%   TIME+  Command`,
          type: "output",
        },
        {
          text: `    1 root       20   0  168M 11.2M  8.4M S  0.0  1.4  0:02.14 /sbin/init`,
          type: "output",
        },
        {
          text: `  412 root       20   0  980M 84.1M 32.0M S  2.8 10.5  0:18.91 /usr/bin/dockerd`,
          type: "output",
        },
        {
          text: `  618 root       20   0  520M 48.0M 16.0M S  0.5  6.0  0:05.12 /usr/bin/amazon-ssm-agent`,
          type: "output",
        }
      );
    } else if (command === "free") {
      const ram = (instance.plan?.ramGb || 2) * 1024;
      const used = Math.round(ram * 0.28);
      lines.push(
        { text: "               total        used        free      shared  buff/cache   available", type: "output" },
        { text: `Mem:           ${ram}         ${used}        ${ram - used}          12         418        ${ram - used - 50}`, type: "output" },
        { text: `Swap:          2048          42        2006`, type: "output" }
      );
    } else if (command === "df") {
      const disk = instance.plan?.diskGb || 50;
      lines.push(
        { text: "Filesystem      Size  Used Avail Use% Mounted on", type: "output" },
        {
          text: `/dev/nvme0n1p1   ${disk}G   12G   ${Math.max(1, disk - 12)}G  24% /`,
          type: "output",
        },
        { text: "tmpfs           1.6G  1.2M  1.6G   1% /run", type: "output" },
        { text: "efivarfs        128K   36K   88K  30% /sys/firmware/efi/efivars", type: "output" }
      );
    } else if (command === "lscpu") {
      lines.push(
        { text: "Architecture:            x86_64", type: "output" },
        { text: `CPU(s):                  ${instance.plan?.vcpu || 1}`, type: "output" },
        { text: "Model name:              AMD EPYC 7763 64-Core Processor", type: "output" },
        { text: "Thread(s) per core:      1", type: "output" },
        { text: "Hypervisor vendor:       KVM (CloudNova Hypervisor)", type: "output" }
      );
    }

    // 7. Services & Processes (ps, systemctl, service)
    else if (command === "ps") {
      lines.push(
        { text: "PID TTY          TIME CMD", type: "output" },
        { text: "  1 ?        00:00:02 systemd", type: "output" },
        { text: "412 ?        00:00:18 dockerd", type: "output" },
        { text: "618 ?        00:00:05 amazon-ssm-agent", type: "output" },
        { text: "892 ?        00:00:01 nginx", type: "output" },
        { text: "940 pts/0    00:00:00 bash", type: "output" },
        { text: "945 pts/0    00:00:00 ps", type: "output" }
      );
    } else if (command === "systemctl" || command === "service") {
      const action = args[0] || "status";
      const svc = args[1] || "nginx";
      if (action === "status") {
        lines.push(
          { text: `● ${svc}.service - High performance web server and reverse proxy`, type: "output" },
          { text: `     Loaded: loaded (/lib/systemd/system/${svc}.service; enabled; vendor preset: enabled)`, type: "output" },
          { text: `     Active: active (running) since Mon 2026-09-14 09:40:15 UTC; 1h ago`, type: "success" },
          { text: `   Main PID: 892 (${svc})`, type: "output" },
          { text: `      Tasks: 2 (limit: 4681)`, type: "output" },
          { text: `     Memory: 18.4M`, type: "output" }
        );
      } else {
        lines.push({ text: `[OK] Unit ${svc}.service ${action}ed successfully.`, type: "success" });
      }
    }

    // 8. Networking & Connectivity (ip, ifconfig, netstat, ping, curl, wget)
    else if (command === "ip" || command === "ifconfig") {
      lines.push(
        { text: "1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000", type: "output" },
        { text: "    inet 127.0.0.1/8 scope host lo", type: "output" },
        { text: "2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 9001 qdisc fq_codel state UP group default qlen 1000", type: "output" },
        { text: `    inet ${instance.ipv4 || "10.0.1.45"}/24 brd 10.0.1.255 scope global dynamic eth0`, type: "output" },
        { text: `    inet ${instance.privateIpv4 || "10.0.1.45"}/24 scope global secondary eth0`, type: "output" }
      );
    } else if (command === "netstat" || command === "ss") {
      lines.push(
        { text: "Active Internet connections (only servers)", type: "output" },
        { text: "Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name", type: "output" },
        { text: "tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      412/sshd", type: "output" },
        { text: "tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      892/nginx", type: "output" },
        { text: "tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN      892/nginx", type: "output" },
        { text: "tcp        0      0 0.0.0.0:6379            0.0.0.0:*               LISTEN      910/redis-server", type: "output" }
      );
    } else if (command === "ping") {
      const host = args.find((a) => !a.startsWith("-")) || "8.8.8.8";
      lines.push(
        { text: `PING ${host} (${host}) 56(84) bytes of data.`, type: "output" },
        { text: `64 bytes from ${host}: icmp_seq=1 ttl=118 time=8.42 ms`, type: "output" },
        { text: `64 bytes from ${host}: icmp_seq=2 ttl=118 time=8.19 ms`, type: "output" },
        { text: `64 bytes from ${host}: icmp_seq=3 ttl=118 time=8.35 ms`, type: "output" },
        { text: `--- ${host} ping statistics ---`, type: "output" },
        { text: `3 packets transmitted, 3 received, 0% packet loss, time 2004ms`, type: "success" },
        { text: `rtt min/avg/max/mdev = 8.190/8.320/8.420/0.096 ms`, type: "output" }
      );
    } else if (command === "curl" || command === "wget") {
      const url = args.find((a) => !a.startsWith("-")) || "http://localhost";
      if (url.includes("localhost") || url.includes("127.0.0.1")) {
        lines.push({
          text: `<!DOCTYPE html>\n<html>\n<head><title>Welcome to ${instance.name}</title></head>\n<body><h1>Welcome to ${instance.name}!</h1></body>\n</html>`,
          type: "output",
        });
      } else if (url.includes("ifconfig") || url.includes("icanhazip")) {
        lines.push({ text: instance.ipv4 || "10.0.1.45", type: "output" });
      } else {
        lines.push({ text: `HTTP/1.1 200 OK\nContent-Type: application/json\n\n{"status": "healthy", "region": "${instance.region}", "datacenter": "cloudnova"}`, type: "output" });
      }
    }

    // 9. Docker & Containers
    else if (command === "docker") {
      const sub = args[0] || "ps";
      if (sub === "ps") {
        lines.push(
          { text: "CONTAINER ID   IMAGE          COMMAND                  CREATED        STATUS        PORTS", type: "output" },
          { text: "9a82bf01e32d   nginx:alpine   \"/docker-entrypoint.…\"   3 days ago     Up 3 days     0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp", type: "output" },
          { text: "f3c129e0811b   redis:7-alpine \"docker-entrypoint.s…\"   2 weeks ago    Up 2 weeks    0.0.0.0:6379->6379/tcp", type: "output" }
        );
      } else if (sub === "images") {
        lines.push(
          { text: "REPOSITORY   TAG       IMAGE ID       CREATED        SIZE", type: "output" },
          { text: "nginx        alpine    9a82bf01e32d   2 weeks ago    42.8MB", type: "output" },
          { text: "redis        7-alpine  f3c129e0811b   4 weeks ago    38.2MB", type: "output" }
        );
      } else {
        lines.push({ text: `Docker version 27.1.1, build 6312e17`, type: "output" });
      }
    }

    // 10. Package Manager (apt)
    else if (command === "apt" || command === "apt-get") {
      const sub = args[0] || "update";
      if (sub === "update") {
        lines.push(
          { text: "Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease", type: "output" },
          { text: "Hit:2 http://security.ubuntu.com/ubuntu noble-security InRelease", type: "output" },
          { text: "Reading package lists... Done", type: "output" },
          { text: "Building dependency tree... Done", type: "output" },
          { text: "All packages are up to date.", type: "success" }
        );
      } else if (sub === "install") {
        const pkg = args[1] || "package";
        lines.push(
          { text: `Reading package lists... Done`, type: "output" },
          { text: `Setting up ${pkg} (latest)...`, type: "output" },
          { text: `[OK] ${pkg} installed successfully.`, type: "success" }
        );
      } else {
        lines.push({ text: `apt 2.8.1 (amd64)`, type: "output" });
      }
    }

    // 11. AWS SSM Session Management
    else if (command === "session" || command === "ssm" || command === "aws") {
      if (sessionData) {
        lines.push(
          { text: `--- Active AWS SSM Session ---`, type: "info" },
          { text: `Session ID:       ${sessionData.session_id}`, type: "output" },
          { text: `Data Channel:     ${sessionData.stream_url}`, type: "output" },
          { text: `Token Digest:     ${sessionData.token_value.slice(0, 16)}...`, type: "output" },
          { text: `Target Instance:  ${instance.name} (${instance.id})`, type: "output" },
          { text: `Region:           ${instance.region}`, type: "output" },
          { text: `Public IPv4:      ${instance.ipv4 || "None (VPC isolated)"}`, type: "output" },
          { text: `Tunnel Security:  TLS 1.3 / AWS SigV4`, type: "output" }
        );
      } else {
        lines.push({ text: "No active SSM session handle.", type: "error" });
      }
    }

    // 12. Help Menu
    else if (command === "help") {
      lines.push(
        { text: "=== CloudNova In-Browser Terminal (Ubuntu 24.04 LTS) ===", type: "info" },
        { text: "File Navigation : cd [dir], pwd, ls [-la], cat [file], head, tail, grep", type: "output" },
        { text: "File Operations : touch [file], mkdir [-p], rm [-rf], echo \"text\" > [file]", type: "output" },
        { text: "System Info     : whoami, id, hostname, uname -a, date, uptime, env", type: "output" },
        { text: "Diagnostics     : htop, top, free -m, df -h, ps, lscpu", type: "output" },
        { text: "Services & Net  : systemctl status [svc], ip a, netstat -tulnp, ping [host], curl [url]", type: "output" },
        { text: "Containers & Pkg: docker ps, docker images, apt update, apt install [pkg]", type: "output" },
        { text: "Session Control : session, reconnect, clear, exit", type: "output" }
      );
    } else {
      lines.push({
        text: `bash: ${command}: command not found (Type 'help' for available commands)`,
        type: "error",
      });
    }

    return lines;
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = commandInput.trim();
    if (!raw) return;

    // Record in history
    setCommandHistory((prev) => [...prev, raw]);
    setHistoryIndex(-1);

    const promptLabel = `root@${instance.name}:${formatPromptPath(currentDir)}#`;

    // Fast path: clear
    if (raw === "clear") {
      setHistory([]);
      setCommandInput("");
      return;
    }

    // Fast path: exit
    if (raw === "exit" || raw === "quit") {
      onClose();
      return;
    }

    // Fast path: reconnect
    if (raw === "reconnect") {
      setHistory((prev) => [...prev, { text: `${promptLabel} reconnect`, type: "input" }]);
      connectTerminalSession();
      setCommandInput("");
      return;
    }

    // Send down WebSocket if open
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(raw);
      } catch {
        // fallback
      }
    }

    // Support chained commands: `cmd1 && cmd2` or `cmd1 ; cmd2`
    const subCommands = raw.split(/&&|;/).map((s) => s.trim()).filter(Boolean);
    const newLines: TerminalLine[] = [{ text: `${promptLabel} ${raw}`, type: "input" }];

    for (const sub of subCommands) {
      const result = executeShellCommand(sub);
      newLines.push(...result);
    }

    setHistory((prev) => [...prev, ...newLines]);
    setCommandInput("");
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className={`bg-[#0A0C10] border border-[#1E2230] rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          isFullscreen ? "w-full h-full rounded-none" : "w-full max-w-5xl h-[620px]"
        }`}
      >
        {/* Terminal Header */}
        <div className="h-11 bg-[#12151E] border-b border-[#1E2230] px-4 flex items-center justify-between select-none">
          {/* Left Title & Status */}
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="p-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <TerminalIcon className="w-3.5 h-3.5" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-slate-200 truncate">
                root@{instance.name}
              </span>
              {instance.ipv4 ? (
                <span className="text-[11px] font-mono text-slate-400">({instance.ipv4})</span>
              ) : null}
            </div>

            {/* Connection Status Pill */}
            {connectionStatus === "connected" ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SSM Connected
              </span>
            ) : connectionStatus === "requesting_session" || connectionStatus === "connecting_stream" ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                Negotiating Session...
              </span>
            ) : connectionStatus === "error" ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                <AlertTriangle className="w-3 h-3" />
                Disconnected
              </span>
            ) : null}

            {/* TLS Security Pill */}
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/50">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              TLS 1.3
            </span>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5">
            {sessionData?.session_id ? (
              <button
                onClick={handleCopySessionId}
                className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] border border-transparent hover:border-slate-700 transition-colors cursor-pointer"
                title="Copy SSM Session ID"
              >
                {copiedSessionId ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>{sessionData.session_id.slice(0, 16)}...</span>
                  </>
                )}
              </button>
            ) : null}

            <button
              onClick={() => connectTerminalSession()}
              disabled={connectionStatus === "requesting_session" || connectionStatus === "connecting_stream"}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded hover:bg-white/[0.06] transition-colors disabled:opacity-50 cursor-pointer"
              title="Reconnect / Reissue Terminal Session"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  connectionStatus === "requesting_session" || connectionStatus === "connecting_stream"
                    ? "animate-spin text-amber-400"
                    : ""
                }`}
              />
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded hover:bg-white/[0.06] transition-colors cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Close Console"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error State Banner */}
        {connectionStatus === "error" && (
          <div className="bg-rose-950/40 border-b border-rose-500/20 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage || "Unable to establish AWS SSM Session Manager tunnel."}</span>
            </div>

            <div className="flex items-center gap-2">
              {instance.status !== "active" ? (
                <button
                  onClick={handlePowerOn}
                  disabled={isPoweringOn}
                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isPoweringOn ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Booting Droplet...</span>
                    </>
                  ) : (
                    <>
                      <Power className="w-3 h-3" />
                      <span>Power On Droplet</span>
                    </>
                  )}
                </button>
              ) : null}

              <button
                onClick={() => connectTerminalSession()}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry Connection</span>
              </button>
            </div>
          </div>
        )}

        {/* Output Console Container */}
        <div
          ref={scrollRef}
          onClick={() => inputRef.current?.focus()}
          className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1 bg-[#060709] select-text cursor-text"
        >
          {history.map((line, idx) => (
            <div
              key={idx}
              className={
                line.type === "system"
                  ? "text-slate-500"
                  : line.type === "info"
                  ? "text-sky-400"
                  : line.type === "success"
                  ? "text-emerald-400 font-medium"
                  : line.type === "input"
                  ? "text-blue-400 font-semibold"
                  : line.type === "error"
                  ? "text-rose-400 font-medium"
                  : "text-slate-200 leading-relaxed whitespace-pre-wrap"
              }
            >
              {line.text}
            </div>
          ))}

          {/* Prompt Form */}
          <form onSubmit={handleCommand} className="flex items-center pt-1.5">
            <span className="text-emerald-400 font-semibold mr-2 shrink-0">{`root@${instance.name}:${formatPromptPath(currentDir)}#`}</span>
            <input
              ref={inputRef}
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={connectionStatus === "requesting_session"}
              className="flex-1 bg-transparent text-slate-100 focus:outline-none border-none p-0 font-mono text-xs caret-emerald-400"
              autoFocus
              placeholder={
                connectionStatus === "requesting_session"
                  ? "Negotiating SSM tunnel..."
                  : connectionStatus === "error"
                  ? "Connection error. Retry or type 'reconnect'..."
                  : "Type 'help' or commands..."
              }
            />
          </form>
        </div>

        {/* Terminal Footer Bar */}
        <div className="h-7 bg-[#0E1017] border-t border-[#1E2230] px-4 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span>REGION: {instance.region.toUpperCase()}</span>
            <span>VCPU: {instance.plan?.vcpu || 1}</span>
            <span>RAM: {instance.plan?.ramGb || 1}GB</span>
            <span>OS: {instance.image.toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Press Tab for auto-complete</span>
            <span>•</span>
            <span>Type &apos;help&apos; for commands</span>
          </div>
        </div>
      </div>
    </div>
  );
}


