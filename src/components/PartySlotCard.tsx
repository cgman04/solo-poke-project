import type { PartySlot, PokemonOption } from "../types";

type PartySlotCardProps = {
  slot: PartySlot;
  slotIndex: number;
  pokemonOptions: PokemonOption[];
  onSelectPokemon: (slotIndex: number, pokemonId: string) => void;
  onClear: (slotIndex: number) => void;
};

function PartySlotCard({
  slot,
  slotIndex,
  pokemonOptions,
  onSelectPokemon,
  onClear,
}: PartySlotCardProps) {
  return (
    <div className="party-slot">
      <img
        src={slot?.sprite ?? "placeholders/pokeball-gray.png"}
        alt={slot ? slot.name : "Empty party slot"}
        className="party-slot-image"
      />

      <div className="slot-controls">
        <div className="slot-label">Slot {slotIndex + 1}</div>

        <select
          value={slot?.id ?? ""}
          onChange={(e) => onSelectPokemon(slotIndex, e.target.value)}
        >
          <option value="">Select a Pokémon</option>
          {pokemonOptions.map((pokemon) => (
            <option key={pokemon.id} value={pokemon.id}>
              {pokemon.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="clear-button"
          onClick={() => onClear(slotIndex)}
        >
          Clear Slot
        </button>
      </div>
    </div>
  );
}

export default PartySlotCard;