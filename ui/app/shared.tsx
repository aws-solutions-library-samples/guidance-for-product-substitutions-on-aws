import Image from 'next/image';
import { Product } from '../types';

const imageSize = { width: 100, height: 80 };

const placeHolderImage = `https://placehold.co/${imageSize.width}x${imageSize.height}/black/white?text=Product+Image`;

export const columnDefinitions = [
  {
    id: 'id',
    header: 'Id',
    cell: (item: Product) => item.id,
    isRowHeader: true,
  },
  {
    id: 'title',
    header: 'Title',
    cell: (item: Product) => item.title,
  },
  {
    id: 'image',
    header: 'Image',
    cell: (item: Product) => (
      <Image
        src={item.image || placeHolderImage}
        alt="Product Image"
        width={imageSize.width}
        height={imageSize.height}
      />
    ),
  },
  {
    id: 'categories',
    header: 'Categories',
    cell: (item: Product) => item.categories.join(', '),
  },
];
