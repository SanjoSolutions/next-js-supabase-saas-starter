import { I18nTestWrapper } from "@/test/utils/i18n-test-wrapper"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ContractStatusTimeline } from "./contract-status-timeline"

describe("ContractStatusTimeline", () => {
  it("renders all steps", () => {
    render(
      <I18nTestWrapper locale="en">
        <ContractStatusTimeline status="pending_payment" />
      </I18nTestWrapper>
    )

    expect(screen.getByRole("status")).toBeInTheDocument()
    expect(screen.getByText(/Pending Payment/i)).toBeInTheDocument()
  })

  it("highlights current step", () => {
    render(
      <I18nTestWrapper locale="en">
        <ContractStatusTimeline status="in_progress" />
      </I18nTestWrapper>
    )

    expect(screen.getByText(/In Progress/i)).toBeInTheDocument()
  })

  it("shows terminal status for disputed", () => {
    render(
      <I18nTestWrapper locale="en">
        <ContractStatusTimeline status="disputed" />
      </I18nTestWrapper>
    )

    expect(screen.getByText(/Disputed/i)).toBeInTheDocument()
  })

  it("shows terminal status for cancelled", () => {
    render(
      <I18nTestWrapper locale="en">
        <ContractStatusTimeline status="cancelled" />
      </I18nTestWrapper>
    )

    expect(screen.getByText(/Cancelled/i)).toBeInTheDocument()
  })

  it("has accessible role=status", () => {
    render(
      <I18nTestWrapper locale="en">
        <ContractStatusTimeline status="paid" />
      </I18nTestWrapper>
    )

    expect(screen.getByRole("status")).toBeInTheDocument()
  })

  it("renders in German locale", () => {
    render(
      <I18nTestWrapper locale="de">
        <ContractStatusTimeline status="pending_payment" />
      </I18nTestWrapper>
    )

    expect(screen.getByText(/Zahlung ausstehend/i)).toBeInTheDocument()
  })
})
