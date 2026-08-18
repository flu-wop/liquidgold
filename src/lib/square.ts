import { SquareClient, SquareEnvironment } from "square";

let _square: SquareClient | null = null;

export function getSquare(): SquareClient {
  if (_square) return _square;
  _square = new SquareClient({
    token: process.env.SQUARE_ACCESS_TOKEN!,
    environment:
      process.env.SQUARE_ENVIRONMENT === "production"
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox,
  });
  return _square;
}
