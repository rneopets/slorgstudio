import type { TextProps } from "@chakra-ui/react"
import { Box, Center, Container, Heading, HStack, Icon, Link, Stack, Text } from "@chakra-ui/react"
import { FaDiscord, FaGithub } from "react-icons/fa6"
import { GitCommit } from "../ui/GitCommit"
import { FooterLogo } from "./FooterLogo"

const socialLinks = [
  { href: "https://discord.gg/neopets", icon: <FaDiscord /> },
  { href: "https://github.com/rneopets/slorgstudio", icon: <FaGithub /> },
]

function Logo() {
  return (
    <HStack gap="2">
      <FooterLogo size={32} />
      <Heading size="md">Slorg Studio</Heading>
    </HStack>
  )
}

function Copyright(props: TextProps) {
  return (
    <Text fontSize="sm" color="fg.muted" {...props}>
      Website, design, and code &copy; Slorg Studio
      <br />
      This is an unofficial Neopets fansite with no affiliation/endorsement with Neopets.
      <br />
      Images/Names &copy; Neopets, Inc. All rights reserved.
    </Text>
  )
}

export function Footer() {
  return (
    <Box as="footer" bg="gray.100" _dark={{ bg: "transparent" }}>
      <Container py={{ base: "10", md: "12" }}>
        <Stack gap="6">
          <Stack direction="row" justify="space-between" align="center">
            <Logo />
            <HStack gap="4">
              {socialLinks.map(({ href, icon }, index) => (
                <Link key={index} href={href} target="_blank" rel="noopener noreferrer" colorPalette="gray">
                  <Icon size="md">{icon}</Icon>
                </Link>
              ))}
            </HStack>
          </Stack>
          <Copyright />
          <Center>
            <GitCommit />
          </Center>
        </Stack>
      </Container>
    </Box>
  )
}
