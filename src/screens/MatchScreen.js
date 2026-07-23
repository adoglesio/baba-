import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

function fmtTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function MatchScreen() {
  const { draw, match, iniciarPartida, marcarGol, toggleTimer, tick, encerrarRodada, teamName } = useApp();
  const [duration, setDuration] = useState('10');
  const [goalTarget, setGoalTarget] = useState('2');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (match && match.running) {
      intervalRef.current = setInterval(() => tick(), 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [match && match.running]);

  useEffect(() => {
    if (match && match.running && match.seconds === 0) {
      encerrarRodada();
    }
  }, [match && match.seconds]);

  useEffect(() => {
    if (match && match.goalTarget > 0 && (match.scoreA >= match.goalTarget || match.scoreB >= match.goalTarget)) {
      encerrarRodada();
    }
  }, [match && match.scoreA, match && match.scoreB]);

  if (!draw) {
    return (
      <View style={styles.empty}>
        <Text style={{ fontSize: 40, marginBottom: 10 }}>🏟️</Text>
        <Text style={styles.emptyTitle}>Sem times sorteados</Text>
        <Text style={styles.emptyText}>Vai na aba Sorteio pra montar os times antes da partida.</Text>
      </View>
    );
  }

  if (!match) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Formato "vencedor fica"</Text>
          <Text style={styles.helperText}>
            O time que ganhar continua em quadra. Quem perde vai pro fim da fila. Configure o tempo ou a meta de gols de cada rodada.
          </Text>
          <Text style={styles.label}>Duração de cada partida (minutos)</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={duration} onChangeText={setDuration} />
          <Text style={styles.label}>Meta de gols pra vencer antes do tempo (0 = sem meta)</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={goalTarget} onChangeText={setGoalTarget} />
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() =>
              iniciarPartida({ duration: parseInt(duration) || 10, goalTarget: parseInt(goalTarget) || 0 })
            }
          >
            <Text style={styles.primaryBtnText}>Começar partida</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const teamA = match.onFieldA;
  const teamB = match.onFieldB;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.card}>
        <View style={styles.scoreBoard}>
          <View style={styles.scoreSide}>
            <Text style={[styles.scoreTeam, { color: teamA.cor }]}>{teamName(teamA)}</Text>
            <Text style={styles.scoreNum}>{match.scoreA}</Text>
            <View style={styles.scoreBtns}>
              <TouchableOpacity style={styles.roundBtn} onPress={() => marcarGol('A', 1)}>
                <Text style={styles.roundBtnText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.roundBtn} onPress={() => marcarGol('A', -1)}>
                <Text style={styles.roundBtnText}>–</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.vs}>x</Text>
          <View style={styles.scoreSide}>
            <Text style={[styles.scoreTeam, { color: teamB.cor }]}>{teamName(teamB)}</Text>
            <Text style={styles.scoreNum}>{match.scoreB}</Text>
            <View style={styles.scoreBtns}>
              <TouchableOpacity style={styles.roundBtn} onPress={() => marcarGol('B', 1)}>
                <Text style={styles.roundBtnText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.roundBtn} onPress={() => marcarGol('B', -1)}>
                <Text style={styles.roundBtnText}>–</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.timer}>{fmtTime(match.seconds)}</Text>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={[styles.flexBtn, match.running ? styles.outlineBtn : styles.primaryBtnFlex]} onPress={toggleTimer}>
            <Text style={match.running ? styles.outlineBtnText : styles.primaryBtnText}>
              {match.running ? '⏸ Pausar' : '▶ Iniciar tempo'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.flexBtn, styles.outlineBtn]} onPress={encerrarRodada}>
            <Text style={styles.outlineBtnText}>🏁 Encerrar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Fila de espera (vencedor fica)</Text>
        {match.queue.length === 0 ? (
          <Text style={styles.helperText}>Ninguém esperando — só esses dois times.</Text>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {match.queue.map((tid) => {
              const t = draw.teams.find((x) => x.id === tid);
              return (
                <View key={tid} style={styles.queueChip}>
                  <View style={[styles.bibDot, { backgroundColor: t.cor }]} />
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>{teamName(t)}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 6 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 16, marginBottom: 14 },
  cardTitle: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: colors.textDim, fontWeight: '700', marginBottom: 10 },
  helperText: { color: colors.textFaint, fontSize: 13, lineHeight: 19, marginBottom: 10 },
  label: { color: colors.textDim, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginTop: 10, marginBottom: 6 },
  input: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, color: colors.text },
  primaryBtn: { backgroundColor: colors.gold, borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 16 },
  primaryBtnFlex: { backgroundColor: colors.gold },
  primaryBtnText: { color: '#26170a', fontWeight: '800', fontSize: 15 },
  flexBtn: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center' },
  outlineBtn: { borderWidth: 1.5, borderColor: colors.border },
  outlineBtnText: { color: colors.text, fontWeight: '700', fontSize: 15 },
  scoreBoard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  scoreSide: { flex: 1, alignItems: 'center' },
  scoreTeam: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  scoreNum: { fontSize: 52, fontWeight: '900', color: colors.text, marginVertical: 6 },
  scoreBtns: { flexDirection: 'row', gap: 8 },
  roundBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  roundBtnText: { color: colors.text, fontSize: 20, fontWeight: '800' },
  vs: { color: colors.textFaint, fontWeight: '700' },
  timer: { textAlign: 'center', fontSize: 36, fontWeight: '900', color: colors.text, marginVertical: 14 },
  queueChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, marginRight: 8, marginBottom: 8 },
  bibDot: { width: 12, height: 12, borderRadius: 4 },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 30 },
  emptyTitle: { color: colors.text, fontWeight: '700', marginBottom: 4 },
  emptyText: { color: colors.textFaint, textAlign: 'center' },
});
