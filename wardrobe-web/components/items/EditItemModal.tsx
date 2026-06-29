'use client'

import { useItemForm } from '@/hooks/useItemForm'
import type { Item, Pattern, UpdateItem, Vibe } from '@/lib/items'
import {
  Dialog,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from '@/components/ui/dialog'
import { ItemForm } from './ItemForm'

type Props = {
  item: Item
  onClose: () => void
  onSubmit: (
    id: string,
    body: UpdateItem,
    callbacks: { onSuccess: () => void }
  ) => void
  onDelete: (id: string, callbacks: { onSuccess: () => void }) => void
  pending?: boolean
  deleting?: boolean
  errorMessage?: string
}

export function EditItemModal({
  item,
  onClose,
  onSubmit,
  onDelete,
  pending,
  deleting,
  errorMessage,
}: Props) {
  const form = useItemForm({
    name: item.name,
    category: item.category,
    subType: item.subType ?? null,
    hex: item.color.hex,
    pattern: item.pattern as Pattern,
    vibe: item.vibe as Vibe[],
    seasonWear: item.seasonWear,
    image: null,
  })

  function submit() {
    if (!form.isValid) return
    const { name, category, subType, hex, pattern, vibe, seasonWear, image } =
      form.values
    onSubmit(
      item.id,
      { name, category, subType, hex, pattern, vibe, seasonWear, image },
      { onSuccess: onClose }
    )
  }

  function handleDelete() {
    onDelete(item.id, { onSuccess: onClose })
  }

  return (
    <Dialog
      open
      onOpenChange={nextOpen => {
        if (!nextOpen) onClose()
      }}
    >
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Edit item</DialogTitle>
        </DialogHeader>
        <DialogPanel>
          <ItemForm
            form={form}
            onSubmit={submit}
            pending={pending}
            errorMessage={errorMessage}
            submitLabel='Save changes'
            photoLabel='Replace photo'
            onDelete={handleDelete}
            deleting={deleting}
          />
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  )
}
