import { BIBS } from '../theme';

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// embaralha mas mantém ordem geral de força (só baralha empates) — evita virar loteria pura
function shuffleEqualRank(arr) {
  const grupos = {};
  arr.forEach((p) => {
    (grupos[p.nota] = grupos[p.nota] || []).push(p);
  });
  const notas = Object.keys(grupos).map(Number).sort((a, b) => b - a);
  let out = [];
  notas.forEach((n) => {
    const g = grupos[n];
    for (let i = g.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [g[i], g[j]] = [g[j], g[i]];
    }
    out = out.concat(g);
  });
  return out;
}

// Distribui jogadores em N times, equilibrando por nota e evitando
// que todos os goleiros (ou todos os "craques") caiam no mesmo time.
export function gerarTimes(players, numTimes) {
  const teams = Array.from({ length: numTimes }, (_, i) => ({
    ...BIBS[i % BIBS.length],
    id: uid(),
    players: [],
    soma: 0,
  }));

  const goleiros = players.filter((p) => p.posicao === 'Goleiro').sort((a, b) => b.nota - a.nota);
  const linha = players.filter((p) => p.posicao !== 'Goleiro').sort((a, b) => b.nota - a.nota);

  shuffleEqualRank(goleiros).forEach((p, i) => {
    const t = teams[i % teams.length];
    t.players.push(p.id);
    t.soma += p.nota;
  });

  shuffleEqualRank(linha).forEach((p) => {
    const t = teams.reduce((min, cur) => (cur.soma < min.soma ? cur : min), teams[0]);
    t.players.push(p.id);
    t.soma += p.nota;
  });

  let melhorou = true;
  let tentativas = 0;
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  while (melhorou && tentativas < 200) {
    melhorou = false;
    tentativas++;
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        for (const idA of teams[i].players) {
          for (const idB of teams[j].players) {
            const pA = byId[idA];
            const pB = byId[idB];
            if ((pA.posicao === 'Goleiro') !== (pB.posicao === 'Goleiro')) continue;
            const diffAtual = Math.abs(teams[i].soma - teams[j].soma);
            const novoI = teams[i].soma - pA.nota + pB.nota;
            const novoJ = teams[j].soma - pB.nota + pA.nota;
            if (Math.abs(novoI - novoJ) < diffAtual) {
              teams[i].players = teams[i].players.map((id) => (id === idA ? idB : id));
              teams[j].players = teams[j].players.map((id) => (id === idB ? idA : id));
              teams[i].soma = novoI;
              teams[j].soma = novoJ;
              melhorou = true;
            }
          }
        }
      }
    }
  }
  return teams;
}
