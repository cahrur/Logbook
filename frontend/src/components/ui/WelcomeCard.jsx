import { Sparkles, LayoutDashboard, Activity, CheckCircle2, Boxes, ListChecks, TrendingUp } from 'lucide-react';

// Decorative floating icons in the hero background (ported from dealone-ui welcome card).
const FX_ICONS = [
  { Icon: Sparkles, top: '16%', left: '6%', size: 26, delay: 0, duration: 4.2 },
  { Icon: LayoutDashboard, top: '62%', left: '12%', size: 30, delay: 0.8, duration: 5 },
  { Icon: Boxes, top: '22%', left: '34%', size: 32, delay: 0.4, duration: 4.6 },
  { Icon: CheckCircle2, top: '70%', left: '46%', size: 24, delay: 1.2, duration: 4.4 },
  { Icon: ListChecks, top: '14%', left: '64%', size: 30, delay: 0.6, duration: 5.4 },
  { Icon: TrendingUp, top: '60%', left: '74%', size: 24, delay: 1.6, duration: 4 },
  { Icon: Activity, top: '32%', left: '86%', size: 26, delay: 1, duration: 4.8 },
];

export function WelcomeCard({ name, greeting, subtitle = 'Berikut ringkasan proyek Anda untuk hari ini.', action }) {
  const text = greeting ?? `Halo, ${name || ''}!`;

  return (
    <section className="welcome-card">
      <div className="welcome-card__fx" aria-hidden="true">
        {FX_ICONS.map(({ Icon, top, left, size, delay, duration }, i) => (
          <span
            key={i}
            className="welcome-card__fx-icon"
            style={{ top, left, animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
          >
            <Icon style={{ width: size, height: size }} strokeWidth={1.8} />
          </span>
        ))}
      </div>

      <div className="welcome-card__text">
        <h1 className="welcome-card__title">
          {text.split(' ').map((word, i) => (
            <span key={`${word}-${i}`} className="welcome-card__word" style={{ animationDelay: `${i * 0.15}s` }}>
              {word}
            </span>
          ))}
        </h1>
        <p className="welcome-card__subtitle">{subtitle}</p>
      </div>

      {action && <div className="welcome-card__action">{action}</div>}
    </section>
  );
}
