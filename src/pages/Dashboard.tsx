import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
} from "@mui/material";
const Dashboard = () => {
  return (
    <Box sx={{ p: 4 }}>

      <Typography
        variant="h3"
        fontWeight="bold"
        gutterBottom
      >
        🏥 MedVoice AI
      </Typography>

      <Typography color="text.secondary" mb={4}>
        Welcome Doctor
      </Typography>
<Stack
  direction={{ xs: "column", md: "row" }}
  spacing={3}
>
  {[
    ["Today's Patients", "18"],
    ["Appointments", "12"],
    ["Completed", "9"],
    ["Pending", "3"],
  ].map(([title, value]) => (

    <Card
      key={title}
      elevation={4}
      sx={{
        flex: 1,
        borderRadius: 3,
      }}
    >
      <CardContent>

        <Typography color="text.secondary">
          {title}
        </Typography>

        <Typography
          variant="h3"
          fontWeight="bold"
        >
          {value}
        </Typography>

      </CardContent>
    </Card>

  ))}
</Stack>

      <Card
        sx={{
          mt: 5,
          p: 4,
        }}
      >

        <Typography
          variant="h5"
          gutterBottom
        >
          Quick Actions
        </Typography>

        <Button
          variant="contained"
          size="large"
          sx={{ mr: 2 }}
        >
          ➕ New Consultation
        </Button>

        <Button
          variant="outlined"
          size="large"
          sx={{ mr: 2 }}
        >
          🔍 Search Patient
        </Button>

        <Button
          variant="outlined"
          size="large"
        >
          📋 Today's Visits
        </Button>

      </Card>

    </Box>
  );
};

export default Dashboard;