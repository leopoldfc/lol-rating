import RoleTag from './RoleTag';
import type { Role } from '../types';

const ROLES: Role[] = ['TOP', 'JGL', 'MID', 'BOT', 'SUP'];

const PILLAR_WEIGHTS: Record<Role, { laning: number; damage: number; presence: number; efficiency: number }> = {
  TOP: { laning: 35, damage: 30, presence: 10, efficiency: 25 },
  JGL: { laning: 15, damage: 20, presence: 35, efficiency: 30 },
  MID: { laning: 25, damage: 30, presence: 20, efficiency: 25 },
  BOT: { laning: 25, damage: 35, presence: 15, efficiency: 25 },
  SUP: { laning: 15, damage: 10, presence: 40, efficiency: 35 },
};

const ROLE_LABEL: Record<Role, string> = {
  TOP: 'Top', JGL: 'Jungle', MID: 'Mid', BOT: 'Bot', SUP: 'Support',
};

const TIERS = [
  { range: '75 – 100', label: 'Elite',          color: 'var(--tier-elite)',  desc: 'Meilleur joueur de la compétition à son poste.' },
  { range: '60 – 75',  label: 'Très bon',        color: 'var(--accent)',      desc: 'Solide, dominante dans la plupart des métriques.' },
  { range: '45 – 60',  label: 'Moyen',           color: 'var(--text-3)',      desc: 'Dans la moyenne du plateau.' },
  { range: '25 – 45',  label: 'En difficulté',   color: 'var(--red)',         desc: 'Sous-performe face à ses pairs.' },
  { range: '0 – 25',   label: 'Faible',          color: 'var(--tier-weak)',   desc: 'Niveau nettement inférieur.' },
];

const PILLARS = [
  {
    id: 'laning',
    label: 'Laning',
    icon: '⚔',
    color: 'var(--pillar-laning)',
    desc: 'Mesure la domination en early game, avant les 15 premières minutes de la partie.',
    stats: [
      { name: 'GD@15',  full: 'Gold Diff à 15 min',  tip: 'Avance en or par rapport à l\'adversaire direct en lane à la 15e minute.' },
      { name: 'CSD@15', full: 'CS Diff à 15 min',    tip: 'Avance en minions farmés par rapport au laner adverse.' },
      { name: 'XPD@15', full: 'XP Diff à 15 min',    tip: 'Avance en expérience par rapport au laner adverse.' },
    ],
    formula: 'Laning = (GD@15 + CSD@15 + XPD@15) ÷ 3',
    note: 'Un score élevé signifie que le joueur gagne régulièrement sa lane.',
  },
  {
    id: 'damage',
    label: 'Damage',
    icon: '💥',
    color: 'var(--pillar-damage)',
    desc: 'Mesure la production de dégâts, en tenant compte du volume mais aussi de l\'efficacité.',
    stats: [
      { name: 'DPM',       full: 'Damage Per Minute',     tip: 'Dégâts infligés aux champions ennemis par minute de jeu.' },
      { name: 'DMG%/Gold%', full: 'Efficacité des dégâts', tip: 'Part des dégâts de l\'équipe produits par le joueur, ramenée à sa part des ressources consommées. Punit les joueurs qui farmaient les gold sans impacter.' },
    ],
    formula: 'Damage = 60% × DPM + 40% × (DMG% ÷ Gold%)',
    note: 'Pas seulement qui tape fort — mais qui tape fort pour ce qu\'il consomme.',
  },
  {
    id: 'presence',
    label: 'Presence',
    icon: '🌐',
    color: 'var(--pillar-presence)',
    desc: 'Mesure l\'implication dans les combats d\'équipe et les kills.',
    stats: [
      { name: 'KP%', full: 'Kill Participation', tip: 'Pourcentage des kills de l\'équipe auxquels le joueur a participé (kill ou assist).' },
    ],
    formula: 'Presence = KP%',
    note: 'Un support ou un jungler très présent sur la map obtient un score élevé.',
  },
  {
    id: 'efficiency',
    label: 'Efficiency',
    icon: '🛡',
    color: 'var(--pillar-efficiency)',
    desc: 'Mesure la solidité individuelle : survivre, avoir un bon ratio, et farmer.',
    stats: [
      { name: 'Deaths', full: 'Morts par partie',  tip: 'Inversé : mourir peu = meilleur score.' },
      { name: 'KDA',    full: 'Kills + Assists / Deaths', tip: 'Ratio classique de performance individuelle.' },
      { name: 'CSM',    full: 'CS Par Minute',     tip: 'Capacité à farmer les sbires efficacement. Non pris en compte pour les supports.' },
    ],
    formula: 'Efficiency = 35% × inv(Deaths) + 35% × KDA + 30% × CSM  (support : 50% × inv(Deaths) + 50% × KDA)',
    note: 'Un joueur qui ne meurt jamais et maintient un bon KDA score bien même avec peu de kills.',
  },
];

function WeightBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'var(--bg-4)', overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.4s' }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)', width: 32, textAlign: 'right' }}>{value}%</span>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Hero */}
      <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 10, padding: '28px 28px 24px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 10 }}>
          Comment fonctionne le rating ?
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--text-1)', margin: '0 0 12px', letterSpacing: '0.02em' }}>
          Le Rating est un score sur 100
        </h2>
        <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
          Chaque joueur reçoit une note entre <strong style={{ color: 'var(--text-1)' }}>0 et 100</strong> qui résume ses performances
          sur l'ensemble des statistiques disponibles. <strong style={{ color: 'var(--text-1)' }}>50 est la moyenne</strong> — un joueur
          à 50 est dans la norme de son rôle et de sa ligue. Un joueur à 75+ est considéré élite.
        </p>
        <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.7, margin: '10px 0 0' }}>
          Le rating n'est <strong style={{ color: 'var(--text-1)' }}>pas un z-score ni une formule magique</strong> — c'est une
          agrégation de <strong style={{ color: 'var(--text-1)' }}>percentiles par rôle</strong>. Si tu es à 80, tu fais mieux
          que 80% des joueurs à ton poste dans la compétition.
        </p>
      </div>

      {/* Tiers */}
      <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 10, padding: '24px 28px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16 }}>
          Lecture du score
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TIERS.map(t => (
            <div key={t.range} style={{ display: 'grid', gridTemplateColumns: '90px 110px 1fr', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>{t.range}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: t.color }}>{t.label}</span>
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{t.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4 pilliers */}
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 14 }}>
          Les 4 piliers du rating
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PILLARS.map(pillar => (
            <div key={pillar.id} style={{ background: 'var(--bg-1)', border: `1px solid var(--line)`, borderRadius: 10, overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--line)', background: 'var(--bg-2)' }}>
                <span style={{ fontSize: 18 }}>{pillar.icon}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: pillar.color, letterSpacing: '0.04em' }}>{pillar.label}</span>
                <span style={{ fontSize: 13, color: 'var(--text-3)', marginLeft: 4 }}>{pillar.desc}</span>
              </div>

              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {pillar.stats.map(s => (
                    <div key={s.name} style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 10, alignItems: 'start' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: pillar.color, paddingTop: 1 }}>{s.name}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
                        <strong style={{ color: 'var(--text-1)' }}>{s.full}</strong> — {s.tip}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Formule */}
                <div style={{ background: 'var(--bg-3)', borderRadius: 5, padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)', borderLeft: `3px solid ${pillar.color}` }}>
                  {pillar.formula}
                </div>

                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>{pillar.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Poids par rôle */}
      <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 10, padding: '24px 28px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16 }}>
          Poids par rôle
        </div>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
          Chaque rôle n'a pas les mêmes responsabilités en jeu — un support ne farme pas, un jungler roam plus qu'il ne lane.
          Les 4 piliers sont donc <strong style={{ color: 'var(--text-1)' }}>pondérés différemment selon le poste</strong>.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {ROLES.map(role => {
            const w = PILLAR_WEIGHTS[role];
            return (
              <div key={role}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <RoleTag role={role} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)' }}>{ROLE_LABEL[role]}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px 16px' }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-4)', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>LANING</div>
                    <WeightBar value={w.laning} color="var(--pillar-laning)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-4)', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>DAMAGE</div>
                    <WeightBar value={w.damage} color="var(--pillar-damage)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-4)', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>PRESENCE</div>
                    <WeightBar value={w.presence} color="var(--pillar-presence)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-4)', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>EFFICIENCY</div>
                    <WeightBar value={w.efficiency} color="var(--pillar-efficiency)" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Facteur de confiance */}
      <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 10, padding: '24px 28px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>
          Facteur de confiance
        </div>
        <p style={{ margin: '0 0 12px', fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          Un joueur qui n'a joué que <strong style={{ color: 'var(--text-1)' }}>2 ou 3 parties</strong> peut avoir un rating
          extrême par chance. Pour éviter ça, le rating est <strong style={{ color: 'var(--text-1)' }}>ramené vers 50</strong> quand
          le nombre de games est faible.
        </p>
        <div style={{ background: 'var(--bg-3)', borderRadius: 5, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)', borderLeft: '3px solid var(--accent)', marginBottom: 12 }}>
          rating_final = 50 + (rating_brut − 50) × min(1, games ÷ médiane_games)
        </div>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-3)' }}>
          Exemple : un joueur à 80 brut avec moitié moins de games que la médiane → <strong style={{ color: 'var(--text-1)', fontFamily: 'var(--font-mono)' }}>50 + (80−50) × 0.5 = 65</strong>.
          Plus il joue, plus son rating reflète la réalité.
        </p>
      </div>

      {/* Source */}
      <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 10, padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6 }}>Source des données</div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)' }}>
            Toutes les statistiques sont issues de <strong style={{ color: 'var(--text-1)' }}>gol.gg</strong>, le site de référence
            pour les statistiques de LoL esport. Les données sont mises à jour manuellement après chaque tournoi.
          </p>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text-4)', flexShrink: 0 }}>gol.gg</div>
      </div>

    </div>
  );
}
