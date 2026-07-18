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
  initial?: CreateItem
}

export function AddItemModal({
  open,
  onClose,
  onSubmit,
  pending,
  errorMessage,
  initial,
}: Props) {
  const form = useItemForm(initial)

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
      subtitle='matches refresh instantly'
      submitLabel='Add item'
      form={form}
      onSubmit={submit}
      pending={pending}
      errorMessage={errorMessage}
    />
  )
}
