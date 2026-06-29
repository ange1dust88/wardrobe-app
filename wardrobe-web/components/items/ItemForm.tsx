'use client'

import { useState } from 'react'
import {
  CATEGORIES,
  CATEGORY_LABELS,
  extractItemColor,
  PATTERNS,
  SEASONS,
  STACK_POLICY,
  SUBTYPES,
  VIBES,
  type Category,
  type Pattern,
  type Season,
  type Vibe,
} from '@/lib/items'
import type { ItemFormApi } from '@/hooks/useItemForm'
import { findVibeConflicts } from '@/lib/vibe-compat'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { CheckboxGroup } from '@/components/ui/checkbox-group'
import {
  Field,
  FieldDescription,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Props = {
  form: ItemFormApi
  onSubmit: () => void
  pending?: boolean
  errorMessage?: string
  submitLabel?: string
  photoLabel?: string
  onDelete?: () => void
  deleting?: boolean
}

const categoryItems = CATEGORIES.map(value => ({
  label: CATEGORY_LABELS[value],
  value,
}))

const patternItems = PATTERNS.map(value => ({
  label: value.replace(/_/g, ' '),
  value,
}))

const ANY_SUBTYPE = '__any'

function formatOption(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function ItemForm({
  form,
  onSubmit,
  pending,
  errorMessage,
  submitLabel = 'Add item',
  photoLabel = 'Photo',
  onDelete,
  deleting,
}: Props) {
  const { values, patch, isValid } = form
  const [extractingColor, setExtractingColor] = useState(false)
  const vibeConflicts = findVibeConflicts(values.vibe)
  const subtypes = SUBTYPES[values.category]
  const subtypeItems = subtypes
    ? [
        { label: 'Any', value: ANY_SUBTYPE },
        ...subtypes.map(value => ({ label: formatOption(value), value })),
      ]
    : []
  const subtypeHint =
    STACK_POLICY[values.category] === 'layered'
      ? 'Lets you layer one of each subtype — a tee under a sweater.'
      : 'Optional — just helps keep your wardrobe organized.'

  async function handleImageChange(file: File | null) {
    patch({ image: file })
    if (!file) return
    setExtractingColor(true)
    const result = await extractItemColor(file).catch(() => null)
    if (result) patch({ hex: result.hex })
    setExtractingColor(false)
  }

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        onSubmit()
      }}
      className='flex flex-col gap-4'
    >
      <Field>
        <FieldLabel>Name *</FieldLabel>
        <Input
          type='text'
          value={values.name}
          onChange={e => patch({ name: e.target.value })}
          placeholder='Black Hooded Jacket'
        />
      </Field>
    
      <Field>
        <FieldLabel>Type</FieldLabel>
        <Select
          items={categoryItems}
          value={values.category}
          onValueChange={value =>
            patch({ category: value as Category, subType: null })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectPopup alignItemWithTrigger={false}>
            {categoryItems.map(item => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
      </Field>

      {subtypes && (
        <Field>
          <FieldLabel>Subtype</FieldLabel>
          <Select
            items={subtypeItems}
            value={values.subType ?? ANY_SUBTYPE}
            onValueChange={value =>
              patch({ subType: value === ANY_SUBTYPE ? null : (value as string) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectPopup alignItemWithTrigger={false}>
              {subtypeItems.map(item => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
          <FieldDescription>{subtypeHint}</FieldDescription>
        </Field>
      )}

      <Field>
        <FieldLabel>Pattern</FieldLabel>
        <Select
          items={patternItems}
          value={values.pattern}
          onValueChange={value => patch({ pattern: value as Pattern })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectPopup alignItemWithTrigger={false}>
            {patternItems.map(item => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
      </Field>

      <div className='flex items-start gap-3 w-full'>
        <Field className='flex-1'>
          <FieldLabel>{photoLabel}</FieldLabel>
          <Input
            key={form.fileInputKey}
            type='file'
            nativeInput
            accept='image/jpeg,image/png,image/webp,image/gif'
            onChange={e => handleImageChange(e.target.files?.[0] ?? null)}
          />
          <FieldDescription>
            {extractingColor
              ? 'Reading color from photo…'
              : 'JPG, PNG, WebP, or GIF up to 5 MB.'}
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel>Color</FieldLabel>
          <input
            type='color'
            aria-label='Color'
            value={values.hex}
            onChange={e => patch({ hex: e.target.value })}
            className='size-8.5 shrink-0 cursor-pointer rounded-lg border border-input bg-background p-1 shadow-xs/5 sm:size-7.5'
          />
        </Field>
      </div>

      <Field>
        <FieldLabel>Vibe *</FieldLabel>
        <CheckboxGroup
          aria-label='Vibe'
          value={values.vibe}
          onValueChange={value => patch({ vibe: value as Vibe[] })}
        >
          {VIBES.map(vibe => (
            <Label key={vibe}>
              <Checkbox value={vibe} />
              {formatOption(vibe)}
            </Label>
          ))}
        </CheckboxGroup>
        {vibeConflicts.length > 0 && (
          <Alert variant='warning'>
            <AlertDescription>
              {vibeConflicts.length === 1
                ? 'These vibes usually clash: '
                : 'These vibe pairs usually clash: '}
              {vibeConflicts
                .map(([a, b]) => `${formatOption(a)} + ${formatOption(b)}`)
                .join(', ')}
              .
            </AlertDescription>
          </Alert>
        )}
      </Field>

      <Field>
        <FieldLabel>When to wear *</FieldLabel>
        <CheckboxGroup
          aria-label='When to wear'
          value={values.seasonWear}
          onValueChange={value => patch({ seasonWear: value as Season[] })}
        >
          {SEASONS.map(season => (
            <Label key={season}>
              <Checkbox value={season} />
              {formatOption(season)}
            </Label>
          ))}
        </CheckboxGroup>
      </Field>

      {errorMessage && (
        <Alert variant='error'>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className='flex gap-2'>
        {onDelete && (
          <Button
            type='button'
            variant='outline'
            onClick={onDelete}
            loading={deleting}
            disabled={pending}
          >
            Delete
          </Button>
        )}
        <Button
          type='submit'
          className='flex-1'
          disabled={!isValid || deleting}
          loading={pending}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
