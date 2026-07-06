'use client'

import { XIcon } from 'lucide-react'
import type { ItemFormApi } from '@/hooks/useItemForm'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogPopup,
  DialogTitle,
} from '@/components/ui/dialog'
import { ItemForm } from './ItemForm'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  subtitle: string
  submitLabel: string
  form: ItemFormApi
  onSubmit: () => void
  pending?: boolean
  errorMessage?: string
  onDelete?: () => void
  deleting?: boolean
  initialImageUrl?: string | null
}

export function ItemFormDialog({
  open,
  onClose,
  title,
  subtitle,
  submitLabel,
  form,
  onSubmit,
  pending,
  errorMessage,
  onDelete,
  deleting,
  initialImageUrl,
}: Props) {
  const valid = form.isValid

  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen) onClose()
      }}
    >
      <DialogPopup
        showCloseButton={false}
        className='max-h-[calc(100svh-3rem)] max-w-[560px] gap-0 overflow-hidden rounded-[24px] p-0'
      >
        <div className='flex flex-none items-center justify-between gap-4 border-b border-border px-6 py-[18px]'>
          <div className='flex items-baseline gap-3'>
            <DialogTitle className='font-heading text-[21px] leading-none font-bold tracking-tight'>
              {title}
            </DialogTitle>
            <DialogDescription className='text-[12.5px]'>
              {subtitle}
            </DialogDescription>
          </div>
          <DialogClose
            aria-label='Close'
            className='flex size-8 flex-none items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent/40'
          >
            <XIcon className='size-4' />
          </DialogClose>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault()
            if (valid) onSubmit()
          }}
          className='flex min-h-0 flex-1 flex-col'
        >
          <div className='min-h-0 flex-1 overflow-y-auto px-6 pt-[18px] pb-2'>
            <ItemForm form={form} initialImageUrl={initialImageUrl} />
            {errorMessage && (
              <Alert variant='error' className='mt-4'>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className='flex flex-none items-center gap-3 border-t border-border px-6 py-3.5'>
            {onDelete && (
              <Button
                type='button'
                variant='outline'
                onClick={onDelete}
                loading={deleting}
                disabled={pending}
                className='h-12 rounded-[13px] border-destructive/30 text-destructive hover:bg-destructive/5'
              >
                Delete
              </Button>
            )}
            <Button
              type='submit'
              disabled={!valid || deleting}
              loading={pending}
              className='h-12 flex-1 rounded-[13px] text-[15px] font-bold'
            >
              {submitLabel}
            </Button>
          </div>
        </form>
      </DialogPopup>
    </Dialog>
  )
}
