
export interface CreateItemDto {
  name: string; 
  category: string; 
  color?: string;
  size?: string;
}

export type UpdateItemDto = Partial<CreateItemDto>;

export interface Item extends CreateItemDto {
  id: string;
  createdAt: string;
}
