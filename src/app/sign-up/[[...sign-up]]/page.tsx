import React from "react";
import { SignUp } from "@clerk/nextjs";
import { Box, Container, Paper, Typography } from "@mui/material";

export default function SignUpPage(): JSX.Element {
  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f0f0f0",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          borderRadius: 3,
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#333",
          }}
        >
          Sign Up
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          gutterBottom
          sx={{
            color: "#666",
          }}
        >
          Create your account to get started.
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            marginTop: 2,
          }}
        >
          <SignUp
            appearance={{
              elements: {
                card: "bg-gray-50 shadow-lg rounded-lg border border-gray-200",
                headerTitle: "text-xl font-semibold text-center text-gray-800",
                formFieldInput: "border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring focus:ring-blue-200",
                formButtonPrimary: "bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg",
              },
            }}
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
          />
        </Box>
      </Paper>
    </Container>
  );
}
