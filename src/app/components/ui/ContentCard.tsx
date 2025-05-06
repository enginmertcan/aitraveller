"use client";

import React, { ReactNode } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  CardProps, 
  SxProps, 
  Theme,
  Divider
} from '@mui/material';
import { useThemeContext } from '../../context/ThemeContext';
import { colors, borderRadius, shadows } from '../ThemeRegistry/theme';

interface ContentCardProps extends Omit<CardProps, 'children'> {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  iconBackground?: string;
  headerDivider?: boolean;
  children: ReactNode;
  contentSx?: SxProps<Theme>;
  headerSx?: SxProps<Theme>;
  gradient?: boolean;
  gradientColors?: string;
  elevation?: number;
  hoverEffect?: boolean;
}

export const ContentCard = ({
  title,
  subtitle,
  icon,
  iconBackground,
  headerDivider = true,
  children,
  contentSx,
  headerSx,
  gradient = false,
  gradientColors,
  elevation = 0,
  hoverEffect = true,
  sx,
  ...rest
}: ContentCardProps) => {
  const { isDarkMode } = useThemeContext();

  const defaultGradient = isDarkMode
    ? 'linear-gradient(45deg, rgba(147, 197, 253, 0.1), rgba(167, 139, 250, 0.1))'
    : 'linear-gradient(45deg, rgba(37, 99, 235, 0.05), rgba(124, 58, 237, 0.05))';

  return (
    <Card
      elevation={elevation}
      sx={{
        height: '100%',
        background: gradient 
          ? (gradientColors || defaultGradient)
          : (isDarkMode ? colors.dark.card : colors.light.card),
        backdropFilter: "blur(10px)",
        borderRadius: borderRadius.lg,
        border: `1px solid ${isDarkMode ? colors.dark.border : colors.light.border}`,
        overflow: 'hidden',
        transition: hoverEffect ? "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out" : undefined,
        "&:hover": hoverEffect ? {
          transform: "translateY(-8px)",
          boxShadow: isDarkMode ? shadows.dark.lg : shadows.lg,
        } : undefined,
        ...sx
      }}
      {...rest}
    >
      {(title || icon) && (
        <Box
          sx={{
            p: { xs: 2, md: 3 },
            display: "flex",
            alignItems: "center",
            gap: 2,
            ...headerSx
          }}
        >
          {icon && (
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: iconBackground || colors.gradients.primary,
                boxShadow: isDarkMode ? shadows.dark.md : shadows.md,
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          )}
          
          <Box>
            {title && (
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: isDarkMode ? colors.dark.text.primary : colors.light.text.primary,
                }}
              >
                {title}
              </Typography>
            )}
            
            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: isDarkMode ? colors.dark.text.muted : colors.light.text.muted,
                  mt: 0.5,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      )}
      
      {(title || icon) && headerDivider && (
        <Divider sx={{ 
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          mx: { xs: 2, md: 3 },
        }} />
      )}
      
      <CardContent sx={{ p: { xs: 2, md: 3 }, ...contentSx }}>
        {children}
      </CardContent>
    </Card>
  );
};
