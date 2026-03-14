import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import C from "@/constants/colors";

type Props = {
  onFinished: () => void;
};

const ND = Platform.OS !== "web";
const logoSource = require("../assets/images/logo.jpg");

const M_W = 200;
const M_H = 148;
const BAR_H = 32;
const PIL_W = 44;
const PIL_H = M_H - BAR_H;
const GAP = (M_W - PIL_W * 3) / 2;

const LOGO_IMG_W = 220;
const LOGO_IMG_H = 180;

export function AnimatedSplash({ onFinished }: Props) {
  const pY0 = useRef(new Animated.Value(-420)).current;
  const pY1 = useRef(new Animated.Value(-420)).current;
  const pY2 = useRef(new Animated.Value(-420)).current;

  const barY = useRef(new Animated.Value(-320)).current;
  const barScaleY = useRef(new Animated.Value(1)).current;

  const flashOp = useRef(new Animated.Value(0)).current;

  const supOp = useRef(new Animated.Value(0)).current;
  const supSc = useRef(new Animated.Value(0.3)).current;
  const tagOp = useRef(new Animated.Value(0)).current;

  const blocksOp = useRef(new Animated.Value(1)).current;
  const logoOp = useRef(new Animated.Value(0)).current;

  const glowOp = useRef(new Animated.Value(0)).current;
  const exitOp = useRef(new Animated.Value(1)).current;
  const exitSc = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pillarSpring = { tension: 45, friction: 8, useNativeDriver: ND };
    const barSpring = { tension: 50, friction: 5, useNativeDriver: ND };

    Animated.sequence([
      Animated.parallel([
        Animated.spring(pY0, { toValue: 0, ...pillarSpring }),
        Animated.sequence([
          Animated.delay(120),
          Animated.spring(pY1, { toValue: 0, ...pillarSpring }),
        ]),
        Animated.sequence([
          Animated.delay(240),
          Animated.spring(pY2, { toValue: 0, ...pillarSpring }),
        ]),
        Animated.sequence([
          Animated.delay(480),
          Animated.spring(barY, { toValue: 0, ...barSpring }),
        ]),
      ]),

      Animated.parallel([
        Animated.sequence([
          Animated.timing(barScaleY, {
            toValue: 1.15,
            duration: 50,
            useNativeDriver: ND,
          }),
          Animated.spring(barScaleY, {
            toValue: 1,
            tension: 300,
            friction: 5,
            useNativeDriver: ND,
          }),
        ]),
        Animated.sequence([
          Animated.timing(flashOp, {
            toValue: 0.7,
            duration: 40,
            useNativeDriver: ND,
          }),
          Animated.timing(flashOp, {
            toValue: 0,
            duration: 180,
            useNativeDriver: ND,
          }),
        ]),
      ]),

      Animated.parallel([
        Animated.spring(supSc, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: ND,
        }),
        Animated.timing(supOp, {
          toValue: 1,
          duration: 200,
          useNativeDriver: ND,
        }),
        Animated.timing(tagOp, {
          toValue: 1,
          duration: 300,
          useNativeDriver: ND,
        }),
      ]),

      Animated.delay(200),

      Animated.parallel([
        Animated.timing(blocksOp, {
          toValue: 0,
          duration: 420,
          useNativeDriver: ND,
        }),
        Animated.timing(logoOp, {
          toValue: 1,
          duration: 420,
          useNativeDriver: ND,
        }),
        Animated.timing(glowOp, {
          toValue: 0.55,
          duration: 420,
          useNativeDriver: ND,
        }),
      ]),

      Animated.delay(500),

      Animated.parallel([
        Animated.timing(exitOp, {
          toValue: 0,
          duration: 380,
          useNativeDriver: ND,
        }),
        Animated.timing(exitSc, {
          toValue: 1.12,
          duration: 380,
          useNativeDriver: ND,
        }),
        Animated.timing(glowOp, {
          toValue: 0,
          duration: 260,
          useNativeDriver: ND,
        }),
      ]),
    ]).start(() => onFinished());
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: exitOp, transform: [{ scale: exitSc }] },
      ]}
    >
      <Animated.View style={[styles.glow, { opacity: glowOp }]} />

      <Animated.View style={[styles.logoImgWrap, { opacity: logoOp }]}>
        <Image
          source={logoSource}
          style={styles.logoImg}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View style={[styles.blocksWrap, { opacity: blocksOp }]}>
        <View style={styles.mRow}>
          <View style={styles.mBox}>
            <Animated.View
              style={[
                styles.crossbar,
                {
                  transform: [{ translateY: barY }, { scaleY: barScaleY }],
                },
              ]}
            />

            <Animated.View style={[styles.flashBar, { opacity: flashOp }]} />

            <Animated.View
              style={[
                styles.pillar,
                { left: 0, transform: [{ translateY: pY0 }] },
              ]}
            />
            <Animated.View
              style={[
                styles.pillar,
                { left: PIL_W + GAP, transform: [{ translateY: pY1 }] },
              ]}
            />
            <Animated.View
              style={[
                styles.pillar,
                {
                  left: PIL_W * 2 + GAP * 2,
                  transform: [{ translateY: pY2 }],
                },
              ]}
            />
          </View>

          <Animated.Text
            style={[
              styles.sup,
              { opacity: supOp, transform: [{ scale: supSc }] },
            ]}
          >
            2
          </Animated.Text>
        </View>

        <Animated.View style={[styles.tagWrap, { opacity: tagOp }]}>
          <View style={styles.tagLine} />
          <Text style={styles.tagText}>TRAINING</Text>
          <View style={styles.tagLine} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: C.orange,
    shadowColor: C.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 80,
    elevation: 40,
    transform: [{ scaleY: 0.45 }],
  },
  logoImgWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  logoImg: {
    width: LOGO_IMG_W,
    height: LOGO_IMG_H,
  },
  blocksWrap: {
    alignItems: "center",
    gap: 14,
  },
  mRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  mBox: {
    width: M_W,
    height: M_H,
    overflow: "visible" as const,
    position: "relative",
  },
  crossbar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: M_W,
    height: BAR_H,
    backgroundColor: C.orange,
    borderRadius: 2,
  },
  flashBar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: M_W,
    height: BAR_H,
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  pillar: {
    position: "absolute",
    top: BAR_H,
    width: PIL_W,
    height: PIL_H,
    backgroundColor: C.orange,
    borderRadius: 2,
  },
  sup: {
    color: C.orange,
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    lineHeight: 40,
    marginLeft: 4,
    marginTop: -4,
  },
  tagWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tagLine: {
    width: 28,
    height: 1,
    backgroundColor: C.dim,
  },
  tagText: {
    color: C.dim,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 5,
  },
});
