import { useQuery } from "@tanstack/react-query";

import {
  certificateDetailQueryOptions,
  certificatePrintQueryOptions,
  certificatesListQueryOptions,
} from "../api/certificatesQueries";
import type { CertificateListParams } from "../types/certificate.types";

export const useCertificates = (params: CertificateListParams) =>
  useQuery(certificatesListQueryOptions(params));

export const useCertificate = (id: string | undefined) => useQuery(certificateDetailQueryOptions(id));

export const useCertificatePrint = (id: string | undefined) => useQuery(certificatePrintQueryOptions(id));
