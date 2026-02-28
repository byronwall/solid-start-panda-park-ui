import { ArrowRight } from 'lucide-solid'
import { AbsoluteCenter } from '~/components/ui/absolute-center'
import { Button } from '~/components/ui/button'
import { Link } from '~/components/ui/link'
import { Box, HStack, VStack } from 'styled-system/jsx'

export default function HomeRoute() {
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
            <Link href="/comps" textDecoration="none">
              <Button variant="solid" size="lg">
                Open Comps Explorer
                <ArrowRight />
              </Button>
            </Link>
          </HStack>
        </VStack>
      </AbsoluteCenter>

    </>
  )
}
