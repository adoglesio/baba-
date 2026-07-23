import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

export default function HomeScreen({ navigation }) {
  const { players, groups, draw, match, history, saveGroup, loadGroup, deleteGroup, teamName } = useApp();
  const [groupModal, setGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');

  const presentes = players.filter((p) => p.presente).length;
  const ultimo = history[0];

  async function confirmarSalvarGrupo() {
    if (!groupName.trim()) return;
    await saveGroup(groupName.trim());
    setGroupName('');
    setGroupModal(false);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Hoje</Text>
        <View style={{ flexDirection: 'row' }}>
          <Stat value={players.length} label="no elenco" />
          <Stat value={presentes} label="presentes hoje" bordered />
          <Stat value={draw ? draw.teams.length : '–'} label="times sorteados" />
        </View>
      </View>

      {players.length === 0 ? (
        <ActionCard
          text="Ainda não tem jogador cadastrado. Chama a galera pro elenco antes de sortear os times."
          buttonLabel="Cadastrar jogadores"
          onPress={() => navigation.navigate('Jogadores')}
        />
      ) : presentes < 2 ? (
        <ActionCard
          text="Marca quem chegou hoje na aba Jogadores pra já deixar o sorteio pronto."
          buttonLabel="Marcar presença"
          onPress={() => navigation.navigate('Jogadores')}
        />
      ) : (
        <ActionCard
          text={`${presentes} na área. Bora sortear os times?`}
          buttonLabel="Sortear times"
          onPress={() => navigation.navigate('Sorteio')}
        />
      )}

      {match ? (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Partida')}>
          <Text style={styles.cardTitle}>Partida rolando</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>
              {teamName(match.onFieldA)} <Text style={{ color: colors.textFaint }}>vs</Text> {teamName(match.onFieldB)}
            </Text>
            <Text style={{ color: colors.gold, fontWeight: '900', fontSize: 20 }}>
              {match.scoreA} – {match.scoreB}
            </Text>
          </View>
        </TouchableOpacity>
      ) : ultimo ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Última partida</Text>
          <Text style={{ color: colors.text, fontWeight: '700' }}>
            {ultimo.time_a} {ultimo.placar_a} x {ultimo.placar_b} {ultimo.time_b}
          </Text>
          <Text style={{ color: colors.textFaint, fontSize: 12, marginTop: 4 }}>Venceu: {ultimo.vencedor}</Text>
        </View>
      ) : null}

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Grupos salvos</Text>
      </View>
      {groups.length === 0 ? (
        <Text style={styles.helperText}>
          Salve a lista de presentes de hoje como um grupo (ex: "Baba de quinta") pra marcar presença rápido da próxima vez.
        </Text>
      ) : (
        groups.map((g) => (
          <View key={g.id} style={styles.groupRow}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{g.nome}</Text>
              <Text style={{ color: colors.textFaint, fontSize: 12 }}>{g.player_ids.length} jogadores</Text>
            </View>
            <TouchableOpacity
              style={styles.useBtn}
              onPress={async () => {
                await loadGroup(g.id);
                navigation.navigate('Jogadores');
              }}
            >
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>Usar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Alert.alert('Excluir grupo', `Remover "${g.nome}"?`, [
                  { text: 'Cancelar' },
                  { text: 'Excluir', style: 'destructive', onPress: () => deleteGroup(g.id) },
                ])
              }
              style={{ padding: 8 }}
            >
              <Text style={{ color: colors.textFaint }}>✕</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
      {presentes > 0 && (
        <TouchableOpacity onPress={() => setGroupModal(true)}>
          <Text style={styles.linkBtn}>+ salvar presentes de hoje como grupo</Text>
        </TouchableOpacity>
      )}

      <Modal visible={groupModal} transparent animationType="fade" onRequestClose={() => setGroupModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16, marginBottom: 12 }}>Nome do grupo</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: Baba de quinta"
              placeholderTextColor={colors.textFaint}
              value={groupName}
              onChangeText={setGroupName}
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity style={styles.modalBtnOutline} onPress={() => setGroupModal(false)}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnPrimary} onPress={confirmarSalvarGrupo}>
                <Text style={{ color: '#26170a', fontWeight: '800' }}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function Stat({ value, label, bordered }) {
  return (
    <View style={[styles.stat, bordered && styles.statBordered]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionCard({ text, buttonLabel, onPress }) {
  return (
    <View style={styles.card}>
      <Text style={styles.helperText}>{text}</Text>
      <TouchableOpacity style={styles.primaryBtn} onPress={onPress}>
        <Text style={styles.primaryBtnText}>{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 6 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 16, marginBottom: 14 },
  cardTitle: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: colors.textDim, fontWeight: '700', marginBottom: 10 },
  stat: { flex: 1, alignItems: 'center' },
  statBordered: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border },
  statValue: { fontSize: 26, fontWeight: '900', color: colors.gold },
  statLabel: { fontSize: 11, color: colors.textFaint, marginTop: 2 },
  helperText: { color: colors.textFaint, fontSize: 13, lineHeight: 19, marginBottom: 14 },
  primaryBtn: { backgroundColor: colors.gold, borderRadius: 14, padding: 14, alignItems: 'center' },
  primaryBtnText: { color: '#26170a', fontWeight: '800', fontSize: 15 },
  sectionRow: { marginTop: 6, marginBottom: 10 },
  sectionTitle: { color: colors.text, fontWeight: '800', fontSize: 15 },
  groupRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, marginBottom: 8 },
  useBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 11, paddingHorizontal: 12, paddingVertical: 8 },
  linkBtn: { color: colors.gold, fontWeight: '700', fontSize: 13, paddingVertical: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(4,12,10,0.75)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalBox: { backgroundColor: colors.bg2, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 20, width: '100%' },
  modalInput: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, color: colors.text },
  modalBtnOutline: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, alignItems: 'center' },
  modalBtnPrimary: { flex: 1, backgroundColor: colors.gold, borderRadius: 14, padding: 12, alignItems: 'center' },
});
