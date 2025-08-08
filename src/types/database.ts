import { IBoard, IList, ICard } from "@models/BoardModel";

export interface PopulatedCard extends Omit<ICard, "listId"> {
  listId: PopulatedList;
}

export interface PopulatedList extends Omit<IList, "boardId"> {
  boardId: IBoard;
}

export interface PopulatedBoard extends Omit<IBoard, "lists"> {
  lists: IList[];
}
