import React, { useCallback, useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { FONT_FAMILY, palette } from '../../../../theme';
import { FormField, Typography } from '../../../../components';
import GradientButton from '../../../../components/buttons/GradientButton';
import MailIconSvg from '../../../../components/icons/MailIconSvg';
import LockIconSbg from '../../../../components/icons/LockIconSbg';
import PhoneSvg from '../../../../components/icons/PhoneSvg';
import bg from '../../../../assets/images/bg.webp'
const INPUT_RADIUS = 16;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^(\+374\d{8})$/;

const LOGIN_TITLES = {
    mail: 'ՄՈՒՏՔ ԷԼ-ՓՈՍՏՈՎ',
    phone: 'ՄՈՒՏՔ ՀԵՌԱԽՈՍԱՀԱՄԱՐՈՎ',
};

const FADE_OUT_MS = 160;
const FADE_IN_MS = 220;
function OrDivider() {
    return (
        <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Typography style={styles.dividerText}>կամ</Typography>
            <View style={styles.dividerLine} />
        </View>
    );
}

function OutlineButton({ title, onPress, icon }) {

    return (
        <Pressable
            style={({ pressed }) => [styles.outlineButton, pressed && styles.buttonPressed]}
            onPress={onPress}>
            {icon && icon}
            <Typography variant="h5" style={styles.outlineButtonText}>
                {title}
            </Typography>
        </Pressable>
    );
}
function MailLogin({ handleTabPress }) {
    const { control } = useForm({
        defaultValues: { email: '', password: '' },
        mode: 'onBlur',
    });
    return (
        <View>
            <View style={{ marginBottom: 30 }}>
                <FormField
                    control={control}
                    name="email"
                    label="Էլ.-փոստ"
                    placeholder="example@docx.am"
                    startIcon={<MailIconSvg width={19} height={15} />}
                    rules={{
                        required: 'Էլ.-փոստը պարտադիր է',
                        pattern: { value: EMAIL_PATTERN, message: 'Մուտքագրեք վավեր էլ.-փոստ' },
                    }}
                />
            </View>

            <FormField
                control={control}
                name="password"
                label="Գաղտնաբառ"
                placeholder="********"
                startIcon={<LockIconSbg width={17} height={19} />}
                secureTextEntry
                rules={{
                    required: 'Գաղտնաբառը պարտադիր է',
                    minLength: { value: 6, message: 'Առնվազն 6 նիշ' },
                }}
            />
            <Pressable style={styles.forgotLink} hitSlop={8}>
                <Typography style={styles.forgotLinkText}>Մոռացե՞լ եք գաղտնաբառը</Typography>
            </Pressable>
            <View style={styles.actions}>
                <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
                    <GradientButton height={45} isLight={false}>
                        <Typography variant="h5" style={styles.primaryButtonText}>
                            Մուտք գործել
                        </Typography>
                    </GradientButton>
                </Pressable>
                <OrDivider />
                <OutlineButton title="Մուտք հեռախոսահամարով" onPress={() => handleTabPress('phone')} icon={<PhoneSvg width={20} height={20} fill={palette.mainBlue} />} />
            </View>
        </View>
    );
}
function PhoneLogin({ onPhoneLogin, handleTabPress }) {
    const { control } = useForm({
        defaultValues: { email: '', password: '' },
        mode: 'onBlur',
    });
    return (
        <View>
            <FormField
                control={control}
                name="phone"
                label="Հեռախոսահամար"
                keyboardType="numeric"
                placeholder="+374 91 123 456"
                startIcon={<PhoneSvg width={20} height={20} fill={palette.mainBlue} />}
                rules={{
                    required: 'Հեռախոսահամարը պարտադիր է',
                    pattern: { value: PHONE_PATTERN, message: 'Մուտքագրեք վավեր հեռախոսահամար' },
                }}
            />


            <View style={styles.actions}>
                <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
                    <GradientButton height={45} isLight={false}>
                        <Typography variant="h5" style={styles.primaryButtonText}>
                            Ուղարկել կոդը
                        </Typography>
                    </GradientButton>
                </Pressable>
                <OrDivider />
                <OutlineButton title="Մուտք էլեկտրոնային փոստով" onPress={() => handleTabPress('mail')} icon={<MailIconSvg width={19} height={15} />} />
                <Image source={bg} style={styles.bg} />
            </View>
        </View>
    );
}
function renderLoginContent(activeTab, handleTabPress, onPhoneLogin) {
    switch (activeTab) {
        case 'mail':
            return <MailLogin handleTabPress={handleTabPress} />;
        case 'phone':
            return <PhoneLogin handleTabPress={handleTabPress} onPhoneLogin={onPhoneLogin} />;
        default:
            return null;
    }
}

export function LoginTabs({ onPhoneLogin }) {
    const [activeTab, setActiveTab] = useState('mail');
    const contentOpacity = useRef(new Animated.Value(1)).current;
    const contentTranslateY = useRef(new Animated.Value(0)).current;

    const handleTabPress = useCallback(
        (tab) => {
            if (tab === activeTab) {
                return;
            }

            Animated.parallel([
                Animated.timing(contentOpacity, {
                    toValue: 0,
                    duration: FADE_OUT_MS,
                    useNativeDriver: true,
                }),
                Animated.timing(contentTranslateY, {
                    toValue: -10,
                    duration: FADE_OUT_MS,
                    useNativeDriver: true,
                }),
            ]).start(({ finished }) => {
                if (!finished) {
                    return;
                }

                setActiveTab(tab);
                contentTranslateY.setValue(10);

                Animated.parallel([
                    Animated.timing(contentOpacity, {
                        toValue: 1,
                        duration: FADE_IN_MS,
                        useNativeDriver: true,
                    }),
                    Animated.timing(contentTranslateY, {
                        toValue: 0,
                        duration: FADE_IN_MS,
                        useNativeDriver: true,
                    }),
                ]).start();
            });
        },
        [activeTab, contentOpacity, contentTranslateY],
    );

    return (
        <View style={[styles.form, styles.formTop]}>
            <Animated.View
                style={{
                    opacity: contentOpacity,
                    transform: [{ translateY: contentTranslateY }],
                }}>
                <Typography variant="h4" style={styles.loginTitle}>
                    {LOGIN_TITLES[activeTab]}
                </Typography>
                {renderLoginContent(activeTab, handleTabPress, onPhoneLogin)}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    form: {
        gap: 16,
    },
    formTop: {
        marginTop: 30,
    },
    actions: {
        marginTop: 20,
    },
    forgotLink: {
        alignSelf: 'flex-start',
        marginTop: 10,
        marginBottom: 10,
    },
    forgotLinkText: {
        fontSize: 8,
        fontFamily: FONT_FAMILY.semiBold,
        color: palette.mainBlue,
        textDecorationLine: 'underline',
    },
    primaryButton: {
        height: 45,
        overflow: 'hidden',
        borderRadius: INPUT_RADIUS,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    primaryButtonText: {
        fontFamily: FONT_FAMILY.regular,
        color: palette.white,
        letterSpacing: 1.2,
    },
    outlineButton: {
        height: 45,
        borderRadius: INPUT_RADIUS,
        borderWidth: 1,
        borderColor: palette.mainBlue,
        backgroundColor: palette.white,
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 16,
    },
    outlineButtonText: {
        width: '80%',
        textAlign: 'center',
        color: palette.mainBlue,
        letterSpacing: 2,
    },
    buttonPressed: {
        opacity: 0.88,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 30,
        gap: 12,
    },
    dividerLine: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: palette.gray,
    },
    dividerText: {
        fontSize: 13,
        fontFamily: FONT_FAMILY.regular,
        color: palette.lightGray,
    },
    loginTitle: {
        fontFamily: FONT_FAMILY.medium,
        letterSpacing: 1.2,
        marginBottom: 4,
        textAlign: 'center',
    },
    bg: {
        marginTop: 20,
        height: 161,
        width: '100%',
    },
});
