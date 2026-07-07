import { Box } from "@mui/material";
import type { FieldErrors } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import ConsultationClinicalForm from "./ConsultationClinicalForm";
import ConsultationPatientSummary from "./ConsultationPatientSummary";
import ConsultationStickySaveBar from "./ConsultationStickySaveBar";
import { consultationFormSchema, type ConsultationFormValues } from "../schemas/consultationSchema";
import { getFirstValidationMessage } from "../utils/validationUtils";
import type { Consultation } from "../types/consultation.types";

export interface ConsultationWorkspaceProps {
  consultation: Consultation;
  defaultValues: ConsultationFormValues;
  onSubmit: (values: ConsultationFormValues) => Promise<void> | void;
  onValidationError?: (message: string) => void;
  readOnly?: boolean;
  isSaving?: boolean;
  showSaveBar?: boolean;
  showStatusField?: boolean;
}

const ConsultationWorkspace = ({
  consultation,
  defaultValues,
  onSubmit,
  onValidationError,
  readOnly = false,
  isSaving = false,
  showSaveBar = true,
  showStatusField = true,
}: ConsultationWorkspaceProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationFormSchema),
    defaultValues,
  });

  const handleInvalid = (fieldErrors: FieldErrors<ConsultationFormValues>) => {
    onValidationError?.(getFirstValidationMessage(fieldErrors));
  };

  return (
    <Box component="form" noValidate onSubmit={(event) => void handleSubmit(onSubmit, handleInvalid)(event)}>
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", lg: "320px 1fr" },
          alignItems: "start",
          pb: showSaveBar ? 10 : 0,
        }}
      >
        <ConsultationPatientSummary consultation={consultation} />
        <ConsultationClinicalForm
          control={control}
          errors={errors}
          readOnly={readOnly}
          showStatusField={showStatusField && !readOnly}
        />
      </Box>
      {showSaveBar && !readOnly && <ConsultationStickySaveBar isSaving={isSaving} />}
    </Box>
  );
};

export default ConsultationWorkspace;
