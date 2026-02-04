import { createClient } from "@/lib/supabase/client"
import { I18nTestWrapper } from "@/test/utils/i18n-test-wrapper"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { NotificationCenter } from "./notification-center"

// Mock notification actions
const mockGetNotifications = vi.fn()
const mockMarkAsRead = vi.fn()
const mockMarkAllAsRead = vi.fn()

vi.mock("@/app/[locale]/(authenticated)/notifications/actions", () => ({
  getNotifications: () => mockGetNotifications(),
  markAsRead: (id: string) => mockMarkAsRead(id),
  markAllAsRead: () => mockMarkAllAsRead(),
}))

// Mock Supabase client for real-time subscriptions
const mockChannel = vi.fn()
const mockOn = vi.fn()
const mockSubscribe = vi.fn()
const mockRemoveChannel = vi.fn()

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}))

// Mock Next.js router
const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe("NotificationCenter", () => {
  const mockNotifications = [
    {
      id: "notif-1",
      title: "New member joined",
      content: "John Doe joined your organization",
      is_read: false,
      created_at: "2024-01-15T10:00:00Z",
      link: "/org/123/members",
    },
    {
      id: "notif-2",
      title: "Subscription updated",
      content: "Your plan has been upgraded to Pro",
      is_read: true,
      created_at: "2024-01-14T15:30:00Z",
      link: null,
    },
    {
      id: "notif-3",
      title: "Invite accepted",
      content: "Jane Smith accepted your invitation",
      is_read: false,
      created_at: "2024-01-13T09:00:00Z",
      link: "/org/123/members",
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup Supabase real-time mock
    mockSubscribe.mockReturnValue({ unsubscribe: vi.fn() })
    mockOn.mockReturnValue({ subscribe: mockSubscribe })
    mockChannel.mockReturnValue({ on: mockOn })

    ;(createClient as ReturnType<typeof vi.fn>).mockReturnValue({
      channel: mockChannel,
      removeChannel: mockRemoveChannel,
    })

    // Default: return mock notifications
    mockGetNotifications.mockResolvedValue({ data: mockNotifications })
    mockMarkAsRead.mockResolvedValue(undefined)
    mockMarkAllAsRead.mockResolvedValue(undefined)
  })

  it("renders the notification bell button", async () => {
    render(
      <I18nTestWrapper locale="en">
        <NotificationCenter />
      </I18nTestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument()
    })
  })

  it("shows unread count badge when there are unread notifications", async () => {
    render(
      <I18nTestWrapper locale="en">
        <NotificationCenter />
      </I18nTestWrapper>
    )

    await waitFor(() => {
      // 2 unread notifications in mock data
      const badge = screen.getByText("2")
      expect(badge).toBeInTheDocument()
    })
  })

  it("shows 9+ when unread count exceeds 9", async () => {
    const manyUnread = Array.from({ length: 12 }, (_, i) => ({
      id: `notif-${i}`,
      title: `Notification ${i}`,
      content: `Content ${i}`,
      is_read: false,
      created_at: "2024-01-15T10:00:00Z",
      link: null,
    }))
    mockGetNotifications.mockResolvedValue({ data: manyUnread })

    render(
      <I18nTestWrapper locale="en">
        <NotificationCenter />
      </I18nTestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText("9+")).toBeInTheDocument()
    })
  })

  it("does not show badge when all notifications are read", async () => {
    const allRead = mockNotifications.map((n) => ({ ...n, is_read: true }))
    mockGetNotifications.mockResolvedValue({ data: allRead })

    render(
      <I18nTestWrapper locale="en">
        <NotificationCenter />
      </I18nTestWrapper>
    )

    await waitFor(() => {
      expect(screen.queryByText("0")).not.toBeInTheDocument()
      expect(screen.queryByText("1")).not.toBeInTheDocument()
    })
  })

  it("opens dropdown and shows notifications when clicked", async () => {
    const user = userEvent.setup()

    render(
      <I18nTestWrapper locale="en">
        <NotificationCenter />
      </I18nTestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument()
    })

    const bellButton = screen.getByRole("button", { name: "Notifications" })
    await user.click(bellButton)

    await waitFor(() => {
      expect(screen.getByText("New member joined")).toBeInTheDocument()
      expect(screen.getByText("Subscription updated")).toBeInTheDocument()
      expect(screen.getByText("Invite accepted")).toBeInTheDocument()
    })
  })

  it("shows 'No notifications yet' when empty", async () => {
    const user = userEvent.setup()
    mockGetNotifications.mockResolvedValue({ data: [] })

    render(
      <I18nTestWrapper locale="en">
        <NotificationCenter />
      </I18nTestWrapper>
    )

    const bellButton = await screen.findByRole("button", { name: "Notifications" })
    await user.click(bellButton)

    await waitFor(() => {
      expect(screen.getByText("No notifications yet")).toBeInTheDocument()
    })
  })

  it("shows 'Mark all as read' button when there are unread notifications", async () => {
    const user = userEvent.setup()

    render(
      <I18nTestWrapper locale="en">
        <NotificationCenter />
      </I18nTestWrapper>
    )

    const bellButton = await screen.findByRole("button", { name: "Notifications" })
    await user.click(bellButton)

    await waitFor(() => {
      expect(screen.getByText("Mark all as read")).toBeInTheDocument()
    })
  })

  it("marks notification as read and navigates when clicked", async () => {
    const user = userEvent.setup()

    render(
      <I18nTestWrapper locale="en">
        <NotificationCenter />
      </I18nTestWrapper>
    )

    const bellButton = await screen.findByRole("button", { name: "Notifications" })
    await user.click(bellButton)

    await waitFor(() => {
      expect(screen.getByText("New member joined")).toBeInTheDocument()
    })

    const notification = screen.getByText("New member joined").closest("[role='menuitem']")
    await user.click(notification!)

    await waitFor(() => {
      expect(mockMarkAsRead).toHaveBeenCalledWith("notif-1")
      expect(mockPush).toHaveBeenCalledWith("/org/123/members")
    })
  })

  it("marks notification as read without navigating when no link", async () => {
    const user = userEvent.setup()
    const noLinkNotification = [
      {
        id: "notif-no-link",
        title: "System update",
        content: "System maintenance completed",
        is_read: false,
        created_at: "2024-01-15T10:00:00Z",
        link: null,
      },
    ]
    mockGetNotifications.mockResolvedValue({ data: noLinkNotification })

    render(
      <I18nTestWrapper locale="en">
        <NotificationCenter />
      </I18nTestWrapper>
    )

    const bellButton = await screen.findByRole("button", { name: "Notifications" })
    await user.click(bellButton)

    await waitFor(() => {
      expect(screen.getByText("System update")).toBeInTheDocument()
    })

    const notification = screen.getByText("System update").closest("[role='menuitem']")
    await user.click(notification!)

    await waitFor(() => {
      expect(mockMarkAsRead).toHaveBeenCalledWith("notif-no-link")
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it("marks all notifications as read when button clicked", async () => {
    const user = userEvent.setup()

    render(
      <I18nTestWrapper locale="en">
        <NotificationCenter />
      </I18nTestWrapper>
    )

    const bellButton = await screen.findByRole("button", { name: "Notifications" })
    await user.click(bellButton)

    await waitFor(() => {
      expect(screen.getByText("Mark all as read")).toBeInTheDocument()
    })

    const markAllButton = screen.getByText("Mark all as read")
    await user.click(markAllButton)

    await waitFor(() => {
      expect(mockMarkAllAsRead).toHaveBeenCalled()
    })
  })

  it("subscribes to real-time notifications on mount", async () => {
    render(
      <I18nTestWrapper locale="en">
        <NotificationCenter />
      </I18nTestWrapper>
    )

    await waitFor(() => {
      expect(mockChannel).toHaveBeenCalledWith("notifications")
      expect(mockOn).toHaveBeenCalledWith(
        "postgres_changes",
        expect.objectContaining({
          event: "INSERT",
          schema: "public",
          table: "notifications",
        }),
        expect.any(Function)
      )
      expect(mockSubscribe).toHaveBeenCalled()
    })
  })

  it("unsubscribes from real-time notifications on unmount", async () => {
    const { unmount } = render(
      <I18nTestWrapper locale="en">
        <NotificationCenter />
      </I18nTestWrapper>
    )

    await waitFor(() => {
      expect(mockSubscribe).toHaveBeenCalled()
    })

    unmount()

    expect(mockRemoveChannel).toHaveBeenCalled()
  })

  it("highlights unread notifications with different background", async () => {
    const user = userEvent.setup()

    render(
      <I18nTestWrapper locale="en">
        <NotificationCenter />
      </I18nTestWrapper>
    )

    const bellButton = await screen.findByRole("button", { name: "Notifications" })
    await user.click(bellButton)

    await waitFor(() => {
      const unreadNotif = screen.getByText("New member joined").closest("[role='menuitem']")
      expect(unreadNotif).toHaveClass("bg-accent/50")

      const readNotif = screen.getByText("Subscription updated").closest("[role='menuitem']")
      expect(readNotif).not.toHaveClass("bg-accent/50")
    })
  })

  it("decrements unread count when marking single notification as read", async () => {
    const user = userEvent.setup()

    render(
      <I18nTestWrapper locale="en">
        <NotificationCenter />
      </I18nTestWrapper>
    )

    // Initial unread count is 2
    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument()
    })

    const bellButton = screen.getByRole("button", { name: "Notifications" })
    await user.click(bellButton)

    await waitFor(() => {
      expect(screen.getByText("New member joined")).toBeInTheDocument()
    })

    const notification = screen.getByText("New member joined").closest("[role='menuitem']")
    await user.click(notification!)

    // Should now show 1 unread
    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument()
    })
  })

  it("renders in German locale", async () => {
    const user = userEvent.setup()
    mockGetNotifications.mockResolvedValue({ data: [] })

    render(
      <I18nTestWrapper locale="de">
        <NotificationCenter />
      </I18nTestWrapper>
    )

    const bellButton = await screen.findByRole("button", { name: "Benachrichtigungen" })
    await user.click(bellButton)

    await waitFor(() => {
      expect(screen.getByText("Noch keine Benachrichtigungen")).toBeInTheDocument()
    })
  })
})
