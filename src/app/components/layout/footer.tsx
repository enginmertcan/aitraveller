"use client";

import React from "react";
import { GitHub, LinkedIn, Copyright } from "@mui/icons-material";
import { Box, Container, IconButton, Stack, Typography, Link, Divider } from "@mui/material";
import { useThemeContext } from '../../context/ThemeContext';

export default function Footer() {
  const { isDarkMode } = useThemeContext();
  
  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        py: 2,
        zIndex: 1000,
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: isDarkMode ? '0 -4px 30px rgba(0, 0, 0, 0.3)' : '0 -4px 30px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Container maxWidth="lg" sx={{ height: '100%' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 2, sm: 3 }}
          alignItems="center"
          justifyContent="space-between"
          sx={{ height: '100%' }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography
              variant="body2"
              sx={{
                color: isDarkMode ? '#e5e7eb' : 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <Copyright fontSize="small" sx={{ color: isDarkMode ? '#e5e7eb' : 'text.secondary' }} />
              {new Date().getFullYear()}
              <Link
                href="/"
                sx={{
                  color: isDarkMode ? '#93c5fd' : '#2563eb',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                    color: isDarkMode ? '#60a5fa' : '#1d4ed8',
                  },
                  ml: 0.5,
                }}
              >
                AI Traveller
              </Link>
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <Link
              href="/privacy-policy"
              sx={{
                color: isDarkMode ? '#e5e7eb' : 'text.secondary',
                textDecoration: 'none',
                fontSize: '0.875rem',
                transition: 'color 0.2s ease',
                '&:hover': {
                  color: isDarkMode ? '#93c5fd' : '#2563eb',
                },
              }}
            >
              Gizlilik Politikası
            </Link>
            <Divider orientation="vertical" flexItem sx={{ 
              mx: 1,
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            }} />
            <Link
              href="/terms"
              sx={{
                color: isDarkMode ? '#e5e7eb' : 'text.secondary',
                textDecoration: 'none',
                fontSize: '0.875rem',
                transition: 'color 0.2s ease',
                '&:hover': {
                  color: isDarkMode ? '#93c5fd' : '#2563eb',
                },
              }}
            >
              Kullanım Koşulları
            </Link>
            <Divider orientation="vertical" flexItem sx={{ 
              mx: 1,
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            }} />
            <Link
              href="/contact"
              sx={{
                color: isDarkMode ? '#e5e7eb' : 'text.secondary',
                textDecoration: 'none',
                fontSize: '0.875rem',
                transition: 'color 0.2s ease',
                '&:hover': {
                  color: isDarkMode ? '#93c5fd' : '#2563eb',
                },
              }}
            >
              İletişim
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
