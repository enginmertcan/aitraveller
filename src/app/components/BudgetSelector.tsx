"use client";

import React from "react";
import { Card, CardContent, Grid, Typography } from "@mui/material";
import { Crown, DollarSign, Wallet } from "lucide-react";

const budgetOptions = [
  {
    title: "Ekonomik",
    description: "Bütçe dostu seyahat",
    icon: <Wallet style={{ color: "#2e7d32" }} />,
    value: "cheap",
  },
  {
    title: "Standart",
    description: "Dengeli harcama",
    icon: <DollarSign style={{ color: "#ed6c02" }} />,
    value: "moderate",
  },
  {
    title: "Lüks",
    description: "Premium deneyim",
    icon: <Crown style={{ color: "#1976d2" }} />,
    value: "luxury",
  },
];

interface BudgetSelectorProps {
  selectedBudget: string | null;
  onBudgetSelect: (budget: number) => void;
  error?: string;
}

export const BudgetSelector: React.FC<BudgetSelectorProps> = ({ selectedBudget, onBudgetSelect, error }) => (
  <div>
    <Typography variant="h6" sx={{ mb: 3 }}>
      Bütçeniz Nedir?
    </Typography>
    {error && (
      <Typography color="error" sx={{ mb: 2 }}>
        {error}
      </Typography>
    )}
    <Grid container spacing={3}>
      {budgetOptions.map(option => (
        <Grid item xs={12} md={4} key={option.value}>
          <Card
            onClick={() => onBudgetSelect(option)}
            sx={{
              cursor: "pointer",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.02)",
              },
              border: selectedBudget === option.value ? 2 : 0,
              borderColor: "primary.main",
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              {option.icon}
              <Typography variant="h6" sx={{ mt: 2 }}>
                {option.title}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {option.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </div>
);
