import type {ForwardedRef} from 'react';
import React, {useEffect, useRef} from 'react';
import type {GestureResponderEvent, Role} from 'react-native';
import {Platform, View} from 'react-native';
import Animated, {createAnimatedPropAdapter, Easing, interpolateColor, processColor, useAnimatedProps, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import Svg, {Path} from 'react-native-svg';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import Tooltip from './Tooltip/PopoverAnchorTooltip';

const AnimatedPath = Animated.createAnimatedComponent(Path);
AnimatedPath.displayName = 'AnimatedPath';

const AnimatedPressable = Animated.createAnimatedComponent(PressableWithFeedback);
AnimatedPressable.displayName = 'AnimatedPressable';

type AdapterPropsRecord = {
    type: number;
    payload?: number | null;
};

type AdapterProps = {
    fill?: string | AdapterPropsRecord;
    stroke?: string | AdapterPropsRecord;
};

const adapter = createAnimatedPropAdapter(
    (props: AdapterProps) => {
        // eslint-disable-next-line rulesdir/prefer-underscore-method
        if (Object.keys(props).includes('fill')) {
            // eslint-disable-next-line no-param-reassign
            props.fill = {type: 0, payload: processColor(props.fill)};
        }
        // eslint-disable-next-line rulesdir/prefer-underscore-method
        if (Object.keys(props).includes('stroke')) {
            // eslint-disable-next-line no-param-reassign
            props.stroke = {type: 0, payload: processColor(props.stroke)};
        }
    },
    ['fill', 'stroke'],
);

type FloatingActionButtonProps = {
    /* Callback to fire on request to toggle the FloatingActionButton */
    onPress: (event: GestureResponderEvent | KeyboardEvent | undefined) => void;

    /* Current state (active or not active) of the component */
    isActive: boolean;

    /* An accessibility label for the button */
    accessibilityLabel: string;

    /* An accessibility role for the button */
    role: Role;
};

function FloatingActionButton({onPress, isActive, accessibilityLabel, role}: FloatingActionButtonProps, ref: ForwardedRef<HTMLDivElement | View>) {
    const {success, buttonDefaultBG, textLight, textDark} = useTheme();
    const styles = useThemeStyles();
    const borderRadius = styles.floatingActionButton.borderRadius;
    const {translate} = useLocalize();
    const fabPressable = useRef<HTMLDivElement | View | null>(null);
    const sharedValue = useSharedValue(isActive ? 1 : 0);
    const buttonRef = ref;

    useEffect(() => {
        sharedValue.value = withTiming(isActive ? 1 : 0, {
            duration: 340,
            easing: Easing.inOut(Easing.ease),
        });
    }, [isActive, sharedValue]);

    const animatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(sharedValue.value, [0, 1], [success, buttonDefaultBG]);

        return {
            transform: [{rotate: `${sharedValue.value * 135}deg`}],
            backgroundColor,
            borderRadius,
        };
    });

    const animatedProps = useAnimatedProps(
        () => {
            const fill = interpolateColor(sharedValue.value, [0, 1], [textLight, textDark]);

            return {
                fill,
            };
        },
        undefined,
        Platform.OS === 'web' ? undefined : adapter,
    );

    return (
        <Tooltip text={translate('common.new')}>
            <View style={styles.floatingActionButtonContainer}>
                <AnimatedPressable
                    ref={(el) => {
                        fabPressable.current = el;

                        if (buttonRef && 'current' in buttonRef) {
                            buttonRef.current = el;
                        }
                    }}
                    accessibilityLabel={accessibilityLabel}
                    role={role}
                    pressDimmingValue={1}
                    onPress={(e) => {
                        // Drop focus to avoid blue focus ring.
                        fabPressable.current?.blur();
                        onPress(e);
                    }}
                    onLongPress={() => {}}
                    style={[styles.floatingActionButton, animatedStyle]}
                >
                    <Svg
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                    >
                        <AnimatedPath
                            d="M12,3c0-1.1-0.9-2-2-2C8.9,1,8,1.9,8,3v5H3c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h5v5c0,1.1,0.9,2,2,2c1.1,0,2-0.9,2-2v-5h5c1.1,0,2-0.9,2-2c0-1.1-0.9-2-2-2h-5V3z"
                            animatedProps={animatedProps}
                        />
                    </Svg>
                </AnimatedPressable>
            </View>
        </Tooltip>
    );
}

FloatingActionButton.displayName = 'FloatingActionButton';

export default FloatingActionButton;
