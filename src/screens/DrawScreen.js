import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

export default function DrawScreen({ navigation }) {
  const { players, draw, sortear } = useApp();
  const [numTimes, setNumTimes] = useState(2);

  const presentes = players.filter((p) => p.presente);
  const podeGerar = presentes.length >= 2;
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quem vai jogar</Text>
        <Text style={styles.helperText}>
          {presentes.length} jogador(es) marcado(s) como presente. Ajusta na aba Jogadores se faltar alguém.
        </Text>

        <Text style={[styles.cardTitle, { marginTop: 6 }]}>Quantos times?</Text>
        <View style={styles.seg}>
          {[2, 3, 4].map((n) => (
            <TouchableOpacity
              key={n}
              style={[styles.segBtn, numTimes === n && styles.segBtnActive]}
              onPress={() => setNumTimes(n)}
            >
              <Text style={[styles.segText, numTimes === n && styles.segTextActive]}>{n} times</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, !podeGerar && { opacity: 0.4 }]}
          disabled={!podeGerar}
          onPress={() => sortear(numTimes)}
        >
          <Text style={styles.primaryBtnText}>{draw ? '🔀 Sortear de novo' : '🔀 Sortear times'}</Text>
        </TouchableOpacity>
        {!podeGerar && <Text style={styles.helperText}>Marque pelo menos 2 jogadores presentes pra sortear.</Text>}
      </View>

      {draw &&
        draw.teams.map((t) => {
          const jogadores = t.players.map((id) => byId[id]).filter(Boolean);
          const media = jogadores.length
            ? Math.round((jogadores.reduce((a, p) => a + p.nota, 0) / jogadores.length) * 10) / 10
            : 0;
          return (
            <View key={t.id} style={[styles.teamBlock, { borderColor: colors.border }]}>
              <View style={styles.teamHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.bibDot, { backgroundColor: t.cor }]} />
                  <Text style={styles.teamName}>{t.nome}</Text>
                </View>
                <View style={styles.avgTag}>
                  <Text style={{ color: colors.textDim, fontSize: 12 }}>média {media}</Text>
                </View>
              </View>
              {jogadores.map((p) => (
                <View key={p.id} style={styles.miniPlayer}>
                  <Text style={{ color: colors.text, flex: 1 }}>{p.nome}</Text>
                  <Text style={styles.posTag}>{p.posicao}</Text>
                </View>
              ))}
            </View>
          );
        })}

      {draw && (
        <TouchableOpacity style={styles.outlineBtn} onPress={() => navigation.navigate('Partida')}>
          <Text style={styles.outlineBtnText}>Ir para a partida →</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 6 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 16, marginBottom: 14 },
  cardTitle: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: colors.textDim, fontWeight: '700', marginBottom: 10 },
  helperText: { color: colors.textFaint, fontSize: 13, lineHeight: 19, marginBottom: 10 },
  seg: { flexDirection: 'row', gap: 6 },
  segBtn: { flex: 1, paddingVertical: 10, borderRadius: 11, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center' },
  segBtnActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  segText: { color: colors.textDim, fontWeight: '700', fontSize: 13 },
  segTextActive: { color: '#26170a' },
  primaryBtn: { backgroundColor: colors.gold, borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 16 },
  primaryBtnText: { color: '#26170a', fontWeight: '800', fontSize: 15 },
  teamBlock: { borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 14, backgroundColor: colors.surface },
  teamHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  bibDot: { width: 14, height: 14, borderRadius: 4 },
  teamName: { color: colors.text, fontWeight: '900', fontSize: 15 },
  avgTag: { backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8 },
  miniPlayer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  posTag: { fontSize: 10, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, backgroundColor: colors.surface2, color: colors.textDim, fontWeight: '700' },
  outlineBtn: { borderWidth: 1.5, borderColor: colors.border, borderRadius: 14, padding: 14, alignItems: 'center', marginBottom: 20 },
  outlineBtnText: { color: colors.text, fontWeight: '700', fontSize: 15 },
});
