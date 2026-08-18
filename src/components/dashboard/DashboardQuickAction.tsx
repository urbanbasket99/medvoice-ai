import React from 'react';
import { Card, CardContent, Typography, Button, Stack } from '@mui/material';

interface Action {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

const DashboardQuickAction: React.FC<Action> = ({ label, onClick, disabled }) => {
  return (
    <Card elevation={1} sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1">{label}</Typography>
          <Button variant="contained" size="small" onClick={onClick} disabled={disabled}>
            {disabled ? 'Coming Soon' : 'Open'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default DashboardQuickAction;
