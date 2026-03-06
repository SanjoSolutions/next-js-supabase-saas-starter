import type { Meta, StoryObj } from "@storybook/react"
import { OnboardingWizard } from "@/components/onboarding-wizard"
import { NextIntlClientProvider } from "next-intl"

const messages = {
  onboarding: {
    title: "Get Started",
    description: "Complete these steps to set up your workspace.",
    progress: "{completed} of {total} steps completed",
    steps: {
      createAccount: "Create your account",
      createOrg: "Create an organization",
      inviteTeam: "Invite team members",
      setupBilling: "Set up billing",
    },
    orgPlaceholder: "Organization name",
    create: "Create",
    creating: "Creating...",
  },
}

const meta = {
  title: "Components/OnboardingWizard",
  component: OnboardingWizard,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="en" messages={messages}>
        <div className="w-[480px]">
          <Story />
        </div>
      </NextIntlClientProvider>
    ),
  ],
} satisfies Meta<typeof OnboardingWizard>

export default meta
type Story = StoryObj<typeof meta>

export const NewUser: Story = {
  args: {
    hasOrganization: false,
    steps: [
      { id: "account", completed: true },
      { id: "org", completed: false },
      { id: "invite", completed: false },
      { id: "billing", completed: false },
    ],
    onCreateOrg: async (name: string) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Created org:", name)
    },
  },
}

export const OrgCreated: Story = {
  args: {
    hasOrganization: true,
    steps: [
      { id: "account", completed: true },
      { id: "org", completed: true },
      { id: "invite", completed: false },
      { id: "billing", completed: false },
    ],
    onCreateOrg: async () => {},
  },
}

export const FullyOnboarded: Story = {
  args: {
    hasOrganization: true,
    steps: [
      { id: "account", completed: true },
      { id: "org", completed: true },
      { id: "invite", completed: true },
      { id: "billing", completed: true },
    ],
    onCreateOrg: async () => {},
  },
}
