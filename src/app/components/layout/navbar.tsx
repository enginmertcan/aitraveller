"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SignOutButton, UserButton, useUser } from "@clerk/nextjs";
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  Tooltip,
  Divider
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  X as CloseIcon,
  Menu as MenuIcon,
  Sun,
  Moon,
  Map,
  PlusCircle,
  Plane,
  Star
} from "lucide-react";
import { useThemeContext } from '../../context/ThemeContext';
import { colors, borderRadius, shadows } from '../ThemeRegistry/theme';

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
  borderRadius: borderRadius.md,
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
  fontWeight: 800,
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

const LogoIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '12px',
  color: theme.palette.mode === 'dark' ? '#93c5fd' : '#2563eb',
  transition: 'all 0.3s ease',
}));

const ThemeToggleButton = styled(IconButton)(({ theme }) => ({
  padding: "8px",
  borderRadius: borderRadius.md,
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

const ActiveNavIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: -2,
  left: '50%',
  transform: 'translateX(-50%)',
  height: 3,
  width: '50%',
  borderRadius: '2px',
  background: theme.palette.mode === 'dark'
    ? "linear-gradient(45deg, #93c5fd, #a78bfa)"
    : "linear-gradient(45deg, #2563eb, #7c3aed)",
}));

const Navbar = (): React.ReactElement => {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useThemeContext();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  if (!isSignedIn) {
    return <></>;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: "Gezi Oluştur", path: "/", icon: <PlusCircle size={18} /> },
    { label: "Gezilerim", path: "/my-trips", icon: <Map size={18} /> },
    { label: "Önerilen Seyahatler", path: "/recommended-trips", icon: <Star size={18} /> },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  const navContent = (
    <>
      {navItems.map(item => (
        <NavButton
          key={item.path}
          variant="text"
          color={isActive(item.path) ? "primary" : "inherit"}
          onClick={() => {
            router.push(item.path);
            setMobileOpen(false);
          }}
          sx={{
            mx: { xs: 0, md: 1 },
            my: { xs: 1, md: 0 },
            width: { xs: "100%", md: "auto" },
            position: 'relative',
            fontWeight: isActive(item.path) ? 700 : 600,
            color: isActive(item.path)
              ? (isDarkMode ? colors.primary.light : colors.primary.main)
              : 'inherit',
          }}
          startIcon={item.icon}
        >
          {item.label}
          {isActive(item.path) && <ActiveNavIndicator sx={{ display: { xs: 'none', md: 'block' } }} />}
        </NavButton>
      ))}

      <ThemeToggleButton
        onClick={toggleTheme}
        color="primary"
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
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
              avatarBox: {
                width: "40px",
                height: "40px",
                borderRadius: "12px",
              },
            },
          }}
        />
      </Box>
    </>
  );

  return (
    <>
      <StyledAppBar
        elevation={scrolled ? 1 : 0}
        sx={{
          backgroundColor: isDarkMode
            ? (scrolled ? 'rgba(17, 24, 39, 0.95)' : 'rgba(17, 24, 39, 0.8)')
            : (scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)'),
          transition: 'all 0.3s ease',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: "space-between", px: { xs: 1, sm: 2 } }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': {
                  '& .logo-icon': {
                    transform: 'rotate(15deg)',
                  }
                }
              }}
              onClick={() => router.push("/")}
            >
              <LogoIcon className="logo-icon">
                <Plane size={28} />
              </LogoIcon>
              <LogoText>AI Traveller</LogoText>
            </Box>

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ display: { xs: "none", md: "flex" } }}
            >
              {navContent}
            </Stack>

            <IconButton
              color="primary"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                display: { md: "none" },
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                borderRadius: borderRadius.md,
                '&:hover': {
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                }
              }}
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
            width: 280,
            backgroundColor: isDarkMode
              ? "rgba(17, 24, 39, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderLeft: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          },
        }}
      >
        <Box sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          height: '100%',
          color: isDarkMode ? '#fff' : 'inherit',
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => {
                router.push("/");
                setMobileOpen(false);
              }}
            >
              <LogoIcon>
                <Plane size={24} />
              </LogoIcon>
              <LogoText sx={{ fontSize: '1.3rem' }}>AI Traveller</LogoText>
            </Box>
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                color: isDarkMode ? '#fff' : '#000',
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                '&:hover': {
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2, borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }} />

          <Box sx={{ display: "flex", flexDirection: "column", flex: 1, gap: 1 }}>
            {navItems.map(item => (
              <NavButton
                key={item.path}
                variant={isActive(item.path) ? "contained" : "text"}
                color={isActive(item.path) ? "primary" : "inherit"}
                onClick={() => {
                  router.push(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  py: 1.5,
                  justifyContent: 'flex-start',
                  backgroundColor: isActive(item.path)
                    ? (isDarkMode ? 'rgba(147, 197, 253, 0.15)' : 'rgba(37, 99, 235, 0.1)')
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive(item.path)
                      ? (isDarkMode ? 'rgba(147, 197, 253, 0.25)' : 'rgba(37, 99, 235, 0.15)')
                      : (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'),
                  }
                }}
                startIcon={item.icon}
              >
                {item.label}
              </NavButton>
            ))}
          </Box>

          <Divider sx={{ my: 2, borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ThemeToggleButton
              onClick={toggleTheme}
              color="primary"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
            </ThemeToggleButton>

            <UserButton
              appearance={{
                elements: {
                  rootBox: {
                    width: "40px",
                    height: "40px",
                  },
                  avatarBox: {
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                  },
                },
              }}
            />
          </Box>
        </Box>
      </Drawer>

      <Toolbar />
    </>
  );
};

export default Navbar;
