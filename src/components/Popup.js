import React, { useEffect } from 'react';
import {
    I18nManager,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { usePopup } from '../context/PopupContext';

const Popup = () => {
  const { queue, dismiss } = usePopup();
  const current = queue[0] || null;

  useEffect(() => {
    if (!current) return;
    if (current.type === 'toast') {
      const timeout = setTimeout(() => dismiss(current.id), current.duration || 3000);
      return () => clearTimeout(timeout);
    }
  }, [current, dismiss]);

  if (!current) return null;

  const alignment = I18nManager.isRTL ? 'flex-start' : 'flex-end';

  if (current.type === 'banner') {
    return (
      <View style={[styles.bannerContainer, { alignItems: alignment }]}>
        <View style={styles.banner}>
              <View style={styles.bannerBody}>
                {current.title ? <Text style={styles.bannerTitle}>{current.title}</Text> : null}
                <Text style={styles.bannerText}>{current.message}</Text>
              </View>
              <TouchableOpacity onPress={() => dismiss(current.id)} style={styles.bannerClose}>
                <Text style={styles.closeText}>×</Text>
              </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (current.type === 'alert') {
    return (
      <Modal transparent animationType="fade" visible>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
                {current.title ? <Text style={styles.modalTitle}>{current.title}</Text> : null}
                <Text style={styles.modalText}>{current.message}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => dismiss(current.id)}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <View style={[styles.toastContainer, { alignItems: alignment }]}>
      <View style={styles.toast}>
          <View style={styles.toastRow}>
            <View style={styles.toastBody}>
              {current.title ? <Text style={styles.toastTitle}>{current.title}</Text> : null}
              <Text style={styles.toastText}>{current.message}</Text>
            </View>
            <TouchableOpacity onPress={() => dismiss(current.id)} style={styles.toastClose}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
  },
  toast: {
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  toastText: {
    color: '#fff',
  },
  bannerContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  banner: {
    backgroundColor: '#2b6cb0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerBody: {
    flex: 1,
  },
  bannerTitle: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 4,
  },
  bannerClose: {
    marginLeft: 12,
  },
  bannerText: {
    color: '#fff',
  },
  toastRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toastBody: {
    flex: 1,
  },
  toastTitle: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 2,
  },
  toastClose: {
    marginLeft: 12,
  },
  closeText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modalButtonText: {
    color: '#2b6cb0',
    fontWeight: '600',
  },
});

export default Popup;

