"use client";

import React from 'react';
import { Typography, Grid, Card, CardContent } from '@mui/material';
import { User, Users, UserPlus2, Tent } from 'lucide-react';

const companionOptions = [
  {
    title: "Tek Başına",
    description: "Özgür bir keşif deneyimi",
    icon: <User style={{ color: '#1976d2' }} />,
    value: "solo",
    people: "1 Kişi",
  },
  {
    title: "Çift",
    description: "Romantik bir kaçamak",
    icon: <Users style={{ color: '#e91e63' }} />,
    value: "couple",
    people: "2 Kişi",
  },
  {
    title: "Aile",
    description: "Unutulmaz aile macerası",
    icon: <UserPlus2 style={{ color: '#2e7d32' }} />,
    value: "family",
    people: "3-5 Kişi",
  },
  {
    title: "Arkadaşlar",
    description: "Eğlenceli grup seyahati",
    icon: <Tent style={{ color: '#ed6c02' }} />,
    value: "friends",
    people: "5-10 Kişi",
  },
];

interface CompanionSelectorProps {
  selectedCompanion: string | null;
  onCompanionSelect: (companion: any) => void;
  error?: string;
}

export const CompanionSelector: React.FC<CompanionSelectorProps> = ({
  selectedCompanion,
  onCompanionSelect,
  error,
}) => {
  return (
    <div>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Kimlerle Seyahat Edeceksiniz?
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <Grid container spacing={3}>
        {companionOptions.map((option) => (
          <Grid item xs={6} sm={3} key={option.value}>
            <Card
              onClick={() => onCompanionSelect(option)}
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
                border: selectedCompanion === option.value ? 2 : 0,
                borderColor: 'primary.main',
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                {option.icon}
                <Typography variant="h6" sx={{ mt: 2 }}>
                  {option.title}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {option.description}
                </Typography>
                <Typography color="primary" sx={{ mt: 1, fontWeight: 500 }}>
                  {option.people}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};