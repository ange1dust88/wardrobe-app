'use client'

import { useItemForm } from '@/hooks/useItemForm'
import type { CreateItem } from '@/lib/items'
import {
  Dialog,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from '@/components/ui/dialog'
import { ItemForm } from './ItemForm'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (values: CreateItem, callbacks: { onSuccess: () => void }) => void
  pending?: boolean
  errorMessage?: string
}

export function AddItemModal({
  open,
  onClose,
  onSubmit,
  pending,
  errorMessage,
}: Props) {
  const form = useItemForm()

  function submit() {
    if (!form.isValid) return
    onSubmit(form.values, {
      onSuccess: () => {
        form.reset()
        onClose()
      },
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen) onClose()
      }}
    >
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>New item</DialogTitle>
        </DialogHeader>
        <DialogPanel>
          <ItemForm
            form={form}
            onSubmit={submit}
            pending={pending}
            errorMessage={errorMessage}
          />
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  )
}
