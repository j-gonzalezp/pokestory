import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function extraerIdDeUrl(url: string): number {
  const parts = url.split('/');
  return parseInt(parts[parts.length - 2]);
}

export function getPokemonTypeColor(type: string): string {
  switch (type.toLowerCase()) {
    case 'normal': return '#A8A77A';
    case 'fire': return '#EE8130';
    case 'water': return '#6390F0';
    case 'electric': return '#F7D02C';
    case 'grass': return '#7AC74C';
    case 'ice': return '#96D9D6';
    case 'fighting': return '#C22E28';
    case 'poison': return '#A33EA1';
    case 'ground': return '#E2BF65';
    case 'flying': return '#A98FF3';
    case 'psychic': return '#F95587';
    case 'bug': return '#A6B91A';
    case 'rock': return '#B6A136';
    case 'ghost': return '#735797';
    case 'dragon': return '#6F35FC';
    case 'steel': return '#B7B7CE';
    case 'dark': return '#705746';
    case 'fairy': return '#D685AD';
    default: return '#68A090'; 
  }
}

export function getPokemonTypeGlow(type: string): string {
  const color = getPokemonTypeColor(type);
  return `0 0 8px ${color}, 0 0 12px ${color}`;
}
