"use client";

import React, { useState } from "react";
import {
  HardDrive,
  Database,
  Plus,
  Terminal,
  Trash2,
  Paperclip,
  Share2,
  Check,
  Copy,
  FolderUp,
  Server,
  FileCode,
  Globe,
  Sliders,
} from "lucide-react";
import { useCloud } from "@/lib/store/cloud-context";
import { REGIONS } from "@/lib/mock-data/initial-state";
import { Volume, S3Bucket } from "@/lib/types/cloud";

export default function StoragePage() {
  const {
    volumes,
    buckets,
    instances,
    createVolume,
    attachVolume,
    detachVolume,
    resizeVolume,
    destroyVolume,
    createBucket,
    uploadObject,
    deleteObject,
    destroyBucket,
    selectedRegion,
  } = useCloud();

  const [activeTab, setActiveTab] = useState<"volumes" | "s3">("volumes");

  // Volume modals & state
  const [isCreateVolumeOpen, setIsCreateVolumeOpen] = useState(false);
  const [volName, setVolName] = useState("vol-db-storage");
  const [volSize, setVolSize] = useState(250);
  const [volRegion, setVolRegion] = useState("nyc1");
  const [volFs, setVolFs] = useState<"ext4" | "xfs">("ext4");
  const [selectedVolForMount, setSelectedVolForMount] = useState<Volume | null>(null);

  // S3 modals & state
  const [selectedBucketId, setSelectedBucketId] = useState<string>(buckets[0]?.id || "");
  const [isCreateBucketOpen, setIsCreateBucketOpen] = useState(false);
  const [bucketName, setBucketName] = useState("app-media-store");
  const [bucketRegion, setBucketRegion] = useState("nyc1");
  const [bucketAcl, setBucketAcl] = useState<"public-read" | "private">("public-read");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [presignedUrlResult, setPresignedUrlResult] = useState<string | null>(null);

  const activeBucket = buckets.find((b) => b.id === selectedBucketId) || buckets[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleCreateVolumeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createVolume({
      name: volName,
      region: volRegion as any,
      sizeGb: volSize,
      iops: Math.min(15000, volSize * 15),
      attachedToInstanceId: null,
      filesystem: volFs,
      wholesaleMonthly: Number((volSize * 0.08).toFixed(2)),
      retailMonthly: Number((volSize * 0.12).toFixed(2)),
    });
    setIsCreateVolumeOpen(false);
  };

  const handleCreateBucketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBucket({
      name: bucketName.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      region: bucketRegion as any,
      acl: bucketAcl,
      storageClass: "STANDARD",
      cdnActive: true,
      wholesaleMonthly: 5.0,
      retailMonthly: 8.0,
      endpoint: `https://${bucketName}.s3.${bucketRegion}.cloudnova.io`,
    });
    setIsCreateBucketOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !activeBucket) return;
    const file = e.target.files[0];
    uploadObject(activeBucket.id, {
      key: `uploads/${file.name}`,
      sizeBytes: file.size,
      lastModified: new Date().toISOString().split("T")[0],
      contentType: file.type || "application/octet-stream",
    });
  };

  const handleGeneratePresignedUrl = (key: string) => {
    const url = `${activeBucket.endpoint}/${key}?X-Amz-Expires=86400&X-Amz-Signature=89c02e1f4...`;
    setPresignedUrlResult(url);
    handleCopy(url, key);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            Storage Fabric
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Elastic NVMe block storage volumes and S3-compatible Spaces with built-in CDN edge acceleration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Storage Sub-Tabs */}
          <div className="flex items-center rounded-md bg-[#161922] border border-[#232736] p-0.5 text-xs">
            <button
              onClick={() => setActiveTab("volumes")}
              className={`px-3 py-1.5 rounded-sm font-medium transition-colors ${
                activeTab === "volumes"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              NVMe Volumes ({volumes.length})
            </button>
            <button
              onClick={() => setActiveTab("s3")}
              className={`px-3 py-1.5 rounded-sm font-medium transition-colors ${
                activeTab === "s3"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              S3 Object Spaces ({buckets.length})
            </button>
          </div>

          {activeTab === "volumes" ? (
            <button
              onClick={() => setIsCreateVolumeOpen(true)}
              className="h-9 px-3.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create NVMe Volume</span>
            </button>
          ) : (
            <button
              onClick={() => setIsCreateBucketOpen(true)}
              className="h-9 px-3.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create S3 Bucket</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: NVMe Block Storage */}
      {activeTab === "volumes" && (
        <div className="rounded-lg bg-[#161922] border border-[#232736] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#11131A] text-slate-400 uppercase tracking-wider font-medium text-[11px] border-b border-[#232736]">
              <tr>
                <th className="py-2.5 px-4">Volume Name & Region</th>
                <th className="py-2.5 px-4">Capacity & IOPS</th>
                <th className="py-2.5 px-4">Attached Droplet</th>
                <th className="py-2.5 px-4">Filesystem</th>
                <th className="py-2.5 px-4">Retail Price (Margin)</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232736]">
              {volumes.map((vol) => {
                const attachedInst = instances.find((i) => i.id === vol.attachedToInstanceId);
                return (
                  <tr key={vol.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-200 block">{vol.name}</span>
                      <span className="text-[11px] font-mono text-slate-500 uppercase">{vol.region}</span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="text-slate-200 font-medium block">{vol.sizeGb} GB</span>
                      <span className="text-[11px] text-slate-500">{vol.iops.toLocaleString()} IOPS</span>
                    </td>
                    <td className="py-3 px-4">
                      {attachedInst ? (
                        <div className="flex items-center gap-1.5">
                          <Server className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-slate-200 font-medium">{attachedInst.name}</span>
                          <button
                            onClick={() => detachVolume(vol.id)}
                            className="text-[10px] text-rose-400 hover:text-rose-300 ml-2"
                          >
                            Detach
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 italic">Unattached</span>
                          <select
                            onChange={(e) => {
                              if (e.target.value) attachVolume(vol.id, e.target.value);
                            }}
                            className="h-6 px-2 rounded bg-[#11131A] border border-[#232736] text-[10px] text-slate-300"
                            defaultValue=""
                          >
                            <option value="" disabled>Attach to Droplet...</option>
                            {instances.map((i) => (
                              <option key={i.id} value={i.id}>{i.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{vol.filesystem}</td>
                    <td className="py-3 px-4 font-mono">
                      <span className="text-slate-200 font-semibold block">${vol.retailMonthly}/mo</span>
                      <span className="text-[10px] text-emerald-400">
                        +${(vol.retailMonthly - vol.wholesaleMonthly).toFixed(2)} profit
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedVolForMount(vol)}
                          className="h-7 px-2.5 rounded bg-[#1E2230] hover:bg-[#252B3D] border border-[#232736] text-[11px] text-slate-300 hover:text-white inline-flex items-center gap-1"
                        >
                          <Terminal className="w-3 h-3 text-slate-400" />
                          <span>Mount Cmds</span>
                        </button>
                        <button
                          onClick={() => resizeVolume(vol.id, vol.sizeGb + 100)}
                          className="h-7 px-2 rounded bg-[#1E2230] hover:bg-[#252B3D] border border-[#232736] text-[11px] text-slate-300 hover:text-white"
                          title="Expand size +100GB"
                        >
                          +100G
                        </button>
                        <button
                          onClick={() => destroyVolume(vol.id)}
                          className="h-7 w-7 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 flex items-center justify-center"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 2: S3 Object Storage */}
      {activeTab === "s3" && activeBucket && (
        <div className="space-y-6">
          {/* Bucket Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {buckets.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBucketId(b.id)}
                className={`p-4 rounded-lg text-left transition-colors border ${
                  activeBucket.id === b.id
                    ? "bg-[#161922] border-blue-500/50 shadow-sm"
                    : "bg-[#11131A] border-[#232736] hover:bg-[#161922] hover:border-[#33394D]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-200 block truncate">{b.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-600/10 text-blue-400 border border-blue-600/20">
                    CDN ACTIVE
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{(b.totalSizeBytes / 1e9).toFixed(2)} GB</span>
                  <span>{b.objectCount} objects</span>
                </div>
              </button>
            ))}
          </div>

          {/* Bucket Explorer Panel */}
          <div className="rounded-lg bg-[#161922] border border-[#232736] overflow-hidden">
            <div className="p-4 border-b border-[#232736] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#11131A]">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">{activeBucket.name}</h3>
                <span className="text-[11px] font-mono text-slate-500">{activeBucket.endpoint}</span>
              </div>

              <div className="flex items-center gap-2">
                <label className="h-8 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm">
                  <FolderUp className="w-3.5 h-3.5" />
                  <span>Upload Files</span>
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>
                <button
                  onClick={() => destroyBucket(activeBucket.id)}
                  className="h-8 w-8 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 flex items-center justify-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Presigned URL Alert */}
            {presignedUrlResult && (
              <div className="p-3 bg-blue-950/40 border-b border-blue-800/40 flex items-center justify-between text-xs">
                <span className="text-blue-300 truncate mr-2">Presigned 24h URL: {presignedUrlResult}</span>
                <span className="text-emerald-400 font-semibold shrink-0">Copied to Clipboard!</span>
              </div>
            )}

            {/* Object Table */}
            <table className="w-full text-left text-xs">
              <thead className="bg-[#11131A] text-slate-400 uppercase tracking-wider font-medium text-[11px] border-b border-[#232736]">
                <tr>
                  <th className="py-2.5 px-4">Key / Object Path</th>
                  <th className="py-2.5 px-4">Size</th>
                  <th className="py-2.5 px-4">Content-Type</th>
                  <th className="py-2.5 px-4">Uploaded</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232736]">
                {activeBucket.objects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-500">
                      Bucket is empty. Upload objects using the button above.
                    </td>
                  </tr>
                ) : (
                  activeBucket.objects.map((obj) => (
                    <tr key={obj.key} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-mono font-medium text-slate-200">{obj.key}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {(obj.sizeBytes / 1e6).toFixed(2)} MB
                      </td>
                      <td className="py-3 px-4 text-slate-400">{obj.contentType}</td>
                      <td className="py-3 px-4 text-slate-500">{obj.lastModified}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleGeneratePresignedUrl(obj.key)}
                            className="h-7 px-2.5 rounded bg-[#1E2230] hover:bg-[#252B3D] border border-[#232736] text-[11px] text-slate-300 hover:text-white inline-flex items-center gap-1"
                            title="Generate 24h Presigned Download Link"
                          >
                            <Share2 className="w-3 h-3 text-blue-400" />
                            <span>Presigned URL</span>
                          </button>
                          <button
                            onClick={() => deleteObject(activeBucket.id, obj.key)}
                            className="h-7 w-7 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 flex items-center justify-center"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Linux Mount Helper Modal */}
      {selectedVolForMount && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161922] border border-[#232736] rounded-lg shadow-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-100">Linux Mount Commands ({selectedVolForMount.name})</h3>
            <p className="text-xs text-slate-400">Run these commands inside your Droplet terminal to format and mount the volume.</p>
            <div className="p-3 bg-[#090A0F] border border-[#232736] rounded font-mono text-xs text-slate-300 space-y-1">
              <p className="text-slate-500"># 1. Format volume (first-time only)</p>
              <p>sudo mkfs.{selectedVolForMount.filesystem} -F /dev/disk/by-id/scsi-0DO_Volume_{selectedVolForMount.name}</p>
              <p className="text-slate-500 pt-2"># 2. Create mount point</p>
              <p>sudo mkdir -p /mnt/{selectedVolForMount.name}</p>
              <p className="text-slate-500 pt-2"># 3. Mount filesystem</p>
              <p>sudo mount -o discard,defaults /dev/disk/by-id/scsi-0DO_Volume_{selectedVolForMount.name} /mnt/{selectedVolForMount.name}</p>
              <p className="text-slate-500 pt-2"># 4. Auto-mount on reboot (/etc/fstab)</p>
              <p>echo &apos;/dev/disk/by-id/scsi-0DO_Volume_{selectedVolForMount.name} /mnt/{selectedVolForMount.name} {selectedVolForMount.filesystem} defaults,nofail,discard 0 2&apos; | sudo tee -a /etc/fstab</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedVolForMount(null)}
                className="h-8 px-4 rounded bg-blue-600 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Volume Modal */}
      {isCreateVolumeOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161922] border border-[#232736] rounded-lg shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-100">Create NVMe Block Volume</h3>
            <form onSubmit={handleCreateVolumeSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">Volume Name</label>
                <input
                  type="text"
                  value={volName}
                  onChange={(e) => setVolName(e.target.value)}
                  className="w-full h-9 px-3 rounded bg-[#11131A] border border-[#232736] text-xs font-mono text-slate-200"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">Capacity (GB): {volSize} GB</label>
                <input
                  type="range"
                  min={10}
                  max={2000}
                  step={10}
                  value={volSize}
                  onChange={(e) => setVolSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateVolumeOpen(false)}
                  className="h-8 px-3 rounded bg-[#1E2230] text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded bg-blue-600 text-white text-xs font-semibold"
                >
                  Provision Volume
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create S3 Bucket Modal */}
      {isCreateBucketOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161922] border border-[#232736] rounded-lg shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-100">Create S3-Compatible Bucket</h3>
            <form onSubmit={handleCreateBucketSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">Bucket Slug</label>
                <input
                  type="text"
                  value={bucketName}
                  onChange={(e) => setBucketName(e.target.value)}
                  className="w-full h-9 px-3 rounded bg-[#11131A] border border-[#232736] text-xs font-mono text-slate-200"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">Default ACL</label>
                <select
                  value={bucketAcl}
                  onChange={(e) => setBucketAcl(e.target.value as any)}
                  className="w-full h-9 px-3 rounded bg-[#11131A] border border-[#232736] text-xs text-slate-200"
                >
                  <option value="public-read">Public-Read (CDN Web Assets)</option>
                  <option value="private">Private (Vault Backups)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateBucketOpen(false)}
                  className="h-8 px-3 rounded bg-[#1E2230] text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded bg-blue-600 text-white text-xs font-semibold"
                >
                  Create Bucket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
