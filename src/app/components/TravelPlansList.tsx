"use client";

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { MapPin, Calendar, Users, Wallet } from 'lucide-react';
import { TravelPlan } from '../types/TravelPlan';


interface TravelPlansListProps {
  plans: (TravelPlan & { id: string })[];
  onDeletePlan?: (planId: string) => void;
}

export default function TravelPlansList({ plans, onDeletePlan }: TravelPlansListProps) {
  if (!plans.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No travel plans found
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {plans.map((plan) => (
        <Grid item xs={12} key={plan.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MapPin size={20} />
                    {plan.destination}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Reservation ID: {plan.id}
                  </Typography>
                </Box>
                {onDeletePlan && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => onDeletePlan(plan.id)}
                  >
                    Cancel Reservation
                  </Button>
                )}
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Calendar size={16} />
                    <Typography variant="body2">
                      Start Date: {plan.startDate}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Users size={16} />
                    <Typography variant="body2">
                      {plan.groupType} • {plan.numberOfPeople}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Wallet size={16} />
                    <Typography variant="body2">
                      Budget: {plan.budget}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Accordion>
                <AccordionSummary>
                  <Typography>View Itinerary Details</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    {typeof plan.itinerary === 'string' 
                      ? plan.itinerary 
                      : JSON.stringify(plan.itinerary, null, 2)}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}