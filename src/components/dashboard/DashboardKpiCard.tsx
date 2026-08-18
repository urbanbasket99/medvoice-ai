import React from 'react';
import { Box, Card, Typography, Avatar, useTheme } from '@mui/material';

interface Props {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  subtitle?: string;
}

const DashboardKpiCard: React.FC<Props> = ({ label, value, icon, subtitle }) => {
  const theme = useTheme();

  return (
    <Card
      elevation={1}
      sx={{
        borderRadius: 2,
        minHeight: 120,
        display: 'flex',
        alignItems: 'center',
        p: 2,
        transition: 'transform 200ms ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.customShadows?.z8 || theme.shadows?.[4],
        },
      }}
    >
      <Avatar sx={{ bgcolor: theme.palette.primary.light, mr: 2 }}>{icon}</Avatar>

      <Box>
        <Typography variant="h6" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={700}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Card>
  );
};

export default DashboardKpiCard;
