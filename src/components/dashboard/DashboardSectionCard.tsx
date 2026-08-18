import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

interface Props {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const DashboardSectionCard: React.FC<Props> = ({ title, subtitle, children }) => {
  return (
    <Card elevation={1} sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {subtitle}
          </Typography>
        )}
        {children}
      </CardContent>
    </Card>
  );
};

export default DashboardSectionCard;
