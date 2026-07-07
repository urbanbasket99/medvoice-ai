import {
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { Controller, useFormContext } from "react-hook-form";

import type { LabOrderFormValues } from "../schemas/laboratorySchema";
import { SAMPLE_TYPE_LABELS } from "../utils/laboratoryUtils";
import { SAMPLE_TYPE_OPTIONS } from "../schemas/laboratorySchema";

export interface SelectedTestsGridProps {
  onRemove: (index: number) => void;
  disabled?: boolean;
}

const SelectedTestsGrid = ({ onRemove, disabled = false }: SelectedTestsGridProps) => {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<LabOrderFormValues>();

  const items = watch("items");

  if (items.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No tests selected. Search and add lab tests above.
      </Typography>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Test</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Sample Type</TableCell>
            <TableCell>Instructions</TableCell>
            {!disabled && <TableCell align="right">Remove</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={`${item.labTestName}-${index}`}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.labTestName}
                </Typography>
                {errors.items?.[index]?.labTestName && (
                  <Typography variant="caption" color="error">
                    {errors.items[index]?.labTestName?.message}
                  </Typography>
                )}
              </TableCell>
              <TableCell>{item.category || "—"}</TableCell>
              <TableCell>
                {disabled ? (
                  SAMPLE_TYPE_LABELS[item.sampleType] ?? item.sampleType
                ) : (
                  <Controller
                    name={`items.${index}.sampleType`}
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} select size="small" sx={{ minWidth: 120 }}>
                        {SAMPLE_TYPE_OPTIONS.map((option) => (
                          <MenuItem key={option} value={option}>
                            {SAMPLE_TYPE_LABELS[option]}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                )}
              </TableCell>
              <TableCell>
                {disabled ? (
                  item.instructions || "—"
                ) : (
                  <Controller
                    name={`items.${index}.instructions`}
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} size="small" placeholder="Optional instructions" fullWidth />
                    )}
                  />
                )}
              </TableCell>
              {!disabled && (
                <TableCell align="right">
                  <IconButton size="small" color="error" onClick={() => onRemove(index)} aria-label="Remove test">
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SelectedTestsGrid;
