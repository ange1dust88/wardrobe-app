'use client'

import { useItemForm } from '@/hooks/useItemForm'
import type { CreateItem } from '@/lib/items'
import { ItemFormDialog } from './ItemFormDialog'

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
    <ItemFormDialog
      open={open}
      onClose={onClose}
      title='New item'
      subtitle='Catalog a piece — dress learns how it pairs.'
      submitLabel='Add item'
      form={form}
      onSubmit={submit}
      pending={pending}
      errorMessage={errorMessage}
    />
  )
}
