"use client";

import React from "react";
import { GitHub, LinkedIn } from "@mui/icons-material";
import { Box, Container, IconButton, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledFooter = styled(Box)({
  background: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 -4px 30px rgba(0, 0, 0, 0.1)",
  borderTop: "1px solid rgba(255, 255, 255, 0.3)",
  color: "#1976d2",
  transition: "all 0.3s ease",
  position: "fixed",
  bottom: 0,
  width: "100%",
  "& .MuiContainer-root": {
    minHeight: "70px",
  },
});

const FooterText = styled(Typography)({
  fontSize: "1rem",
  fontWeight: 600,
  textAlign: "center",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
  },
});

const Footer = (): React.ReactElement => (
  <StyledFooter>
    <Container maxWidth="xl">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 2 }}>
        <FooterText>© 2023 AI Traveller. All rights reserved.</FooterText>
        <Stack direction="row" spacing={1}>
          <IconButton color="primary" href="https://github.com/enginmertcan" target="_blank" aria-label="GitHub">
            <GitHub />
          </IconButton>
          <IconButton
            color="primary"
            href="https://www.linkedin.com/in/mertcanenginn54/"
            target="_blank"
            aria-label="LinkedIn"
          >
            <LinkedIn />
          </IconButton>
        </Stack>
      </Stack>
    </Container>
  </StyledFooter>
);

export default Footer;
