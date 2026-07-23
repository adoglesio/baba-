import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, initials, colorFromName, stars } from '../theme';

export default function PlayerRow({ player, onTogglePresente, onEdit }) {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.checkbox, player.presente && styles.checkboxOn]}
        onPress={() => onTogglePresente(player.id)}
      >
        {player.presente ? <Text style={styles.checkMark}>✓</Text> : null}
      </TouchableOpacity>

      <View style={[styles.avatar, { backgroundColor: colorFromName(player.nome) }]}>
        <Text style={styles.avatarText}>{initials(player.nome)}</Text>
      </View>

      <TouchableOpacity style={styles.info} onPress={() => onEdit(player)}>
        <Text style={styles.name} numberOfLines={1}>{player.nome}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.posTag}>{player.posicao}</Text>
          <Text style={styles.starsText}>{stars(player.nota)}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(player)}>
        <Text style={{ color: colors.textFaint, fontSize: 16 }}>✎</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    marginBottom: 8,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  checkMark: { color: '#26170a', fontWeight: '900', fontSize: 14 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#0a1f1a', fontWeight: '800', fontSize: 14 },
  info: { flex: 1 },
  name: { color: colors.text, fontWeight: '700', fontSize: 15 },
  metaRow: { flexDirection: 'row', gap: 6, marginTop: 3, alignItems: 'center' },
  posTag: { fontSize: 10, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, backgroundColor: colors.surface2, color: colors.textDim, fontWeight: '700', overflow: 'hidden' },
  starsText: { color: colors.gold, fontSize: 11 },
  editBtn: { padding: 6 },
});
