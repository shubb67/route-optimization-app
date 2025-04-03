import React, { useState } from 'react';
import {
  Modal,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';

type Props = {
  currentRole: string;
  onChange: (role: string) => void;
};

const roles = [
  { label: 'Driver', value: 'Driver', icon: '🚚' },
  { label: 'Admin', value: 'Admin', icon: '🛠' },
];

const RoleSwitcher: React.FC<Props> = ({ currentRole, onChange }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (role: string) => {
    setModalVisible(false);
    onChange(role);
  };

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.dropdownText}>
          {roles.find(r => r.value === currentRole)?.icon} {currentRole}
        </Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Your Role</Text>
            <FlatList
              data={roles}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.roleItem}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text style={styles.roleText}>
                    {item.icon} {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtn}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default RoleSwitcher;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginVertical: 20,
  },
  dropdownButton: {
    backgroundColor: '#e5e5e5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
  },
  roleItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  roleText: {
    fontSize: 16,
  },
  closeBtn: {
    color: '#00a6ff',
    fontWeight: '600',
    marginTop: 16,
  },
});
