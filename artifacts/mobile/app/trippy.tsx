import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

export default function TrippyScreen() {
  const translateY = new Animated.Value(0);
  const scale = new Animated.Value(0.3);
  const rotateZ = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -800,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateZ, {
        toValue: 360,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotateZInterpolate = rotateZ.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.spaceBg}>
        {[...Array(100)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.7 + 0.3,
              },
            ]}
          />
        ))}
      </View>

      <Animated.View
        style={[
          styles.fallingContainer,
          {
            transform: [
              { translateY },
              { scale },
              { rotateZ: rotateZInterpolate },
            ],
          },
        ]}
      >
        <View style={styles.pyramid}>
          <View style={[styles.triangleLeft, { borderRightColor: "#ff1493" }]} />
          <View
            style={[styles.triangleRight, { borderLeftColor: "#00ffff" }]}
          />
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.grid,
          {
            opacity: Animated.divide(
              Animated.modulo(Animated.divide(translateY, -100), 8),
              8
            ),
          },
        ]}
      >
        {[...Array(5)].map((_, i) => (
          <View key={i} style={styles.gridLine} />
        ))}
      </Animated.View>

      <Pressable
        style={styles.closeBtn}
        onPress={() => {
          router.back();
        }}
      >
        <Feather name="x" size={28} color="#ff1493" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  spaceBg: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: "absolute",
    width: 2,
    height: 2,
    backgroundColor: "#fff",
    borderRadius: 1,
  },
  fallingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  pyramid: {
    width: 100,
    height: 100,
    flexDirection: "row",
  },
  triangleLeft: {
    width: 0,
    height: 0,
    borderLeftWidth: 50,
    borderRightWidth: 50,
    borderBottomWidth: 100,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#ff1493",
  },
  triangleRight: {
    width: 0,
    height: 0,
    borderLeftWidth: 50,
    borderRightWidth: 50,
    borderBottomWidth: 100,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#00ffff",
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-around",
  },
  gridLine: {
    height: 1,
    backgroundColor: "rgba(255, 20, 147, 0.1)",
  },
  closeBtn: {
    position: "absolute",
    top: Platform.OS === "web" ? 70 : 50,
    right: 20,
    zIndex: 10,
  },
});
