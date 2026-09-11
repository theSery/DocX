import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Accordion } from '../accordion';
import { CheckBox } from '../checkbox';
import { Typography } from '../typography/Typography';
import { useIsCompactScreen } from '../../hooks/useResponsiveLayout';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { FONT_FAMILY } from '../../theme';

const DROPDOWN_ITEM_KEY = 'dropdown';
const INPUT_RADIUS = 16;
const DEFAULT_MAX_BODY_HEIGHT = 240;

const DropdownHostContext = createContext(null);
const dismissListeners = new Set();

function isPointInsideFrame(pageX, pageY, frame) {
  if (!frame) {
    return false;
  }

  return (
    pageX >= frame.x &&
    pageX <= frame.x + frame.width &&
    pageY >= frame.y &&
    pageY <= frame.y + frame.height
  );
}

/** Close any open dropdown. Safe to call from form fields and outside presses. */
export function dismissOpenDropdowns() {
  dismissListeners.forEach(close => close());
}

/**
 * Watches presses in this subtree. A press outside an open dropdown closes it
 * without stealing the touch, so a FormField can still focus.
 */
export function DropdownHost({ children, style }) {
  const anchorRef = useRef(null);
  const frameRef = useRef(null);
  const isOpenRef = useRef(false);

  const api = useMemo(
    () => ({
      registerAnchor(node) {
        anchorRef.current = node;
      },
      setOpen(isOpen) {
        isOpenRef.current = isOpen;
        if (!isOpen) {
          frameRef.current = null;
        }
      },
      updateFrame(frame) {
        frameRef.current = frame;
      },
    }),
    [],
  );

  const handleTouchCapture = event => {
    if (!isOpenRef.current) {
      return false;
    }

    const { pageX, pageY } = event.nativeEvent;
    const frame = frameRef.current;
    if (frame && !isPointInsideFrame(pageX, pageY, frame)) {
      dismissOpenDropdowns();
      return false;
    }

    anchorRef.current?.measureInWindow((x, y, width, height) => {
      const nextFrame = { x, y, width, height };
      frameRef.current = nextFrame;
      if (!isPointInsideFrame(pageX, pageY, nextFrame)) {
        dismissOpenDropdowns();
      }
    });

    return false;
  };

  return (
    <DropdownHostContext.Provider value={api}>
      <View
        style={style}
        onStartShouldSetResponderCapture={handleTouchCapture}
      >
        {children}
      </View>
    </DropdownHostContext.Provider>
  );
}

function defaultKeyExtractor(item, index) {
  return item?.id ?? index;
}

function defaultGetItemLabel(item) {
  return item?.nameHy ?? item?.name ?? item?.label ?? item?.title ?? '';
}

