'use client'

import { XIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { sendFeedback } from '@/lib/items'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogPopup,
  DialogTitle,
} from '@/components/ui/dialog'

export function FeedbackModal({ onClose }: { onClose: () => void }) {
  const pathname = usePathname()
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const canSend = message.trim().length > 0

  async function submit() {
    if (!canSend || sending) return
    setError(null)
    setSending(true)
    try {
      await sendFeedback(message.trim(), pathname)
      onClose()
    } catch (e) {
      setError((e as Error).message)
      setSending(false)
    }
  }

  return (
    <Dialog open onOpenChange={next => !next && onClose()}>
      <DialogPopup
        showCloseButton={false}
        className='max-w-[440px] gap-0 rounded-[14px] p-0'
      >
        <div className='flex items-start justify-between gap-4 border-b border-border px-6 py-[18px]'>
          <div>
            <DialogTitle className='font-heading text-[19px] leading-none font-bold tracking-tight'>
              Send feedback
            </DialogTitle>
            <DialogDescription className='mt-1.5 text-[12.5px]'>
              Bug, idea, or anything off — we read all of it.
            </DialogDescription>
          </div>
          <DialogClose
            aria-label='Close'
            className='flex size-8 flex-none items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent/40'
          >
            <XIcon className='size-4' />
          </DialogClose>
        </div>

        <div className='p-6'>
          <textarea
            autoFocus
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={5}
            placeholder="What's on your mind?"
            className='w-full resize-none rounded-[8px] border border-border bg-background px-3.5 py-3 text-[14px] outline-none'
          />
          {error && (
            <div className='mt-3 rounded-[8px] border border-destructive/25 bg-destructive/5 px-3.5 py-2.5 text-[13px] text-destructive'>
              {error}
            </div>
          )}
          <div className='mt-4 flex items-center justify-end gap-2.5'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              className='h-11 rounded-[8px]'
            >
              Cancel
            </Button>
            <Button
              type='button'
              onClick={submit}
              disabled={!canSend}
              loading={sending}
              className='h-11 rounded-[8px] px-6 font-bold'
            >
              Send
            </Button>
          </div>
        </div>
      </DialogPopup>
    </Dialog>
  )
}
