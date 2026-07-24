export const treeFieldUi = {
  base: [
    'bg-[var(--color-tree-modal-input-bg)]',
    '!text-[var(--color-tree-modal-input-text)]',
    '[color:var(--color-tree-modal-input-text)]',
    '[-webkit-text-fill-color:var(--color-tree-modal-input-text)]',
    'ring ring-inset ring-[var(--color-tree-modal-input-border)]',
    'placeholder:!text-[var(--color-tree-modal-input-placeholder)]',
    'hover:bg-[var(--color-tree-modal-input-hover)]',
    'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-tree-modal-input-focus)]',
    'caret-[var(--color-tree-modal-input-text)]'
  ].join(' '),
  leadingIcon: 'text-[var(--color-tree-modal-input-placeholder)]',
  trailingIcon: 'text-[var(--color-tree-modal-input-placeholder)]'
}

export const treeTextareaUi = {
  ...treeFieldUi
}

export const treeSelectUi = {
  base: treeFieldUi.base,
  value: '!text-[var(--color-tree-modal-input-text)]',
  placeholder: '!text-[var(--color-tree-modal-input-placeholder)]',
  leadingIcon: 'text-[var(--color-tree-modal-input-placeholder)]',
  trailingIcon: 'text-[var(--color-tree-modal-input-placeholder)]',
  arrow: 'fill-[var(--color-tree-modal-input-placeholder)]',
  content: [
    'bg-[var(--color-tree-modal-popover-bg)]',
    'ring ring-inset ring-[var(--color-tree-modal-input-border)]',
    'shadow-lg'
  ].join(' '),
  item: [
    'text-[var(--color-tree-modal-input-text)]',
    'data-highlighted:not-data-disabled:before:bg-[var(--color-tree-modal-input-hover)]'
  ].join(' '),
  itemLeadingIcon: 'text-[var(--color-tree-modal-input-placeholder)] group-data-highlighted:not-group-data-disabled:text-[var(--color-tree-modal-input-text)]',
  itemDescription: 'text-[var(--color-tree-modal-input-placeholder)]'
}

export const treeSelectMenuUi = {
  ...treeSelectUi,
  input: [
    'border-b border-[var(--color-tree-modal-input-border)]',
    'bg-transparent',
    '!text-[var(--color-tree-modal-input-text)]',
    '[color:var(--color-tree-modal-input-text)]',
    '[-webkit-text-fill-color:var(--color-tree-modal-input-text)]',
    'placeholder:!text-[var(--color-tree-modal-input-placeholder)]'
  ].join(' ')
}
