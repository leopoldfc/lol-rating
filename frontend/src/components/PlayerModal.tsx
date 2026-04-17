import type { Player } from '../types';
import PlayerSheet from './PlayerSheet';

interface Props { player: Player; onClose: () => void; tournament?: string; teamLogos?: Record<string, string>; playerImages?: Record<string, string>; }

export default function PlayerModal({ player, onClose, tournament, teamLogos, playerImages }: Props) {
  return <PlayerSheet player={player} onClose={onClose} tournament={tournament} teamLogos={teamLogos} playerImages={playerImages} />;
}