function toSelectedKeys(value) {
  if (value == null || value === '') {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

/**
 * flagcdn SVG URLs do not render in Image; use the matching PNG.
 * @param {string | null | undefined} flagUri
 */
export function toFlagImageUri(flagUri) {
  if (typeof flagUri !== 'string' || !flagUri) {
    return null;
  }
  if (/\.png($|\?)/i.test(flagUri)) {
    return flagUri;
  }
  return flagUri
    .replace('flagcdn.com/', 'flagcdn.com/w40/')
    .replace(/\.svg($|\?)/i, '.png');
}

/**
 * Reusable dropdown built on Accordion.
 *
 * The trigger is the accordion header. Options render in the accordion body,
 * capped at `maxBodyHeight` and scrolled. In single-select mode, choosing an
 * option updates the title and closes the body. In `multiple` mode, options
 * render as checkboxes and the header shows selected labels joined by commas.
 * Taps outside the accordion close it when this component is rendered inside
 * `DropdownHost`.
 *
 * @param {{
 *   items: Array<object>;
 *   label?: string;
 *   placeholder?: string;
 *   startIcon?: import('react').ReactNode;
 *   value?: string | number | Array<string | number> | null;
 *   defaultValue?: string | number | Array<string | number> | null;
 *   multiple?: boolean;
 *   onChange?: (item: object | object[] | null) => void;
 *   keyExtractor?: (item: object, index: number) => string | number;
 *   getItemLabel?: (item: object) => string;
 *   getItemSecondaryLabel?: (item: object) => string | null | undefined;
 *   getItemFlag?: (item: object) => string | null | undefined;
 *   renderOption?: (item: object, state: { selected: boolean }) => import('react').ReactNode;
 *   maxBodyHeight?: number;
 *   error?: string;
 *   style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
 * }} props
 */
export function Dropdown({
  items = [],
  label,
  placeholder = '',
  labelVariant = 'h6',
  startIcon,
  value,
  defaultValue = null,
  multiple = false,
  onChange,
  keyExtractor = defaultKeyExtractor,
  getItemLabel = defaultGetItemLabel,
  getItemSecondaryLabel,
  getItemFlag,
  renderOption,
  maxBodyHeight = DEFAULT_MAX_BODY_HEIGHT,
  error,
  style,
}) {
  const styles = useThemedStyles(createStyles);
  const isCompactScreen = useIsCompactScreen();
  const host = useContext(DropdownHostContext);
  const rootRef = useRef(null);
  const isValueControlled = value !== undefined;
  const [selectedKey, setSelectedKey] = useState(() =>
    multiple ? toSelectedKeys(value ?? defaultValue) : (value ?? defaultValue),
  );
  const [openKey, setOpenKey] = useState(null);

  const currentKey = isValueControlled ? value : selectedKey;
  const selectedKeys = toSelectedKeys(currentKey);
  const selectedItems = multiple
    ? items.filter((item, index) =>
        selectedKeys.includes(keyExtractor(item, index)),
      )
    : [];
  const selectedItem = multiple
    ? null
    : (items.find((item, index) => keyExtractor(item, index) === currentKey) ??
      null);
  const hasSelection = multiple
    ? selectedItems.length > 0
    : Boolean(selectedItem);
  const title = multiple
    ? hasSelection
      ? selectedItems.map(getItemLabel).join(', ')
      : placeholder
    : selectedItem
      ? getItemLabel(selectedItem)
      : placeholder;
  const selectedFlag =
    selectedItem && getItemFlag ? toFlagImageUri(getItemFlag(selectedItem)) : null;
  const isOpen = openKey != null;

  const close = useCallback(() => {
    setOpenKey(null);
  }, []);

  const updateFrame = useCallback(() => {
    rootRef.current?.measureInWindow((x, y, width, height) => {
      host?.updateFrame({ x, y, width, height });
    });
  }, [host]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    dismissListeners.add(close);
    return () => {
      dismissListeners.delete(close);
    };
  }, [close, isOpen]);

  useEffect(() => {
    if (!host) {
      return undefined;
    }

    host.registerAnchor(rootRef.current);
    host.setOpen(isOpen);
    if (isOpen) {
      updateFrame();
    }

    return () => {
      host.setOpen(false);
    };
  }, [host, isOpen, updateFrame]);

  const handleOpenChange = useCallback(nextKey => {
    setOpenKey(nextKey);
  }, []);

  const handleSelect = useCallback(
    item => {
      const nextKey = keyExtractor(item, items.indexOf(item));

      if (multiple) {
        const currentKeys = toSelectedKeys(currentKey);
        const nextKeys = items
          .map((option, index) => keyExtractor(option, index))
          .filter(key =>
            key === nextKey
              ? !currentKeys.includes(key)
              : currentKeys.includes(key),
          );

        if (!isValueControlled) {
          setSelectedKey(nextKeys);
        }

        const nextItems = items.filter((option, index) =>
          nextKeys.includes(keyExtractor(option, index)),
        );
        onChange?.(nextItems);
        return;
      }

      if (!isValueControlled) {
        setSelectedKey(nextKey);
      }
      onChange?.(item);
      close();
    },
    [close, currentKey, isValueControlled, items, keyExtractor, multiple, onChange],
  );

  const accordionItems = useMemo(
    () => [{ id: DROPDOWN_ITEM_KEY }],
    [],
  );

  return (
    <View
      ref={node => {
        rootRef.current = node;
        host?.registerAnchor(node);
      }}
      onLayout={updateFrame}
      style={[styles.root, isOpen && styles.rootOpen, style]}
      collapsable={false}
    >
      {label ? <Typography variant={labelVariant}>{label}</Typography> : null}
      <Accordion
        items={accordionItems}
        keyExtractor={item => item.id}
        openKey={openKey}
        onOpenChange={handleOpenChange}
        style={styles.accordion}
        itemStyle={(_item, { isOpen: itemOpen }) => [
          styles.accordionItem,
          isCompactScreen && styles.accordionItemCompact,
          itemOpen && styles.accordionItemOpen,
          error && styles.accordionItemError,
        ]}
        headerStyle={[
          styles.accordionHeader,
          isCompactScreen && styles.accordionHeaderCompact,
        ]}
        contentStyle={styles.accordionContent}
        renderHeader={() => (
          <View style={styles.header}>
            {selectedFlag ? (
              <Image
                source={{ uri: selectedFlag }}
                style={styles.flag}
                resizeMode="cover"
              />
            ) : startIcon ? (
              <View style={styles.startIcon}>{startIcon}</View>
            ) : null}
            <Text
              numberOfLines={1}
              style={[
                styles.valueText,
                selectedItems.length === 2 && styles.valueTextCompact,
                !hasSelection && styles.placeholderText,
              ]}
            >
              {title}
            </Text>
          </View>
        )}
        renderContent={() => (
          <ScrollView
            style={{ maxHeight: maxBodyHeight }}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {items.map((item, index) => {
              const itemKey = keyExtractor(item, index);
              const selected = multiple
                ? selectedKeys.includes(itemKey)
                : itemKey === currentKey;
              const nextItemKey =
                index < items.length - 1
                  ? keyExtractor(items[index + 1], index + 1)
                  : null;
              const nextSelected =
                nextItemKey != null &&
                (multiple
                  ? selectedKeys.includes(nextItemKey)
                  : nextItemKey === currentKey);
              const optionLabel = getItemLabel(item);
              const secondaryLabel = getItemSecondaryLabel?.(item);
              const flagUri = getItemFlag ? toFlagImageUri(getItemFlag(item)) : null;

              return (
                <View key={itemKey}>
                  <Pressable
                    accessibilityRole={multiple ? 'checkbox' : 'button'}
                    accessibilityState={{ selected, checked: selected }}
                    accessibilityLabel={optionLabel}
                    onPress={() => handleSelect(item)}
                    style={({ pressed }) => [
                      styles.option,
                      selected && styles.optionSelected,
                      pressed && !selected && styles.optionPressed,
                    ]}
                  >
                    {selected && !multiple ? (
                      <View style={styles.optionAccent} />
                    ) : null}
                    {renderOption ? (
                      renderOption(item, { selected })
                    ) : multiple ? (
                      <View pointerEvents="none" style={styles.optionCheckboxWrap}>
                        <CheckBox
                          checked={selected}
                          label={optionLabel}
                          style={styles.optionCheckbox}
                        />
                      </View>
                    ) : (
                      <>
                        {flagUri ? (
                          <Image
                            source={{ uri: flagUri }}
                            style={styles.flag}
                            resizeMode="cover"
                          />
                        ) : null}
                        <View style={styles.optionText}>
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.optionLabel,
                              selected && styles.optionLabelSelected,
                            ]}
                          >
                            {optionLabel}
                          </Text>
                          {secondaryLabel ? (
                            <Text
                              numberOfLines={1}
                              style={styles.optionSecondaryLabel}
                            >
                              {secondaryLabel}
                            </Text>
                          ) : null}
                        </View>
                      </>
                    )}
                  </Pressable>
                  {index < items.length - 1 && !selected && !nextSelected ? (
                    <View style={styles.optionDivider} />
                  ) : null}
                </View>
              );
            })}
          </ScrollView>
        )}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const createStyles = colors =>
  StyleSheet.create({
    root: {
      width: '100%',
      gap: 8,
      zIndex: 0,
    },
    rootOpen: {
      zIndex: 20,
      elevation: 12,
    },
    accordion: {
      width: '100%',
    },
    accordionItem: {
      minHeight: 45,
      marginBottom: 0,
      paddingHorizontal: 16,
      paddingVertical: 0,
      borderRadius: INPUT_RADIUS,
      borderColor: colors.border,
      backgroundColor: colors.input,
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    accordionItemCompact: {
      minHeight: 40,
    },
    accordionItemOpen: {
      borderColor: colors.iconAccent,
    },
    accordionItemError: {
      borderColor: colors.error,
    },
    errorText: {
      fontSize: 12,
      fontFamily: FONT_FAMILY.regular,
      color: colors.error,
      marginTop: -4,
    },
    accordionHeader: {
      minHeight: 45,
      paddingVertical: 0,
    },
    accordionHeaderCompact: {
      minHeight: 40,
    },
    accordionContent: {
      marginTop: 2,
      marginHorizontal: -16,
      paddingHorizontal: 6,
      paddingTop: 6,
      paddingBottom: 6,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      backgroundColor: colors.pureWhite,
    },
    header: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingRight: 4,
    },
    startIcon: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    valueText: {
      flex: 1,
      padding: 0,
      fontSize: 15,
      fontFamily: FONT_FAMILY.regular,
      color: colors.text,
    },
    valueTextCompact: {
      fontSize: 14,
    },
    placeholderText: {
      color: colors.textDisabled,
    },
    optionCheckboxWrap: {
      flex: 1,
    },
    optionCheckbox: {
      marginBottom: 0,
    },
    option: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 10,
      overflow: 'hidden',
    },
    optionDivider: {
      height: StyleSheet.hairlineWidth,
      marginHorizontal: 12,
      backgroundColor: colors.border,
    },
    optionSelected: {
      backgroundColor: colors.cardSelected,
    },
    optionPressed: {
      backgroundColor: colors.cardSelected,
    },
    optionAccent: {
      position: 'absolute',
      left: 0,
      top: 10,
      bottom: 10,
      width: 3,
      borderRadius: 2,
      backgroundColor: colors.iconAccent,
    },
    optionText: {
      flex: 1,
    },
    optionLabel: {
      fontSize: 15,
      fontFamily: FONT_FAMILY.regular,
      color: colors.text,
    },
    optionLabelSelected: {
      fontFamily: FONT_FAMILY.medium,
      color: colors.icons,
    },
    optionSecondaryLabel: {
      marginTop: 1,
      fontSize: 11,
      lineHeight: 14,
      fontFamily: FONT_FAMILY.regular,
      color: colors.textSecondary,
    },
    flag: {
      width: 28,
      height: 18,
      borderRadius: 3,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.borderSubtle,
    },
  });
