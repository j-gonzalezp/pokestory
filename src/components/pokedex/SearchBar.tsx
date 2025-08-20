import { Input } from "../ui/input";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (newTerm: string) => void;
}

export function SearchBar({ searchTerm, onSearchChange }: SearchBarProps) {
  return (
    <Input
      type="text"
      placeholder="Buscar Pokémon..."
      value={searchTerm}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
    />
  );
}