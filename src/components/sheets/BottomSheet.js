import React, { useRef } from 'react';
import {
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    PanResponder,
    Platform,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

const BottomSheet = ({
  collapsedHeight = 140,
  expandedHeight = screenHeight * 0.6,
  startExpanded = true,
  children,
}) => {
  const maxTranslateY = 0;
  const minTranslateY = expandedHeight - collapsedHeight;

  const translateY = useRef(new Animated.Value(startExpanded ? maxTranslateY : minTranslateY)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newY = minTranslateY + gestureState.dy;
        if (newY >= maxTranslateY && newY <= minTranslateY) {
          translateY.setValue(newY);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const shouldExpand = gestureState.vy < 0 || gestureState.dy < 0;
        Animated.spring(translateY, {
          toValue: shouldExpand ? maxTranslateY : minTranslateY,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: expandedHeight,
          transform: [{ translateY }],
        },
      ]}>
      <View style={styles.handleArea} {...panResponder.panHandlers}>
        <View style={styles.handle} />
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  handleArea: {
    paddingTop: 8,
    paddingBottom: 4,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e5e7eb',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  flex: {
    flex: 1,
  },
});

export default BottomSheet;
