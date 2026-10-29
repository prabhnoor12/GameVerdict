/**
 * Verdict card image export: renders a 1200x630 share image on a <canvas>
 * (no dependencies) for Discord / Reddit / X, where links alone underperform.
 */

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxWidth && line) {
      lines.push(line);
      line = w;
      if (lines.length === maxLines) break;
    } else {
      line = t;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
  return lines.length;
}

export function verdictImageURL(game) {
  const g = game || {};
  const c = document.createElement('canvas');
  c.width = 1200;
  c.height = 630;
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, 1200, 630);
  ctx.strokeStyle = '#27272a';
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 8, 1184, 614);

  ctx.fillStyle = '#6ee7b7';
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.fillText('🎮 GAMEVERDICT', 60, 80);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 64px system-ui, sans-serif';
  const titleLines = wrapText(ctx, g.title || 'Unknown game', 60, 160, 700, 74, 2);

  const score = g.unifiedConsensusPercent == null ? '—' : `${g.unifiedConsensusPercent}%`;
  ctx.fillStyle = '#34d399';
  ctx.font = '900 150px system-ui, monospace';
  ctx.fillText(score, 60, 160 + titleLines * 74 + 130);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 34px system-ui, sans-serif';
  ctx.fillText(String(g.verdictBadge || '').slice(0, 60), 60, 160 + titleLines * 74 + 185);

  const v = g.threeSentenceVerdict || {};
  ctx.fillStyle = '#d4d4d8';
  ctx.font = '28px system-ui, sans-serif';
  let y = 470;
  y += wrapText(ctx, `🟢 ${v.coreHook || ''}`, 60, y, 1080, 38, 2) * 38 + 14;
  y += wrapText(ctx, `🎯 ${v.targetAudience || ''}`, 60, y, 1080, 38, 2) * 38 + 14;

  ctx.fillStyle = '#71717a';
  ctx.font = '24px system-ui, sans-serif';
  ctx.fillText('Zero-fluff consensus · Steam + OpenCritic + Metacritic', 60, 590);

  return c.toDataURL('image/png');
}

export function downloadVerdictImage(game) {
  try {
    const a = document.createElement('a');
    a.href = verdictImageURL(game);
    a.download = `gameverdict-${String(game?.id || 'verdict').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return true;
  } catch {
    return false;
  }
}
