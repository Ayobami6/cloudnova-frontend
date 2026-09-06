"use client";

import React, { useState, useEffect, useRef } from "react";
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, ShieldCheck } from "lucide-react";
import { Instance } from "@/lib/types/cloud";

interface TerminalLine {
  text: string;
  type: "system" | "input" | "output" | "error";
}

export function TerminalModal({
  instance,
  onClose,
}: {
  instance: Instance | null;
  onClose: () => void;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [commandInput, setCommandInput] = useState("");
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (instance) {
      setHistory([
        { text: `Connecting to ${instance.name} (${instance.ipv4})...`, type: "system" },
        { text: `SSH-2.0-OpenSSH_9.6p1 Ubuntu-3ubuntu13`, type: "system" },
        { text: `Authenticated with ED25519 cloud-init host key. Session encrypted TLS 1.3.`, type: "system" },
        { text: `Welcome to ${instance.image.toUpperCase()} GNU/Linux 6.8.0-38-generic x86_64`, type: "output" },
        { text: ` * Documentation:  https://docs.cloudnova.io`, type: "output" },
        { text: ` * System load:    0.34, 0.28, 0.19    Uptime: ${Math.floor(instance.uptimeSeconds / 3600)} hours`, type: "output" },
        { text: ` * Memory usage:   ${instance.currentRamPercent}% of ${instance.plan.ramGb}GB`, type: "output" },
        { text: `Type 'help' or commands: 'htop', 'df -h', 'docker ps', 'uptime', 'clear'`, type: "output" },
      ]);
    }
  }, [instance]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  if (!instance) return null;

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd) return;

    const newHistory: TerminalLine[] = [
      ...history,
      { text: `root@${instance.name}:~# ${cmd}`, type: "input" },
    ];

    if (cmd === "clear") {
      setHistory([]);
      setCommandInput("");
      return;
    }

    if (cmd === "help") {
      newHistory.push({
        text: "Available commands: htop, df -h, docker ps, uptime, uname -a, ip a, clear",
        type: "output",
      });
    } else if (cmd === "htop") {
      newHistory.push(
        { text: `  CPU[|||||||||||||||||||||||||||         ${instance.currentCpu}%]   Tasks: 42, 1 thr; 1 running`, type: "output" },
        { text: `  Mem[||||||||||||||||||||                 ${instance.currentRamPercent}%]   Swp[|                    2%]`, type: "output" },
        { text: `  PID USER      PRI  NI  VIRT   RES   SHR S CPU% MEM%   TIME+  Command`, type: "output" },
        { text: `    1 root       20   0  168M 11.2M  8.4M S  0.0  1.4  0:02.14 /sbin/init`, type: "output" },
        { text: `  412 root       20   0  980M 84.1M 32.0M S  2.8 10.5  0:18.91 /usr/bin/dockerd`, type: "output" }
      );
    } else if (cmd === "df -h") {
      newHistory.push(
        { text: "Filesystem      Size  Used Avail Use% Mounted on", type: "output" },
        { text: `/dev/vda1       ${instance.plan.diskGb}G   14G   ${instance.plan.diskGb - 14}G  28% /`, type: "output" },
        { text: "tmpfs           1.6G  1.2M  1.6G   1% /run", type: "output" }
      );
    } else if (cmd === "docker ps") {
      newHistory.push(
        { text: "CONTAINER ID   IMAGE                 COMMAND                  CREATED        STATUS        PORTS", type: "output" },
        { text: "9a82bf01e32d   nginx:alpine          \"/docker-entrypoint.…\"   3 days ago     Up 3 days     0.0.0.0:80->80/tcp", type: "output" },
        { text: "f3c129e0811b   redis:7-alpine        \"docker-entrypoint.s…\"   2 weeks ago    Up 2 weeks    6379/tcp", type: "output" }
      );
    } else if (cmd === "uptime") {
      newHistory.push({
        text: ` 13:45:00 up ${Math.floor(instance.uptimeSeconds / 3600)} hours,  1 user,  load average: 0.24, 0.18, 0.12`,
        type: "output",
      });
    } else if (cmd === "uname -a") {
      newHistory.push({
        text: `Linux ${instance.name} 6.8.0-38-generic #38-Ubuntu SMP PREEMPT_DYNAMIC Thu May 23 15:46:40 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux`,
        type: "output",
      });
    } else {
      newHistory.push({
        text: `bash: ${cmd}: command not found. Type 'help' for examples.`,
        type: "error",
      });
    }

    setHistory(newHistory);
    setCommandInput("");
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`bg-[#0E1017] border border-[#232736] rounded-lg shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          isFullscreen ? "w-full h-full" : "w-full max-w-4xl h-[560px]"
        }`}
      >
        {/* Terminal Header */}
        <div className="h-10 bg-[#161922] border-b border-[#232736] px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-mono font-medium text-slate-200">
              root@{instance.name} ({instance.ipv4})
            </span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 ml-2">
              <ShieldCheck className="w-3 h-3" />
              TLS 1.3
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-white/[0.06]"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-white/[0.06]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Output Console */}
        <div
          ref={scrollRef}
          onClick={() => inputRef.current?.focus()}
          className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1 bg-[#090A0F]"
        >
          {history.map((line, idx) => (
            <div
              key={idx}
              className={
                line.type === "system"
                  ? "text-slate-500"
                  : line.type === "input"
                  ? "text-blue-400 font-semibold"
                  : line.type === "error"
                  ? "text-rose-400"
                  : "text-slate-300"
              }
            >
              {line.text}
            </div>
          ))}

          <form onSubmit={handleCommand} className="flex items-center pt-1">
            <span className="text-blue-400 font-semibold mr-2">{`root@${instance.name}:~#`}</span>
            <input
              ref={inputRef}
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              className="flex-1 bg-transparent text-slate-100 focus:outline-none border-none p-0 font-mono text-xs"
              autoFocus
            />
          </form>
        </div>
      </div>
    </div>
  );
}
