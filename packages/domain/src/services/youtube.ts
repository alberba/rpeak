/** Construye una URL de búsqueda de YouTube por nombre de ejercicio. No elige ni scrapea vídeos. */
export function buildYoutubeSearchUrl(exerciseName: string): string {
  const query = encodeURIComponent(exerciseName);
  return `https://www.youtube.com/results?search_query=${query}`;
}
