import { AppBar, Toolbar, Typography } from "@mui/material";

const Header = () => {
  return (
    <AppBar position="static">

      <Toolbar>

        <Typography variant="h5" fontWeight="bold">

          🏥 MedVoice AI

        </Typography>

      </Toolbar>

    </AppBar>
  );
};

export default Header;