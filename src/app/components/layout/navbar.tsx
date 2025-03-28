"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SignOutButton, UserButton, useUser } from "@clerk/nextjs";
import { AppBar, Box, Button, Container, Drawer, IconButton, Stack, Toolbar, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { X as CloseIcon, Menu as MenuIcon, Sun, Moon } from "lucide-react";
import { useThemeContext } from '../../context/ThemeContext';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.mode === 'dark' 
    ? "rgba(17, 24, 39, 0.95)" 
    : "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
  boxShadow: theme.palette.mode === 'dark'
    ? "0 4px 30px rgba(0, 0, 0, 0.3)"
    : "0 4px 30px rgba(0, 0, 0, 0.1)",
  borderBottom: theme.palette.mode === 'dark'
    ? "1px solid rgba(255, 255, 255, 0.1)"
    : "1px solid rgba(0, 0, 0, 0.1)",
  color: theme.palette.text.primary,
  transition: "all 0.3s ease",
  position: "fixed",
  "& .MuiToolbar-root": {
    minHeight: "70px",
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  borderRadius: "12px",
  padding: "8px 20px",
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.95rem",
  transition: "all 0.3s ease",
  color: theme.palette.text.primary,
  "&:hover": {
    transform: "translateY(-2px)",
    backgroundColor: theme.palette.mode === 'dark' 
      ? "rgba(255, 255, 255, 0.1)" 
      : "rgba(0, 0, 0, 0.05)",
  },
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontSize: "1.5rem",
  fontWeight: 700,
  background: theme.palette.mode === 'dark'
    ? "linear-gradient(45deg, #93c5fd, #a78bfa)"
    : "linear-gradient(45deg, #2563eb, #7c3aed)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  cursor: "pointer",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
  },
}));

const ThemeToggleButton = styled(IconButton)(({ theme }) => ({
  padding: "8px",
  borderRadius: "12px",
  color: theme.palette.text.primary,
  background: theme.palette.mode === 'dark'
    ? "rgba(255, 255, 255, 0.05)"
    : "rgba(0, 0, 0, 0.05)",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    background: theme.palette.mode === 'dark'
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(0, 0, 0, 0.1)",
    transform: "translateY(-2px)",
  },
}));

const Navbar = (): React.ReactElement => {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useThemeContext();

  if (!isSignedIn) {
    return <></>;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: "Gezi Oluştur", path: "/" },
    { label: "Gezilerim", path: "/my-trips" },
  ];

  const navContent = (
    <>

      
      {navItems.map(item => (
        <NavButton
          key={item.path}
          variant="text"
          color="primary"
          onClick={() => {
            router.push(item.path);
            setMobileOpen(false);
          }}
          sx={{
            mx: { xs: 0, md: 1 },
            my: { xs: 1, md: 0 },
            width: { xs: "100%", md: "auto" },
          }}
        >
          {item.label}
        </NavButton>
      ))}

<ThemeToggleButton onClick={toggleTheme} color="primary">
        {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
      </ThemeToggleButton>
      <Box sx={{ ml: { xs: 0, md: 2 }, mt: { xs: 2, md: 0 } }}>
        <UserButton
          appearance={{
            elements: {
              rootBox: {
                width: "40px",
                height: "40px",
              },
            },
          }}
        />
      </Box>
    </>
  );

  return (
    <>
      <StyledAppBar>
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: "space-between", px: { xs: 1, sm: 2 } }}>
            <LogoText onClick={() => router.push("/")}>AI Traveller</LogoText>

            <Stack direction="row" spacing={2} alignItems="center" sx={{ display: { xs: "none", md: "flex" } }}>
              {navContent}
            </Stack>

            <IconButton
              color="primary"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { md: "none" } }}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Toolbar>
        </Container>
      </StyledAppBar>

      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 240,
            backgroundColor: isDarkMode 
              ? "rgba(17, 24, 39, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderLeft: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          },
        }}
      >
        <Box sx={{ 
          p: 2, 
          display: "flex", 
          flexDirection: "column",
          color: isDarkMode ? "#fff" : "inherit"
        }}>
          {navContent}
        </Box>
      </Drawer>

      <Toolbar />
    </>
  );
};

export default Navbar;
