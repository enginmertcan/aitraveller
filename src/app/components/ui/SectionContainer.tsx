"use client";

import React, { ReactNode } from "react";
import { Box, Paper, PaperProps, SxProps, Theme, Typography } from "@mui/material";

import { useThemeContext } from "../../context/ThemeContext";
import { borderRadius, colors, shadows } from "../ThemeRegistry/theme";

interface SectionContainerProps extends Omit<PaperProps, "children"> {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  iconBackground?: string;
  headerDivider?: boolean;
  children: ReactNode;
  contentSx?: SxProps<Theme>;
  headerSx?: SxProps<Theme>;
  decorativeElement?: boolean;
}

export const SectionContainer = ({
  title,
  subtitle,
  icon,
  iconBackground,
  headerDivider = true,
  children,
  contentSx,
  headerSx,
  decorativeElement = true,
  sx,
  ...rest
}: SectionContainerProps) => {
  const { isDarkMode } = useThemeContext();

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        mt: 4,
        background: isDarkMode ? colors.dark.section : colors.light.section,
        backdropFilter: "blur(10px)",
        borderRadius: borderRadius.lg,
        border: `1px solid ${isDarkMode ? colors.dark.border : colors.light.border}`,
        overflow: "hidden",
        position: "relative",
        ...sx,
      }}
      {...rest}
    >
      {/* Decorative element */}
      {decorativeElement && (
        <Box
          sx={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(124, 58, 237, 0.05))",
            filter: "blur(60px)",
            zIndex: 0,
            opacity: isDarkMode ? 0.3 : 0.5,
          }}
        />
      )}

      {/* Section Header */}
      {(title || icon) && (
        <Box
          sx={{
            mb: 4,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: 2,
            justifyContent: "space-between",
            borderBottom: headerDivider
              ? `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`
              : "none",
            pb: headerDivider ? 3 : 0,
            position: "relative",
            zIndex: 1,
            ...headerSx,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {icon && (
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: iconBackground || colors.gradients.primary,
                  boxShadow: isDarkMode ? shadows.dark.md : shadows.md,
                }}
              >
                {icon}
              </Box>
            )}

            <Box>
              {title && (
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                    background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
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
        </Box>
      )}

      {/* Section Content */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          ...contentSx,
        }}
      >
        {children}
      </Box>
    </Paper>
  );
};
