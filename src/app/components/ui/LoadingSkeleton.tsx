"use client";

import { Box, Skeleton, Stack, Container } from "@mui/material";

export function LoadingSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Stack spacing={3}>
        {[1, 2].map((i) => (
          <Box key={i} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Skeleton variant="rectangular" width="33%" height={32} sx={{ mb: 2 }} />
            <Box display="grid" gridTemplateColumns={{ md: '1fr 1fr' }} gap={3}>
              <Stack spacing={2}>
                <Skeleton variant="text" width="66%" />
                <Skeleton variant="text" width="50%" />
                <Skeleton variant="text" width="75%" />
              </Stack>
              <Skeleton variant="rectangular" height={200} />
            </Box>
          </Box>
        ))}
      </Stack>
    </Container>
  );
}