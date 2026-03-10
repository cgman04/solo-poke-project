import type { PartySlot, PokemonOption } from "../types";
import PartySlotCard from "./PartySlotCard";

type PartyTrackerProps = {
  party: PartySlot[];
  pokemonOptions: PokemonOption[];
  onSelectPokemon: (slotIndex: number, pokemonId: string) => void;
  onClearSlot: (slotIndex: number) => void;
};

function PartyTracker({
  party,
  pokemonOptions,
  onSelectPokemon,
  onClearSlot,
}: PartyTrackerProps) {
  return (
    <div className="panel">
      <h2>Party</h2>
      <div className="party-grid">
        {party.map((slot, index) => (
          <PartySlotCard
            key={index}
            slot={slot}
            slotIndex={index}
            pokemonOptions={pokemonOptions}
            onSelectPokemon={onSelectPokemon}
            onClear={onClearSlot}
          />
        ))}
      </div>
    </div>
  );
}

export default PartyTracker;