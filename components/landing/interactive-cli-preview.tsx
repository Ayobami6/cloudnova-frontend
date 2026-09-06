"use client";

import React, { useState } from "react";
import { Terminal, Copy, Check, Code, Cpu } from "lucide-react";

export function InteractiveCliPreview() {
  const [activeTab, setActiveTab] = useState<"cli" | "terraform" | "curl">("cli");
  const [copied, setCopied] = useState(false);

  const snippets = {
    cli: `# 1. Install CloudNova CLI via Homebrew or curl
curl -fsSL https://get.cloudnova.io | sh

# 2. Authenticate CLI session
cloudnova auth login

# 3. Provision 8-core KVM compute node with NVMe in NYC
cloudnova droplet create \\
  --name api-gateway-01 \\
  --region nyc1 \\
  --image ubuntu-24-04 \\
  --plan g4.8core-32g \\
  --tags "production,api" \\
  --vpc default-vpc \\
  --monitoring

# Output: Droplet 'api-gateway-01' provisioned in 18.4s. IPv4: 198.51.100.42`,

    terraform: `terraform {
  required_providers {
    cloudnova = {
      source  = "cloudnova/cloudnova"
      version = "~> 2.4.0"
    }
  }
}

provider "cloudnova" {
  api_token = var.cloudnova_token
}

resource "cloudnova_droplet" "api_cluster" {
  count     = 3
  name      = "api-worker-\${count.index}"
  region    = "nyc1"
  image     = "ubuntu-24-04"
  plan      = "g4.4core-16g"
  vpc_id    = cloudnova_vpc.main.id
  tags      = ["production", "kubernetes"]

  monitoring = true
}`,

    curl: `# Instant droplet provisioning via REST API (TLS 1.3)
curl -X POST https://api.cloudnova.io/v2/droplets \\
  -H "Authorization: Bearer \${NOVA_API_TOKEN}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "prod-cache-01",
    "region": "fra1",
    "image": "debian-12",
    "plan_id": "plan-std-8g",
    "backups": true,
    "monitoring": true,
    "user_data": "#!/bin/bash\\napt-get update && apt-get install -y redis"
  }'`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="developers" className="py-20 border-t border-slate-200 dark:border-[#232736]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left Description */}
          <div className="lg:w-1/2 space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 text-xs font-mono border border-blue-200 dark:border-blue-500/20">
              <Code className="w-3.5 h-3.5" />
              <span>Developer-First Automation</span>
            </div>

            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              Everything as Code. Zero Console Lock-in.
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Every feature visible in the CloudNova console is 100% exposed via open REST APIs, official Terraform / OpenTofu providers, and a lightning-fast Rust CLI. Automate cluster provisioning, Anycast DNS zone propagation, and volume attachments into your GitHub Actions CI/CD workflows.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-white dark:bg-[#11131A] border border-slate-200 dark:border-[#232736]">
                <span className="font-semibold text-slate-900 dark:text-slate-100 block">Sub-20s Boot Times</span>
                <span className="text-slate-500 mt-0.5 block">KVM hardware microVMs boot cold to SSH prompt in under 20 seconds.</span>
              </div>
              <div className="p-3 rounded-lg bg-white dark:bg-[#11131A] border border-slate-200 dark:border-[#232736]">
                <span className="font-semibold text-slate-900 dark:text-slate-100 block">Cloud-Init Ready</span>
                <span className="text-slate-500 mt-0.5 block">Inject user data scripts, SSH authorized keys, and Nix flakes natively.</span>
              </div>
            </div>
          </div>

          {/* Right Interactive Terminal */}
          <div className="lg:w-1/2 w-full">
            <div className="rounded-xl bg-[#0B0D13] border border-[#232736] overflow-hidden shadow-2xl">
              {/* Terminal Titlebar */}
              <div className="h-11 bg-[#11131A] border-b border-[#232736] px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                  <span className="text-xs font-mono text-slate-400 ml-2">cloudnova-dx</span>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-[#090A0F] p-0.5 rounded-md border border-[#232736]">
                  <button
                    onClick={() => setActiveTab("cli")}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                      activeTab === "cli"
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    CLI
                  </button>
                  <button
                    onClick={() => setActiveTab("terraform")}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                      activeTab === "terraform"
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Terraform
                  </button>
                  <button
                    onClick={() => setActiveTab("curl")}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                      activeTab === "curl"
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    REST API
                  </button>
                </div>

                {/* Copy */}
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 transition-colors"
                  title="Copy snippet"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Code Area */}
              <div className="p-5 font-mono text-xs text-slate-300 overflow-x-auto min-h-[280px] bg-[#090A0F]">
                <pre className="whitespace-pre leading-relaxed">
                  <code>{snippets[activeTab]}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
