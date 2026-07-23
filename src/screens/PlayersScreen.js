import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, POSICOES } from '../theme';
import PlayerRow from '../components/PlayerRow';

export default function PlayersScreen() {
  const { players, togglePresente, marcarTodosPresentes, addPlayer, updatePlayer, deletePlayer } = useApp();
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null); // player object ou null (novo)
  const [nome, setNome] = useState('');
  const [posicao, setPosicao] = useState('Meia');
  const [nota, setNota] = useState(3);

  const filtered = players
    .filter((p) => p.nome.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.nome.localeCompare(b.nome));

  const presentesCount = players.filter((p) => p.presente).length;

  function abrirNovo() {
    setEditing(null);
    setNome('');
    setPosicao('Meia');
    setNota(3);
    setModalVisible(true);
  }

  function abrirEdicao(p) {
    setEditing(p);
    setNome(p.nome);
    setPosicao(p.posicao);
    setNota(p.nota);
    setModalVisible(true);
  }

  async function salvar() {
    if (!nome.trim()) {
      Alert.alert('Ops', 'Digita um nome pro jogador');
      return;
    }
    try {
      if (editing) {
        await updatePlayer(editing.id, { nome: nome.trim(), posicao, nota });
      } else {
        await addPlayer({ nome: nome.trim(), posicao, nota });
      }
      setModalVisible(false);
    } catch (e) {
      Alert.alert('Erro ao salvar', e.message);
    }
  }

  async function excluir() {
    if (!editing) return;
    try {
      await deletePlayer(editing.id);
      setModalVisible(false);
    } catch (e) {
      Alert.alert('Erro ao excluir', e.message);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Jogadores</Text>
        <View style={styles.pill}><Text style={styles.pillText}>{players.length}</Text></View>
      </View>

      {players.length > 0 && (
        <>
          <TextInput
            style={styles.search}
            placeholder="Buscar jogador..."
            placeholderTextColor={colors.textFaint}
            value={search}
            onChangeText={setSearch}
          />
          <View style={styles.presenceBar}>
            <Text style={styles.presenceText}>Presentes hoje: {presentesCount}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={styles.smallBtn} onPress={() => marcarTodosPresentes(true)}>
                <Text style={styles.smallBtnText}>Marcar todos</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.smallBtn} onPress={() => marcarTodosPresentes(false)}>
                <Text style={styles.smallBtnText}>Limpar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>👥</Text>
            <Text style={styles.emptyTitle}>{players.length === 0 ? 'Nenhum jogador ainda' : 'Ninguém encontrado'}</Text>
            <Text style={styles.emptyText}>
              {players.length === 0 ? 'Toque no + para cadastrar o primeiro craque.' : 'Tenta buscar por outro nome.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <PlayerRow player={item} onTogglePresente={togglePresente} onEdit={abrirEdicao} />
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={abrirNovo}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{editing ? 'Editar jogador' : 'Novo jogador'}</Text>

            <Text style={styles.label}>Nome</Text>
            <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome do craque" placeholderTextColor={colors.textFaint} autoFocus />

            <Text style={styles.label}>Posição</Text>
            <View style={styles.seg}>
              {POSICOES.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.segBtn, posicao === p && styles.segBtnActive]}
                  onPress={() => setPosicao(p)}
                >
                  <Text style={[styles.segBtnText, posicao === p && styles.segBtnTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Nível (1 a 5 estrelas)</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity key={n} onPress={() => setNota(n)}>
                  <Text style={[styles.star, n <= nota && styles.starOn]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.actions}>
              {editing && (
                <TouchableOpacity style={styles.btnDanger} onPress={excluir}>
                  <Text style={styles.btnDangerText}>Excluir</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.btnPrimary} onPress={salvar}>
                <Text style={styles.btnPrimaryText}>Salvar</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={() => setModalVisible(false)}>
              <Text style={{ color: colors.textFaint }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 10 },
  title: { fontSize: 20, fontWeight: '900', color: colors.text },
  pill: { backgroundColor: colors.surface2, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  pillText: { color: colors.textDim, fontWeight: '700', fontSize: 12 },
  search: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 13, padding: 11, color: colors.text, marginBottom: 12 },
  presenceBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 12, marginBottom: 14 },
  presenceText: { color: colors.textDim, fontWeight: '700', fontSize: 13 },
  smallBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 11, paddingHorizontal: 10, paddingVertical: 7 },
  smallBtnText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { color: colors.text, fontWeight: '700', marginBottom: 4 },
  emptyText: { color: colors.textFaint, textAlign: 'center' },
  fab: {
    position: 'absolute', right: 18, bottom: 24, width: 58, height: 58, borderRadius: 29,
    backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.gold, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  fabText: { fontSize: 28, color: '#26170a', fontWeight: '900' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(4,12,10,0.75)' },
  sheet: { backgroundColor: colors.bg2, borderTopLeftRadius: 22, borderTopRightRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 20, paddingBottom: 36 },
  handle: { width: 38, height: 4, backgroundColor: colors.border, borderRadius: 3, alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { color: colors.text, fontSize: 18, fontWeight: '900', marginBottom: 16 },
  label: { color: colors.textDim, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, color: colors.text, fontSize: 15 },
  seg: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  segBtn: { flexGrow: 1, minWidth: 70, paddingVertical: 10, borderRadius: 11, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center' },
  segBtnActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  segBtnText: { color: colors.textDim, fontWeight: '700', fontSize: 13 },
  segBtnTextActive: { color: '#26170a' },
  starsRow: { flexDirection: 'row', gap: 8 },
  star: { fontSize: 30, color: colors.border },
  starOn: { color: colors.gold },
  actions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  btnPrimary: { flex: 1, backgroundColor: colors.gold, borderRadius: 14, padding: 14, alignItems: 'center' },
  btnPrimaryText: { color: '#26170a', fontWeight: '800', fontSize: 15 },
  btnDanger: { flex: 1, backgroundColor: 'rgba(228,87,46,0.15)', borderWidth: 1, borderColor: 'rgba(228,87,46,0.35)', borderRadius: 14, padding: 14, alignItems: 'center' },
  btnDangerText: { color: '#ff8b66', fontWeight: '800', fontSize: 15 },
});
