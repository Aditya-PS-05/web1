import { Schema, model, models, Document, Types } from "mongoose";

export interface ICard extends Document {
  _id: string;
  title: string;
  description?: string;
  position: number;
  listId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IList extends Document {
  _id: string;
  title: string;
  position: number;
  boardId: Types.ObjectId;
  cards: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IBoard extends Document {
  _id: string;
  title: string;
  description?: string;
  ownerId: Types.ObjectId;
  lists: Types.ObjectId[];
  isPublic: boolean;
  shareSlug?: string;
  createdAt: Date;
  updatedAt: Date;
}

const cardSchema = new Schema<ICard>(
  {
    title: {
      type: String,
      required: [true, "Card title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    position: {
      type: Number,
      required: true,
      default: 0,
    },
    listId: {
      type: Schema.Types.ObjectId,
      ref: "List",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const listSchema = new Schema<IList>(
  {
    title: {
      type: String,
      required: [true, "List title is required"],
      trim: true,
    },
    position: {
      type: Number,
      required: true,
      default: 0,
    },
    boardId: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    cards: [
      {
        type: Schema.Types.ObjectId,
        ref: "Card",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const boardSchema = new Schema<IBoard>(
  {
    title: {
      type: String,
      required: [true, "Board title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lists: [
      {
        type: Schema.Types.ObjectId,
        ref: "List",
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareSlug: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
cardSchema.index({ listId: 1, position: 1 });
listSchema.index({ boardId: 1, position: 1 });
boardSchema.index({ ownerId: 1 });
boardSchema.index({ shareSlug: 1 });

export const Card = models.Card || model<ICard>("Card", cardSchema);
export const List = models.List || model<IList>("List", listSchema);
export const Board = models.Board || model<IBoard>("Board", boardSchema);
