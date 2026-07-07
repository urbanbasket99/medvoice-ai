import {
  Checkbox,
  FormControlLabel,
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

import type { RadiologyOrderFormValues } from "../schemas/radiologySchema";
import { IMAGING_CATEGORY_LABELS } from "../utils/radiologyUtils";
import { IMAGING_CATEGORY_OPTIONS } from "../schemas/radiologySchema";

export interface SelectedTestsGridProps {
  onRemove: (index: number) => void;
  disabled?: boolean;
}

const SelectedTestsGrid = ({ onRemove, disabled = false }: SelectedTestsGridProps) => {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<RadiologyOrderFormValues>();

  const items = watch("items");

  if (items.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No tests selected. Search and add radiology tests above.
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
            <TableCell>Body Part</TableCell>
            <TableCell>Contrast</TableCell>
            <TableCell>Instructions</TableCell>
            {!disabled && <TableCell align="right">Remove</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={`${item.testName}-${index}`}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.testName}
                </Typography>
                {errors.items?.[index]?.testName && (
                  <Typography variant="caption" color="error">
                    {errors.items[index]?.testName?.message}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                {disabled ? (
                  IMAGING_CATEGORY_LABELS[item.category] ?? item.category
                ) : (
                  <Controller
                    name={`items.${index}.category`}
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} select size="small" sx={{ minWidth: 140 }}>
                        {IMAGING_CATEGORY_OPTIONS.map((option) => (
                          <MenuItem key={option} value={option}>
                            {IMAGING_CATEGORY_LABELS[option]}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                )}
              </TableCell>
              <TableCell>
                {disabled ? (
                  item.bodyPart || "—"
                ) : (
                  <Controller
                    name={`items.${index}.bodyPart`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        placeholder="Body part"
                        error={Boolean(errors.items?.[index]?.bodyPart)}
                        helperText={errors.items?.[index]?.bodyPart?.message}
                        sx={{ minWidth: 120 }}
                      />
                    )}
                  />
                )}
              </TableCell>
              <TableCell>
                {disabled ? (
                  item.contrastRequired ? "Yes" : "No"
                ) : (
                  <Controller
                    name={`items.${index}.contrastRequired`}
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={field.value}
                            onChange={(event) => field.onChange(event.target.checked)}
                          />
                        }
                        label=""
                        sx={{ m: 0 }}
                      />
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
