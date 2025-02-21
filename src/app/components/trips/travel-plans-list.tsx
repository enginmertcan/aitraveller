"use client";

import { useState } from "react";
import { TabPanelProps } from "@/app/types/TabPanelProps";
import { Box, Card, CardContent, Tab, Tabs } from "@mui/material";

import { TravelPlan } from "../../types/travel";
import { HotelList } from "./hotel-list";
import { ItineraryView } from "./itinerary-view";
import { TravelOverview } from "./travel-overview";

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface TravelPlansListProps {
  plans: TravelPlan[];
}

export function TravelPlansList({ plans }: TravelPlansListProps) {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {plans.map(plan => (
        <Card key={plan.id}>
          <CardContent>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
              <Tabs value={selectedTab} onChange={handleTabChange}>
                <Tab label="Overview" />
                <Tab label="Hotels" />
                <Tab label="Itinerary" />
              </Tabs>
            </Box>

            <TabPanel value={selectedTab} index={0}>
              <TravelOverview plan={plan} />
            </TabPanel>

            <TabPanel value={selectedTab} index={1}>
              <HotelList hotels={plan.hotelOptions} />
            </TabPanel>

            <TabPanel value={selectedTab} index={2}>
              <ItineraryView itinerary={plan.itinerary} />
            </TabPanel>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
