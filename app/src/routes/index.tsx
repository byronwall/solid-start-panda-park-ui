import { ArrowRight } from "lucide-solid";
import { useNavigate } from "@solidjs/router";
import { AbsoluteCenter } from "~/components/ui/absolute-center";
import { Button } from "~/components/ui/button";
import { Box, HStack, VStack } from "styled-system/jsx";

export default function HomeRoute() {
  const navigate = useNavigate();

  return (
    <>
      <AbsoluteCenter axis="both">
        <VStack gap="8" textAlign="center" maxW="xl" px="6">
          <VStack gap="3">
            <Box textStyle="5xl" fontWeight="bold" letterSpacing="tight">
              Panda Park UI
            </Box>
            <Box color="fg.muted" textStyle="md">
              Starter site with a component gallery route.
            </Box>
          </VStack>

          <HStack gap="3" flexWrap="wrap" justifyContent="center">
            <Button variant="solid" size="lg" onClick={() => navigate("/comps")}>
              Open Comps Explorer
              <ArrowRight />
            </Button>
          </HStack>
        </VStack>
      </AbsoluteCenter>
    </>
  );
}
