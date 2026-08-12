import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, initials, colorFromName } from '../theme';

export default function StatsScreen() {
  const { players, history } = useApp();

  if (players.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={{ fontSize: 40, marginBottom: 10 }}>📊</Text>
        <Text style={styles.emptyTitle}>Sem estatísticas ainda</Text>
        <Text style={styles.emptyText}>Jogue algumas partidas e o ranking aparece aqui.</Text>
      </View>
    );
  }

  const porVitorias = [...players].sort((a, b) => (b.vitorias || 0) - (a.vitorias || 0) || (b.gols || 0) - (a.gols || 0));
  const porGols = [...players].sort((a, b) => (b.gols || 0) - (a.gols || 0));
  const porAssist = [...players].sort((a, b) => (b.assistencias || 0) - (a.assistencias || 0));

  // agrega o histórico por cor de time: quantas vezes venceu e quantos gols fez vencendo
  const porTime = {};
  history.forEach((h) => {
    if (h.vencedor === 'Empate') return;
    const golsDoVencedor = h.vencedor === h.time_a ? h.placar_a : h.placar_b;
    if (!porTime[h.vencedor]) porTime[h.vencedor] = { nome: h.vencedor, vitorias: 0, gols: 0 };
    porTime[h.vencedor].vitorias += 1;
    porTime[h.vencedor].gols += golsDoVencedor;
  });
  const rankingTimes = Object.values(porTime).sort((a, b) => b.vitorias - a.vitorias || b.gols - a.gols);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      {rankingTimes.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Times que mais venceram</Text>
          {rankingTimes.map((t, i) => (
            <View key={t.nome} style={styles.rankRow}>
              <Text style={[styles.rankNum, i === 0 && { color: colors.gold }]}>{i + 1}</Text>
              <Text style={styles.rankName} numberOfLines={1}>
                {t.nome} <Text style={{ color: colors.textFaint, fontWeight: '400', fontSize: 12 }}>· {t.gols} gols feitos vencendo</Text>
              </Text>
              <Text style={styles.rankVal}>{t.vitorias}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mais vitórias</Text>
        {porVitorias.slice(0, 10).map((p, i) => (
          <RankRow key={p.id} i={i} p={p} val={p.vitorias || 0} />
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Artilharia</Text>
        {porGols.slice(0, 10).map((p, i) => (
          <RankRow key={p.id} i={i} p={p} val={p.gols || 0} />
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mais assistências</Text>
        {porAssist.slice(0, 10).map((p, i) => (
          <RankRow key={p.id} i={i} p={p} val={p.assistencias || 0} />
        ))}
      </View>
      {history.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Histórico recente</Text>
          {history.slice(0, 8).map((h) => (
            <View key={h.id} style={styles.histRow}>
              <Text style={{ color: colors.text, fontWeight: '700', flex: 1 }}>
                {h.time_a} {h.placar_a} x {h.placar_b} {h.time_b}
              </Text>
              <Text style={{ color: colors.textFaint, fontSize: 11 }}>
                {h.vencedor === 'Empate' ? 'Empate' : `🏆 ${h.vencedor}`}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function RankRow({ i, p, val }) {
  const jogos = p.jogos || 0;
  const aproveitamento = jogos ? Math.round(((p.vitorias || 0) / jogos) * 100) : 0;
  return (
    <View style={styles.rankRow}>
      <Text style={[styles.rankNum, i === 0 && { color: colors.gold }]}>{i + 1}</Text>
      <View style={[styles.avatar, { backgroundColor: colorFromName(p.nome) }]}>
        <Text style={styles.avatarText}>{initials(p.nome)}</Text>
      </View>
      <Text style={styles.rankName} numberOfLines={1}>
        {p.nome} <Text style={{ color: colors.textFaint, fontWeight: '400', fontSize: 12 }}>· {jogos} jogos · {aproveitamento}% aprov.</Text>
      </Text>
      <Text style={styles.rankVal}>{val}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 6 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 16, marginBottom: 14 },
  cardTitle: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: colors.textDim, fontWeight: '700', marginBottom: 10 },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderColor: colors.border },
  rankNum: { width: 20, textAlign: 'center', fontWeight: '900', color: colors.textFaint },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#0a1f1a', fontWeight: '800', fontSize: 11 },
  rankName: { flex: 1, color: colors.text, fontWeight: '700', fontSize: 14 },
  rankVal: { color: colors.gold, fontWeight: '900', fontSize: 16, minWidth: 30, textAlign: 'right' },
  histRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: colors.border },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 30 },
  emptyTitle: { color: colors.text, fontWeight: '700', marginBottom: 4 },
  emptyText: { color: colors.textFaint, textAlign: 'center' },
});
