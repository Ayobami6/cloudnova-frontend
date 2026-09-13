import { apiRequest } from "./http";
import type {
  AttachVolumeRequest,
  BucketResponse,
  CreateBucketRequest,
  CreateVolumeRequest,
  PresignBucketRequest,
  PresignedUrlResponse,
  ResizeVolumeRequest,
  VolumeResponse,
} from "./types";

export async function listVolumes(): Promise<VolumeResponse[]> {
  return apiRequest<VolumeResponse[]>("/storage/volumes");
}

export async function getVolume(id: string): Promise<VolumeResponse> {
  return apiRequest<VolumeResponse>(`/storage/volumes/${id}`);
}

export async function createVolume(payload: CreateVolumeRequest): Promise<VolumeResponse> {
  return apiRequest<VolumeResponse>("/storage/volumes", {
    method: "POST",
    body: payload,
  });
}

export async function attachVolume(id: string, instanceId: string): Promise<VolumeResponse> {
  const payload: AttachVolumeRequest = { instance_id: instanceId };
  return apiRequest<VolumeResponse>(`/storage/volumes/${id}/attach`, {
    method: "POST",
    body: payload,
  });
}

export async function detachVolume(id: string): Promise<VolumeResponse> {
  return apiRequest<VolumeResponse>(`/storage/volumes/${id}/detach`, {
    method: "POST",
  });
}

export async function resizeVolume(id: string, sizeGb: number): Promise<VolumeResponse> {
  const payload: ResizeVolumeRequest = { size_gb: sizeGb };
  return apiRequest<VolumeResponse>(`/storage/volumes/${id}/resize`, {
    method: "POST",
    body: payload,
  });
}

export async function destroyVolume(id: string): Promise<void> {
  return apiRequest<void>(`/storage/volumes/${id}`, {
    method: "DELETE",
  });
}

export async function listBuckets(): Promise<BucketResponse[]> {
  return apiRequest<BucketResponse[]>("/storage/buckets");
}

export async function getBucket(id: string): Promise<BucketResponse> {
  return apiRequest<BucketResponse>(`/storage/buckets/${id}`);
}

export async function createBucket(payload: CreateBucketRequest): Promise<BucketResponse> {
  return apiRequest<BucketResponse>("/storage/buckets", {
    method: "POST",
    body: payload,
  });
}

export async function destroyBucket(id: string): Promise<void> {
  return apiRequest<void>(`/storage/buckets/${id}`, {
    method: "DELETE",
  });
}

export async function presignBucket(
  id: string,
  payload: PresignBucketRequest
): Promise<PresignedUrlResponse> {
  return apiRequest<PresignedUrlResponse>(`/storage/buckets/${id}/presign`, {
    method: "POST",
    body: payload,
  });
}
