import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ColorSchemeToggle } from '../../../components/theme';
import { useGlobalStyles, useThemedStyles } from '../../../hooks';
import { useTheme } from '../../../hooks/useTheme';
import { AnimatedView, Typography } from '../../../components';

import { FONT_FAMILY, palette } from '../../../theme';
import SupportSvg from '../../../components/icons/SupportSvg';


export function SettingsScreen({ navigation }) {
  const globalStyles = useGlobalStyles();

  const styles = useThemedStyles(createStyles);
  const { colorScheme, isAnimating, toggle } = useTheme();


  return (
    // <ScrollView style={[styles.container, { marginBottom: 72 }] } contentContainerStyle={{ paddingBottom: 32 }}>
    //   <Text style={styles.title}>Settings</Text>
    //   <Text style={styles.subtitle}>App preferences</Text>

    //   <Text style={styles.sectionTitle}>Appearance</Text>

    // </ScrollView>
    <ScrollView style={[globalStyles.screen, styles.screen]} contentContainerStyle={[styles.contentContainer]}>
      <AnimatedView animation="fadeIn" duration={500} style={styles.content}>
        <View style={styles.balanceContainer}>
          <Typography variant="h4" tone="disabled">
            Ինտերֆեյս
          </Typography>
        </View>

        <View style={styles.section}>
          <View style={styles.menuList}>
            <ColorSchemeToggle
              label="Theme"
              description="Tap to switch between light and dark with a smooth transition."
              style={{ marginBottom: 16 }}
            />
          </View>
        </View>

        <View style={styles.sectionSpaced}>
          <Typography variant="h4" tone="disabled">

            Օգնություն
          </Typography>
          <View style={styles.menuList}>
            <Pressable
              style={[styles.menuItem,]}
              onPress={() => navigation.navigate('Help')}
            >
              <View style={styles.menuItemRow}>
                <SupportSvg fill={palette.mainBlue} width={20} height={20} />
                <Typography
                  variant="h5"
                >
                  Կապ մեզ հետ
                </Typography>
              </View>
            </Pressable>

          </View>
        </View>
        <View style={styles.sectionSpaced}>
          <Typography variant="h4" tone="disabled">
            Իրավական
          </Typography>
          <View style={styles.menuList}>
            <Pressable
              style={[styles.menuItem,]}
              onPress={() => navigation.navigate('Help')}
            >
              <View style={styles.menuItemRow}>
                <SupportSvg fill={palette.mainBlue} width={20} height={20} />
                <Typography
                  variant="h5"
                >
                  Գաղտնիության քաղաքականություն
                </Typography>
              </View>
            </Pressable>
            <Pressable
              style={[styles.menuItem,]}
              onPress={() => navigation.navigate('Help')}
            >
              <View style={styles.menuItemRow}>
                <SupportSvg fill={palette.mainBlue} width={20} height={20} />
                <Typography
                  variant="h5"
                >
                  Օգտագործման պայմաններ և դրույթներ
                </Typography>
              </View>
            </Pressable>
          </View>
        </View>

      </AnimatedView>
      <Typography variant="h5" tone="secondary" style={styles.footer}>
        © 2026 - DOCX Բոլոր իրավունքները պաշտպանված են
      </Typography>
    </ScrollView>
  );
}
const createStyles = (colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      paddingHorizontal: 16,
    },
    content: {
      justifyContent: 'flex-start',
      alignItems: 'center',
      width: '100%',
      marginTop: 30,
    },
    balanceContainer: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      // paddingBottom: 20,
    },
    balanceRow: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
    },

    section: {
      width: '100%',
    },
    sectionSpaced: {
      width: '100%',
      marginTop: 30,
    },
    menuList: {
      // marginTop: 20,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.textDisabled,
      paddingHorizontal: 30,
    },
    menuItemLast: {
      borderBottomWidth: 0,
    },
    menuItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      width: '80%',
    },
    footer: {
      textAlign: 'center',
      marginTop: 20,
      fontSize: 8,
    },
    contentContainer: {

      justifyContent: 'space-between',

      height: '80%',
    },
  });