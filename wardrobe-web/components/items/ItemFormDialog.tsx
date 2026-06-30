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
        className='max-w-[548px] gap-0 overflow-hidden rounded-[26px] p-0'
      >
        <div className='flex flex-none items-start justify-between gap-4 border-b border-border px-6 pt-6 pb-4 sm:px-7'>
          <div>
            <DialogTitle className='font-heading text-[23px] leading-tight font-bold tracking-tight'>
              {title}
            </DialogTitle>
            <DialogDescription className='mt-1 text-[13px]'>
              {subtitle}
            </DialogDescription>
          </div>
          <DialogClose
            aria-label='Close'
            className='flex size-[34px] flex-none items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent/40'
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
          <div className='min-h-0 flex-1 overflow-y-auto px-6 py-5 sm:px-7'>
            <ItemForm form={form} />
            {errorMessage && (
              <Alert variant='error' className='mt-5'>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className='flex-none border-t border-border px-6 pt-4 pb-6 sm:px-7'>
            {!valid && (
              <p className='mb-2.5 text-center text-[12px] text-muted-foreground'>
                Add a name, a vibe, and at least one season to save.
              </p>
            )}
            <div className='flex gap-2.5'>
              {onDelete && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={onDelete}
                  loading={deleting}
                  disabled={pending}
                  className='h-12 rounded-2xl'
                >
                  Delete
                </Button>
              )}
              <Button
                type='submit'
                disabled={!valid || deleting}
                loading={pending}
                className='h-12 flex-1 rounded-2xl text-[15px] font-bold'
              >
                {submitLabel}
              </Button>
            </div>
          </div>
        </form>
      </DialogPopup>
    </Dialog>
  )
}
