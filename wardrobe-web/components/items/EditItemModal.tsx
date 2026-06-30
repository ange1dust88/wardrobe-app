'use client'

import { useItemForm } from '@/hooks/useItemForm'
import {
  getItemImageSrc,
  type Fit,
  type Formality,
  type Item,
  type Pattern,
  type UpdateItem,
  type Vibe,
} from '@/lib/items'
import { ItemFormDialog } from './ItemFormDialog'

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
    accentHex: item.accent?.hex ?? null,
    pattern: item.pattern as Pattern,
    formality: (item.formality as Formality | null) ?? null,
    fit: (item.fit as Fit | null) ?? null,
    vibe: item.vibe as Vibe[],
    seasonWear: item.seasonWear,
    image: null,
  })

  function submit() {
    if (!form.isValid) return
    const {
      name,
      category,
      subType,
      hex,
      accentHex,
      pattern,
      formality,
      fit,
      vibe,
      seasonWear,
      image,
    } = form.values
    onSubmit(
      item.id,
      {
        name,
        category,
        subType,
        hex,
        accentHex,
        pattern,
        formality,
        fit,
        vibe,
        seasonWear,
        image,
      },
      { onSuccess: onClose }
    )
  }

  function handleDelete() {
    onDelete(item.id, { onSuccess: onClose })
  }

  return (
    <ItemFormDialog
      open
      onClose={onClose}
      title='Edit item'
      subtitle='Update the details — matches refresh instantly.'
      submitLabel='Save changes'
      form={form}
      onSubmit={submit}
      pending={pending}
      errorMessage={errorMessage}
      onDelete={handleDelete}
      deleting={deleting}
      initialImageUrl={getItemImageSrc(item)}
    />
  )
}
