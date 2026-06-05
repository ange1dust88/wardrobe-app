'use client'

import {
  CATEGORIES,
  CATEGORY_LABELS,
  PATTERNS,
  SEASONS,
  VIBES,
  type Category,
  type Pattern,
  type Season,
  type Vibe,
} from '@/lib/items'
import type { ItemFormApi } from '@/hooks/useItemForm'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { CheckboxGroup } from '@/components/ui/checkbox-group'
import { Field, FieldLabel } from '@/components/ui/field'
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
}

const categoryItems = CATEGORIES.map(value => ({
  label: CATEGORY_LABELS[value],
  value,
}))

const patternItems = PATTERNS.map(value => ({
  label: value.replace(/_/g, ' '),
  value,
}))

function formatOption(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function ItemForm({ form, onSubmit, pending, errorMessage }: Props) {
  const { values, patch, isValid } = form

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

      <div className='flex items-end gap-3'>
        <Field className='flex-1'>
          <FieldLabel>Type</FieldLabel>
          <Select
            items={categoryItems}
            value={values.category}
            onValueChange={value => patch({ category: value as Category })}
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

        <Field>
          <FieldLabel>Color</FieldLabel>
          <Input
            type='color'
            className='h-9 w-14 p-1'
            value={values.hex}
            onChange={e => patch({ hex: e.target.value })}
          />
        </Field>
      </div>

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

      <Button type='submit' disabled={!isValid} loading={pending}>
        Add item
      </Button>
    </form>
  )
}
