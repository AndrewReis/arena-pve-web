import { GameData } from "../scenes/GameScene";

export async function createGame(): Promise<GameData> {
  const response = await fetch("http://localhost:3000/game", {
    method: "POST"
  });
  return response.json();
}

export async function sendAction(gameId: string, body: { targetId: string, ability: number }): Promise<GameData> {
  const response = await fetch(
    `http://localhost:3000/game/${gameId}/apply-action`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }
  );
  return await response.json();
}