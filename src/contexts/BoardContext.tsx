"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Card {
  _id: string;
  title: string;
  description?: string;
  position: number;
  listId: string;
}

export interface List {
  _id: string;
  title: string;
  position: number;
  boardId: string;
  cards: Card[];
}

export interface Board {
  _id: string;
  title: string;
  description?: string;
  ownerId: string;
  lists: List[];
}

interface BoardState {
  user: User | null;
  boards: Board[];
  currentBoard: Board | null;
  loading: boolean;
  error: string | null;
}

type BoardAction =
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_BOARDS"; payload: Board[] }
  | { type: "SET_CURRENT_BOARD"; payload: Board | null }
  | { type: "ADD_BOARD"; payload: Board }
  | { type: "UPDATE_BOARD"; payload: Board }
  | { type: "DELETE_BOARD"; payload: string }
  | { type: "ADD_LIST"; payload: List }
  | { type: "UPDATE_LIST"; payload: List }
  | { type: "DELETE_LIST"; payload: string }
  | { type: "ADD_CARD"; payload: Card }
  | { type: "UPDATE_CARD"; payload: Card }
  | { type: "DELETE_CARD"; payload: string }
  | { type: "MOVE_CARD"; payload: { cardId: string; newListId: string; newPosition: number } }
  | { type: "MOVE_LIST"; payload: { listId: string; newPosition: number } }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const initialState: BoardState = {
  user: null,
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,
};

function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };

    case "SET_BOARDS":
      return { ...state, boards: action.payload };

    case "SET_CURRENT_BOARD":
      return { ...state, currentBoard: action.payload };

    case "ADD_BOARD":
      return { ...state, boards: [action.payload, ...state.boards] };

    case "UPDATE_BOARD":
      return {
        ...state,
        boards: state.boards.map((board) => (board._id === action.payload._id ? action.payload : board)),
        currentBoard: state.currentBoard?._id === action.payload._id ? action.payload : state.currentBoard,
      };

    case "DELETE_BOARD":
      return {
        ...state,
        boards: state.boards.filter((board) => board._id !== action.payload),
        currentBoard: state.currentBoard?._id === action.payload ? null : state.currentBoard,
      };

    case "ADD_LIST":
      if (!state.currentBoard) return state;
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          lists: [...state.currentBoard.lists, action.payload],
        },
      };

    case "UPDATE_LIST":
      if (!state.currentBoard) return state;
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          lists: state.currentBoard.lists.map((list) => (list._id === action.payload._id ? action.payload : list)),
        },
      };

    case "DELETE_LIST":
      if (!state.currentBoard) return state;
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          lists: state.currentBoard.lists.filter((list) => list._id !== action.payload),
        },
      };

    case "ADD_CARD":
      if (!state.currentBoard) return state;
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          lists: state.currentBoard.lists.map((list) => (list._id === action.payload.listId ? { ...list, cards: [...list.cards, action.payload] } : list)),
        },
      };

    case "UPDATE_CARD":
      if (!state.currentBoard) return state;
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          lists: state.currentBoard.lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) => (card._id === action.payload._id ? action.payload : card)),
          })),
        },
      };

    case "DELETE_CARD":
      if (!state.currentBoard) return state;
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          lists: state.currentBoard.lists.map((list) => ({
            ...list,
            cards: list.cards.filter((card) => card._id !== action.payload),
          })),
        },
      };

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

const BoardContext = createContext<{
  state: BoardState;
  dispatch: React.Dispatch<BoardAction>;
} | null>(null);

export function BoardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(boardReducer, initialState);

  return <BoardContext.Provider value={{ state, dispatch }}>{children}</BoardContext.Provider>;
}

export function useBoardContext() {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoardContext must be used within a BoardProvider");
  }
  return context;
}
