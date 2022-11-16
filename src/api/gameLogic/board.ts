import { Square } from "./type";

export function initBoard(nbRows: number, nbColumns: number): Square[][] {
  const board: Square[][] = [];
  for (let i = 0; i < nbRows; i++) {
    const row: Square[] = [];
    for (let j = 0; j < nbColumns; j++) {
      row.push({ color: "white", time: "" });
    }
    board.push(row);
  }
  return board;
}
