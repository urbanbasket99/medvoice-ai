import { useState } from "react";
import { Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import CertificateForm from "../components/CertificateForm";
import { useCertificateMutations } from "../hooks/useCertificateMutations";
import { certificateFormDefaultValues } from "../schemas/certificateSchema";
import type { CertificateFormValues } from "../schemas/certificateSchema";
import { toCreatePayload } from "../utils/certificateUtils";

const CertificateCreatePage = () => {
  const navigate = useNavigate();
  const { create } = useCertificateMutations();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (values: CertificateFormValues) => {
    setServerError(null);
    try {
      const certificate = await create.mutateAsync(toCreatePayload(values));
      navigate(`/certificates/${certificate.id}`, {
        replace: true,
        state: { flashMessage: "Certificate created successfully." },
      });
    } catch (error) {
      setServerError(extractApiErrorMessage(error, "Could not create certificate."));
    }
  };

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          New Certificate
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Issue a medical certificate for a patient.
        </Typography>
      </div>

      <CertificateForm
        defaultValues={certificateFormDefaultValues()}
        onSubmit={handleSubmit}
        submitLabel="Create Certificate"
        isSubmitting={create.isPending}
        serverError={serverError}
      />
    </Stack>
  );
};

export default CertificateCreatePage;
