import type TreeDTO from "~/composables/scripts/familytree/dtos/inner/TreeDTO";

export type TreeCardItem = {
  id: string;
  title: string;
  author?: string;
  description?: string;
  avatar: string;
  coverSeed?: string;
  comments?: string;
  href: string;
};

export function getTreeCardId(tree: TreeDTO, index: number) {
  return String(tree.id ?? tree.tree_id ?? index + 1);
}

export function getTreeCardTitle(tree: TreeDTO, index: number) {
  return tree.name ?? tree.title ?? `Tree ${index + 1}`;
}

export default function mapTreeToTreeCardItem(tree: TreeDTO, index: number): TreeCardItem {
  const id = getTreeCardId(tree, index);

  return {
    id,
    title: getTreeCardTitle(tree, index),
    description: 'Lorem ipsum, lenivets danya!',
    avatar: '',
    coverSeed: id,
    href: `/trees/${id}`,
  };
}
