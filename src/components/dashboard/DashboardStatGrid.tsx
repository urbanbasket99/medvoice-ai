import React from 'react';
import { Grid } from '@mui/material';

interface Props {
  children: React.ReactNode;
}

const DashboardStatGrid: React.FC<Props> = ({ children }) => {
  return (
    <Grid container spacing={2}>
      {React.Children.map(children, (child, idx) => (
        <Grid item xs={12} sm={6} md={3} key={idx}>
          {child}
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardStatGrid;
