import { Box, Button, IconButton, MenuItem, Stack, TextField, Tooltip, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

import { BILLING_DEPARTMENT_LABELS, BILLING_DEPARTMENT_OPTIONS, computeLineTotal, defaultInvoiceItem } from "../utils/billingUtils";
import type { InvoiceFormValues } from "../schemas/billingSchema";

const InvoiceItemEditor = ({ readOnly = false }: { readOnly?: boolean }) => {
  const {
    register,
    control,
    formState: { errors },
    watch,
  } = useFormContext<InvoiceFormValues>();

  const { fields, append, remove } = useFieldArray<InvoiceFormValues, "items">({ name: "items", control });

  const itemsErrors = errors.items;

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="subtitle2">Line Items</Typography>
        {!readOnly && (
          <Button
            size="small"
            startIcon={<AddRoundedIcon />}
            onClick={() => append(defaultInvoiceItem(fields.length))}
          >
            Add Item
          </Button>
        )}
      </Stack>

      {fields.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No line items yet.{!readOnly && ' Click "Add Item" to begin.'}
        </Typography>
      )}

      {fields.map((field, index) => {
        const itemErrors = Array.isArray(itemsErrors) ? itemsErrors[index] : undefined;
        const unitPrice = watch(`items.${index}.unitPrice`);
        const quantity = watch(`items.${index}.quantity`);
        const discount = watch(`items.${index}.discountAmount`);
        const taxAmount = watch(`items.${index}.taxAmount`);
        const lineTotal = computeLineTotal(unitPrice, quantity, discount, taxAmount);

        return (
          <Box
            key={field.id}
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              position: "relative",
            }}
          >
            <Stack spacing={1.5}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Controller
                  name={`items.${index}.department`}
                  control={control}
                  render={({ field: deptField }) => (
                    <TextField
                      select
                      label="Department"
                      size="small"
                      sx={{ minWidth: 150 }}
                      disabled={readOnly}
                      value={deptField.value}
                      onChange={deptField.onChange}
                      onBlur={deptField.onBlur}
                      inputRef={deptField.ref}
                      error={Boolean(itemErrors?.department)}
                      helperText={itemErrors?.department?.message}
                    >
                      {BILLING_DEPARTMENT_OPTIONS.map((dept) => (
                        <MenuItem key={dept} value={dept}>
                          {BILLING_DEPARTMENT_LABELS[dept]}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <TextField
                  label="Service"
                  size="small"
                  fullWidth
                  disabled={readOnly}
                  {...register(`items.${index}.serviceName`)}
                  error={Boolean(itemErrors?.serviceName)}
                  helperText={itemErrors?.serviceName?.message}
                />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <TextField
                  label="Qty"
                  size="small"
                  type="number"
                  sx={{ width: 80 }}
                  disabled={readOnly}
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  error={Boolean(itemErrors?.quantity)}
                  helperText={itemErrors?.quantity?.message}
                />
                <TextField
                  label="Unit Price (₹)"
                  size="small"
                  sx={{ width: 130 }}
                  disabled={readOnly}
                  {...register(`items.${index}.unitPrice`)}
                  error={Boolean(itemErrors?.unitPrice)}
                  helperText={itemErrors?.unitPrice?.message}
                />
                <TextField
                  label="Discount (₹)"
                  size="small"
                  sx={{ width: 120 }}
                  disabled={readOnly}
                  {...register(`items.${index}.discountAmount`)}
                  error={Boolean(itemErrors?.discountAmount)}
                  helperText={itemErrors?.discountAmount?.message}
                />
                <TextField
                  label="Tax (₹)"
                  size="small"
                  sx={{ width: 90 }}
                  disabled={readOnly}
                  {...register(`items.${index}.taxAmount`)}
                  error={Boolean(itemErrors?.taxAmount)}
                  helperText={itemErrors?.taxAmount?.message}
                />
                <Box sx={{ display: "flex", alignItems: "center", pl: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                    = ₹{lineTotal.toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
            {!readOnly && (
              <Tooltip title="Remove item">
                <IconButton
                  size="small"
                  color="error"
                  sx={{ position: "absolute", top: 8, right: 8 }}
                  onClick={() => remove(index)}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      })}

      {typeof itemsErrors === "object" && !Array.isArray(itemsErrors) && (itemsErrors as { message?: string }).message && (
        <Typography variant="caption" color="error">
          {(itemsErrors as { message?: string }).message}
        </Typography>
      )}
    </Stack>
  );
};

export default InvoiceItemEditor;
