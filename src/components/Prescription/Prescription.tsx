import {
  Card,
  CardContent,
  Divider,
  Typography,
  List,
  ListItem,
} from "@mui/material";

const Prescription = () => {
  return (
    <Card
      elevation={4}
      sx={{
        mt: 4,
        borderRadius: 4,
      }}
    >
      <CardContent>

        <Typography
          variant="h5"
          fontWeight="bold"
          gutterBottom
        >
          AI Generated Prescription
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="h6">
          Chief Complaint
        </Typography>

        <List dense>
          <ListItem>• Fever for 2 days</ListItem>
          <ListItem>• Dry cough</ListItem>
        </List>

        <Typography variant="h6">
          History
        </Typography>

        <List dense>
          <ListItem>• No Diabetes</ListItem>
          <ListItem>• No Hypertension</ListItem>
        </List>

        <Typography variant="h6">
          Diagnosis
        </Typography>

        <Typography mb={2}>
          Viral Fever
        </Typography>

        <Typography variant="h6">
          Prescription
        </Typography>

        <List dense>
          <ListItem>
            • Paracetamol 650 mg
          </ListItem>

          <ListItem>
            • Cetirizine 10 mg
          </ListItem>
        </List>

        <Typography variant="h6">
          Advice
        </Typography>

        <Typography>
          Drink plenty of fluids.
          Take complete rest.
        </Typography>

      </CardContent>
    </Card>
  );
};

export default Prescription;