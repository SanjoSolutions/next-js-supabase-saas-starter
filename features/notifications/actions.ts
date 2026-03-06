"use server"

import {
  getNotifications as getNotificationsImpl,
  markAllAsRead as markAllAsReadImpl,
  markAsRead as markAsReadImpl,
} from "./actions/notifications"

export async function getNotifications() {
  return getNotificationsImpl()
}

export async function markAsRead(id: string) {
  return markAsReadImpl(id)
}

export async function markAllAsRead() {
  return markAllAsReadImpl()
}
