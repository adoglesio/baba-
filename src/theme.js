export const colors = {
  bg: '#0a1f1a',
  bg2: '#0d2620',
  surface: '#123830',
  surface2: '#17453b',
  border: '#1f5346',
  gold: '#f2a93b',
  goldDim: '#c9862a',
  blue: '#3d8bd4',
  coral: '#e4572e',
  greenBib: '#4cae7d',
  text: '#f4efe4',
  textDim: '#93b3a7',
  textFaint: '#5f8377',
  danger: '#e4572e',
};

export const BIBS = [
  { nome: 'Colete Amarelo', cor: '#f2c14e' },
  { nome: 'Colete Azul', cor: '#3d8bd4' },
  { nome: 'Colete Vermelho', cor: '#e4572e' },
  { nome: 'Colete Verde', cor: '#4cae7d' },
];

export const POSICOES = ['Goleiro', 'Zagueiro', 'Meia', 'Atacante'];

export function initials(nome) {
  return nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

export function colorFromName(nome) {
  const palette = ['#f2a93b', '#3d8bd4', '#e4572e', '#4cae7d', '#a06cd5', '#e0607e'];
  let h = 0;
  for (const c of nome) h = (h * 31 + c.charCodeAt(0)) % 997;
  return palette[h % palette.length];
}

export function stars(n) {
  return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);
}
