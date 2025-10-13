"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { v4 as uuidv4 } from "uuid"

type Message = {
  role: "user" | "assistant"
  content: string
  escalated?: boolean
  ticketId?: string
}

export default function ChatHelpline() {
  const [sessionId, setSessionId] = React.useState<string>("")
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I’m your AI support assistant. Ask me anything about the product. If I can’t help, I’ll offer to escalate you to a human.",
    },
  ])
  const [input, setInput] = React.useState("")
  const [isSending, setIsSending] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Initialize persistent session id
  React.useEffect(() => {
    const existing = typeof window !== "undefined" ? localStorage.getItem("support:session-id") : null
    if (existing) {
      setSessionId(existing)
    } else {
      const id = uuidv4()
      localStorage.setItem("support:session-id", id)
      setSessionId(id)
    }
  }, [])

  // Auto-scroll to bottom on new messages
  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [messages])

  async function sendMessage() {
    const trimmed = input.trim()
    if (!trimmed || isSending) return

    // optimistic user message
    const newUserMsg: Message = { role: "user", content: trimmed }
    setMessages((prev) => [...prev, newUserMsg])
    setInput("")
    setIsSending(true)

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: trimmed }),
      })

      if (!res.ok) {
        let serverMsg = ""
        try {
          const body = await res.json()
          serverMsg = body?.reply || body?.error || ""
        } catch {
          // ignore JSON parse errors
        }
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              serverMsg ||
              "I’m having trouble reaching the helpdesk right now. Please try again, or I can escalate to a human.",
          },
        ])
        return
      }

      const data: { reply: string; escalate?: boolean; ticketId?: string } = await res.json()
      const aiMsg: Message = {
        role: "assistant",
        content: data.reply,
        escalated: data.escalate,
        ticketId: data.ticketId,
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I couldn’t reach the helpdesk service. Please check your connection and try again, or I can escalate to a human.",
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void sendMessage()
    }
  }

  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm",
        "transition-all duration-300",
        "hover:shadow-md",
      )}
      aria-label="Support chat"
      role="region"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          <h2 className="text-sm font-medium">Live Helpdesk</h2>
        </div>
        <p className="text-xs text-muted-foreground">Session: {sessionId.slice(0, 8)}</p>
      </div>

      {/* Messages */}
      <div ref={containerRef} className="h-[60vh] overflow-y-auto px-4 py-5 md:h-[62vh] md:px-6" aria-live="polite">
        <ul className="space-y-4">
          {messages.map((m, i) => {
            const isUser = m.role === "user"
            return (
              <li
                key={i}
                className={cn(
                  "flex w-full",
                  isUser ? "justify-end" : "justify-start",
                  "transition-transform duration-300",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] md:max-w-[70%] rounded-xl px-3.5 py-2.5 text-sm",
                    "shadow-sm ring-1 ring-transparent",
                    isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    "animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
                  )}
                >
                  <p className="whitespace-pre-wrap text-pretty">{m.content}</p>

                  {/* Escalation badge */}
                  {m.escalated && m.ticketId ? (
                    <div className="mt-2 inline-flex items-center gap-2 rounded-md bg-amber-100/70 px-2 py-1 text-[11px] font-medium text-amber-900">
                      Escalation initiated • Ticket {m.ticketId}
                    </div>
                  ) : null}
                </div>
              </li>
            )
          })}

          {/* Typing indicator */}
          {isSending ? (
            <li className="flex w-full justify-start">
              <div className="max-w-[70%] rounded-xl bg-muted px-3.5 py-2.5 text-sm text-muted-foreground shadow-sm ring-1 ring-transparent">
                <span className="inline-flex items-center gap-1">
                  <span className="size-1.5 animate-bounce rounded-full bg-foreground/60 [animation-delay:0ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-foreground/60 [animation-delay:150ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-foreground/60 [animation-delay:300ms]" />
                  <span className="sr-only">Assistant is typing</span>
                </span>
              </div>
            </li>
          ) : null}
        </ul>
      </div>

      {/* Composer */}
      <div className="border-t p-3 md:p-4">
        <div className="flex items-end gap-2">
          <Textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type your question…"
            aria-label="Message the support assistant"
            className="min-h-[44px]"
          />
          <Button
            onClick={() => void sendMessage()}
            disabled={!input.trim() || isSending}
            className="transition-transform duration-200 hover:translate-y-[-1px]"
          >
            Send
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Press Enter to send, Shift+Enter for a new line.</p>
      </div>
    </div>
  )
}
