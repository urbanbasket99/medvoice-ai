import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { ipdApi } from "./ipdApi";
import type { AdmissionListParams, BedListParams, WardListParams } from "../types/ipd.types";

export const ipdQueryKeys = {
  all: ["ipd"] as const,
  wards: () => [...ipdQueryKeys.all, "wards"] as const,
  wardLists: () => [...ipdQueryKeys.wards(), "list"] as const,
  wardList: (params: WardListParams) => [...ipdQueryKeys.wardLists(), params] as const,
  beds: () => [...ipdQueryKeys.all, "beds"] as const,
  bedLists: () => [...ipdQueryKeys.beds(), "list"] as const,
  bedList: (params: BedListParams) => [...ipdQueryKeys.bedLists(), params] as const,
  availableBeds: (wardId?: string) => [...ipdQueryKeys.beds(), "available", wardId ?? "all"] as const,
  admissions: () => [...ipdQueryKeys.all, "admissions"] as const,
  admissionLists: () => [...ipdQueryKeys.admissions(), "list"] as const,
  admissionList: (params: AdmissionListParams) => [...ipdQueryKeys.admissionLists(), params] as const,
  admissionDetails: () => [...ipdQueryKeys.admissions(), "detail"] as const,
  admissionDetail: (id: string) => [...ipdQueryKeys.admissionDetails(), id] as const,
  nursingNotes: (admissionId: string) => [...ipdQueryKeys.admissions(), admissionId, "nursing-notes"] as const,
  otSchedules: (admissionId: string) => [...ipdQueryKeys.admissions(), admissionId, "ot-schedules"] as const,
  mlcCase: (admissionId: string) => [...ipdQueryKeys.admissions(), admissionId, "mlc"] as const,
  charges: (admissionId: string) => [...ipdQueryKeys.admissions(), admissionId, "charges"] as const,
};

export const wardsListQueryOptions = (params: WardListParams) =>
  queryOptions({
    queryKey: ipdQueryKeys.wardList(params),
    queryFn: () => ipdApi.listWards(params),
    placeholderData: keepPreviousData,
  });

export const bedsListQueryOptions = (params: BedListParams) =>
  queryOptions({
    queryKey: ipdQueryKeys.bedList(params),
    queryFn: () => ipdApi.listBeds(params),
    placeholderData: keepPreviousData,
  });

export const availableBedsQueryOptions = (wardId?: string) =>
  queryOptions({
    queryKey: ipdQueryKeys.availableBeds(wardId),
    queryFn: () => ipdApi.listAvailableBeds(wardId),
  });

export const admissionsListQueryOptions = (params: AdmissionListParams) =>
  queryOptions({
    queryKey: ipdQueryKeys.admissionList(params),
    queryFn: () => ipdApi.listAdmissions(params),
    placeholderData: keepPreviousData,
  });

export const admissionDetailQueryOptions = (id: string | undefined) =>
  queryOptions({
    queryKey: ipdQueryKeys.admissionDetail(id ?? "unknown"),
    queryFn: () => ipdApi.getAdmissionById(id as string),
    enabled: Boolean(id),
  });

export const nursingNotesQueryOptions = (admissionId: string | undefined) =>
  queryOptions({
    queryKey: ipdQueryKeys.nursingNotes(admissionId ?? "unknown"),
    queryFn: () => ipdApi.listNursingNotes(admissionId as string),
    enabled: Boolean(admissionId),
  });

export const otSchedulesQueryOptions = (admissionId: string | undefined) =>
  queryOptions({
    queryKey: ipdQueryKeys.otSchedules(admissionId ?? "unknown"),
    queryFn: () => ipdApi.listOtSchedules(admissionId as string),
    enabled: Boolean(admissionId),
  });

export const mlcCaseQueryOptions = (admissionId: string | undefined) =>
  queryOptions({
    queryKey: ipdQueryKeys.mlcCase(admissionId ?? "unknown"),
    queryFn: () => ipdApi.getMlcCase(admissionId as string),
    enabled: Boolean(admissionId),
  });

export const admissionChargesQueryOptions = (admissionId: string | undefined) =>
  queryOptions({
    queryKey: ipdQueryKeys.charges(admissionId ?? "unknown"),
    queryFn: () => ipdApi.listAdmissionCharges(admissionId as string),
    enabled: Boolean(admissionId),
  });
