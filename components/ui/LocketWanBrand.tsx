import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);


export const LocketWanTypewriter: React.FC = () => {
  const brandText = "Locket Wan";

  return (
    <View style={styles.brandContainer}>
      <View style={styles.typewriterContainer}>
        <View style={styles.brandTextContainer}>
          {brandText.split('').map((char, index) => {
            const opacity = useSharedValue(0);
            const scale = useSharedValue(0.5);

            useEffect(() => {
              const delay = index * 200;
              
              opacity.value = withRepeat(
                withSequence(
                  withDelay(delay, withTiming(1, { duration: 100 })),
                  withDelay(2000, withTiming(0, { duration: 100 }))
                ),
                -1,
                false
              );

              scale.value = withRepeat(
                withSequence(
                  withDelay(delay, withSpring(1, { damping: 10 })),
                  withDelay(2000, withTiming(0.5, { duration: 100 }))
                ),
                -1,
                false
              );
            }, []);

            const animatedStyle = useAnimatedStyle(() => ({
              opacity: opacity.value,
              transform: [{ scale: scale.value }],
            }));

            return (
              <Animated.Text
                key={`${char}-${index}`}
                style={[styles.typewriterChar, animatedStyle]}
              >
                {char}
              </Animated.Text>
            );
          })}
          
          {/* Blinking cursor */}
          <BlinkingCursor />
        </View>
      </View>
    </View>
  );
};

const BlinkingCursor = () => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.cursor, animatedStyle]}>
      |
    </Animated.Text>
  );
};


// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  brandContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

 


  // Typewriter
  typewriterContainer: {
    padding: 16,
  },
  typewriterChar: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 1,
  },
  cursor: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginLeft: 2,
  },

 
});