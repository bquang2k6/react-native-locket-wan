import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from "react-native-reanimated";
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from "react-native-gesture-handler";

const { width } = Dimensions.get("window");

interface CardData {
    id: number;
    content: React.ReactNode;
}

interface StackProps {
    cards?: React.ReactNode[];
    randomRotation?: boolean;
    sensitivity?: number;
    sendToBackOnClick?: boolean;
    animationConfig?: {
        stiffness: number;
        damping: number;
    };
}

interface CardRotateProps {
    children: React.ReactNode;
    onSendToBack: () => void;
    sensitivity: number;
    disableDrag?: boolean;
}

function CardRotate({
    children,
    onSendToBack,
    sensitivity,
    disableDrag = false,
}: CardRotateProps) {
    const translateX = useSharedValue(0);
    const startX = useSharedValue(0);

    const gesture = Gesture.Pan()
        .enabled(!disableDrag)
        .onStart(() => {
            startX.value = translateX.value;
        })
        .onUpdate((event) => {
            translateX.value = startX.value + event.translationX;
        })
        .onEnd((event) => {
            if (Math.abs(event.translationX) > sensitivity) {
                runOnJS(onSendToBack)();
            }
            translateX.value = withSpring(0);
        });

    const rotateZ = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        const rotation = (translateX.value / 150) * 8;
        rotateZ.value = rotation;

        return {
            transform: [
                { translateX: translateX.value },
                { rotateZ: `${rotation}deg` },
            ],
        };
    });

    if (disableDrag) {
        return <View style={styles.cardContainer}>{children}</View>;
    }

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.cardContainer, animatedStyle]}>
                {children}
            </Animated.View>
        </GestureDetector>
    );
}

export default function Stack({
    cards = [],
    randomRotation = false,
    sensitivity = 200,
    sendToBackOnClick = false,
    animationConfig = { stiffness: 260, damping: 20 },
}: StackProps) {
    const [stack, setStack] = useState<CardData[]>([]);

    useEffect(() => {
        if (cards.length > 0) {
            setStack(cards.map((content, index) => ({ id: index + 1, content })));
        }
    }, [cards]);

    const sendToBack = useCallback((id: number) => {
        setStack((prev) => {
            const newStack = [...prev];
            const index = newStack.findIndex((card) => card.id === id);
            if (index !== -1) {
                const [card] = newStack.splice(index, 1);
                newStack.unshift(card);
            }
            return newStack;
        });
    }, []);

    return (
        <GestureHandlerRootView style={styles.stackContainer}>
            <View style={styles.stackInner}>
                {stack.map((card, index) => {
                    const randomRotate = randomRotation ? Math.random() * 10 - 5 : 0;
                    const scale = 1 + index * 0.06 - stack.length * 0.06;
                    const rotation = (stack.length - index - 1) * 4 + randomRotate;

                    return (
                        <CardRotate
                            key={card.id}
                            onSendToBack={() => sendToBack(card.id)}
                            sensitivity={sensitivity}
                        >
                            <TouchableOpacity
                                activeOpacity={sendToBackOnClick ? 0.8 : 1}
                                onPress={() => sendToBackOnClick && sendToBack(card.id)}
                                style={[
                                    styles.card,
                                    {
                                        transform: [{ scale }, { rotateZ: `${rotation}deg` }],
                                        transformOrigin: "90% 90%",
                                    },
                                ]}
                            >
                                {card.content}
                            </TouchableOpacity>
                        </CardRotate>
                    );
                })}
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    stackContainer: {
        width: "100%",
        height: "100%",
        position: "relative",
    },
    stackInner: {
        width: "100%",
        height: "100%",
        position: "relative",
    },
    cardContainer: {
        position: "absolute",
        width: "100%",
        height: "100%",
    },
    card: {
        width: "100%",
        height: "100%",
        borderRadius: 16,
        overflow: "hidden",
    },
});
