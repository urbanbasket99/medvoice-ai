import {

  Alert,

  Box,

  Button,

  Card,

  CardContent,

  Chip,

  CircularProgress,

  Divider,

  Stack,

  Table,

  TableBody,

  TableCell,

  TableHead,

  TableRow,

  Typography,

} from "@mui/material";

import PrintRoundedIcon from "@mui/icons-material/PrintRounded";



import { useRadiologyOrderPrint } from "../hooks/useRadiologyOrder";

import {

  formatDisplayDate,

  PRIORITY_LABELS,

  IMAGING_CATEGORY_LABELS,

  STATUS_LABELS,

} from "../utils/radiologyUtils";

import type { ImagingCategory } from "../types/radiology.types";



export interface ImagingRequestPrintProps {

  radiologyOrderId: string;

}



const ImagingRequestPrint = ({ radiologyOrderId }: ImagingRequestPrintProps) => {

  const printQuery = useRadiologyOrderPrint(radiologyOrderId);



  const handlePrint = () => {

    window.print();

  };



  if (printQuery.isLoading) {

    return (

      <Stack spacing={2} sx={{ alignItems: "center", py: 4 }}>

        <CircularProgress size={32} />

        <Typography variant="body2" color="text.secondary">

          Loading imaging request preview…

        </Typography>

      </Stack>

    );

  }



  if (printQuery.isError || !printQuery.data) {

    return (

      <Alert

        severity="error"

        action={

          <Button color="inherit" size="small" onClick={() => void printQuery.refetch()}>

            Retry

          </Button>

        }

      >

        Could not load imaging request preview.

      </Alert>

    );

  }



  const data = printQuery.data;



  return (

    <Stack spacing={2}>

      <Stack direction="row" spacing={1.5} className="no-print" sx={{ flexWrap: "wrap" }}>

        <Button variant="contained" startIcon={<PrintRoundedIcon />} onClick={handlePrint}>

          Print Imaging Request

        </Button>

      </Stack>



      <Card variant="outlined" id="radiology-imaging-request-print-area" sx={{ "@media print": { boxShadow: "none", border: 0 } }}>

        <CardContent>

          <Stack spacing={3}>

            <Stack spacing={0.5} sx={{ alignItems: "center", textAlign: "center" }}>

              <Typography variant="h6" sx={{ fontWeight: 700 }}>

                Imaging Request

              </Typography>

              <Typography variant="body2" color="text.secondary">

                Order {data.orderNumber} • Visit {data.consultationVisitNumber ?? "—"} •{" "}

                {formatDisplayDate(data.createdAt.slice(0, 10))}

              </Typography>

            </Stack>



            <Stack direction="row" spacing={1} sx={{ justifyContent: "center", flexWrap: "wrap" }}>

              <Chip size="small" label={PRIORITY_LABELS[data.priority as keyof typeof PRIORITY_LABELS] ?? data.priority} />

              <Chip size="small" label={STATUS_LABELS[data.status as keyof typeof STATUS_LABELS] ?? data.status} />

            </Stack>



            <Box

              sx={{

                display: "grid",

                gap: 2,

                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },

              }}

            >

              <Box>

                <Typography variant="overline" color="text.secondary">

                  Patient

                </Typography>

                <Typography variant="body1" sx={{ fontWeight: 600 }}>

                  {data.patientName ?? "—"}

                </Typography>

                <Typography variant="body2" color="text.secondary">

                  MRN: {data.patientMrn ?? "—"} • UHID: {data.patientUhid ?? "—"}

                </Typography>

                <Typography variant="body2" color="text.secondary">

                  {data.patientGender ?? "—"}

                  {data.patientDateOfBirth ? ` • DOB ${formatDisplayDate(data.patientDateOfBirth)}` : ""}

                </Typography>

              </Box>

              <Box>

                <Typography variant="overline" color="text.secondary">

                  Ordering Doctor

                </Typography>

                <Typography variant="body1" sx={{ fontWeight: 600 }}>

                  {data.doctorName ?? "—"}

                </Typography>

                <Typography variant="body2" color="text.secondary">

                  {data.doctorCode ?? "—"}

                  {data.doctorSpecialization ? ` • ${data.doctorSpecialization}` : ""}

                </Typography>

              </Box>

            </Box>



            {data.clinicalNotes && (

              <Box>

                <Typography variant="overline" color="text.secondary">

                  Clinical Notes

                </Typography>

                <Typography variant="body2">{data.clinicalNotes}</Typography>

              </Box>

            )}



            <Divider />



            <Table size="small">

              <TableHead>

                <TableRow>

                  <TableCell>#</TableCell>

                  <TableCell>Test</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Body Part</TableCell>
                  <TableCell>Contrast</TableCell>
                  <TableCell>Instructions</TableCell>

                </TableRow>

              </TableHead>

              <TableBody>

                {data.items.map((item, index) => (

                  <TableRow key={`${item.testName}-${index}`}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.testName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {IMAGING_CATEGORY_LABELS[item.category as ImagingCategory] ?? item.category}
                    </TableCell>
                    <TableCell>{item.bodyPart}</TableCell>
                    <TableCell>{item.contrastRequired ? "Yes" : "No"}</TableCell>
                    <TableCell>{item.instructions ?? "—"}</TableCell>
                  </TableRow>

                ))}

              </TableBody>

            </Table>

          </Stack>

        </CardContent>

      </Card>

    </Stack>

  );

};



export default ImagingRequestPrint;

