import type { Role } from '../types';

const ROLE_LABEL: Record<Role, string> = {
  TOP: 'Top', JGL: 'Jgl', MID: 'Mid', BOT: 'Bot', SUP: 'Sup',
};

export default function RoleTag({ role }: { role: Role }) {
  return (
    <span className={`badge badge--role-${role.toLowerCase()}`}>
      {ROLE_LABEL[role]}
    </span>
  );
}
