import { Button } from "../ui/Button";

interface FavoritesToggleProps {
  isFiltered: boolean;
  onToggle: () => void;
}

export function FavoritesToggle({ isFiltered, onToggle }: FavoritesToggleProps) {
  return (
    <Button onClick={onToggle} variant={isFiltered ? "default" : "outline"}>
      {isFiltered ? "Show All" : "Show Favorites"}
    </Button>
  );
}