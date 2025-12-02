import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { toast } from 'sonner'

interface Notification {
  id: number
  type: 'payment_reminder' | 'loan_due' | 'meeting_reminder' | 'system'
  title: string
  message: string
  memberId?: number
  memberName?: string
  memberPhone?: string
  status: 'pending' | 'sent' | 'failed'
  scheduledFor: string
  sentAt?: string
  createdAt: string
  priority: 'low' | 'medium' | 'high'
}

interface NotificationContextType {
  notifications: Notification[]
  sendPaymentReminder: (memberId: number, memberName: string, memberPhone: string, amount: number) => void
  sendLoanDueReminder: (memberId: number, memberName: string, memberPhone: string, amount: number, dueDate: string) => void
  sendMeetingReminder: (memberIds: number[], memberNames: string[], memberPhones: string[], meetingTitle: string, meetingDate: string) => void
  markNotificationAsSent: (notificationId: number) => void
  getNotificationHistory: () => Notification[]
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const storedNotifications = localStorage.getItem('chama_notifications')
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications))
    }
  }, [])

  const saveNotifications = (newNotifications: Notification[]) => {
    setNotifications(newNotifications)
    localStorage.setItem('chama_notifications', JSON.stringify(newNotifications))
  }

  const sendPaymentReminder = (memberId: number, memberName: string, memberPhone: string, amount: number) => {
    const notification: Notification = {
      id: Date.now(),
      type: 'payment_reminder',
      title: 'Monthly Share Reminder',
      message: `Hi ${memberName}, your monthly share of KES ${amount.toLocaleString()} is due. Please make your payment at your earliest convenience.`,
      memberId,
      memberName,
      memberPhone,
      status: 'pending',
      scheduledFor: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      priority: 'medium'
    }

    const newNotifications = [...notifications, notification]
    saveNotifications(newNotifications)

    setTimeout(() => {
      markNotificationAsSent(notification.id)
      toast.success(`Payment reminder sent to ${memberName}`)
    }, 1000)
  }

  const sendLoanDueReminder = (memberId: number, memberName: string, memberPhone: string, amount: number, dueDate: string) => {
    const notification: Notification = {
      id: Date.now(),
      type: 'loan_due',
      title: 'Loan Payment Due',
      message: `Hi ${memberName}, your loan payment of KES ${amount.toLocaleString()} is due on ${new Date(dueDate).toLocaleDateString()}.`,
      memberId,
      memberName,
      memberPhone,
      status: 'pending',
      scheduledFor: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      priority: 'high'
    }

    const newNotifications = [...notifications, notification]
    saveNotifications(newNotifications)

    setTimeout(() => {
      markNotificationAsSent(notification.id)
      toast.success(`Loan reminder sent to ${memberName}`)
    }, 1000)
  }

  const sendMeetingReminder = (memberIds: number[], memberNames: string[], memberPhones: string[], meetingTitle: string, meetingDate: string) => {
    const newNotifications = [...notifications]

    memberIds.forEach((memberId, index) => {
      const notification: Notification = {
        id: Date.now() + index,
        type: 'meeting_reminder',
        title: 'Meeting Reminder',
        message: `Hi ${memberNames[index]}, reminder: "${meetingTitle}" is scheduled for ${new Date(meetingDate).toLocaleDateString()}.`,
        memberId,
        memberName: memberNames[index],
        memberPhone: memberPhones[index],
        status: 'pending',
        scheduledFor: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        priority: 'medium'
      }
      newNotifications.push(notification)
    })

    saveNotifications(newNotifications)

    setTimeout(() => {
      toast.success(`Meeting reminders sent to ${memberNames.length} members`)
    }, 1500)
  }

  const markNotificationAsSent = (notificationId: number) => {
    const updatedNotifications = notifications.map(notification => {
      if (notification.id === notificationId) {
        return {
          ...notification,
          status: 'sent' as const,
          sentAt: new Date().toISOString()
        }
      }
      return notification
    })
    saveNotifications(updatedNotifications)
  }

  const getNotificationHistory = () => {
    return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const value: NotificationContextType = {
    notifications,
    sendPaymentReminder,
    sendLoanDueReminder,
    sendMeetingReminder,
    markNotificationAsSent,
    getNotificationHistory
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
