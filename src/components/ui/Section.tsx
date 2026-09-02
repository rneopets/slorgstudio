import type { ReactNode } from "react"
import { Stack, Text } from "@chakra-ui/react"

interface SectionProps {
  title: string
  first?: boolean
  children: ReactNode
}

export function Section({ title, first, children }: SectionProps) {
  return (
    <Stack
      gap="3"
      pt={first ? "0" : "4"}
      mt={first ? "0" : "4"}
      borderTopWidth={first ? "0" : "1px"}
      borderColor="border"
    >
      <Text fontWeight="semibold" fontSize="sm">
        {title}
      </Text>
      {children}
    </Stack>
  )
}
